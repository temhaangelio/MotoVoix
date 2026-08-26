import { notFound } from "next/navigation";
import { getAllNews, getNewsBySlug } from "../../../lib/news";
import SiteHeader from "../../components/site-header";
import NewsDetailContent from "../../components/news-detail-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);

  if (!post) {
    return { title: "Story not found" };
  }

  return {
    title: post.titleEn,
    description: post.excerptEn,
  };
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getAllNews().filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <SiteHeader />

      <NewsDetailContent post={post} relatedPosts={relatedPosts} />
    </>
  );
}
