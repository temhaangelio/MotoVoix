# MotoVoix — Ubuntu kurulum rehberi

Bu rehber, projeyi Windows’ta geliştirip **Ubuntu sunucuda** çalıştırmak içindir. İçerik MySQL’de, haber görselleri ise `public/images/` altında statik dosya olarak durur. Admin paneli dosya yüklemez; yalnızca görsel yolunu kaydeder (`/images/news/news1.png`).

**Windows’ta aldığın `.next` build’ini Ubuntu’ya kopyalama.** Prisma motorları ve native paketler platforma özeldir. Kaynağı taşı, bağımlılıkları ve build’i Ubuntu’da al.

Önerilen dizin: `/var/www/motovoix`  
Önerilen uygulama kullanıcısı: `motovoix`  
Uygulama portu: `3000` (yalnızca localhost; dışarıya Nginx açılır)

---

## 0. Mimari özet

| Katman | Ne yapar |
| --- | --- |
| Nginx | 80/443, TLS, `/` → `127.0.0.1:3000` |
| Node (Next.js) | `next start`, systemd ile |
| MySQL | `motovoix` veritabanı, utf8mb4 |
| Disk | Kod + `.env` + `public/images/` |

Çalışma anında yazılan veri MySQL’dedir. Diskte yazma yetkisi yalnızca görsel klasörü ve ileride eklenecek yüklemeler için gerekir.

---

## 1. Ubuntu’da sistem paketleri

Node **22** kullan (Prisma `process.loadEnvFile` ve Next 16 için).

```bash
sudo apt update
sudo apt install -y curl git nginx mysql-client
# MySQL bu makinedeyse:
sudo apt install -y mysql-server

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # v22.x olmalı
npm -v
```

Uygulama kullanıcısı:

```bash
sudo adduser --system --group --home /var/www/motovoix motovoix
sudo mkdir -p /var/www/motovoix
sudo chown motovoix:motovoix /var/www/motovoix
```

---

## 2. Hangi dosyaları taşı, hangilerini elle ekle

### 2.1 Git’ten gelen (otomatik)

Repoyu klonlamak en temiz yol:

```bash
sudo -u motovoix git clone <REPO_URL> /var/www/motovoix
```

Git yoksa Windows’tan kopyala; **şunları alma:**

- `node_modules/`
- `.next/`
- `lib/generated/`
- `.env` / `.env.local` (sunucuda yeniden yazacaksın)

### 2.2 Elle eklemen gerekenler (git’te yok / build üretmez)

| Dosya / klasör | Neden |
| --- | --- |
| `.env` | Veritabanı, oturum anahtarı, site URL. Asla git’e koyma. |
| `public/images/header-bg.png` | Haber akışı arka planı |
| `public/images/header-bg-dark.png` | Koyu tema arka planı |
| `public/images/news/*` | Yazı kapakları. Panel yolu `/images/news/dosya.png` bekler. |

İkonlar (`app/favicon.ico`, `app/icon.svg`, `app/apple-icon.png`) kaynakla birlikte gelmeli. Yoksa tarayıcı ikonu boş kalır.

### 2.3 İlk kurulumda işine yarayan (repoda var)

| Dosya | Ne zaman |
| --- | --- |
| `prisma/migrations/` | Tabloları oluşturmak için zorunlu |
| `data/local-db.json` | Eski JSON içeriği MySQL’e aktarmak için |
| `scripts/create-admin.mjs` | İlk admin hesabı |
| `scripts/seed-pages.mjs` | About / Contact / Privacy / Terms sayfaları |
| `scripts/migrate-json-to-mysql.mjs` | `npm run db:seed` |

`content/news/*.md` ziyaretçi sitesinde kullanılmaz; içerik MySQL’dedir. Taşımana gerek yok.

### 2.4 Windows’tan görselleri kopyalama

Yerel makinede görseller `public/images/` altındaysa (PowerShell veya WinSCP):

```bash
# Ubuntu tarafında klasörler
sudo -u motovoix mkdir -p /var/www/motovoix/public/images/news

# Windows'tan örnek (OpenSSH ile):
scp -r public/images/* motovoix@SUNUCU_IP:/var/www/motovoix/public/images/
```

