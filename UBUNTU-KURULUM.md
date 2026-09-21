# MotoVoix — Ubuntu (kısa)

PM2 zorunlu değil; `next start`’ı ayakta tutar. systemd yazmadan aynı işi görür, o yüzden burada PM2 var.

Windows `.next` / `node_modules` kopyalama. Ubuntu’da `npm ci` + `npm run build`.

---

## Elle ekle

| Ne | Nereye |
| --- | --- |
| `.env` | proje kökü, `chmod 600` |
| `header-bg.png`, `header-bg-dark.png` | `public/images/` |

## Görseller ve izinler

Kapak ve reklam görselleri panelden yüklenir: form → **Upload image**, ya da **Choose from library** ile `public/images/news/` içindekilerden seç. Dosya benzersiz adla (`ornek-m1x2y3ab.png`) o klasöre yazılır, yol alana kendisi girer. Rebuild ve restart gerekmez. Sınır 8 MB; JPG, PNG, WebP, GIF, AVIF.

Node (PM2'yi çalıştıran kullanıcı) yalnız şu iki yere yazar, ikisi de o kullanıcıya ait olmalı:

| Yol | Neden |
| --- | --- |
| `public/images/news/` | panel yüklemeleri |
| `.next/cache/images/` | `next/image` küçültülmüş kopyaları |

Nginx (`www-data`) proje dosyalarına dokunmaz, ona izin gerekmez.

```bash
sudo chown -R $USER:$USER /var/www/motovoix
chmod 600 /var/www/motovoix/.env
find /var/www/motovoix/public/images -type d -exec chmod 755 {} +
find /var/www/motovoix/public/images -type f -exec chmod 644 {} +
```

- `chmod -R 755` kullanma: resimleri çalıştırılabilir yapar, git bunu değişiklik sayar, `git pull` takılır.
- Panel "cannot write to public/images/news" derse: bir şey root ile çalıştırılmış (`sudo npm ...`, WinSCP'ye root girişi). Yukarıdaki `chown`'u tekrar çalıştır.
- Yüklenen görseller git'te yok, yalnız sunucuda. Yedeğe `public/images/news/` klasörünü kat.

---

## 1. Paketler

```bash
sudo apt update
sudo apt install -y nginx mysql-server git
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

## 2. Kod + .env + görseller

```bash
sudo mkdir -p /var/www/motovoix
sudo chown $USER:$USER /var/www/motovoix
git clone https://github.com/temhaangelio/MotoVoix.git /var/www/motovoix
```

WinSCP ile kopyalama: `updateproject.sh` `git pull` ile çalışır, `.git` şart. Repodaki görseller clone ile gelir.

`.env`:

```env
DATABASE_URL="mysql://motovoix:SIFRE@127.0.0.1:3306/motovoix"
ADMIN_SESSION_SECRET="openssl rand -base64 32 çıktısı"
NEXT_PUBLIC_SITE_URL="https://motovoix.com"
NODE_ENV="production"
```

MySQL (yoksa):

```sql
CREATE DATABASE motovoix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'motovoix'@'localhost' IDENTIFIED BY 'SIFRE';
GRANT ALL ON motovoix.* TO 'motovoix'@'localhost';
FLUSH PRIVILEGES;
```

## 3. Build ve çalıştır

```bash
cd /var/www/motovoix
npm ci
npm run db:deploy
npm run db:seed
node scripts/seed-pages.mjs
node scripts/create-admin.mjs admin@motovoix.com "Parola" "Admin"
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # çıktıdaki "sudo env PATH=..." satırını kopyala, çalıştır
```

`db:seed` yalnızca ilk kurulum. Sonra tekrar çalışma, paneli ezer.

`ecosystem.config.cjs` Next'i `127.0.0.1:3000`'de başlatır; 3000 dışarı açılmaz, önüne Nginx girer.

## 4. Nginx + SSL

`/etc/nginx/sites-available/motovoix`:

```nginx
server {
    listen 80;
    server_name motovoix.com www.motovoix.com;
    # Panelden görsel yükleme (8 MB). Nginx varsayılanı 1 MB, üstü 413 döner.
    client_max_body_size 10m;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/motovoix /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d motovoix.com -d www.motovoix.com
```

## Güncelleme

Windows'ta commit + push, sonra sunucuda:

```bash
cd /var/www/motovoix
./updateproject.sh
```

Sırası: `git pull` → `npm ci` (yalnız `package-lock.json` değiştiyse) → `prisma migrate deploy` → build → `pm2` restart → `/news` kontrolü.

Build `.next-build`'e alınır, site bu sırada açık kalır. Build patlarsa canlı site değişmez. Yeni sürüm `/news`'e 200 dönmezse eski build'e kendisi döner.

| Komut | Ne zaman |
| --- | --- |
| `./updateproject.sh` | Normal güncelleme. Yeni commit yoksa bir şey yapmaz. |
| `./updateproject.sh --no-pull` | Kod aynı, `.env` değişti; yeniden build. |
| `./updateproject.sh --rollback` | Son sürüm sorunlu; önceki build'e dön. Tekrar çalıştırınca geri gelir. |

- `sudo` ile çalıştırma; projenin sahibi olan kullanıcıyla çalıştır.
- `Permission denied` → `chmod +x updateproject.sh` veya `bash updateproject.sh`.
- Rollback yalnız build'i döndürür. Uygulanan migration geri alınmaz.
- Sunucuya elle koyduğun bir görseli sonra repoya da eklersen `git pull` "untracked working tree files would be overwritten" der: sunucudakini sil, scripti tekrar çalıştır.

PM2'yi eskiden `pm2 start npm --name motovoix -- start` ile başlattıysan bir kez:

```bash
pm2 delete motovoix && pm2 start ecosystem.config.cjs && pm2 save
```

Admin: `/admin/login`  
Log: `pm2 logs motovoix`, güncelleme logları `logs/update-*.log`
