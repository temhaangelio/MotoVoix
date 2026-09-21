#!/usr/bin/env bash
# MotoVoix sunucu güncellemesi:
#   git fetch + reset --hard origin -> npm ci (lock değiştiyse) -> prisma migrate deploy -> build -> PM2 restart -> sağlık kontrolü
#
# Build ayrı klasöre (.next-build) alınır; canlı site bu sırada çalışmaya devam eder.
# Build patlarsa canlı site hiç değişmez. Başarılıysa .next ile yer değiştirir, eski build
# .next-prev olarak kalır. Yeni build /news'e 200 dönmezse otomatik olarak eskisine döner.
#
#   ./updateproject.sh             origin ile eşitle (sunucu ezilir), yeni commit varsa build
#   ./updateproject.sh --no-pull   kodu çekmeden yeniden build al (.env değişti, önceki deneme yarım kaldı)
#   ./updateproject.sh --rollback  canlı build ile önceki build'i yer değiştir
# root / sudo ile de çalışır (kullanıcı değiştirmez).
#
# Loglar: logs/update-*.log (son 20 tanesi tutulur)

set -Eeuo pipefail

SELF="$(readlink -f "${BASH_SOURCE[0]}")"
APP_DIR="$(dirname "$SELF")"

APP_NAME="motovoix"   # ecosystem.config.cjs içindeki name ile aynı olmalı
BRANCH="${BRANCH:-main}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/news}"
# "bot" içerdiği için ziyaret istatistiğine yazılmaz (lib/analytics.js, BOT_PATTERN).
HEALTH_UA="motovoix-update-healthcheck-bot"

LIVE=".next"          # next start bunu okur
BUILD=".next-build"   # yeni build buraya alınır (NEXT_DIST_DIR, next.config.mjs)
PREV=".next-prev"     # bir önceki canlı build
SWAP=".next-swap"
COMMIT_STAMP=".deployed-commit"
INSTALL_STAMP="node_modules/.package-lock.sha256"
LOCK_FILE="$APP_DIR/.update.lock"
LOG_DIR="$APP_DIR/logs"
LOG_FILE=""

log()  { printf '\n==> %s\n' "$*"; }
warn() { printf '!!  %s\n' "$*" >&2; }
die()  { printf 'XX  %s\n' "$*" >&2; exit 1; }

on_error() {
  printf 'XX  %s. satırdaki komut başarısız oldu (çıkış kodu %s).%s\n' \
    "$2" "$1" "${LOG_FILE:+ Log: $LOG_FILE}" >&2
  exit "$1"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "'$1' bulunamadı. $2"
}

preflight() {
  require_cmd git   "sudo apt install -y git"
  require_cmd node  "Node 22 kur (UBUNTU-KURULUM.md, adım 1)."
  require_cmd npm   "Node ile birlikte gelir."
  require_cmd pm2   "sudo npm i -g pm2"
  require_cmd curl  "sudo apt install -y curl"
  require_cmd flock "sudo apt install -y util-linux"
  node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>20||(a===20&&b>=12)?0:1)' \
    || die "Node $(node -v) eski. En az 20.12 gerekli (22 önerilir)."
  git rev-parse --is-inside-work-tree >/dev/null 2>&1 \
    || die "$APP_DIR bir git deposu değil. Proje git clone ile kurulmalı."
  [[ -f .env ]] || die ".env yok: $APP_DIR/.env (UBUNTU-KURULUM.md, adım 2)."
}

acquire_lock() {
  exec 9>"$LOCK_FILE"
  flock -n 9 || die "Başka bir güncelleme zaten çalışıyor ($LOCK_FILE)."
}

start_log() {
  mkdir -p "$LOG_DIR"
  LOG_FILE="$LOG_DIR/update-$(date +%Y%m%d-%H%M%S).log"
  exec > >(tee -a "$LOG_FILE") 2>&1
  find "$LOG_DIR" -maxdepth 1 -name 'update-*.log' -type f -printf '%T@ %p\n' \
    | sort -rn | tail -n +21 | cut -d' ' -f2- | xargs -r rm -f
}

pull_code() {
  local before script_before
  log "Kod çekiliyor (origin/$BRANCH); sunucudaki farklar silinecek"

  git fetch --prune origin "$BRANCH"
  before="$(git rev-parse HEAD)"
  script_before="$(git hash-object "$SELF")"

  # git öncelikli: yerel commit, dirty dosya, ff-only takılması yok.
  git checkout -f -B "$BRANCH" "origin/$BRANCH"
  git reset --hard "origin/$BRANCH"
  # Ignore edilenler (.env, node_modules, .next) durur.
  # Panelden yüklenen görseller ve loglar da kalsın.
  git clean -fd -e public/images -e logs -e .update.lock

  if [[ "$before" != "$(git rev-parse HEAD)" ]]; then
    git log --oneline "$before..HEAD" | head -20
  else
    log "origin/$BRANCH zaten HEAD ($(git rev-parse --short HEAD))"
  fi

  # Script kendini güncellediyse kalan adımları yeni sürüm yapsın.
  if [[ "$(git hash-object "$SELF")" != "$script_before" ]]; then
    log "updateproject.sh değişti, yeni sürümle devam ediliyor"
    exec bash "$SELF" --no-pull
  fi
}

