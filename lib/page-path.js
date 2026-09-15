// Sayfaların ziyaretçi adresleri. Sunucu bağımlılığı yok; hem sunucu hem
// istemci bileşenlerinden (ör. panel tablosundaki "View") kullanılabilir.

// Kendi özel tasarımlı rotası olan sayfalar kökte açılır.
export const DEDICATED_PAGE_SLUGS = ["about", "contact", "privacy", "terms"];

// Panelden eklenen diğer sayfalar /sayfa/<slug> altında (/haber/<slug> gibi).
// Kökte her şeyi yakalayan bir rota kullanmıyoruz: rastgele adresler gerçek
// 404 dönmeli, stream edilen bir "soft 404" değil.
export function pagePath(slug) {
  return DEDICATED_PAGE_SLUGS.includes(slug) ? `/${slug}` : `/sayfa/${slug}`;
}
