// Ziyaretçi tarafı okuma katmanı.
//
// Sayfalar istek başına render edildiği için her okuma Next veri
// önbelleğinden geçiyor; aksi hâlde her ziyaret uzak MySQL'e gidiyor.
// Admin panelinden içerik değiştiğinde revalidateTag(NEWS_TAG) ile
// önbellek anında düşürülüyor (app/admin/actions.js).

import { unstable_cache } from "next/cache";
import {
  getSettings,
  getPublishedNewsCards,
  getPublishedNewsIndex,
  getPublishedPostBySlug,
  getRelatedPublishedNews,
} from "./local-db.js";
import { markdownToHtml } from "./markdown.js";

export const NEWS_TAG = "news";
export const SETTINGS_TAG = "settings";

const CACHE = { revalidate: 300, tags: [NEWS_TAG] };

// Ziyaretçi tarafı ayarları (ör. akış sayfa boyutu). Admin tarafı bunu
// kullanmıyor; orada her zaman taze okunuyor.
export const getPublicSettings = unstable_cache(
  async () => getSettings(),
  ["public-settings"],
  { revalidate: 300, tags: [SETTINGS_TAG] },
);

function normalizeImagePath(imagePath) {
  if (!imagePath || typeof imagePath !== "string") return "";
  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
}

// Kart görünümü: gövde yok, yalnızca listede kullanılan alanlar.
function toCard(post) {
  return {
    ...post,
    image: normalizeImagePath(post.image),
    description: post.description || post.excerpt,
    titleEn: post.titleEn || post.title,
    titleFr: post.titleFr || post.titleEn || post.title,
    excerptEn: post.excerptEn || post.description || post.excerpt,
    excerptFr: post.excerptFr || post.excerptEn || post.description || post.excerpt,
  };
}

function toPublicPost(post) {
  return {
    ...toCard(post),
    content: post.body,
    bodyEn: post.bodyEn || post.body,
    bodyFr: post.bodyFr || post.bodyEn || post.body,
  };
}

// Haber akışı — 49 kayıt gövdesiz taşınıyor.
export const getNewsCards = unstable_cache(
  async () => (await getPublishedNewsCards()).map(toCard),
  ["news-cards"],
  CACHE,
);

// Sitemap — yalnızca slug ve tarihler.
export const getNewsSitemapEntries = unstable_cache(
  async () => getPublishedNewsIndex(),
  ["news-index"],
  CACHE,
);

export const getNewsSlugs = unstable_cache(
  async () => (await getPublishedNewsIndex()).map((post) => ({ slug: post.slug })),
  ["news-slugs"],
  CACHE,
);

// Tek haber. Markdown dönüşümü de önbelleğe giriyor; eskiden her
// istekte iki dil için yeniden ayrıştırılıyordu.
export async function getNewsBySlug(slug) {
  const key = String(slug ?? "");
  if (!key) return null;

  return unstable_cache(
    async () => {
      const post = await getPublishedPostBySlug(key);
      if (!post) return null;

      const linkSource = (value) => (value || "").replace(/^Source:\s*(https?:\/\/\S+)/gm, "Source: [$1]($1)");
      const publicPost = toPublicPost(post);

      return {
        ...publicPost,
        contentHtmlEn: markdownToHtml(linkSource(publicPost.bodyEn)),
        contentHtmlFr: markdownToHtml(linkSource(publicPost.bodyFr)),
      };
    },
    ["news-post", key],
    CACHE,
  )();
}

// Detay sayfasındaki "ilgili haberler" bloğu.
export async function getRelatedNews(slug, limit = 3) {
  const key = String(slug ?? "");

  return unstable_cache(
    async () => (await getRelatedPublishedNews(key, limit)).map(toCard),
    ["news-related", key, String(limit)],
    CACHE,
  )();
}
