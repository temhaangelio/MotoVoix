import { getNewsSitemapEntries } from "../lib/news";
import { getPublicPageLinks } from "../lib/pages";
import { pagePath } from "../lib/page-path";
import { absoluteUrl } from "../lib/site";

// Sitemap her saat yeniden üretilir; admin panelinden yayın yapıldığında
// updateTag + revalidatePath ile zaten tazelenir.
export const revalidate = 3600;

const STATIC_ROUTES = [
  { path: "/news", priority: 1, changeFrequency: "hourly" },
  { path: "/newsletter", priority: 0.6, changeFrequency: "weekly" },
];

// Sabit sayfalar (about/contact/... ve panelden eklenenler) artık
// pages tablosundan geliyor; yayından kaldırılan sayfa sitemap'ten düşüyor.
const PAGE_PRIORITY = { about: 0.5, contact: 0.5, privacy: 0.3, terms: 0.3 };

export default async function sitemap() {
  const [posts, pages] = await Promise.all([getNewsSitemapEntries(), getPublicPageLinks()]);

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const pageEntries = pages.map((page) => ({
    url: absoluteUrl(pagePath(page.slug)),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: PAGE_PRIORITY[page.slug] ?? 0.4,
  }));

  const postEntries = posts.map((post) => ({
    url: absoluteUrl(`/haber/${post.slug}`),
    lastModified: post.published_at ?? post.date ?? post.created_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...pageEntries, ...postEntries];
}