WinSCP kullanıyorsan hedef: `/var/www/motovoix/public/images/`

Kapak görseli panelde şöyle yazılır: `/images/news/ornek.png`  
Bu, diskte `public/images/news/ornek.png` demektir. Yeni görsel eklemek **rebuild gerektirmez**; dosyayı koy, panelde yolu kaydet, sayfayı yenile.

---

## 3. `.env` (sunucuda sıfırdan yaz)

```bash
sudo -u motovoix nano /var/www/motovoix/.env
```

```env
# MySQL bu sunucudaysa 127.0.0.1 kullan. Uzak host ise IP yaz.
DATABASE_URL="mysql://KULLANICI:SIFRE@127.0.0.1:3306/motovoix"

# openssl rand -base64 32
ADMIN_SESSION_SECRET="buraya-urettigin-anahtar"

NEXT_PUBLIC_SITE_URL="https://motovoix.com"

NODE_ENV="production"
```

Oturum anahtarı:

```bash
openssl rand -base64 32
```

`NEXT_PUBLIC_SITE_URL` sitemap, Open Graph ve kanonik adresler için kullanılır. `http://localhost:3000` bırakma.

`.env` yetkisi (başkası okumasın):

```bash
sudo chmod 600 /var/www/motovoix/.env
sudo chown motovoix:motovoix /var/www/motovoix/.env
```

---

## 4. MySQL

```sql
CREATE DATABASE motovoix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'motovoix'@'localhost' IDENTIFIED BY 'GUCLU_SIFRE';
GRANT ALL PRIVILEGES ON motovoix.* TO 'motovoix'@'localhost';
FLUSH PRIVILEGES;
```

Uygulama ayrı bir sunucudaysa kullanıcıyı `'motovoix'@'UYGULAMA_IP'` ile aç. Mümkünse MySQL’i dışarıya (`0.0.0.0:3306`) açma.

Bağlantı kontrolü:

```bash
mysql -u motovoix -p -h 127.0.0.1 motovoix -e "SELECT 1"
```

---

## 5. Bağımlılık, migration, build (Ubuntu’da)

```bash
cd /var/www/motovoix
sudo -u motovoix npm ci
```

`npm ci` `postinstall` ile `prisma generate` çalıştırır; `lib/generated/` burada oluşur.

Tablolar:

```bash
sudo -u motovoix npm run db:deploy
```

İlk kurulumda içerik ve admin:

```bash
# JSON'daki yazılar / ayarlar / reklamlar (bir kez; sonra panelden yönet)
sudo -u motovoix npm run db:seed

# Sabit sayfalar (panelde zaten varsa --only-empty)
sudo -u motovoix node scripts/seed-pages.mjs

# Admin hesabı
sudo -u motovoix node scripts/create-admin.mjs admin@motovoix.com "GizliParola" "Admin"
```

Giriş adresi: `https://alanadin.com/admin/giris`

Production build:

```bash
sudo -u motovoix npm run build
```

---

## 6. Dosya yetkileri ve görsel konumu

Hedef ağaç:

```
/var/www/motovoix/
  .env                          # 600, sahibi motovoix
  public/
    sw.js
    images/                     # 755, sahibi motovoix
      header-bg.png             # 644
      header-bg-dark.png
      news/                     # 755
        news1.png               # 644
        ...
```

Uygula:

```bash
sudo chown -R motovoix:motovoix /var/www/motovoix
sudo find /var/www/motovoix -type d -exec chmod 755 {} \;
sudo find /var/www/motovoix -type f -exec chmod 644 {} \;
sudo chmod 600 /var/www/motovoix/.env

# Görsel klasörleri yazılabilir kalsın (SFTP / scp ile yeni resim)
sudo chmod 755 /var/www/motovoix/public/images
sudo chmod 755 /var/www/motovoix/public/images/news
```

**`chmod 777` kullanma.**

| Kim | Ne yapabilmeli |
| --- | --- |
| `motovoix` (Node + SFTP) | Kodu okur, `public/images/news` yazar |
| Nginx (`www-data`) | Hiçbir şeye yazmaz; reverse proxy yeter |
| Diğer kullanıcılar | `.env` okuyamaz |

Panelde dosya yükleme yok. Yeni kapak:

