// MotoVoix veri katmanı — MySQL (Prisma).
//
// Tüm fonksiyonlar async'tir. Dönüş şekilleri eski JSON tabanlı sürümle
// birebir aynı tutuldu (created_at, source_name, titleEn ...), böylece
// çağıran taraflarda yalnızca `await` eklendi.

import { prisma } from "./prisma.js";
import { slugify } from "./markdown.js";

const str = (value, fallback = "") => (value == null ? fallback : String(value));

function toDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const POST_STATUS = new Set(["draft", "published", "scheduled"]);
const NEWSLETTER_STATUS = new Set(["draft", "scheduled", "sent"]);

function postStatus(value, fallback = "draft") {
  const normalized = str(value).toLowerCase();
  return POST_STATUS.has(normalized) ? normalized : fallback;
}

// Slug artık veritabanında benzersiz; çakışırsa sonuna sayı ekleniyor.
async function uniqueSlug(base, ignoreId = null) {
  const root = slugify(base) || `haber-${Date.now().toString(36)}`;
  let candidate = root;
  for (let suffix = 2; suffix < 100; suffix += 1) {
    const existing = await prisma.post.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${root}-${suffix}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}

async function uniquePageSlug(base, ignoreId = null) {
  const root = slugify(base) || `sayfa-${Date.now().toString(36)}`;
  let candidate = root;
  for (let suffix = 2; suffix < 100; suffix += 1) {
    const existing = await prisma.page.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${root}-${suffix}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}

// --------------------------------------------------------------- ayarlar

const SETTINGS_STRINGS = [
  "siteName",
  "domain",
  "description",
  "descriptionEn",
  "language",
  "feedLayout",
  "contactEmail",
  "newsletterTitle",
  "newsletterDescription",
  "adminName",
  "adminEmail",
];

const SETTINGS_BOOLS = [
  "newsletterEnabled",
  "showSubscriberCount",
  "maintenanceMode",
  "modulePosts",
  "moduleNewsletter",
  "moduleAds",
  "moduleAnalytics",
  "moduleThemes",
];

const SETTINGS_FALLBACK = {
  id: 1,
  siteName: "motorvoix",
  domain: "",
  description: "",
  descriptionEn: "",
  contactEmail: "",
  language: "en",
  feedLayout: "card",
  postsPerPage: 8,
  newsletterEnabled: true,
  newsletterTitle: "",
  newsletterDescription: "",
  showSubscriberCount: true,
  maintenanceMode: false,
  modulePosts: true,
  moduleNewsletter: true,
  moduleAds: true,
  moduleAnalytics: true,
  moduleThemes: false,
  adminName: "",
  adminEmail: "",
};

export async function getSettings() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  return settings ?? SETTINGS_FALLBACK;
}

export async function updateSettings(patch) {
  const data = {};
  for (const key of SETTINGS_STRINGS) {
    if (key in patch) data[key] = str(patch[key]);
  }
  for (const key of SETTINGS_BOOLS) {
    if (key in patch) data[key] = Boolean(patch[key]);
  }
  if ("postsPerPage" in patch) data.postsPerPage = Number(patch.postsPerPage) || 8;

  return prisma.settings.upsert({
    where: { id: 1 },
    create: { ...SETTINGS_FALLBACK, ...data },
    update: data,
  });
}

// ---------------------------------------------------------------- yazılar

const POST_ORDER = [{ created_at: "desc" }, { date: "desc" }];

export async function getPosts() {
  return prisma.post.findMany({ orderBy: POST_ORDER });
}

export async function getPostById(id) {
  if (!id) return null;
  return prisma.post.findUnique({ where: { id: String(id) } });
}

// Liste/kart görünümleri gövdeye ihtiyaç duymuyor. Gövdeler MediumText
// olduğu için select daraltmak hem sorguyu hem RSC yükünü ciddi küçültüyor.
const POST_CARD_SELECT = {
  id: true,
  slug: true,
  legacySlug: true,
  title: true,
  titleEn: true,
  titleFr: true,
  description: true,
  excerpt: true,
  excerptEn: true,
  excerptFr: true,
  category: true,
  tags: true,
  image: true,
  date: true,
  published_at: true,
  created_at: true,
};

const PUBLISHED = { status: "published" };

// Ziyaretçi akışı: yayındaki tüm yazılar, gövdesiz.
export async function getPublishedNewsCards() {
  return prisma.post.findMany({ where: PUBLISHED, orderBy: POST_ORDER, select: POST_CARD_SELECT });
}

// Tek haber: slug veya eski slug üzerinden tek sorgu.
export async function getPublishedPostBySlug(slug) {
  const value = String(slug ?? "");
  if (!value) return null;
  return prisma.post.findFirst({ where: { ...PUBLISHED, OR: [{ slug: value }, { legacySlug: value }] } });
}

// İlgili haberler: veritabanında sınırlanıyor, tüm tablo çekilmiyor.
export async function getRelatedPublishedNews(slug, limit = 3) {
  return prisma.post.findMany({
    where: { ...PUBLISHED, slug: { not: String(slug ?? "") } },
    orderBy: POST_ORDER,
    take: limit,
    select: POST_CARD_SELECT,
  });
}

// Sitemap: yalnızca slug ve tarihler.
export async function getPublishedNewsIndex() {
  return prisma.post.findMany({
    where: PUBLISHED,
    orderBy: POST_ORDER,
    select: { slug: true, date: true, published_at: true, created_at: true },
  });
}

export async function createPost(input) {
  const now = new Date();
  const status = postStatus(input.status);
  const slug = await uniqueSlug(input.slug || input.title || input.titleEn);

  return prisma.post.create({
    data: {
      slug,
      title: str(input.title || input.titleEn),
      titleEn: str(input.titleEn || input.title),
      titleFr: str(input.titleFr),
      description: str(input.description || input.excerpt),
      excerpt: str(input.excerpt || input.description),
      body: str(input.body),
      excerptEn: str(input.excerptEn || input.excerpt || input.description),
      excerptFr: str(input.excerptFr),
      bodyEn: str(input.bodyEn || input.body),
      bodyFr: str(input.bodyFr),
      category: str(input.category, "motorcycle") || "motorcycle",
      tags: str(input.tags),
      image: str(input.image),
      date: toDate(input.date) ?? now,
      status,
      reads: 0,
      created_at: now,
      published_at: status === "published" ? now : null,
      scheduled_at: status === "scheduled" ? toDate(input.scheduled_at) : null,
      source_name: str(input.source_name),
      source_url: str(input.source_url),
    },
  });
}

const POST_TEXT_FIELDS = [
  "title",
  "titleEn",
  "titleFr",
  "description",
  "excerpt",
  "body",
  "excerptEn",
  "excerptFr",
  "bodyEn",
  "bodyFr",
  "category",
  "tags",
  "image",
  "source_name",
  "source_url",
];

export async function updatePost(id, input) {
  const current = await getPostById(id);
  if (!current) return null;

  const status = input.status ? postStatus(input.status, current.status) : current.status;
  const data = { status };

  for (const field of POST_TEXT_FIELDS) {
    if (field in input && input[field] != null) data[field] = str(input[field]);
  }
  if (input.slug) data.slug = await uniqueSlug(input.slug, current.id);
  if (input.date) data.date = toDate(input.date) ?? current.date;

  data.published_at = status === "published" ? current.published_at ?? new Date() : current.published_at;
  data.scheduled_at = status === "scheduled" ? toDate(input.scheduled_at) ?? current.scheduled_at : null;

  return prisma.post.update({ where: { id: current.id }, data });
}

export async function deletePost(id) {
  try {
    await prisma.post.delete({ where: { id: String(id) } });
    return true;
  } catch {
    return false;
  }
}

// Ziyaretçi haber detayını açtığında okunma sayacını artırır.
export async function incrementPostReads(id) {
  try {
    await prisma.post.update({ where: { id: String(id) }, data: { reads: { increment: 1 } } });
  } catch {
    // Yazı silinmiş olabilir; sayaç kritik değil.
  }
}

// --------------------------------------------------------------- sayfalar

export async function getPages() {
  return prisma.page.findMany({ orderBy: { menu_order: "asc" } });
}

export async function getPageById(id) {
  if (!id) return null;
  return prisma.page.findUnique({ where: { id: String(id) } });
}

export async function getPublishedPages() {
  return prisma.page.findMany({ where: { published: true }, orderBy: { menu_order: "asc" } });
}

export async function createPage(input) {
  const count = await prisma.page.count();
  return prisma.page.create({
    data: {
      title: str(input.title),
      heading: str(input.heading),
      slug: await uniquePageSlug(input.slug || input.title),
      excerpt: str(input.excerpt),
      body: str(input.body),
      menu_order: Number(input.menu_order) || count + 1,
      published: Boolean(input.published),
    },
  });
}

export async function updatePage(id, input) {
  const current = await getPageById(id);
  if (!current) return null;

  const data = {};
  for (const field of ["title", "heading", "excerpt", "body"]) {
    if (field in input && input[field] != null) data[field] = str(input[field]);
  }
  if (input.slug) data.slug = await uniquePageSlug(input.slug, current.id);
  if ("menu_order" in input) data.menu_order = Number(input.menu_order) || current.menu_order;
  if ("published" in input) data.published = Boolean(input.published);

  return prisma.page.update({ where: { id: current.id }, data });
}

export async function deletePage(id) {
  try {
    await prisma.page.delete({ where: { id: String(id) } });
    return true;
  } catch {
    return false;
  }
}

// -------------------------------------------------------------- reklamlar

export async function getAds() {
  return prisma.ad.findMany({ orderBy: { created_at: "desc" } });
}

export async function getActiveAds(language = "en") {
  return prisma.ad.findMany({ where: { active: true, language }, orderBy: { created_at: "desc" } });
}

export async function createAd(input) {
  return prisma.ad.create({
    data: {
      title: str(input.title),
      description: str(input.description),
      ctaLabel: str(input.ctaLabel, "Discover") || "Discover",
      targetUrl: str(input.targetUrl),
      imageUrl: str(input.imageUrl),
      language: str(input.language, "en") || "en",
      active: Boolean(input.active),
    },
  });
}

export async function getAdById(id) {
  if (!id) return null;
  return prisma.ad.findUnique({ where: { id: String(id) } });
}

export async function updateAd(id, patch) {
  const data = {};
  for (const field of ["title", "description", "ctaLabel", "targetUrl", "imageUrl", "language"]) {
    if (field in patch && patch[field] != null) data[field] = str(patch[field]);
  }
  if ("active" in patch) data.active = Boolean(patch.active);

  try {
    return await prisma.ad.update({ where: { id: String(id) }, data });
  } catch {
    return null;
  }
}

export async function deleteAd(id) {
  try {
    await prisma.ad.delete({ where: { id: String(id) } });
    return true;
  } catch {
    return false;
  }
}

// --------------------------------------------------------------- e-bülten

export async function getNewsletters() {
  return prisma.newsletter.findMany({ orderBy: { issue_number: "desc" } });
}

export async function getActiveSubscriberCount() {
  return prisma.subscriber.count({ where: { status: "active" } });
}

export async function getSubscribers() {
  return prisma.subscriber.findMany({ orderBy: { created_at: "desc" } });
}

export async function createNewsletter(input) {
  const last = await prisma.newsletter.findFirst({ orderBy: { issue_number: "desc" }, select: { issue_number: true } });
  const status = NEWSLETTER_STATUS.has(str(input.status).toLowerCase()) ? str(input.status).toLowerCase() : "draft";

  return prisma.newsletter.create({
    data: {
      issue_number: (last?.issue_number ?? 0) + 1,
      subject: str(input.subject),
      preview_text: str(input.preview_text),
      content: str(input.content),
      status,
      scheduled_at: status === "scheduled" ? toDate(input.scheduled_at) : null,
    },
  });
}

export async function getNewsletterById(id) {
  if (!id) return null;
  return prisma.newsletter.findUnique({ where: { id: String(id) } });
}

const newsletterStatus = (value, fallback = "draft") => {
  const normalized = str(value).toLowerCase();
  return NEWSLETTER_STATUS.has(normalized) ? normalized : fallback;
};

export async function updateNewsletter(id, input) {
  const current = await getNewsletterById(id);
  if (!current) return null;

  const status = input.status ? newsletterStatus(input.status, current.status) : current.status;
  const data = { status };

  for (const field of ["subject", "preview_text", "content"]) {
    if (field in input && input[field] != null) data[field] = str(input[field]);
  }
  if ("issue_number" in input && input.issue_number) {
    data.issue_number = Number(input.issue_number) || current.issue_number;
  }

  data.scheduled_at = status === "scheduled" ? toDate(input.scheduled_at) ?? current.scheduled_at : null;
  // "sent" durumuna ilk geçişte gönderim zamanı ve alıcı sayısı yazılıyor.
  if (status === "sent" && !current.sent_at) {
    data.sent_at = new Date();
    data.recipient_count = await prisma.subscriber.count({ where: { status: "active" } });
  }

  try {
    return await prisma.newsletter.update({ where: { id: current.id }, data });
  } catch {
    return null;
  }
}

export async function deleteNewsletter(id) {
  try {
    await prisma.newsletter.delete({ where: { id: String(id) } });
    return true;
  } catch {
    return false;
  }
}

// --------------------------------------------------------------- aboneler

const SUBSCRIBER_STATUS = new Set(["pending", "active", "unsubscribed"]);

export async function getSubscriberById(id) {
  if (!id) return null;
  return prisma.subscriber.findUnique({ where: { id: String(id) } });
}

export async function createSubscriber({ email, name, status, source }) {
  const normalized = str(email).trim().toLowerCase();
  if (!normalized.includes("@")) return { ok: false, message: "Enter a valid email address." };

  const exists = await prisma.subscriber.findUnique({ where: { email: normalized }, select: { id: true } });
  if (exists) return { ok: false, message: "This email is already subscribed." };

  const subscriber = await prisma.subscriber.create({
    data: {
      email: normalized,
      name: str(name),
      status: SUBSCRIBER_STATUS.has(str(status)) ? str(status) : "active",
      source: str(source, "Panel") || "Panel",
    },
  });
  return { ok: true, subscriber };
}

export async function updateSubscriber(id, input) {
  const current = await getSubscriberById(id);
  if (!current) return { ok: false, message: "Subscriber not found." };

  const data = {};
  if (input.email != null) {
    const normalized = str(input.email).trim().toLowerCase();
    if (!normalized.includes("@")) return { ok: false, message: "Enter a valid email address." };
    const clash = await prisma.subscriber.findUnique({ where: { email: normalized }, select: { id: true } });
    if (clash && clash.id !== current.id) return { ok: false, message: "This email is already subscribed." };
    data.email = normalized;
  }
  if (input.name != null) data.name = str(input.name);
  if (input.source != null) data.source = str(input.source) || current.source;
  if (input.status != null && SUBSCRIBER_STATUS.has(str(input.status))) data.status = str(input.status);

  const subscriber = await prisma.subscriber.update({ where: { id: current.id }, data });
  return { ok: true, subscriber };
}

export async function deleteSubscriber(id) {
  try {
    await prisma.subscriber.delete({ where: { id: String(id) } });
    return true;
  } catch {
    return false;
  }
}

export async function addSubscriber(email, source = "Web sitesi") {
  const normalized = str(email).trim().toLowerCase();
  if (!normalized) return { ok: false, message: "Enter a valid email address." };

  const exists = await prisma.subscriber.findUnique({ where: { email: normalized }, select: { id: true } });
  if (exists) return { ok: false, message: "This email is already subscribed." };

  try {
    await prisma.subscriber.create({ data: { email: normalized, name: "", status: "active", source } });
    return { ok: true, message: "You are subscribed. Thanks!" };
  } catch {
    // Eşzamanlı istek aynı e-postayı eklemiş olabilir.
    return { ok: false, message: "This email is already subscribed." };
  }
}

// -------------------------------------------------------------- istatistik

export async function getAnalytics(range = 30) {
  const [latest, breakdown, topPages] = await Promise.all([
    // En yeni 2*range günü çekip kronolojik sıraya çeviriyoruz.
    prisma.analyticsDaily.findMany({ orderBy: { date: "desc" }, take: range * 2 }),
    prisma.analyticsBreakdown.findMany({ orderBy: { hits: "desc" } }),
    prisma.analyticsTopPage.findMany({ orderBy: { pageviews: "desc" } }),
  ]);

  const daily = [...latest].reverse();

  // Tarih formatı eski JSON ile aynı kalsın diye "YYYY-MM-DD"ye indiriyoruz.
  const rows = daily.map((row) => ({
    date: row.date.toISOString().slice(0, 10),
    pageviews: row.pageviews,
    visitors: row.visitors,
  }));

  const current = rows.slice(-range);
  const previous = rows.slice(-range * 2, -range);
  const sum = (list, key) => list.reduce((total, row) => total + row[key], 0);
  const change = (now, before) => (before ? ((now - before) / before) * 100 : null);

  const pageviews = sum(current, "pageviews");
  const visitors = sum(current, "visitors");
  // Yüzdeler artık okuma anında gerçek sayımlardan hesaplanıyor.
  const byKind = (kind) => {
    const rows = breakdown.filter((row) => row.kind === kind);
    const total = rows.reduce((sum, row) => sum + (row.hits || 0), 0);
    return rows
      .map((row) => ({
        code: row.code,
        label: row.label,
        hits: row.hits || 0,
        percentage: total ? Math.round(((row.hits || 0) / total) * 100) : 0,
      }))
      .filter((row) => row.hits > 0)
      .sort((a, b) => b.hits - a.hits);
  };

  return {
    updatedAt: daily.at(-1)?.updatedAt?.toISOString() ?? null,
    daily: current,
    sources: byKind("source"),
    countries: byKind("country"),
    devices: byKind("device"),
    topPages: topPages.map((row) => ({ path: row.path, pageviews: row.pageviews, visitors: row.visitors })),
    pageviews,
    visitors,
    pageviewsChange: change(pageviews, sum(previous, "pageviews")),
    visitorsChange: change(visitors, sum(previous, "visitors")),
  };
}

export async function getDashboardPostStats() {
  const timeZone = "Europe/Istanbul";
  const now = new Date();
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, published, scheduled, recent, publishedThisMonth] = await Promise.all([
    prisma.post.count(),
    prisma.post.findMany({
      where: { status: "published", OR: [{ published_at: { gte: weekAgo } }, { published_at: null, date: { gte: weekAgo } }] },
      select: { id: true },
    }),
    prisma.post.findMany({ where: { status: "scheduled" }, orderBy: { scheduled_at: "asc" } }),
    prisma.post.findMany({ orderBy: POST_ORDER, take: 4 }),
    prisma.post.findMany({
      where: { status: "published", OR: [{ published_at: { gte: monthStart } }, { published_at: null, date: { gte: monthStart } }] },
      select: { published_at: true, date: true },
    }),
  ]);

  const dayFormatter = new Intl.DateTimeFormat("en", { timeZone, day: "numeric" });
  const publishedDaysThisMonth = [
    ...new Set(publishedThisMonth.map((post) => Number(dayFormatter.format(post.published_at ?? post.date)))),
  ];

  return {
    total,
    publishedThisWeek: published.length,
    publishedThisMonth: publishedThisMonth.length,
    publishedDaysThisMonth,
    scheduled,
    recent,
  };
}

export async function getNewsletterDashboard() {
  const [newsletters, subscribers] = await Promise.all([getNewsletters(), getSubscribers()]);

  const countBy = (status) => subscribers.filter((item) => item.status === status).length;
  const sent = newsletters.filter((item) => item.status === "sent");
  const sum = (key) => sent.reduce((total, item) => total + item[key], 0);
  const recipients = sum("recipient_count");

  return {
    newsletters,
    subscribers,
    stats: {
      active: countBy("active"),
      pending: countBy("pending"),
      unsubscribed: countBy("unsubscribed"),
      sent: sent.length,
      openRate: recipients ? (sum("open_count") / recipients) * 100 : 0,
      clickRate: recipients ? (sum("click_count") / recipients) * 100 : 0,
    },
  };
}
