// data/local-db.json içeriğini MySQL'e aktarır.
// Tekrar tekrar çalıştırılabilir: her kayıt id/slug üzerinden upsert edilir.
//
//   node scripts/migrate-json-to-mysql.mjs
//
// Öncesinde `prisma migrate deploy` ile tabloların oluşmuş olması gerekir.

import fs from "node:fs";
import path from "node:path";

try {
  process.loadEnvFile(".env");
} catch {
  // .env yoksa DATABASE_URL dışarıdan geliyordur.
}

const { prisma } = await import("../lib/prisma.js");

const dbPath = path.join(process.cwd(), "data", "local-db.json");

const POST_STATUS = new Set(["draft", "published", "scheduled"]);
const NEWSLETTER_STATUS = new Set(["draft", "scheduled", "sent"]);
const SUBSCRIBER_STATUS = new Set(["pending", "active", "unsubscribed"]);

const str = (value, fallback = "") => (value == null ? fallback : String(value));
const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const bool = (value, fallback = false) => (typeof value === "boolean" ? value : fallback);

function date(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function dateOnly(value) {
  const parsed = date(typeof value === "string" && value.length === 10 ? `${value}T00:00:00.000Z` : value);
  return parsed;
}

function enumValue(value, allowed, fallback) {
  const normalized = str(value).toLowerCase();
  return allowed.has(normalized) ? normalized : fallback;
}

function postData(post) {
  return {
    slug: str(post.slug),
    legacySlug: str(post.legacySlug) || null,
    title: str(post.title || post.titleEn),
    description: str(post.description),
    excerpt: str(post.excerpt),
    body: str(post.body),
    titleEn: str(post.titleEn),
    excerptEn: str(post.excerptEn),
    bodyEn: str(post.bodyEn),
    titleFr: str(post.titleFr),
    excerptFr: str(post.excerptFr),
    bodyFr: str(post.bodyFr),
    category: str(post.category, "motorcycle"),
    tags: str(post.tags),
    image: str(post.image),
    status: enumValue(post.status, POST_STATUS, "draft"),
    reads: num(post.reads),
    date: date(post.date) ?? date(post.created_at) ?? new Date(),
    created_at: date(post.created_at) ?? new Date(),
    published_at: date(post.published_at),
    scheduled_at: date(post.scheduled_at),
    source_name: str(post.source_name),
    source_url: str(post.source_url),
  };
}

async function run() {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Kaynak dosya bulunamadı: ${dbPath}`);
  }

  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  const counts = {};

  // --- ayarlar -------------------------------------------------------
  const s = db.settings ?? {};
  const settings = {
    siteName: str(s.siteName, "motorvoix"),
    domain: str(s.domain),
    description: str(s.description),
    descriptionEn: str(s.descriptionEn),
    contactEmail: str(s.contactEmail),
    language: str(s.language, "en"),
    feedLayout: str(s.feedLayout, "card"),
    postsPerPage: num(s.postsPerPage, 8),
    newsletterEnabled: bool(s.newsletterEnabled, true),
    newsletterTitle: str(s.newsletterTitle),
    newsletterDescription: str(s.newsletterDescription),
    showSubscriberCount: bool(s.showSubscriberCount, true),
    maintenanceMode: bool(s.maintenanceMode, false),
    modulePosts: bool(s.modulePosts, true),
    moduleNewsletter: bool(s.moduleNewsletter, true),
    moduleAds: bool(s.moduleAds, true),
    moduleAnalytics: bool(s.moduleAnalytics, true),
    moduleThemes: bool(s.moduleThemes, false),
    adminName: str(s.adminName),
    adminEmail: str(s.adminEmail),
  };
  await prisma.settings.upsert({ where: { id: 1 }, create: { id: 1, ...settings }, update: settings });
  counts.settings = 1;

  // --- yazılar -------------------------------------------------------
  counts.posts = 0;
  for (const post of db.posts ?? []) {
    const data = postData(post);
    await prisma.post.upsert({
      where: { id: str(post.id) },
      create: { id: str(post.id), ...data },
      update: data,
    });
    counts.posts += 1;
  }

  // --- sayfalar ------------------------------------------------------
  counts.pages = 0;
  for (const page of db.pages ?? []) {
    const data = {
      slug: str(page.slug),
      title: str(page.title),
      excerpt: str(page.excerpt),
      body: str(page.body),
      menu_order: num(page.menu_order),
      published: bool(page.published, true),
      created_at: date(page.created_at) ?? new Date(),
    };
    await prisma.page.upsert({ where: { id: str(page.id) }, create: { id: str(page.id), ...data }, update: data });
    counts.pages += 1;
  }

  // --- reklamlar -----------------------------------------------------
  counts.ads = 0;
  for (const ad of db.ads ?? []) {
    const data = {
      title: str(ad.title),
      description: str(ad.description),
      ctaLabel: str(ad.ctaLabel),
      targetUrl: str(ad.targetUrl),
      imageUrl: str(ad.imageUrl),
      language: str(ad.language, "en"),
      active: bool(ad.active, true),
      created_at: date(ad.created_at) ?? new Date(),
    };
    await prisma.ad.upsert({ where: { id: str(ad.id) }, create: { id: str(ad.id), ...data }, update: data });
    counts.ads += 1;
  }

  // --- e-bültenler ---------------------------------------------------
  counts.newsletters = 0;
  for (const item of db.newsletters ?? []) {
    const data = {
      issue_number: num(item.issue_number),
      subject: str(item.subject),
      preview_text: str(item.preview_text),
      content: str(item.content),
      status: enumValue(item.status, NEWSLETTER_STATUS, "draft"),
      scheduled_at: date(item.scheduled_at),
      sent_at: date(item.sent_at),
      recipient_count: num(item.recipient_count),
      open_count: num(item.open_count),
      click_count: num(item.click_count),
      unsubscribe_count: num(item.unsubscribe_count),
      created_at: date(item.created_at) ?? new Date(),
    };
    await prisma.newsletter.upsert({ where: { id: str(item.id) }, create: { id: str(item.id), ...data }, update: data });
    counts.newsletters += 1;
  }

  // --- aboneler ------------------------------------------------------
  counts.subscribers = 0;
  for (const sub of db.subscribers ?? []) {
    const data = {
      email: str(sub.email).toLowerCase(),
      name: str(sub.name),
      status: enumValue(sub.status, SUBSCRIBER_STATUS, "active"),
      source: str(sub.source, "Web sitesi"),
      created_at: date(sub.created_at) ?? new Date(),
    };
    await prisma.subscriber.upsert({
      where: { email: data.email },
      create: { id: str(sub.id), ...data },
      update: data,
    });
    counts.subscribers += 1;
  }

  // --- istatistik ----------------------------------------------------
  const analytics = db.analytics ?? {};

  counts.analyticsDaily = 0;
  for (const row of analytics.daily ?? []) {
    const day = dateOnly(row.date);
    if (!day) continue;
    const data = { pageviews: num(row.pageviews), visitors: num(row.visitors) };
    await prisma.analyticsDaily.upsert({ where: { date: day }, create: { date: day, ...data }, update: data });
    counts.analyticsDaily += 1;
  }

  counts.analyticsBreakdown = 0;
  const breakdowns = [
    ["source", analytics.sources ?? []],
    ["country", analytics.countries ?? []],
    ["device", analytics.devices ?? []],
  ];
  for (const [kind, rows] of breakdowns) {
    for (const row of rows) {
      const data = { code: str(row.code), percentage: num(row.percentage) };
      await prisma.analyticsBreakdown.upsert({
        where: { kind_label: { kind, label: str(row.label) } },
        create: { kind, label: str(row.label), ...data },
        update: data,
      });
      counts.analyticsBreakdown += 1;
    }
  }

  counts.analyticsTopPages = 0;
  for (const row of analytics.topPages ?? []) {
    const data = { pageviews: num(row.pageviews), visitors: num(row.visitors) };
    await prisma.analyticsTopPage.upsert({
      where: { path: str(row.path) },
      create: { path: str(row.path), ...data },
      update: data,
    });
    counts.analyticsTopPages += 1;
  }

  console.table(counts);
  console.log("Aktarım tamamlandı.");
}

run()
  .catch((error) => {
    console.error("Aktarım başarısız:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
