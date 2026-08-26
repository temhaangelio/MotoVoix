import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter, slugify } from "./markdown";

const dbPath = path.join(process.cwd(), "data", "local-db.json");
const newsDir = path.join(process.cwd(), "content", "news");

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function isoDaysAgo(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function seedPostsFromMarkdown() {
  if (!fs.existsSync(newsDir)) return [];

  const files = fs.readdirSync(newsDir).filter((name) => name.endsWith(".md"));
  const reads = [1840, 1260, 980, 740, 520, 410];

  return files.map((fileName, index) => {
    const raw = fs.readFileSync(path.join(newsDir, fileName), "utf8");
    const { data, content } = parseFrontmatter(raw);
    const created = data.date || nowIso();
    return {
      id: makeId("post"),
      slug: data.slug || slugify(data.title),
      title: data.title || fileName,
      description: data.description || "",
      excerpt: data.description || "",
      body: content,
      category: data.category || "motorcycle",
      tags: data.tags || "",
      date: created,
      image: data.image?.startsWith("/") ? data.image : data.image ? `/${data.image}` : "",
      status: "published",
      reads: reads[index] ?? 120,
      created_at: created,
      published_at: created,
      scheduled_at: null,
      source_name: "",
      source_url: "",
    };
  });
}

function seedAnalytics() {
  const daily = Array.from({ length: 30 }, (_, index) => {
    const date = isoDaysAgo(29 - index);
    const pageviews = 420 + ((index * 47) % 380) + (index > 20 ? 90 : 0);
    const visitors = Math.round(pageviews * 0.62);
    return { date, pageviews, visitors };
  });

  return {
    updatedAt: nowIso(),
    daily,
    sources: [
      { label: "Direkt", percentage: 38 },
      { label: "Google", percentage: 29 },
      { label: "Instagram", percentage: 18 },
      { label: "Newsletter", percentage: 15 },
    ],
    topPages: [
      { path: "/news", pageviews: 4120, visitors: 2680 },
      { path: "/haber/vespa-primavera-2026-geldi", pageviews: 1860, visitors: 1240 },
      { path: "/haber/yamaha-californiaya-veda-ediyor", pageviews: 1540, visitors: 980 },
      { path: "/newsletter", pageviews: 920, visitors: 610 },
      { path: "/about", pageviews: 480, visitors: 310 },
    ],
    countries: [
      { code: "TR", label: "Türkiye", percentage: 54 },
      { code: "DE", label: "Almanya", percentage: 16 },
      { code: "GB", label: "Birleşik Krallık", percentage: 12 },
      { code: "US", label: "ABD", percentage: 10 },
      { code: "IT", label: "İtalya", percentage: 8 },
    ],
  };
}

function defaultDb() {
  const posts = seedPostsFromMarkdown();
  const extraDraft = {
    id: makeId("post"),
    slug: "ducati-panigale-briefing",
    title: "Ducati Panigale briefing (taslak)",
    description: "Yayın öncesi teknik notlar.",
    excerpt: "Yayın öncesi teknik notlar.",
    body: "Bu yazı henüz yayında değil. Admin panelinden düzenleyip yayınlayabilirsiniz.",
    category: "racing",
    tags: "ducati, draft",
    date: nowIso(),
    image: "",
    status: "draft",
    reads: 0,
    created_at: nowIso(),
    published_at: null,
    scheduled_at: null,
    source_name: "",
    source_url: "",
  };
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 5);
  const extraScheduled = {
    id: makeId("post"),
    slug: "motogp-weekend-preview",
    title: "MotoGP weekend preview",
    description: "Hafta sonu grid notları.",
    excerpt: "Hafta sonu grid notları.",
    body: "Planlı yayın. Tarih geldiğinde sitede görünecek.",
    category: "racing",
    tags: "motogp, preview",
    date: nextWeek.toISOString(),
    image: "",
    status: "scheduled",
    reads: 0,
    created_at: nowIso(),
    published_at: null,
    scheduled_at: nextWeek.toISOString(),
    source_name: "",
    source_url: "",
  };

  return {
    settings: {
      siteName: "motorvoix",
      domain: "motovoix.local",
      description: "Motosiklet haber masası.",
      descriptionEn: "Independent motorcycle news desk.",
      postsPerPage: 8,
      language: "en",
      feedLayout: "card",
      contactEmail: "editorial@motovoix.com",
      newsletterEnabled: true,
      newsletterTitle: "Headlines in your inbox.",
      newsletterDescription: "Subscribe for launches, racing updates, and this week's standout stories.",
      showSubscriberCount: true,
      maintenanceMode: false,
      modulePosts: true,
      moduleNewsletter: true,
      moduleAds: true,
      moduleAnalytics: true,
      moduleThemes: false,
      adminName: "MotoVoix Editör",
      adminEmail: "admin@motovoix.local",
    },
    posts: [...posts, extraDraft, extraScheduled],
    pages: [
      {
        id: "page_about",
        title: "About",
        slug: "about",
        excerpt: "Independent motorcycle news desk.",
        body: "MotoVoix is an independent motorcycle news desk focused on launches, technology, racing, and market intelligence.",
        menu_order: 1,
        published: true,
        created_at: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "page_contact",
        title: "Contact",
        slug: "contact",
        excerpt: "Editorial pitches and partnerships.",
        body: "For editorial pitches, corrections, partnerships, or rights inquiries, contact editorial@motovoix.com.",
        menu_order: 2,
        published: true,
        created_at: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "page_privacy",
        title: "Privacy",
        slug: "privacy",
        excerpt: "How we handle data.",
        body: "We may collect basic analytics data. We do not sell personal information.",
        menu_order: 3,
        published: true,
        created_at: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "page_terms",
        title: "Terms",
        slug: "terms",
        excerpt: "Terms of use.",
        body: "All MotoVoix content is provided for informational purposes.",
        menu_order: 4,
        published: true,
        created_at: "2026-01-01T00:00:00.000Z",
      },
    ],
    ads: [
      {
        id: "ad_demo",
        title: "Dainese summer kit",
        description: "Demo reklam. Ziyaretçi akışında gösterilebilir.",
        ctaLabel: "Keşfet",
        targetUrl: "https://www.dainese.com",
        imageUrl: "",
        language: "en",
        active: true,
        created_at: nowIso(),
      },
    ],
    newsletters: [
      {
        id: "nl_12",
        issue_number: 12,
        subject: "This week in motorcycle news",
        preview_text: "Vespa Primavera, Yamaha HQ move, Honda WN7.",
        content: "Haftalık özet demo içeriği.",
        status: "sent",
        scheduled_at: null,
        sent_at: isoDaysAgo(6) + "T08:00:00.000Z",
        recipient_count: 1840,
        open_count: 742,
        click_count: 196,
        unsubscribe_count: 4,
        created_at: isoDaysAgo(8) + "T10:00:00.000Z",
      },
      {
        id: "nl_13",
        issue_number: 13,
        subject: "Launch briefing",
        preview_text: "Sıradaki sayı planlandı.",
        content: "Planlı bülten taslağı.",
        status: "scheduled",
        scheduled_at: new Date(Date.now() + 3 * 86400000).toISOString(),
        sent_at: null,
        recipient_count: 0,
        open_count: 0,
        click_count: 0,
        unsubscribe_count: 0,
        created_at: nowIso(),
      },
    ],
    subscribers: [
      { id: "sub_1", name: "Camille Lefèvre", email: "camille.lefevre@orange.fr", status: "active", source: "Web sitesi", created_at: isoDaysAgo(21) + "T09:00:00.000Z" },
      { id: "sub_2", name: "Hugo Marchand", email: "hugo.marchand@laposte.net", status: "active", source: "Web sitesi", created_at: isoDaysAgo(18) + "T11:20:00.000Z" },
      { id: "sub_3", name: "Léa Bouchon", email: "lea.bouchon@gmail.com", status: "active", source: "E-bülten", created_at: isoDaysAgo(14) + "T16:00:00.000Z" },
      { id: "sub_4", name: "Antoine Rivière", email: "antoine.riviere@free.fr", status: "active", source: "Web sitesi", created_at: isoDaysAgo(11) + "T08:40:00.000Z" },
      { id: "sub_5", name: "Chloé Duhamel", email: "chloe.duhamel@outlook.fr", status: "pending", source: "Web sitesi", created_at: isoDaysAgo(4) + "T19:15:00.000Z" },
      { id: "sub_6", name: "Mathis Morel", email: "mathis.morel@sfr.fr", status: "active", source: "Instagram", created_at: isoDaysAgo(9) + "T13:05:00.000Z" },
      { id: "sub_7", name: "Inès Palmier", email: "ines.palmier@yahoo.fr", status: "unsubscribed", source: "Web sitesi", created_at: isoDaysAgo(40) + "T08:00:00.000Z" },
      { id: "sub_8", name: "Théo Lacroix", email: "theo.lacroix@proton.me", status: "active", source: "Web sitesi", created_at: isoDaysAgo(6) + "T10:30:00.000Z" },
      { id: "sub_9", name: "Manon Vesper", email: "manon.vesper@gmail.com", status: "pending", source: "E-bülten", created_at: isoDaysAgo(2) + "T16:00:00.000Z" },
      { id: "sub_10", name: "Jules Fontaine", email: "jules.fontaine@orange.fr", status: "active", source: "Web sitesi", created_at: isoDaysAgo(27) + "T07:50:00.000Z" },
    ],
    analytics: seedAnalytics(),
  };
}

