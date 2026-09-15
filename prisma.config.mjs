// Prisma 7 CLI yapılandırması.
// Next.js .env dosyasını kendi yüklüyor; Prisma CLI yüklemediği için
// burada elle okuyoruz (Node 22+ yerleşik, ek paket gerekmiyor).
import { defineConfig, env } from "prisma/config";

try {
  process.loadEnvFile(".env");
} catch {
  // .env yoksa ortam değişkenleri zaten dışarıdan geliyordur (CI, systemd, PM2).
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
