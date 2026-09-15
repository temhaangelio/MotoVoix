import { notFound } from "next/navigation";
import { getPublicPage, getPublicPageLinks } from "../../../lib/pages";
import { DEDICATED_PAGE_SLUGS } from "../../../lib/page-path";
import { preparePublicPage } from "../../../lib/public-page";
import { absoluteUrl } from "../../../lib/site";
import SiteHeader from "../../components/site-header";
import { MaintenanceNotice } from "../../components/maintenance-notice";

// Panelden eklenen her yayındaki sayfa /sayfa/<slug> adresinde açılır.
// about / contact / privacy / terms kendi rotalarını kullanır; /sayfa/about
// gibi adresler next.config.mjs'teki 308 yönlendirmesiyle oraya gider.

export const revalidate = 300;

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,99}$/;

// Rastgele adresler her biri için ayrı önbellek kaydı açmasın diye önce
// tek bir önbellekli yayındaki-sayfa listesine bakılıyor.
async function resolvePage(slug) {
  if (!SLUG_PATTERN.test(slug) || DEDICATED_PAGE_SLUGS.includes(slug)) return null;
  const links = await getPublicPageLinks();
  if (!links.some((link) => link.slug === slug)) return null;
  return getPublicPage(slug);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await resolvePage(slug);
  if (!page) return { title: "Page not found", robots: { index: false, follow: false } };
  return {
    title: page.title,
    description: page.excerpt,
    alternates: { canonical: absoluteUrl(`/sayfa/${page.slug}`) },
  };
}

export default async function CustomPage({ params }) {
  const { slug } = await params;
  const [page, settings] = await Promise.all([resolvePage(slug), preparePublicPage(`/sayfa/${slug}`)]);
  if (settings.maintenanceMode) return <MaintenanceNotice settings={settings} />;
  if (!page) notFound();

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 md:px-8 md:pt-28 md:pb-24">
        <section className="mb-12 border-b border-outline-variant/20 pb-8 sm:mb-16 sm:pb-10">
          <span className="font-label text-xs uppercase tracking-[0.3em] text-primary mb-4 block">{page.eyebrow}</span>
          <h1 className="font-headline text-5xl font-light tracking-tight leading-none mb-5 sm:text-6xl md:text-7xl">{page.heading}</h1>
          {page.excerpt ? (
            <p className="max-w-3xl font-body text-lg text-on-surface-variant sm:text-xl">{page.excerpt}</p>
          ) : null}
        </section>

        {page.bodyHtml ? (
          <article
            className="bg-surface-container-low p-5 sm:p-8 border border-outline-variant/20 [&_h2]:font-headline [&_h2]:text-2xl [&_h2]:mb-3 [&_h2]:mt-8 sm:[&_h2]:text-3xl [&_h2:first-child]:mt-0 [&_p]:font-body [&_p]:text-on-surface-variant [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-on-surface-variant [&_li]:mb-2 [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
          />
        ) : null}
      </main>
    </>
  );
}
