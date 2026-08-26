import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllNews, getNewsBySlug } from "../../../lib/news";
import SiteHeader from "../../components/site-header";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);

  if (!post) {
    return { title: "Story not found" };
  }

  return {
    title: post.title,
    description: post.description,
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

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 md:px-8 md:pt-28 md:pb-24">
        <section className="grid grid-cols-1 gap-6 border-b border-outline-variant/20 pb-10 md:gap-8 lg:grid-cols-12 lg:gap-12 lg:pb-12">
          <div className="lg:col-span-8">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-primary mb-4 block">
              {post.category} / DETAIL
            </span>
            <h1 className="font-headline text-4xl font-light tracking-tight leading-tight mb-5 sm:text-5xl md:text-6xl lg:text-7xl">
              {post.title}
            </h1>
            <p className="max-w-3xl font-body text-base leading-relaxed text-on-surface-variant sm:text-lg">
              {post.description}
            </p>
          </div>
          <aside className="lg:col-span-4 bg-surface-container-low p-5 sm:p-8 h-fit rounded-[18px] border border-outline-variant/20">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-6">PUBLISH INFO</p>
            <div className="space-y-4 text-sm">
              <p suppressHydrationWarning>
                <span className="text-zinc-400">Date:</span>{" "}
                {new Intl.DateTimeFormat("en-US", { timeZone: "UTC", dateStyle: "short", timeStyle: "medium" }).format(new Date(post.date))}
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-8 lg:mt-12 lg:grid-cols-12 lg:gap-12">
          <article className="lg:col-span-8">
            <div className="aspect-[4/3] sm:aspect-[21/9] overflow-hidden mb-8 sm:mb-10 bg-surface-container-low border border-outline-variant/20 flex items-center justify-center rounded-[14px]">
              {post.image ? (
                <img alt={post.title} className="w-full h-full object-cover rounded-[14px]" src={post.image} />
              ) : (
                <span className="font-label text-[10px] uppercase tracking-[0.25em] text-outline">Image coming soon</span>
              )}
            </div>

            <article
              className="font-body text-base leading-8 text-zinc-200 sm:text-lg space-y-6 [&_p]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2 [&_a]:break-words [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </article>

          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-surface-container-low p-5 sm:p-8 rounded-[18px] border border-outline-variant/20">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-5">RELATED STORIES</p>
              <div className="space-y-6">
                {relatedPosts.map((item) => (
                  <Link className="block group" href={`/haber/${item.slug}`} key={item.slug}>
                    <h3 className="font-headline text-2xl group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1">{item.category}</p>
                  </Link>
                ))}
              </div>
            </div>
            <Link className="inline-block font-label text-xs uppercase tracking-widest border-b border-primary pb-1" href="/news">
              BACK TO HOME
            </Link>
          </aside>
        </section>
      </main>
    </>
  );
}
