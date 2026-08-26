import SiteHeader from "../components/site-header";

export const metadata = {
  title: "Contact | MotoVoix",
  description: "Contact MotoVoix editorial desk.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 md:px-8 md:pt-28 md:pb-24">
        <section className="mb-12 border-b border-outline-variant/20 pb-8 sm:mb-16 sm:pb-10">
          <span className="font-label text-xs uppercase tracking-[0.3em] text-primary mb-4 block">MOTOVOIX / CONTACT</span>
          <h1 className="font-headline text-5xl font-light tracking-tight leading-none mb-5 sm:text-6xl md:text-7xl">Get in touch.</h1>
          <p className="max-w-3xl font-body text-lg text-on-surface-variant sm:text-xl">
            For editorial pitches, corrections, partnerships, or rights inquiries, contact the MotoVoix desk.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-10 lg:gap-12">
          <article className="md:col-span-8 rounded-[20px] bg-surface-container-low p-5 sm:p-8 border border-outline-variant/20">
            <form className="space-y-5">
              <div>
                <label className="font-label text-xs uppercase tracking-widest text-zinc-400 block mb-2" htmlFor="name">Name</label>
                <input className="w-full bg-transparent border border-outline-variant/30 px-4 py-3 text-base text-on-surface focus:outline-none focus:border-primary transition-colors" id="name" name="name" type="text" />
              </div>
              <div>
                <label className="font-label text-xs uppercase tracking-widest text-zinc-400 block mb-2" htmlFor="email">Email</label>
                <input className="w-full bg-transparent border border-outline-variant/30 px-4 py-3 text-base text-on-surface focus:outline-none focus:border-primary transition-colors" id="email" name="email" type="email" />
              </div>
              <div>
                <label className="font-label text-xs uppercase tracking-widest text-zinc-400 block mb-2" htmlFor="message">Message</label>
                <textarea className="w-full min-h-40 bg-transparent border border-outline-variant/30 px-4 py-3 text-base text-on-surface focus:outline-none focus:border-primary transition-colors" id="message" name="message" />
              </div>
              <button className="min-h-12 w-full bg-primary-container px-8 py-3 font-label text-sm uppercase tracking-widest text-on-primary-container transition-all hover:opacity-90 sm:w-auto" type="button">
                Send Message
              </button>
            </form>
          </article>

          <aside className="md:col-span-4 rounded-[20px] bg-surface-container-low p-5 sm:p-8 border border-outline-variant/20 h-fit">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-5">CONTACT DETAILS</p>
            <div className="space-y-3 text-sm text-on-surface-variant">
              <p><span className="text-zinc-400">Email:</span> editorial@motovoix.com</p>
              <p><span className="text-zinc-400">Location:</span> Istanbul</p>
              <p><span className="text-zinc-400">Response:</span> 1-2 business days</p>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}
