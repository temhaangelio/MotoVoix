import { BrandMark } from "./brand-mark";

// Bakım modu açıkken ziyaretçi sayfalarının yerine bu içerik render edilir.
// Yönlendirme kullanmıyoruz: Next sayfa içi redirect'i 200 + meta refresh
// olarak sunuyor, bu da hem 1 saniye gecikme hem yanlış SEO sinyali demek.
export function MaintenanceNotice({ settings }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="max-w-lg text-center">
        <BrandMark className="mx-auto !size-14 text-primary" />
        <h1 className="font-headline mt-8 text-4xl font-light tracking-tight sm:text-5xl">
          We&rsquo;ll be right back.
        </h1>
        <p className="font-body mt-5 text-lg text-on-surface-variant">
          {settings?.siteName || "MotoVoix"} is briefly offline for maintenance. Please check back shortly.
        </p>
        {settings?.contactEmail ? (
          <p className="font-body mt-8 text-sm text-outline">
            Need something urgently?{" "}
            <a className="text-primary underline" href={`mailto:${settings.contactEmail}`}>
              {settings.contactEmail}
            </a>
          </p>
        ) : null}
      </div>
    </main>
  );
}
