import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Eski Türkçe adresler İngilizce karşılıklarına kalıcı (308) yönleniyor;
// eski yer imleri ve arama motoru kayıtları kırılmasın. Sorgu dizesi korunur.
const ADMIN_SECTIONS = {
  yazilar: "posts",
  sayfalar: "pages",
  kullanicilar: "users",
  "e-bulten": "newsletter",
  mesajlar: "messages",
  istatistik: "analytics",
  reklamlar: "ads",
  profil: "profile",
  giris: "login",
};
const SETTINGS_SECTIONS = {
  "e-bulten": "newsletter",
  genel: "general",
  gorunurluk: "visibility",
  moduller: "modules",
};

const LEGACY_REDIRECTS = [
  { source: "/haber/:slug", destination: "/news/:slug" },
  { source: "/sayfa/:slug(about|contact|privacy|terms)", destination: "/:slug" },
  { source: "/sayfa/:slug", destination: "/page/:slug" },
  ...Object.entries(SETTINGS_SECTIONS).map(([tr, en]) => ({
    source: `/admin/ayarlar/${tr}`,
    destination: `/admin/settings/${en}`,
  })),
  { source: "/admin/ayarlar", destination: "/admin/settings" },
  ...Object.entries(ADMIN_SECTIONS).flatMap(([tr, en]) => [
    { source: `/admin/${tr}/yeni`, destination: `/admin/${en}/new` },
    { source: `/admin/${tr}/:id/duzenle`, destination: `/admin/${en}/:id/edit` },
    { source: `/admin/${tr}/:id/gorsel-uret`, destination: `/admin/${en}/:id/generate-image` },
    { source: `/admin/${tr}/:path*`, destination: `/admin/${en}/:path*` },
  ]),
].map((redirect) => ({ ...redirect, permanent: true }));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // updateproject.sh yeni build'i canlı .next'e dokunmadan ayrı klasöre alır
  // (NEXT_DIST_DIR=.next-build), sonra yer değiştirir. Normalde .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    serverActions: {
      // Panelden görsel yükleme 8 MB'a kadar (lib/news-images.js); varsayılan
      // 1 MB yetmiyor. Üstündeki pay multipart başlıkları için.
      bodySizeLimit: "10mb",
    },
  },
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      // Site kökü haber akışına kalıcı olarak yönleniyor (308).
      // Kökte ayrı bir ana sayfa istenirse bu kaydı kaldırıp
      // app/page.js oluşturmak yeterli.
      { source: "/", destination: "/news", permanent: true },
      // Özel tasarımlı sayfaların /page/ altındaki kopyası olmasın.
      { source: "/page/:slug(about|contact|privacy|terms)", destination: "/:slug", permanent: true },
      ...LEGACY_REDIRECTS,
    ];
  },
};

export default nextConfig;
