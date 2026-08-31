import SiteHeader from "../components/site-header";

export const metadata = {
  title: "About | MotoVoix",
  description: "About MotoVoix editorial desk.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 md:px-8 md:pt-28 md:pb-24">
        <section className="mb-12 border-b border-outline-variant/20 pb-8 sm:mb-16 sm:pb-10">
          <span className="font-label text-xs uppercase tracking-[0.3em] text-primary mb-4 block">MOTOVOIX / ABOUT</span>
          <h1 className="font-headline text-5xl font-light tracking-tight leading-none mb-5 sm:text-6xl md:text-7xl">Who we are.</h1>
          <p className="max-w-3xl font-body text-lg text-on-surface-variant sm:text-xl">
            MotoVoix is an independent motorcycle news desk focused on launches, technology, racing, and market intelligence.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-10 lg:gap-12">
          <article className="md:col-span-8 rounded-[20px] bg-surface-container-low p-5 sm:p-8 border border-outline-variant/20">
            <h2 className="font-headline text-3xl mb-5 sm:text-4xl">Editorial Approach</h2>
            <p className="font-body text-on-surface-variant leading-relaxed mb-5">
              We prioritize factual reporting, primary-source verification, and clear technical context. Every story is written to be useful for both everyday riders and industry-following enthusiasts.
            </p>
            <p className="font-body text-on-surface-variant leading-relaxed mb-5">
              Coverage includes production launches, strategy moves from major manufacturers, motorsport developments, and long-term trends shaping two-wheeled mobility.
            </p>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Our goal is simple: publish accurate motorcycle journalism with a modern, readable format.
            </p>
          </article>

          <aside className="md:col-span-4 rounded-[20px] bg-surface-container-low p-5 sm:p-8 border border-outline-variant/20 h-fit">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-5">DESK INFO</p>
            <div className="space-y-3 text-sm text-on-surface-variant">
              <p><span className="text-zinc-400">Founded:</span> 2026</p>
              <p><span className="text-zinc-400">Focus:</span> Motorcycle and Atv News</p>
              <p><span className="text-zinc-400">Language:</span> English</p>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}
