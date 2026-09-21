import { notFound } from "next/navigation";
import { getNewsBySlug, getNewsSlugs, getRelatedNews } from "../../../lib/news";
import { incrementPostReads } from "../../../lib/local-db";
import { preparePublicPage } from "../../../lib/public-page";
import { absoluteUrl, siteName } from "../../../lib/site";
import SiteHeader from "../../components/site-header";
import NewsDetailContent from "../../components/news-detail-content";
import { MaintenanceNotice } from "../../components/maintenance-notice";

// Haberler statik üretilip 5 dakikada bir tazeleniyor.
export const revalidate = 300;

// Bilinen haberler build sırasında üretilir, yeni eklenenler ilk istekte.
export async function generateStaticParams() {
  return getNewsSlugs();
}

function toIso(value) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);

  if (!post) {
    return { title: "Story not found", robots: { index: false, follow: false } };
  }

  const url = absoluteUrl(`/haber/${post.slug}`);
  const images = post.image ? [{ url: absoluteUrl(post.image), alt: post.titleEn }] : undefined;
  const published = toIso(post.published_at ?? post.date);

  return {
    title: post.titleEn,
    description: post.excerptEn,
    keywords: post.tags ? post.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.titleEn,
      description: post.excerptEn,
      url,
      siteName,
      publishedTime: published,
      modifiedTime: published,
      section: post.category,
      tags: post.tags ? post.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : undefined,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.titleEn,
      description: post.excerptEn,
      images: post.image ? [absoluteUrl(post.image)] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);

  // Okunma sayacı yalnızca gerçek ziyaretçide, yanıt gönderildikten sonra artar.
  const settings = await preparePublicPage(`/haber/${slug}`, {
    onVisit: post ? () => incrementPostReads(post.id) : undefined,
  });
  if (settings.maintenanceMode) return <MaintenanceNotice settings={settings} />;

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedNews(post.slug, 3);
  const url = absoluteUrl(`/haber/${post.slug}`);
  const published = toIso(post.published_at ?? post.date);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.titleEn,
    description: post.excerptEn,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: published,
    dateModified: published,
    articleSection: post.category,
    inLanguage: "en",
    image: post.image ? [absoluteUrl(post.image)] : undefined,
    author: { "@type": "Organization", name: siteName, url: absoluteUrl("/") },
    publisher: { "@type": "Organization", name: siteName, url: absoluteUrl("/") },
    ...(post.source_url ? { isBasedOn: post.source_url } : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "News", item: absoluteUrl("/news") },
      { "@type": "ListItem", position: 2, name: post.titleEn, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <SiteHeader />

      <NewsDetailContent post={post} relatedPosts={relatedPosts} />
    </>
  );
}