install_deps() {
  local want have=""
  want="$(sha256sum package-lock.json | cut -d' ' -f1)"
  if [[ -f "$INSTALL_STAMP" ]]; then have="$(cat "$INSTALL_STAMP")"; fi

  if [[ -d node_modules && "$want" == "$have" ]]; then
    log "package-lock.json değişmemiş, npm ci atlanıyor; Prisma client yenileniyor"
    npm run db:generate
  else
    # npm ci node_modules'u silip baştan kurar; yalnızca lock değişince çalışır.
    # --include=dev: tailwind/postcss/prisma build için gerekli, NODE_ENV=production olsa bile.
    log "Bağımlılıklar kuruluyor (npm ci)"
    npm ci --include=dev --no-audit --no-fund
    echo "$want" > "$INSTALL_STAMP"
  fi
}

build_app() {
  log "Build alınıyor ($BUILD); canlı site çalışmaya devam ediyor"
  rm -rf "$BUILD"
  # Önceki build'in önbelleği build süresini kısaltır.
  if [[ -d "$LIVE/cache" ]]; then
    mkdir -p "$BUILD"
    cp -a "$LIVE/cache" "$BUILD/cache"
  fi
  if ! NEXT_DIST_DIR="$BUILD" npm run build; then
    rm -rf "$BUILD"
    die "Build başarısız, canlı site değişmedi. (Migration uygulandıysa geri alınmadı.)"
  fi
  git rev-parse HEAD > "$BUILD/$COMMIT_STAMP"
}

activate_build() {
  log "Yeni build devreye alınıyor"
  rm -rf "$PREV" "$SWAP"
  if [[ -d "$LIVE" ]]; then mv "$LIVE" "$PREV"; fi
  mv "$BUILD" "$LIVE"
}

swap_builds() {
  [[ -d "$PREV" ]] || die "Önceki build yok ($PREV), dönülemiyor."
  rm -rf "$SWAP"
  if [[ -d "$LIVE" ]]; then mv "$LIVE" "$SWAP"; fi
  mv "$PREV" "$LIVE"
  if [[ -d "$SWAP" ]]; then mv "$SWAP" "$PREV"; fi
}

wait_healthy() {
  local code="000"
  for _ in $(seq 1 20); do
    sleep 2
    code="$(curl -s -o /dev/null -w '%{http_code}' -A "$HEALTH_UA" --max-time 10 "$HEALTH_URL" || true)"
    if [[ "$code" == "200" ]]; then
      log "Sağlık kontrolü tamam: $HEALTH_URL -> 200"
      return 0
    fi
  done
  warn "Sağlık kontrolü başarısız: $HEALTH_URL -> $code"
  return 1
}

restart_app() {
  log "PM2: $APP_NAME yeniden başlatılıyor"
  pm2 startOrRestart ecosystem.config.cjs || return 1
  pm2 save >/dev/null || warn "pm2 save başarısız; reboot sonrası liste eski kalabilir."
  wait_healthy
}

deployed_commit() {
  cat "$LIVE/$COMMIT_STAMP" 2>/dev/null || true
}

main() {
  cd "$APP_DIR"

  local mode="update"
  case "${1:-}" in
    "")          ;;
    --no-pull)   mode="rebuild" ;;
    --rollback)  mode="rollback" ;;
    -h|--help)   sed -n '2,/^$/p' "$SELF" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *)           die "Bilinmeyen seçenek: $1 (yardım: $0 --help)" ;;
  esac

  preflight
  acquire_lock
  start_log
  trap 'on_error $? $LINENO' ERR
  local started=$SECONDS

  if [[ "$mode" == "rollback" ]]; then
    log "Canlı build ile önceki build yer değiştiriyor"
    swap_builds
    restart_app || die "Geri dönülen build de cevap vermiyor. Bak: pm2 logs $APP_NAME --lines 100"
    log "Tamam. Canlı build: $(deployed_commit || true)"
    exit 0
  fi

  if [[ "$mode" == "update" ]]; then
    pull_code
    if [[ "$(deployed_commit)" == "$(git rev-parse HEAD)" ]]; then
      log "Yeni commit yok, canlı build güncel ($(git rev-parse --short HEAD)). Yine de build için: $0 --no-pull"
      exit 0
    fi
  fi

  install_deps

  log "Veritabanı migration'ları (prisma migrate deploy)"
  npm run db:deploy

  build_app
  activate_build

  if ! restart_app; then
    if [[ -d "$PREV" ]]; then
      warn "Yeni build cevap vermiyor, önceki build'e dönülüyor"
      swap_builds
      restart_app || warn "Önceki build de cevap vermiyor."
    fi
    die "Güncelleme başarısız. Bak: pm2 logs $APP_NAME --lines 100"
  fi

  log "Tamam: $(git log -1 --format='%h %s') ($((SECONDS - started)) sn)"
}

main "$@"; exit $?
