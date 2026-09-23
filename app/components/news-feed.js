"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { useLanguage } from "./language-provider";
import { getCategoryLabel } from "../../lib/categories";
import { IMAGE_QUALITY } from "../../lib/images";

export default function NewsFeed({ posts, pageSize = 8 }) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [query, setQuery] = useState("");
  const { language } = useLanguage();
  const localizedPosts = useMemo(() => posts.map((post) => ({
    ...post,
    title: language === "fr" ? post.titleFr : post.titleEn,
    description: language === "fr" ? post.excerptFr : post.excerptEn,
  })), [posts, language]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(language === "fr" ? "fr-FR" : "en-US");
    if (!normalizedQuery) return localizedPosts;
    return localizedPosts.filter((post) => [
      post.title,
      post.description,
      getCategoryLabel(post.category, language),
      post.tags,
    ].filter(Boolean).join(" ").toLocaleLowerCase(language === "fr" ? "fr-FR" : "en-US").includes(normalizedQuery));
  }, [localizedPosts, query, language]);

  const featured = filteredPosts[0];
  const side = filteredPosts[1];

  const gridPosts = useMemo(() => {
    return filteredPosts.slice(2, visibleCount);
  }, [filteredPosts, visibleCount]);

  const hasMore = filteredPosts.length > visibleCount;

  useEffect(() => {
    setVisibleCount(8);
  }, [query, language]);

  function handleLoadMore() {
    setVisibleCount((prev) => prev + 4);
  }

  return (
    <>
      <div className="mb-10 sm:mb-14">
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
          <label className="sr-only" htmlFor="visitor-news-search">{language === "fr" ? "Rechercher dans les actualités" : "Search news"}</label>
          <input
            autoComplete="off"
            className="min-h-14 w-full rounded-[16px] border border-outline-variant/30 bg-surface-container-low py-3 pl-12 pr-12 font-body text-base text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary"
            id="visitor-news-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={language === "fr" ? "Rechercher par titre, catégorie ou mot-clé…" : "Search by title, category, or keyword…"}
            type="search"
            value={query}
          />
          {query && (
            <button
              aria-label={language === "fr" ? "Effacer la recherche" : "Clear search"}
              className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-outline transition-colors hover:bg-surface-container-high hover:text-primary"
              onClick={() => setQuery("")}
              type="button"
            >
              <X aria-hidden size={18} />
            </button>
          )}
        </div>
        {query.trim() && (
          <p className="mt-3 font-label text-xs uppercase tracking-widest text-outline">
            {language === "fr" ? `${filteredPosts.length} résultat${filteredPosts.length === 1 ? "" : "s"}` : `${filteredPosts.length} result${filteredPosts.length === 1 ? "" : "s"}`}
          </p>
        )}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="rounded-[18px] border border-outline-variant/20 bg-surface-container-low px-6 py-16 text-center sm:py-20">
          <Search aria-hidden className="mx-auto mb-5 text-outline" size={28} />
          <h2 className="font-headline text-3xl">{language === "fr" ? "Aucun article trouvé" : "No stories found"}</h2>
          <p className="mx-auto mt-3 max-w-md font-body text-on-surface-variant">
            {language === "fr" ? "Essayez un autre titre, une autre catégorie ou un autre mot-clé." : "Try another title, category, or keyword."}
          </p>
          <button className="mt-7 min-h-11 border-b-2 border-primary font-label text-xs uppercase tracking-widest" onClick={() => setQuery("")} type="button">
            {language === "fr" ? "EFFACER LA RECHERCHE" : "CLEAR SEARCH"}
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-10 lg:gap-12">
        {featured && (
          <article className="md:col-span-8 group rounded-[14px]">
            <Link href={`/news/${featured.slug}`}>
              <div className="relative aspect-[4/3] sm:aspect-[21/9] overflow-hidden mb-5 sm:mb-6 bg-surface-container-low border border-outline-variant/20 flex items-center justify-center rounded-[14px]">
                {featured.image ? (
                  <Image
                    alt={featured.title}
                    className="object-cover rounded-[14px]"
                    fill
                  quality={IMAGE_QUALITY}
                    quality={IMAGE_QUALITY}
                    priority
                    sizes="(max-width: 768px) 100vw, 66vw"
                    src={featured.image}
                  />
                ) : (
                  <span className="font-label text-[10px] uppercase tracking-[0.25em] text-outline">Image coming soon</span>
                )}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                  <span className="bg-primary-container text-on-primary-container px-3 py-1 sm:px-4 font-label text-[10px] uppercase tracking-[0.2em]">{language === "fr" ? "À LA UNE" : "FEATURED"}</span>
                </div>
              </div>
            </Link>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              <div className="md:col-span-2">
                <Link href={`/news/${featured.slug}`}>
                  <h2 className="w-full font-headline text-3xl leading-tight mb-3 sm:text-4xl group-hover:text-primary transition-colors duration-300">{featured.title}</h2>
                </Link>
                <Link href={`/news/${featured.slug}`}>
                  <p className="w-full font-body text-sm leading-7 text-on-surface-variant mb-5 sm:mb-6 sm:text-base">{featured.description}</p>
                </Link>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <span className="font-label text-xs uppercase tracking-widest text-on-surface">{getCategoryLabel(featured.category, language)}</span>
                  <span className="font-label text-xs uppercase tracking-widest text-outline" suppressHydrationWarning>
                    {new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "numeric", day: "numeric", year: "numeric" }).format(new Date(featured.date))}
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-between md:items-end md:pl-8">
                <Link className="inline-flex min-h-11 items-center font-label text-xs uppercase tracking-widest border-b-2 border-primary pb-1 group-hover:pr-4 transition-all duration-300" href={`/news/${featured.slug}`}>{language === "fr" ? "LIRE L’ARTICLE" : "READ STORY"}</Link>
              </div>
            </div>
          </article>
        )}

        {side && (
          <article className="md:col-span-4 group bg-surface-container-low p-5 sm:p-8 flex flex-col justify-between rounded-[14px] overflow-hidden border border-outline-variant/20">
            <div>
              <Link href={`/news/${side.slug}`}>
                <div className="relative aspect-video bg-surface-container-high mb-6 overflow-hidden border border-outline-variant/20 flex items-center justify-center rounded-[14px]">
                  {side.image ? (
                    <Image
                      alt={side.title}
                      className="object-cover rounded-[14px]"
                      fill
                  quality={IMAGE_QUALITY}
                    quality={IMAGE_QUALITY}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      src={side.image}
                    />
                  ) : (
                    <span className="font-label text-[10px] uppercase tracking-[0.25em] text-outline">Image coming soon</span>
                  )}
                </div>
              </Link>
              <span className="font-label text-[10px] uppercase tracking-widest text-primary mb-2 block">{getCategoryLabel(side.category, language)}</span>
              <Link href={`/news/${side.slug}`}>
                <h3 className="font-headline text-2xl mb-3 leading-tight">{side.title}</h3>
              </Link>
              <Link href={`/news/${side.slug}`}>
                <p className="font-body text-sm leading-7 text-on-surface-variant">{side.description}</p>
              </Link>
            </div>
          </article>
        )}

        {gridPosts.map((post) => (
          <article className="md:col-span-4 group bg-surface-container-low p-5 sm:p-6 rounded-[14px] border border-outline-variant/20" key={post.slug}>
            <Link href={`/news/${post.slug}`}>
              <div className="relative aspect-video bg-surface-container-high mb-6 overflow-hidden border border-outline-variant/20 flex items-center justify-center rounded-[14px]">
                {post.image ? (
                    <Image
                      alt={post.title}
                      className="object-cover rounded-[14px]"
                      fill
                  quality={IMAGE_QUALITY}
                    quality={IMAGE_QUALITY}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      src={post.image}
                    />
                ) : (
                  <span className="font-label text-[10px] uppercase tracking-[0.25em] text-outline">Image coming soon</span>
                )}
              </div>
            </Link>
            <div className="space-y-4">
              <span className="font-label text-[10px] uppercase tracking-widest text-primary">{getCategoryLabel(post.category, language)}</span>
              <Link href={`/news/${post.slug}`}>
                <h3 className="font-headline text-[1.75rem] leading-tight sm:text-3xl">{post.title}</h3>
              </Link>
              <Link href={`/news/${post.slug}`}>
                <p className="font-body text-sm leading-7 text-on-surface-variant">{post.description}</p>
              </Link>
            </div>
          </article>
        ))}
      </div>
      )}

      {hasMore && (
        <div className="mt-14 flex justify-center sm:mt-20">
          <button
            className="min-h-12 w-full max-w-sm border border-outline px-8 py-4 font-label text-xs uppercase tracking-[0.35em] transition-all hover:bg-on-surface hover:text-background sm:w-auto sm:px-12"
            onClick={handleLoadMore}
            type="button"
          >
            {language === "fr" ? "VOIR PLUS" : "LOAD MORE"}
          </button>
        </div>
      )}
    </>
  );
}