1. Dosyayı `public/images/news/yeni-haber.png` olarak koy.
2. Yazı formunda Cover image: `/images/news/yeni-haber.png`
3. Kaydet. Rebuild yok.

Görsel üretici (`/admin/yazilar/.../gorsel-uret`) tarayıcıya indirir; sunucuya yazmaz. İndirdiğin dosyayı sen `public/images/news/` altına koyarsın.

---

## 7. systemd (sürekli çalışsın)

```bash
sudo nano /etc/systemd/system/motovoix.service
```

```ini
[Unit]
Description=MotoVoix Next.js
After=network.target mysql.service

[Service]
Type=simple
User=motovoix
Group=motovoix
WorkingDirectory=/var/www/motovoix
EnvironmentFile=/var/www/motovoix/.env
ExecStart=/usr/bin/npm start -- --hostname 127.0.0.1 --port 3000
Restart=on-failure
RestartSec=5
# Güvenlik
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

`npm start` = `next start`. Hostname `127.0.0.1` olmalı; 3000 dışarıya açılmasın.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now motovoix
sudo systemctl status motovoix
```

Log:

```bash
sudo journalctl -u motovoix -f
```

---

## 8. Nginx + TLS

```bash
sudo nano /etc/nginx/sites-available/motovoix
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name motovoix.com www.motovoix.com;

    client_max_body_size 12m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/motovoix /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d motovoix.com -d www.motovoix.com
```

Görselleri Nginx’in `public/` içinden statik servis etmesine gerek yok; Next zaten `public/` dosyalarını sunar. Ayrı `alias` koyarsan iki kaynak çakışmasın.

Firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow "Nginx Full"
sudo ufw enable
```

MySQL ve 3000 ufw’de kapalı kalsın.

---

## 9. Güncelleme (sonraki yayınlar)

```bash
cd /var/www/motovoix
sudo -u motovoix git pull
sudo -u motovoix npm ci
sudo -u motovoix npm run db:deploy
sudo -u motovoix npm run build
sudo systemctl restart motovoix
```

`public/images/` git’te yoksa `git pull` silmez. Yine de yedek al:

```bash
sudo tar -czf /root/motovoix-images-$(date +%F).tar.gz /var/www/motovoix/public/images
```

`db:seed` tekrar çalıştırma: mevcut kayıtları JSON ile ezer.

---

## 10. Kontrol listesi

1. `curl -I http://127.0.0.1:3000/news` → 200
2. `https://alanadin.com/news` açılıyor
3. Header görselleri: `/images/header-bg.png`, `/images/header-bg-dark.png`
4. Bir haber kapağı: `/images/news/news1.png` (veya DB’deki yol)
5. `/admin/giris` ile giriş
6. `/sitemap.xml` ve `robots.txt` gerçek alan adını gösteriyor

---

## 11. Sık sorunlar

| Belirti | Olası neden |
| --- | --- |
| Site açılır, görseller 404 | `public/images/` kopyalanmamış veya yol `/images/news/...` değil |
| `DATABASE_URL tanımlı değil` | `.env` yok / systemd `EnvironmentFile` yanlış |
| Prisma / adapter hatası | Windows `node_modules` veya `.next` kopyalanmış; Ubuntu’da `npm ci` + `build` |
| Admin giriş tutmuyor | `ADMIN_SESSION_SECRET` boş veya her restart’ta değişiyor |
| Migration fail | MySQL kullanıcı yetkisi veya charset utf8mb4 değil |
| 502 Bad Gateway | `motovoix` servisi düşmüş: `journalctl -u motovoix -e` |

---

## 12. Kısa sıra (ilk gün)

1. Node 22, Nginx, MySQL, kullanıcı `motovoix`
2. Kaynak kodu `/var/www/motovoix` altına koy (`.next` / `node_modules` olmadan)
3. `.env` yaz, `chmod 600`
4. `public/images/` ve `public/images/news/` kopyala, sahip `motovoix`, dizin `755`, dosya `644`
5. MySQL veritabanı + kullanıcı
6. `npm ci` → `npm run db:deploy` → (isteğe) seed / admin / seed-pages
7. `npm run build`
8. systemd + Nginx + Certbot
9. `/news` ve `/admin/giris` doğrula
