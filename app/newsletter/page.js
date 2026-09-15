import Link from "next/link";
import SiteHeader from "../components/site-header";
import NewsletterSubscribeForm from "../components/newsletter-subscribe-form";
import { MaintenanceNotice } from "../components/maintenance-notice";
import { preparePublicPage } from "../../lib/public-page";
import { getActiveSubscriberCount } from "../../lib/local-db";

export const revalidate = 300;

export const metadata = {
  title: "Newsletter",
  description: "Subscribe to the MotoVoix newsletter.",
};

const FALLBACK_TITLE = "Get the week's essential motorcycle stories.";
const FALLBACK_DESCRIPTION =
  "Subscribe to receive launch news, manufacturer moves, racing updates, and key industry headlines in one clean briefing.";

export default async function NewsletterPage() {
  const settings = await preparePublicPage("/newsletter");
  if (settings.maintenanceMode) return <MaintenanceNotice settings={settings} />;
  const subscriberCount = settings.showSubscriberCount ? await getActiveSubscriberCount() : 0;
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 md:px-8 md:pt-28 md:pb-24">
        <section className="mb-10 grid grid-cols-1 gap-6 rounded-[22px] border border-outline-variant/20 bg-surface-container-low p-5 sm:p-8 md:mb-14 md:grid-cols-[1.1fr_0.9fr] md:gap-10 md:p-10 lg:p-12">
          <div className="max-w-2xl">
            <span className="mb-4 block font-label text-xs uppercase tracking-[0.3em] text-primary">NEWSLETTER / JOIN</span>
            <h1 className="font-headline text-5xl leading-[0.94] text-zinc-50 sm:text-6xl md:text-7xl">
              {settings.newsletterTitle || FALLBACK_TITLE}
            </h1>
            <p className="mt-5 max-w-xl font-body text-base leading-7 text-on-surface-variant sm:text-lg">
              {settings.newsletterDescription || FALLBACK_DESCRIPTION}
            </p>
            {subscriberCount > 0 ? (
              <p className="mt-6 font-label text-xs uppercase tracking-[0.2em] text-primary">
                {subscriberCount.toLocaleString("en-US")} riders subscribed
              </p>
            ) : null}
          </div>

          <div className="rounded-[22px] border border-outline-variant/20 bg-surface-container p-5 sm:p-6 md:p-8">
            {settings.newsletterEnabled ? (
              <>
                <NewsletterSubscribeForm />
                <p className="mt-4 font-body text-sm leading-7 text-on-surface-variant">
                  No spam. No clutter. Just a concise roundup from MotoVoix.
                </p>
              </>
            ) : (
              <p className="font-body text-sm leading-7 text-on-surface-variant">
                Subscriptions are currently closed. Please check back soon.
              </p>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <article className="rounded-[20px] border border-outline-variant/20 bg-surface-container-low p-5 sm:p-6">
            <p className="font-label text-[10px] uppercase tracking-[0.24em] text-primary">Frequency</p>
            <h2 className="mt-3 font-headline text-3xl text-zinc-50">Weekly</h2>
            <p className="mt-3 font-body text-sm leading-7 text-on-surface-variant">
              A compact digest focused on the strongest stories and launches.
            </p>
          </article>

          <article className="rounded-[20px] border border-outline-variant/20 bg-surface-container-low p-5 sm:p-6">
            <p className="font-label text-[10px] uppercase tracking-[0.24em] text-primary">Coverage</p>
            <h2 className="mt-3 font-headline text-3xl text-zinc-50">Global</h2>
            <p className="mt-3 font-body text-sm leading-7 text-on-surface-variant">
              New models, racing developments, technology, and brand strategy updates.
            </p>
          </article>

          <article className="rounded-[20px] border border-outline-variant/20 bg-surface-container-low p-5 sm:p-6">
            <p className="font-label text-[10px] uppercase tracking-[0.24em] text-primary">Access</p>
            <h2 className="mt-3 font-headline text-3xl text-zinc-50">Free</h2>
            <p className="mt-3 font-body text-sm leading-7 text-on-surface-variant">
              Built as a static sign-up page for the current private site setup.
            </p>
          </article>
        </section>

        <div className="mt-10 md:mt-14">
          <Link className="inline-block font-label text-xs uppercase tracking-widest border-b border-primary pb-1" href="/news">
            Back to News
          </Link>
        </div>
      </main>
    </>
  );
}
