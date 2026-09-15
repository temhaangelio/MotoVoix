// Ziyaretçi tarafı sabit sayfalar (About / Contact / Privacy / Terms).
// İçerik pages tablosunda; panelden düzenlenince revalidateTag(PAGES_TAG)
// ile önbellek anında düşüyor.

import { unstable_cache } from "next/cache";
import { prisma } from "./prisma.js";
import { markdownToHtml } from "./markdown.js";

export const PAGES_TAG = "pages";

const CACHE = { revalidate: 300, tags: [PAGES_TAG] };

// Sayfa gövdesi markdown; HTML dönüşümü de önbelleğe giriyor.
export async function getPublicPage(slug) {
  const key = String(slug ?? "");
  if (!key) return null;

  return unstable_cache(
    async () => {
      const page = await prisma.page.findFirst({ where: { slug: key, published: true } });
      if (!page) return null;

      return {
        ...page,
        heading: page.heading || page.title,
        eyebrow: `MOTOVOIX / ${page.title.toUpperCase()}`,
        bodyHtml: page.body ? markdownToHtml(page.body) : "",
      };
    },
    ["public-page", key],
    CACHE,
  )();
}

// Footer / menü bağlantıları için.
export const getPublicPageLinks = unstable_cache(
  async () =>
    prisma.page.findMany({
      where: { published: true },
      orderBy: { menu_order: "asc" },
      select: { slug: true, title: true },
    }),
  ["public-page-links"],
  CACHE,
);
