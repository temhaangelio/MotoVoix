import Link from "next/link";
import { getAllNews } from "../../lib/news";
import SiteHeader from "../components/site-header";
import NewsFeed from "../components/news-feed";
import { LocalizedText } from "../components/language-provider";
import { Wordmark } from "../components/wordmark";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "News | MotoVoix",
  description: "Motorcycle news",
};

export default function NewsPage() {
  const posts = getAllNews();

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <img
          alt=""
          aria-hidden="true"
          className="header-hero-image header-hero-light w-full max-w-7xl h-auto mx-auto opacity-40 -translate-y-8 sm:-translate-y-14 md:-translate-y-20"
          style={{ objectPosition: "center top" }}
          src="/images/header-bg.png"
        />
        <img
          alt=""
          aria-hidden="true"
          className="header-hero-image header-hero-dark w-full max-w-7xl h-auto mx-auto opacity-40 -translate-y-8 sm:-translate-y-14 md:-translate-y-20"
          style={{ objectPosition: "center top" }}
          src="/images/header-bg-dark.png"
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

        <NewsFeed posts={posts} />
      </main>

      <section className="w-full border-t border-outline-variant/10 bg-surface-container-low py-16 sm:py-20 md:py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-stretch justify-between gap-10 px-4 sm:px-6 md:flex-row md:items-center md:gap-12 md:px-8">
          <div className="max-w-xl text-left">
            <h3 className="font-headline text-4xl mb-4 sm:text-5xl"><LocalizedText en="Headlines in your inbox." fr="L’actualité dans votre boîte mail." /></h3>
            <p className="font-body text-on-surface-variant"><LocalizedText en="Subscribe for new model launches, industry updates, and this week’s standout motorcycle stories." fr="Abonnez-vous pour suivre les nouveaux modèles, l’actualité du secteur et les sujets moto de la semaine." /></p>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[28rem] md:flex-row md:items-end md:gap-4">
            <input aria-label="Email address" className="min-h-12 w-full bg-transparent border border-outline px-4 py-3 font-label text-base uppercase tracking-[0.18em] text-on-surface transition-all focus:border-primary focus:outline-none md:w-80" placeholder="Email" type="email" />
            <button className="min-h-12 w-full bg-primary-container px-8 py-3 font-label text-sm uppercase tracking-widest text-on-primary-container transition-all hover:opacity-90 md:w-auto md:px-12"><LocalizedText en="Subscribe" fr="S’abonner" /></button>
          </div>
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
