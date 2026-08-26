"use client";

import Link from "next/link";
import { useLanguage } from "./language-provider";
import { getCategoryLabel } from "../../lib/categories";

export default function NewsDetailContent({ post, relatedPosts }) {
  const { language } = useLanguage();
  const fr = language === "fr";
  const title = fr ? post.titleFr : post.titleEn;
  const description = fr ? post.excerptFr : post.excerptEn;
  const contentHtml = fr ? post.contentHtmlFr : post.contentHtmlEn;

  return (
    <main className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 md:px-8 md:pt-28 md:pb-24">
      <section className="grid grid-cols-1 gap-6 border-b border-outline-variant/20 pb-10 md:gap-8 lg:grid-cols-12 lg:gap-12 lg:pb-12">
        <div className="lg:col-span-8">
          <span className="font-label text-xs uppercase tracking-[0.3em] text-primary mb-4 block">{getCategoryLabel(post.category, language)} / {fr ? "ARTICLE" : "DETAIL"}</span>
          <h1 className="font-headline text-4xl font-light tracking-tight leading-tight mb-5 sm:text-5xl md:text-6xl lg:text-7xl">{title}</h1>
          <p className="max-w-3xl font-body text-base leading-relaxed text-on-surface-variant sm:text-lg">{description}</p>
        </div>
        <aside className="lg:col-span-4 bg-surface-container-low p-5 sm:p-8 h-fit rounded-[18px] border border-outline-variant/20">
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-6">{fr ? "PUBLICATION" : "PUBLISH INFO"}</p>
          <p className="text-sm" suppressHydrationWarning><span className="text-zinc-400">Date:</span> {new Intl.DateTimeFormat(fr ? "fr-FR" : "en-US", { timeZone: "UTC", dateStyle: "short", timeStyle: "medium" }).format(new Date(post.date))}</p>
        </aside>
      </section>
      <section className="mt-10 grid grid-cols-1 gap-8 lg:mt-12 lg:grid-cols-12 lg:gap-12">
        <article className="lg:col-span-8">
          <div className="aspect-[4/3] sm:aspect-[21/9] overflow-hidden mb-8 sm:mb-10 bg-surface-container-low border border-outline-variant/20 flex items-center justify-center rounded-[14px]">
            {post.image ? <img alt={title} className="w-full h-full object-cover rounded-[14px]" src={post.image} /> : <span className="font-label text-[10px] uppercase tracking-[0.25em] text-outline">{fr ? "Image à venir" : "Image coming soon"}</span>}
          </div>
          <article className="font-body text-base leading-8 text-zinc-200 sm:text-lg space-y-6 [&_p]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2 [&_a]:break-words [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </article>
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-low p-5 sm:p-8 rounded-[18px] border border-outline-variant/20">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-5">{fr ? "ARTICLES ASSOCIÉS" : "RELATED STORIES"}</p>
            <div className="space-y-6">
              {relatedPosts.map((item) => <Link className="block group" href={`/haber/${item.slug}`} key={item.slug}><h3 className="font-headline text-2xl group-hover:text-primary transition-colors">{fr ? item.titleFr : item.titleEn}</h3><p className="text-sm text-zinc-400 mt-1">{getCategoryLabel(item.category, language)}</p></Link>)}
            </div>
          </div>
          <Link className="inline-block font-label text-xs uppercase tracking-widest border-b border-primary pb-1" href="/news">{fr ? "RETOUR À L’ACCUEIL" : "BACK TO HOME"}</Link>
        </aside>
      </section>
    </main>
  );
}
