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
  const contentWithLinkedSource = (post.body || "").replace(/^Source:\s*(https?:\/\/\S+)/gm, "Source: [$1]($1)");
  return {
    ...post,
    contentHtml: markdownToHtml(contentWithLinkedSource),
  };
}
