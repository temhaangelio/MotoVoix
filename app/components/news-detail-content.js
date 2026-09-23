"use client";

import Image from "next/image";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useLanguage } from "./language-provider";
import { getCategoryLabel } from "../../lib/categories";
import { IMAGE_QUALITY } from "../../lib/images";

export default function NewsDetailContent({ post, relatedPosts }) {
  const { language } = useLanguage();
  const [vote, setVote] = useState(null);
  const fr = language === "fr";
  const title = fr ? post.titleFr : post.titleEn;
  const description = fr ? post.excerptFr : post.excerptEn;
  const contentHtml = fr ? post.contentHtmlFr : post.contentHtmlEn;
  const storageKey = `motovoix-article-vote:${post.slug}`;

  useEffect(() => {
    const savedVote = window.localStorage.getItem(storageKey);
    setVote(savedVote === "up" || savedVote === "down" ? savedVote : null);
  }, [storageKey]);

  function handleVote(nextVote) {
    if (vote === nextVote) {
      window.localStorage.removeItem(storageKey);
      setVote(null);
      return;
    }
    window.localStorage.setItem(storageKey, nextVote);
    setVote(nextVote);
  }

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
          <div className="relative aspect-[4/3] sm:aspect-[21/9] overflow-hidden mb-8 sm:mb-10 bg-surface-container-low border border-outline-variant/20 flex items-center justify-center rounded-[14px]">
            {post.image ? <Image alt={title} className="object-cover rounded-[14px]" fill priority quality={IMAGE_QUALITY} sizes="(max-width: 1024px) 100vw, 66vw" src={post.image} /> : <span className="font-label text-[10px] uppercase tracking-[0.25em] text-outline">{fr ? "Image à venir" : "Image coming soon"}</span>}
          </div>
          <article className="font-body text-base leading-8 text-zinc-200 sm:text-lg space-y-6 [&_p]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2 [&_a]:break-words [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          <div className="mt-12 flex flex-col gap-5 rounded-[18px] border border-outline-variant/20 bg-surface-container-low p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div>
              <p className="font-headline text-2xl">{fr ? "Cet article vous a-t-il été utile ?" : "Was this story helpful?"}</p>
              <p className="mt-1 font-body text-sm text-on-surface-variant">
                {vote ? (fr ? "Merci pour votre avis." : "Thanks for your feedback.") : (fr ? "Donnez-nous votre avis." : "Let us know what you think.")}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                aria-label={fr ? "J’aime cet article" : "Thumbs up"}
                aria-pressed={vote === "up"}
                className={`grid size-12 place-items-center rounded-full border transition-colors ${vote === "up" ? "border-primary bg-primary text-on-primary" : "border-outline-variant/40 text-on-surface hover:border-primary hover:text-primary"}`}
                onClick={() => handleVote("up")}
                type="button"
              >
                <ThumbsUp aria-hidden fill={vote === "up" ? "currentColor" : "none"} size={20} />
              </button>
              <button
                aria-label={fr ? "Je n’aime pas cet article" : "Thumbs down"}
                aria-pressed={vote === "down"}
                className={`grid size-12 place-items-center rounded-full border transition-colors ${vote === "down" ? "border-primary bg-primary text-on-primary" : "border-outline-variant/40 text-on-surface hover:border-primary hover:text-primary"}`}
                onClick={() => handleVote("down")}
                type="button"
              >
                <ThumbsDown aria-hidden fill={vote === "down" ? "currentColor" : "none"} size={20} />
              </button>
            </div>
          </div>
        </article>
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-low p-5 sm:p-8 rounded-[18px] border border-outline-variant/20">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-5">{fr ? "ARTICLES ASSOCIÉS" : "RELATED STORIES"}</p>
            <div className="space-y-6">
              {relatedPosts.map((item) => <Link className="block group" href={`/news/${item.slug}`} key={item.slug}><h3 className="font-headline text-2xl group-hover:text-primary transition-colors">{fr ? item.titleFr : item.titleEn}</h3><p className="text-sm text-zinc-400 mt-1">{getCategoryLabel(item.category, language)}</p></Link>)}
            </div>
          </div>
          <Link className="inline-block font-label text-xs uppercase tracking-widest border-b border-primary pb-1" href="/news">{fr ? "RETOUR À L’ACCUEIL" : "BACK TO HOME"}</Link>
        </aside>
      </section>
    </main>
  );
}
