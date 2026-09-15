// Kanonik URL'ler, sitemap ve Open Graph için tek kaynak.
// Sunucuda NEXT_PUBLIC_SITE_URL'i gerçek alan adına ayarlayın.

const FALLBACK_URL = "http://localhost:3000";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_URL).replace(/\/+$/, "");

export const siteName = "MotoVoix";

export function absoluteUrl(pathname = "/") {
  return `${siteUrl}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
