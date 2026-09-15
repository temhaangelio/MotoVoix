// Sabit kodlanmış About / Contact / Privacy / Terms içeriklerini pages
// tablosuna taşır. Bir kez çalıştırılır; sonra sayfalar veritabanından
// okunur ve panelden düzenlenebilir.
//
//   node scripts/seed-pages.mjs
//
// Tekrar çalıştırılabilir, ama panelden yapılan düzenlemeleri ezer.
// Bunu istemiyorsan --only-empty ile yalnızca boş gövdeleri doldurur.

try {
  process.loadEnvFile(".env");
} catch {
  // .env yoksa DATABASE_URL dışarıdan geliyordur.
}

const onlyEmpty = process.argv.includes("--only-empty");
const { prisma } = await import("../lib/prisma.js");

const PAGES = [
  {
    slug: "about",
    title: "About",
    heading: "Who we are.",
    menu_order: 1,
    excerpt:
      "MotoVoix is an independent motorcycle news desk focused on launches, technology, racing, and market intelligence.",
    body: [
      "## Editorial Approach",
      "",
      "We prioritize factual reporting, primary-source verification, and clear technical context. Every story is written to be useful for both everyday riders and industry-following enthusiasts.",
      "",
      "Coverage includes production launches, strategy moves from major manufacturers, motorsport developments, and long-term trends shaping two-wheeled mobility.",
      "",
      "Our goal is simple: publish accurate motorcycle journalism with a modern, readable format.",
    ].join("\n"),
  },
  {
    slug: "contact",
    title: "Contact",
    heading: "Get in touch.",
    menu_order: 2,
    excerpt:
      "For editorial pitches, corrections, partnerships, or rights inquiries, contact the MotoVoix desk.",
    body: "",
  },
  {
    slug: "privacy",
    title: "Privacy",
    heading: "Privacy Policy.",
    menu_order: 3,
    excerpt:
      "This page explains what information we collect, how we process it, and how you can contact us about privacy questions.",
    body: [
      "## Data We Collect",
      "",
      "We may collect basic analytics data such as pages visited, session duration, and device type. If you contact us, we may store your name and email for response purposes.",
      "",
      "## How Data Is Used",
      "",
      "Data is used to improve website performance, editorial experience, and communication quality. We do not sell personal information to third parties.",
      "",
      "## Your Rights",
      "",
      "You may request deletion or correction of your personal contact data by reaching out to editorial@motovoix.com.",
    ].join("\n"),
  },
  {
    slug: "terms",
    title: "Terms",
    heading: "Terms of Use.",
    menu_order: 4,
    excerpt:
      "These terms govern your use of MotoVoix content, website access, and editorial materials.",
    body: [
      "## Content Usage",
      "",
      "All MotoVoix content is provided for informational purposes. Republishing, scraping, or commercial redistribution requires prior written permission.",
      "",
      "## Editorial Disclaimer",
      "",
      "Specifications, pricing, and availability can change. We recommend verifying details with official manufacturers and local dealers before making purchase decisions.",
      "",
      "## Liability",
      "",
      "MotoVoix is not liable for direct or indirect losses resulting from reliance on published information, external links, or third-party services.",
    ].join("\n"),
  },
];

try {
  for (const page of PAGES) {
    const existing = await prisma.page.findUnique({ where: { slug: page.slug } });

    if (existing && onlyEmpty && existing.body.trim().length > 40) {
      console.log(`atlandi (dolu): ${page.slug}`);
      continue;
    }

    const data = {
      title: page.title,
      heading: page.heading,
      excerpt: page.excerpt,
      body: page.body,
      menu_order: page.menu_order,
      published: true,
    };

    await prisma.page.upsert({
      where: { slug: page.slug },
      create: { slug: page.slug, ...data },
      update: data,
    });
    console.log(`${existing ? "guncellendi" : "olusturuldu"}: ${page.slug}`);
  }

  console.log("\ntoplam sayfa:", await prisma.page.count());
} catch (error) {
  console.error("Basarisiz:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
