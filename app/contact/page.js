import { notFound } from "next/navigation";
import { getPublicPage } from "../../lib/pages";
import { preparePublicPage } from "../../lib/public-page";
import { absoluteUrl } from "../../lib/site";
import SiteHeader from "../components/site-header";
import ContactForm from "../components/contact-form";
import { MaintenanceNotice } from "../components/maintenance-notice";

export const revalidate = 300;

const SLUG = "contact";

export async function generateMetadata() {
  const page = await getPublicPage(SLUG);
  if (!page) return { title: "Contact" };
  return {
    title: page.title,
    description: page.excerpt,
    alternates: { canonical: absoluteUrl(`/${SLUG}`) },
  };
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPublicPage(SLUG), preparePublicPage("/contact")]);
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
          <article className="md:col-span-8 rounded-[20px] bg-surface-container-low p-5 sm:p-8 border border-outline-variant/20">
            <ContactForm />
          </article>

          <aside className="md:col-span-4 rounded-[20px] bg-surface-container-low p-5 sm:p-8 border border-outline-variant/20 h-fit">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-5">CONTACT DETAILS</p>
            <div className="space-y-3 text-sm text-on-surface-variant">
              <p><span className="text-zinc-400">Email:</span> {settings.contactEmail || "editorial@motovoix.com"}</p>
              <p><span className="text-zinc-400">Location:</span> Istanbul</p>
              <p><span className="text-zinc-400">Response:</span> 1-2 business days</p>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}
