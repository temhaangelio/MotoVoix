import { getPublishedNews } from "./local-db";
import { markdownToHtml } from "./markdown";

function normalizeImagePath(imagePath) {
  if (!imagePath || typeof imagePath !== "string") return "";
  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
}

function toPublicPost(post) {
  return {
    ...post,
    image: normalizeImagePath(post.image),
    content: post.body,
    description: post.description || post.excerpt,
    titleEn: post.titleEn || post.title,
    titleFr: post.titleFr || post.titleEn || post.title,
    excerptEn: post.excerptEn || post.description || post.excerpt,
    excerptFr: post.excerptFr || post.excerptEn || post.description || post.excerpt,
    bodyEn: post.bodyEn || post.body,
    bodyFr: post.bodyFr || post.bodyEn || post.body,
  };
}

export function getAllNews() {
  return getPublishedNews().map(toPublicPost);
}

export function getNewsSlugs() {
  return getAllNews().map((post) => ({ slug: post.slug }));
}

export async function getNewsBySlug(slug) {
  const post = getAllNews().find((item) => item.slug === slug);
  if (!post) return null;
  const linkSource = (value) => (value || "").replace(/^Source:\s*(https?:\/\/\S+)/gm, "Source: [$1]($1)");
  return {
    ...post,
    contentHtmlEn: markdownToHtml(linkSource(post.bodyEn)),
    contentHtmlFr: markdownToHtml(linkSource(post.bodyFr)),
  };
}
