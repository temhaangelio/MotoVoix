import SiteHeader from "../components/site-header";

export const metadata = {
  title: "Terms | MotoVoix",
  description: "Terms of use for MotoVoix.",
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 md:px-8 md:pt-28 md:pb-24">
        <section className="mb-12 border-b border-outline-variant/20 pb-8 sm:mb-16 sm:pb-10">
          <span className="font-label text-xs uppercase tracking-[0.3em] text-primary mb-4 block">MOTOVOIX / TERMS</span>
          <h1 className="font-headline text-5xl font-light tracking-tight leading-none mb-5 sm:text-6xl md:text-7xl">Terms of Use.</h1>
          <p className="max-w-3xl font-body text-lg text-on-surface-variant sm:text-xl">
            These terms govern your use of MotoVoix content, website access, and editorial materials.
          </p>
        </section>

        <article className="bg-surface-container-low p-5 sm:p-8 border border-outline-variant/20 space-y-8">
          <section>
            <h2 className="font-headline text-2xl mb-3 sm:text-3xl">Content Usage</h2>
            <p className="font-body text-on-surface-variant leading-relaxed">
              All MotoVoix content is provided for informational purposes. Republishing, scraping, or commercial redistribution requires prior written permission.
            </p>
          </section>
          <section>
            <h2 className="font-headline text-2xl mb-3 sm:text-3xl">Editorial Disclaimer</h2>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Specifications, pricing, and availability can change. We recommend verifying details with official manufacturers and local dealers before making purchase decisions.
            </p>
          </section>
          <section>
            <h2 className="font-headline text-2xl mb-3 sm:text-3xl">Liability</h2>
            <p className="font-body text-on-surface-variant leading-relaxed">
              MotoVoix is not liable for direct or indirect losses resulting from reliance on published information, external links, or third-party services.
            </p>
          </section>
        </article>
      </main>
    </>
  );
}