function readDbFile() {
  const raw = fs.readFileSync(dbPath, "utf8");
  return JSON.parse(raw);
}

function writeDbFile(db) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export function getDb() {
  if (!fs.existsSync(dbPath)) {
    const seeded = defaultDb();
    writeDbFile(seeded);
    return seeded;
  }
  return readDbFile();
}

export function saveDb(db) {
  writeDbFile(db);
  return db;
}

export function getSettings() {
  return getDb().settings;
}

export function updateSettings(patch) {
  const db = getDb();
  db.settings = { ...db.settings, ...patch };
  saveDb(db);
  return db.settings;
}

export function getPosts() {
  return [...getDb().posts].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
}

export function getPostById(id) {
  return getDb().posts.find((post) => post.id === id) || null;
}

export function getPublishedNews() {
  return getPosts().filter((post) => post.status === "published");
}

export function createPost(input) {
  const db = getDb();
  const created_at = nowIso();
  const status = input.status || "draft";
  const post = {
    id: makeId("post"),
    slug: input.slug || slugify(input.title) || makeId("haber"),
    title: input.title,
    titleEn: input.titleEn || input.title,
    titleFr: input.titleFr || "",
    description: input.description || input.excerpt || "",
    excerpt: input.excerpt || input.description || "",
    body: input.body || "",
    excerptEn: input.excerptEn || input.excerpt || input.description || "",
    excerptFr: input.excerptFr || "",
    bodyEn: input.bodyEn || input.body || "",
    bodyFr: input.bodyFr || "",
    category: input.category || "motorcycle",
    tags: input.tags || "",
    date: input.date || created_at,
    image: input.image || "",
    status,
    reads: 0,
    created_at,
    published_at: status === "published" ? created_at : null,
    scheduled_at: status === "scheduled" ? input.scheduled_at || null : null,
    source_name: input.source_name || "",
    source_url: input.source_url || "",
  };
  db.posts.unshift(post);
  saveDb(db);
  return post;
}

