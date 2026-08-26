"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export default function NewsFeed({ posts }) {
  const [visibleCount, setVisibleCount] = useState(8);

  const featured = posts[0];
  const side = posts[1];

  const gridPosts = useMemo(() => {
    return posts.slice(2, visibleCount);
  }, [posts, visibleCount]);

  const hasMore = posts.length > visibleCount;

  function handleLoadMore() {
    setVisibleCount((prev) => prev + 4);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-10 lg:gap-12">
        {featured && (
          <article className="md:col-span-8 group rounded-[14px]">
            <Link href={`/haber/${featured.slug}`}>
              <div className="relative aspect-[4/3] sm:aspect-[21/9] overflow-hidden mb-5 sm:mb-6 bg-surface-container-low border border-outline-variant/20 flex items-center justify-center rounded-[14px]">
                {featured.image ? (
                  <img alt={featured.title} className="w-full h-full object-cover rounded-[14px]" src={featured.image} />
                ) : (
                  <span className="font-label text-[10px] uppercase tracking-[0.25em] text-outline">Image coming soon</span>
                )}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                  <span className="bg-primary-container text-on-primary-container px-3 py-1 sm:px-4 font-label text-[10px] uppercase tracking-[0.2em]">FEATURED</span>
                </div>
              </div>
            </Link>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              <div className="md:col-span-2">
                <Link href={`/haber/${featured.slug}`}>
                  <h2 className="w-full font-headline text-3xl leading-tight mb-3 sm:text-4xl group-hover:text-primary transition-colors duration-300">{featured.title}</h2>
                </Link>
                <Link href={`/haber/${featured.slug}`}>
                  <p className="w-full font-body text-sm leading-7 text-on-surface-variant mb-5 sm:mb-6 sm:text-base">{featured.description}</p>
                </Link>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <span className="font-label text-xs uppercase tracking-widest text-on-surface">{featured.category}</span>
                  <span className="font-label text-xs uppercase tracking-widest text-outline" suppressHydrationWarning>
                    {new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "numeric", day: "numeric", year: "numeric" }).format(new Date(featured.date))}
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-between md:items-end md:pl-8">
                <Link className="inline-flex min-h-11 items-center font-label text-xs uppercase tracking-widest border-b-2 border-primary pb-1 group-hover:pr-4 transition-all duration-300" href={`/haber/${featured.slug}`}>READ STORY</Link>
              </div>
            </div>
          </article>
        )}

        {side && (
          <article className="md:col-span-4 group bg-surface-container-low p-5 sm:p-8 flex flex-col justify-between rounded-[14px] overflow-hidden border border-outline-variant/20">
            <div>
              <Link href={`/haber/${side.slug}`}>
                <div className="aspect-video bg-surface-container-high mb-6 overflow-hidden border border-outline-variant/20 flex items-center justify-center rounded-[14px]">
                  {side.image ? (
                    <img alt={side.title} className="w-full h-full object-cover rounded-[14px]" src={side.image} />
                  ) : (
                    <span className="font-label text-[10px] uppercase tracking-[0.25em] text-outline">Image coming soon</span>
                  )}
                </div>
              </Link>
              <span className="font-label text-[10px] uppercase tracking-widest text-primary mb-2 block">{side.category}</span>
              <Link href={`/haber/${side.slug}`}>
                <h3 className="font-headline text-2xl mb-3 leading-tight">{side.title}</h3>
              </Link>
              <Link href={`/haber/${side.slug}`}>
                <p className="font-body text-sm leading-7 text-on-surface-variant">{side.description}</p>
              </Link>
            </div>
          </article>
        )}

        {gridPosts.map((post) => (
          <article className="md:col-span-4 group bg-surface-container-low p-5 sm:p-6 rounded-[14px] border border-outline-variant/20" key={post.slug}>
            <Link href={`/haber/${post.slug}`}>
              <div className="aspect-video bg-surface-container-high mb-6 overflow-hidden border border-outline-variant/20 flex items-center justify-center rounded-[14px]">
                {post.image ? (
                    <img alt={post.title} className="w-full h-full object-cover rounded-[14px]" src={post.image} />
                ) : (
                  <span className="font-label text-[10px] uppercase tracking-[0.25em] text-outline">Image coming soon</span>
                )}
              </div>
            </Link>
            <div className="space-y-4">
              <span className="font-label text-[10px] uppercase tracking-widest text-primary">{post.category}</span>
              <Link href={`/haber/${post.slug}`}>
                <h3 className="font-headline text-[1.75rem] leading-tight sm:text-3xl">{post.title}</h3>
              </Link>
              <Link href={`/haber/${post.slug}`}>
                <p className="font-body text-sm leading-7 text-on-surface-variant">{post.description}</p>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {hasMore && (
        <div className="mt-14 flex justify-center sm:mt-20">
          <button
            className="min-h-12 w-full max-w-sm border border-outline px-8 py-4 font-label text-xs uppercase tracking-[0.35em] transition-all hover:bg-on-surface hover:text-background sm:w-auto sm:px-12"
            onClick={handleLoadMore}
            type="button"
          >
            LOAD MORE
          </button>
        </div>
      )}
    </>
  );
}
