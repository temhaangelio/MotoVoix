import { notFound } from "next/navigation";
import { getPublicPage } from "../../lib/pages";
import { preparePublicPage } from "../../lib/public-page";
import { absoluteUrl } from "../../lib/site";
import SiteHeader from "../components/site-header";
import { MaintenanceNotice } from "../components/maintenance-notice";

export const revalidate = 300;

const SLUG = "about";

export async function generateMetadata() {
  const page = await getPublicPage(SLUG);
  if (!page) return { title: "About" };
  return {
    title: page.title,
    description: page.excerpt,
    alternates: { canonical: absoluteUrl(`/${SLUG}`) },
  };
}

export default async function AboutPage() {
  const [page, settings] = await Promise.all([getPublicPage(SLUG), preparePublicPage("/about")]);
  if (settings.maintenanceMode) return <MaintenanceNotice settings={settings} />;
  if (!page) notFound();

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 md:px-8 md:pt-28 md:pb-24">
        <section className="mb-12 border-b border-outline-variant/20 pb-8 sm:mb-16 sm:pb-10">
          <span className="font-label text-xs uppercase tracking-[0.3em] text-primary mb-4 block">{page.eyebrow}</span>
          <h1 className="font-headline text-5xl font-light tracking-tight leading-none mb-5 sm:text-6xl md:text-7xl">{page.heading}</h1>
          <p className="max-w-3xl font-body text-lg text-on-surface-variant sm:text-xl">
            {page.excerpt}
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-10 lg:gap-12">
          <article
            className="md:col-span-8 rounded-[20px] bg-surface-container-low p-5 sm:p-8 border border-outline-variant/20 [&_h2]:font-headline [&_h2]:text-3xl [&_h2]:mb-5 sm:[&_h2]:text-4xl [&_p]:font-body [&_p]:text-on-surface-variant [&_p]:leading-relaxed [&_p]:mb-5 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-on-surface-variant [&_li]:mb-2 [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
          />

          <aside className="md:col-span-4 rounded-[20px] bg-surface-container-low p-5 sm:p-8 border border-outline-variant/20 h-fit">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-5">DESK INFO</p>
            <div className="space-y-3 text-sm text-on-surface-variant">
              <p><span className="text-zinc-400">Founded:</span> {new Date(page.created_at).getUTCFullYear()}</p>
              <p><span className="text-zinc-400">Focus:</span> Motorcycle and Atv News</p>
              <p><span className="text-zinc-400">Language:</span> {settings.language === "fr" ? "French" : "English"}</p>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}