export function updatePost(id, input) {
  const db = getDb();
  const index = db.posts.findIndex((post) => post.id === id);
  if (index === -1) return null;
  const current = db.posts[index];
  const status = input.status ?? current.status;
  db.posts[index] = {
    ...current,
    ...input,
    slug: input.slug || current.slug,
    status,
    published_at: status === "published" ? current.published_at || nowIso() : current.published_at,
    scheduled_at: status === "scheduled" ? input.scheduled_at || current.scheduled_at : null,
  };
  saveDb(db);
  return db.posts[index];
}

export function deletePost(id) {
  const db = getDb();
  const next = db.posts.filter((post) => post.id !== id);
  if (next.length === db.posts.length) return false;
  db.posts = next;
  saveDb(db);
  return true;
}

export function getPages() {
  return [...getDb().pages].sort((a, b) => a.menu_order - b.menu_order);
}

export function getPageById(id) {
  return getDb().pages.find((page) => page.id === id) || null;
}

export function createPage(input) {
  const db = getDb();
  const page = {
    id: makeId("page"),
    title: input.title,
    slug: input.slug || slugify(input.title),
    excerpt: input.excerpt || "",
    body: input.body || "",
    menu_order: Number(input.menu_order) || db.pages.length + 1,
    published: Boolean(input.published),
    created_at: nowIso(),
  };
  db.pages.push(page);
  saveDb(db);
  return page;
}

export function updatePage(id, input) {
  const db = getDb();
  const index = db.pages.findIndex((page) => page.id === id);
  if (index === -1) return null;
  db.pages[index] = { ...db.pages[index], ...input };
  saveDb(db);
  return db.pages[index];
}

export function deletePage(id) {
  const db = getDb();
  const next = db.pages.filter((page) => page.id !== id);
  if (next.length === db.pages.length) return false;
  db.pages = next;
  saveDb(db);
  return true;
}

