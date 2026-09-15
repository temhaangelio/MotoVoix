import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      // Site kökü haber akışına kalıcı olarak yönleniyor (308).
      // Kökte ayrı bir ana sayfa istenirse bu kaydı kaldırıp
      // app/page.js oluşturmak yeterli.
      { source: "/", destination: "/news", permanent: true },
      // Özel tasarımlı sayfaların /sayfa/ altındaki kopyası olmasın.
      { source: "/sayfa/:slug(about|contact|privacy|terms)", destination: "/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
