import Link from "next/link";
import Image from "next/image";
import { getNewsCards } from "../../lib/news";
import { preparePublicPage } from "../../lib/public-page";
import SiteHeader from "../components/site-header";
import NewsFeed from "../components/news-feed";
import NewsSubscribeInline from "../components/news-subscribe-inline";
import { MaintenanceNotice } from "../components/maintenance-notice";
import { LocalizedText } from "../components/language-provider";
import { Wordmark } from "../components/wordmark";
import { absoluteUrl, siteName } from "../../lib/site";
import { IMAGE_QUALITY } from "../../lib/images";

// Akış statik üretilip 5 dakikada bir tazeleniyor; admin panelinden yayın
// yapıldığında revalidatePath("/news") zaten anında güncelliyor.
export const revalidate = 300;

const PAGE_TITLE = "Motorcycle and ATV News";
const PAGE_DESCRIPTION =
  "New models, manufacturer announcements, racing updates, and key industry moves in one stream.";

export const metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/news") },
  openGraph: {
    type: "website",
    title: `${PAGE_TITLE} | ${siteName}`,
    description: PAGE_DESCRIPTION,
    url: absoluteUrl("/news"),
    images: [{ url: absoluteUrl("/images/header-bg.png"), width: 1200, height: 630, alt: PAGE_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} | ${siteName}`,
    description: PAGE_DESCRIPTION,
    images: [absoluteUrl("/images/header-bg.png")],
  },
};

export default async function NewsPage() {
  const [posts, settings] = await Promise.all([getNewsCards(), preparePublicPage("/news")]);
  if (settings.maintenanceMode) return <MaintenanceNotice settings={settings} />;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: absoluteUrl("/news"),
    isPartOf: { "@type": "WebSite", name: siteName, url: absoluteUrl("/") },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.slice(0, 20).map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/news/${post.slug}`),
        name: post.titleEn,
      })),
    },
  };

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <Image
          alt=""
          aria-hidden="true"
          className="header-hero-image header-hero-light w-full max-w-7xl h-auto mx-auto opacity-40 -translate-y-8 sm:-translate-y-14 md:-translate-y-20"
          height={1024}
          quality={IMAGE_QUALITY}
          priority
          sizes="100vw"
          src="/images/header-bg.png"
          style={{ objectPosition: "center top" }}
          width={1536}
        />
        <Image
          alt=""
          aria-hidden="true"
          className="header-hero-image header-hero-dark w-full max-w-7xl h-auto mx-auto opacity-40 -translate-y-8 sm:-translate-y-14 md:-translate-y-20"
          height={1024}
          quality={IMAGE_QUALITY}
          priority
          sizes="100vw"
          src="/images/header-bg-dark.png"
          style={{ objectPosition: "center top" }}
          width={1536}
        />
      </div>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 md:px-8 md:pt-28 md:pb-24">
        <section className="mb-14 rounded-[18px] border border-outline-variant/20 sm:mb-20">
          <div className="flex flex-col justify-between gap-8 px-5 py-8 sm:px-8 sm:py-10 md:flex-row md:items-end md:px-10 md:py-16">
            <div className="max-w-2xl">
              <span className="font-label text-xs uppercase tracking-[0.3em] text-primary mb-4 block"><LocalizedText en="HEADLINES / BREAKING NEWS" fr="À LA UNE / DERNIÈRE MINUTE" /></span>
              <h1 className="font-headline text-[3.2rem] font-light tracking-tight leading-[0.92] mb-5 text-zinc-50 sm:text-6xl md:text-7xl lg:text-8xl"><LocalizedText en="Motorcycle and Atv News." fr="Actualités moto et quad." /></h1>
              <p className="max-w-xl font-body text-base leading-relaxed text-zinc-200 sm:text-lg md:text-xl"><LocalizedText en="New models, manufacturer announcements, racing updates, and key industry moves in one stream." fr="Nouveaux modèles, annonces des constructeurs, compétition et mouvements clés du secteur, réunis dans un seul flux." /></p>
            </div>
          </div>
        </section>

        <NewsFeed posts={posts} pageSize={settings.postsPerPage || 8} />
      </main>

      <section className="w-full border-t border-outline-variant/10 bg-surface-container-low py-16 sm:py-20 md:py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-stretch justify-between gap-10 px-4 sm:px-6 md:flex-row md:items-center md:gap-12 md:px-8">
          <div className="max-w-xl text-left">
            <h3 className="font-headline text-4xl mb-4 sm:text-5xl"><LocalizedText en="Headlines in your inbox." fr="L’actualité dans votre boîte mail." /></h3>
            <p className="font-body text-on-surface-variant"><LocalizedText en="Subscribe for new model launches, industry updates, and this week’s standout motorcycle stories." fr="Abonnez-vous pour suivre les nouveaux modèles, l’actualité du secteur et les sujets moto de la semaine." /></p>
          </div>
          <NewsSubscribeInline />
        </div>
      </section>

      <footer className="w-full border-t border-zinc-800 bg-zinc-900 py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-8 md:px-8">
          <div className="space-y-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start">
              <Wordmark className="footer-brand font-headline text-2xl text-zinc-100" />
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 md:justify-start">
              <Link className="font-body text-sm text-zinc-500 uppercase tracking-widest hover:text-zinc-100 transition-all" href="/news"><LocalizedText en="News" fr="Actualités" /></Link>
              <Link className="font-body text-sm text-zinc-500 uppercase tracking-widest hover:text-zinc-100 transition-all" href="/newsletter">Newsletter</Link>
              <Link className="font-body text-sm text-zinc-500 uppercase tracking-widest hover:text-zinc-100 transition-all" href="/about"><LocalizedText en="About" fr="À propos" /></Link>
              <Link className="font-body text-sm text-zinc-500 uppercase tracking-widest hover:text-zinc-100 transition-all" href="/contact">Contact</Link>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-6 text-center md:items-end md:text-right">
            <p className="font-body text-sm text-zinc-500 uppercase tracking-widest">© 2026 motorvoix.</p>
            <div className="flex justify-center gap-4 md:justify-end">
              <Link className="font-label text-[10px] text-outline uppercase tracking-[0.2em] hover:text-zinc-100 transition-all" href="/terms">Terms</Link>
              <Link className="font-label text-[10px] text-outline uppercase tracking-[0.2em] hover:text-zinc-100 transition-all" href="/privacy">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