export function getAds() {
  return [...getDb().ads].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function createAd(input) {
  const db = getDb();
  const ad = {
    id: makeId("ad"),
    title: input.title,
    description: input.description,
    ctaLabel: input.ctaLabel || "Keşfet",
    targetUrl: input.targetUrl,
    imageUrl: input.imageUrl || "",
    language: input.language || "en",
    active: Boolean(input.active),
    created_at: nowIso(),
  };
  db.ads.unshift(ad);
  saveDb(db);
  return ad;
}

export function updateAd(id, patch) {
  const db = getDb();
  const index = db.ads.findIndex((ad) => ad.id === id);
  if (index === -1) return null;
  db.ads[index] = { ...db.ads[index], ...patch };
  saveDb(db);
  return db.ads[index];
}

export function deleteAd(id) {
  const db = getDb();
  const next = db.ads.filter((ad) => ad.id !== id);
  if (next.length === db.ads.length) return false;
  db.ads = next;
  saveDb(db);
  return true;
}

export function getNewsletters() {
  return [...getDb().newsletters].sort((a, b) => b.issue_number - a.issue_number);
}

export function getSubscribers() {
  return [...getDb().subscribers].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function createNewsletter(input) {
  const db = getDb();
  const issue_number = db.newsletters.reduce((max, item) => Math.max(max, item.issue_number), 0) + 1;
  const item = {
    id: makeId("nl"),
    issue_number,
    subject: input.subject,
    preview_text: input.preview_text || "",
    content: input.content || "",
    status: input.status || "draft",
    scheduled_at: input.scheduled_at || null,
    sent_at: null,
    recipient_count: 0,
    open_count: 0,
    click_count: 0,
    unsubscribe_count: 0,
    created_at: nowIso(),
  };
  db.newsletters.unshift(item);
  saveDb(db);
  return item;
}

export function addSubscriber(email, source = "Web sitesi") {
  const db = getDb();
  const exists = db.subscribers.some((item) => item.email.toLowerCase() === email.toLowerCase());
  if (exists) return { ok: false, message: "Bu e-posta zaten kayıtlı." };
  db.subscribers.unshift({
    id: makeId("sub"),
    name: "",
    email,
    status: "active",
    source,
    created_at: nowIso(),
  });
  saveDb(db);
  return { ok: true, message: "Abonelik kaydedildi." };
}

export function getAnalytics(range = 30) {
  const analytics = getDb().analytics;
  const daily = analytics.daily.slice(-range);
  const pageviews = daily.reduce((sum, day) => sum + day.pageviews, 0);
  const visitors = daily.reduce((sum, day) => sum + day.visitors, 0);
  const previous = analytics.daily.slice(-range * 2, -range);
  const prevViews = previous.reduce((sum, day) => sum + day.pageviews, 0);
  const prevVisitors = previous.reduce((sum, day) => sum + day.visitors, 0);
  const change = (current, prev) => (prev ? ((current - prev) / prev) * 100 : null);

  return {
    ...analytics,
    daily,
    pageviews,
    visitors,
    pageviewsChange: change(pageviews, prevViews),
    visitorsChange: change(visitors, prevVisitors),
  };
}

export function getDashboardPostStats() {
  const posts = getPosts();
  const timeZone = "Europe/Istanbul";
  const now = new Date();
  const weekAgo = Date.now() - 7 * 86400000;
  const month = now.getMonth();
  const year = now.getFullYear();
  const published = posts.filter((post) => post.status === "published");
  const publishedThisWeek = published.filter((post) => new Date(post.published_at || post.date).getTime() >= weekAgo).length;
  const publishedThisMonth = published.filter((post) => {
    const date = new Date(post.published_at || post.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
  const publishedDaysThisMonth = [...new Set(publishedThisMonth.map((post) => Number(new Intl.DateTimeFormat("en", { timeZone, day: "numeric" }).format(new Date(post.published_at || post.date)))))];

  return {
    total: posts.length,
    publishedThisWeek,
    publishedThisMonth: publishedThisMonth.length,
    publishedDaysThisMonth,
    scheduled: posts.filter((post) => post.status === "scheduled"),
    recent: posts.slice(0, 4),
  };
}

export function getNewsletterDashboard() {
  const newsletters = getNewsletters();
  const subscribers = getSubscribers();
  const active = subscribers.filter((item) => item.status === "active").length;
  const pending = subscribers.filter((item) => item.status === "pending").length;
  const unsubscribed = subscribers.filter((item) => item.status === "unsubscribed").length;
  const sent = newsletters.filter((item) => item.status === "sent");
  const opens = sent.reduce((sum, item) => sum + item.open_count, 0);
  const clicks = sent.reduce((sum, item) => sum + item.click_count, 0);
  const recipients = sent.reduce((sum, item) => sum + item.recipient_count, 0);

  return {
    newsletters,
    subscribers,
    stats: {
      active,
      pending,
      unsubscribed,
      sent: sent.length,
      openRate: recipients ? (opens / recipients) * 100 : 0,
      clickRate: recipients ? (clicks / recipients) * 100 : 0,
    },
  };
}
