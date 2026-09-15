// Gerçek ziyaret takibi.
//
// Eskiden analytics tabloları JSON'dan aktarılmış sabit tohum verisi
// tutuyordu. Artık her ziyaret buradan kaydediliyor: gün bazlı sayaçlar,
// en çok görüntülenen sayfalar ve kaynak/cihaz/ülke kırılımı.
//
// Kişisel veri saklanmıyor: IP doğrudan yazılmıyor, yalnızca günlük
// tekil ziyaretçi tespiti için tuzlanmış bir özet üretiliyor.

import { createHash } from "node:crypto";
import { prisma } from "./prisma.js";

function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function visitorKeyFor(ip, userAgent, day) {
  const salt = process.env.ADMIN_SESSION_SECRET || "motovoix";
  return createHash("sha256")
    .update(`${salt}:${day.toISOString().slice(0, 10)}:${ip}:${userAgent}`)
    .digest("hex")
    .slice(0, 64);
}

// Mevcut panel etiketleriyle uyumlu cihaz sınıflandırması.
function deviceFrom(userAgent) {
  const ua = String(userAgent || "").toLowerCase();
  if (ua.includes("android")) return { code: "android", label: "Android" };
  if (ua.includes("ipad")) return { code: "ipad", label: "iPad" };
  if (ua.includes("iphone")) {
    return ua.includes("iphone17") || ua.includes("iphone 17")
      ? { code: "iphone-17", label: "iPhone 17" }
      : { code: "iphone-other", label: "Other iPhone models" };
  }
  if (ua.includes("macintosh")) return { code: "mac", label: "Mac" };
  if (ua.includes("windows")) return { code: "windows", label: "Windows" };
  if (ua.includes("linux")) return { code: "linux", label: "Linux" };
  return { code: "other", label: "Other" };
}

function sourceFrom(referer, host) {
  if (!referer) return { code: "direct", label: "Direct" };
  try {
    const url = new URL(referer);
    if (host && url.host === host) return null; // site içi gezinme sayılmaz
    const domain = url.hostname.replace(/^www\./, "");
    if (domain.includes("google.")) return { code: "google", label: "Google" };
    if (domain.includes("bing.")) return { code: "bing", label: "Bing" };
    if (domain.includes("instagram.")) return { code: "instagram", label: "Instagram" };
    if (domain.includes("facebook.")) return { code: "facebook", label: "Facebook" };
    if (domain.includes("t.co") || domain.includes("x.com") || domain.includes("twitter."))
      return { code: "x", label: "X" };
    if (domain.includes("youtube.")) return { code: "youtube", label: "YouTube" };
    return { code: domain.slice(0, 40), label: domain.slice(0, 120) };
  } catch {
    return { code: "direct", label: "Direct" };
  }
}

// Ülke yalnızca ters proxy / CDN başlık koyuyorsa bilinebilir.
// Düz bir VPS'te bu başlıklar yoksa kırılım boş kalır — uydurmuyoruz.
function countryFrom(raw) {
  const code = String(raw || "").trim().toUpperCase();
  if (!code || code === "XX" || code.length !== 2) return null;

  let label = code;
  try {
    label = new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
  } catch {
    // Intl bu bölgeyi tanımıyorsa kodu etiket olarak kullan.
  }
  return { code, label };
}

const BOT_PATTERN = /bot|crawler|spider|crawling|preview|lighthouse|headless/i;

// Botlar ne ziyaret istatistiğine ne okunma sayacına yazılmalı.
export function isBotUserAgent(userAgent) {
  return !userAgent || BOT_PATTERN.test(String(userAgent));
}

async function bumpBreakdown(kind, entry) {
  if (!entry) return;
  await prisma.analyticsBreakdown.upsert({
    where: { kind_label: { kind, label: entry.label } },
    create: { kind, code: entry.code, label: entry.label, hits: 1 },
    update: { hits: { increment: 1 }, code: entry.code },
  });
}

// İstek başlıkları SAYFA GÖVDESİNDE okunmalı. Next dokümanı açık:
// Server Component'lerde after() içinde headers()/cookies() kullanılamaz.
// Bu yüzden bilgiyi önce toplayıp after'a veri olarak geçiriyoruz.
export async function collectRequestInfo() {
  try {
    const { headers } = await import("next/headers");
    const list = await headers();
    return {
      // Form gönderimi (server action) sonrası yeniden render ve bağlantı
      // ön-yüklemesi (prefetch) gerçek sayfa görüntüleme değil; sayılmamalı.
      isSideRequest: Boolean(list.get("next-action") || list.get("next-router-prefetch")),
      userAgent: list.get("user-agent") || "",
      ip:
        (list.get("x-forwarded-for") || "").split(",")[0].trim() ||
        list.get("x-real-ip") ||
        "unknown",
      referer: list.get("referer") || "",
      host: list.get("host") || "",
      country:
        list.get("cf-ipcountry") ||
        list.get("x-vercel-ip-country") ||
        list.get("x-country-code") ||
        "",
    };
  } catch {
    return null;
  }
}

// Yanıt gönderildikten sonra (after) çağrılır.
// Hiçbir hata sayfayı etkilememeli, bu yüzden her şey yutuluyor.
export async function recordPageview(pathname, info) {
  try {
    if (!info || info.isSideRequest) return;

    const userAgent = info.userAgent || "";
    // Botlar sayaçları şişirmesin.
    if (isBotUserAgent(userAgent)) return;

    const ip = info.ip || "unknown";
    const day = todayUtc();
    const visitorKey = visitorKeyFor(ip, userAgent, day);

    // Bugün ilk kez mi görülüyor? Benzersiz kısıt cevabı veriyor.
    let isNewVisitor = false;
    try {
      await prisma.analyticsVisit.create({ data: { date: day, visitorKey } });
      isNewVisitor = true;
    } catch {
      // Zaten kayıtlı — tekrar ziyaret.
    }

    await prisma.analyticsDaily.upsert({
      where: { date: day },
      create: { date: day, pageviews: 1, visitors: isNewVisitor ? 1 : 0 },
      update: { pageviews: { increment: 1 }, visitors: { increment: isNewVisitor ? 1 : 0 } },
    });

    const path = String(pathname || "/").slice(0, 255);
    await prisma.analyticsTopPage.upsert({
      where: { path },
      create: { path, pageviews: 1, visitors: isNewVisitor ? 1 : 0 },
      update: { pageviews: { increment: 1 }, visitors: { increment: isNewVisitor ? 1 : 0 } },
    });

    // Kaynak/cihaz/ülke yalnızca yeni ziyaretçide sayılıyor; aksi hâlde
    // çok sayfa gezen bir kişi kırılımı domine ederdi.
    if (isNewVisitor) {
      await bumpBreakdown("device", deviceFrom(userAgent));
      await bumpBreakdown("source", sourceFrom(info.referer, info.host));
      await bumpBreakdown("country", countryFrom(info.country));
    }
  } catch {
    // İstatistik kritik değil; sessizce geç.
  }
}
