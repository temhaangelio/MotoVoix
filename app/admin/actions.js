"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  addSubscriber,
  createAd,
  createNewsletter,
  createPage,
  createPost,
  deleteAd,
  deletePage,
  deletePost,
  updateAd,
  updatePage,
  updatePost,
  updateSettings,
} from "../../lib/local-db";

function revalidateSite() {
  revalidatePath("/admin", "layout");
  revalidatePath("/news");
  revalidatePath("/haber", "layout");
  revalidatePath("/newsletter");
}

export async function logoutAdminAction() {
  const jar = await cookies();
  jar.delete("mv_admin");
  return { success: true };
}

export async function savePostAction(formData) {
  const id = String(formData.get("id") || "");
  const payload = {
    title: String(formData.get("title") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    excerpt: String(formData.get("excerpt") || "").trim(),
    description: String(formData.get("excerpt") || "").trim(),
    body: String(formData.get("body") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    tags: String(formData.get("tags") || "").trim(),
    image: String(formData.get("image") || "").trim(),
    status: String(formData.get("status") || "draft"),
    scheduled_at: String(formData.get("scheduledAt") || "") || null,
    source_name: String(formData.get("sourceName") || "").trim(),
    source_url: String(formData.get("sourceUrl") || "").trim(),
  };

  if (!payload.title || !payload.body) {
    return { success: false, message: "Başlık ve yazı zorunlu." };
  }

  if (id) {
    const updated = updatePost(id, payload);
    if (!updated) return { success: false, message: "Yazı bulunamadı." };
  } else {
    createPost(payload);
  }

  revalidateSite();
  return { success: true };
}

export async function deletePostAction(id) {
  const ok = deletePost(id);
  if (!ok) return { success: false, message: "Yazı silinemedi." };
  revalidateSite();
  return { success: true, message: "Yazı silindi." };
}

export async function savePageAction(formData) {
  const id = String(formData.get("id") || "");
  const payload = {
    title: String(formData.get("title") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    excerpt: String(formData.get("excerpt") || "").trim(),
    body: String(formData.get("body") || "").trim(),
    menu_order: Number(formData.get("menuOrder") || 1),
    published: String(formData.get("published") || "") === "true",
  };
  if (!payload.title) return { success: false, message: "Başlık zorunlu." };
  if (id) {
    const updated = updatePage(id, payload);
    if (!updated) return { success: false, message: "Sayfa bulunamadı." };
  } else {
    createPage(payload);
  }
  revalidateSite();
  return { success: true };
}

export async function deletePageAction(id) {
  const ok = deletePage(id);
  if (!ok) return { success: false, message: "Sayfa silinemedi." };
  revalidateSite();
  return { success: true, message: "Sayfa silindi." };
}

export async function createAdAction(formData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const targetUrl = String(formData.get("targetUrl") || "").trim();
  if (!title || !description || !targetUrl) return { success: false, message: "Başlık, açıklama ve hedef adres gerekli." };
  createAd({
    title,
    description,
    targetUrl,
    ctaLabel: String(formData.get("ctaLabel") || "Keşfet"),
    imageUrl: String(formData.get("imageUrl") || ""),
    language: String(formData.get("language") || "en"),
    active: String(formData.get("active") || "true") === "true",
  });
  revalidateSite();
  return { success: true, message: "Reklam eklendi." };
}

export async function toggleAdAction(id, active) {
  const updated = updateAd(id, { active });
  if (!updated) return { success: false, message: "Reklam bulunamadı." };
  revalidateSite();
  return { success: true, message: active ? "Reklam yayında." : "Reklam taslağa alındı." };
}

export async function deleteAdAction(id) {
  const ok = deleteAd(id);
  if (!ok) return { success: false, message: "Reklam silinemedi." };
  revalidateSite();
  return { success: true, message: "Reklam silindi." };
}

export async function saveNewsletterAction(formData) {
  const subject = String(formData.get("subject") || "").trim();
  if (!subject) return { success: false, message: "Konu zorunlu." };
  createNewsletter({
    subject,
    preview_text: String(formData.get("previewText") || ""),
    content: String(formData.get("content") || ""),
    status: String(formData.get("status") || "draft"),
    scheduled_at: String(formData.get("scheduledAt") || "") || null,
  });
  revalidateSite();
  return { success: true };
}

export async function saveSettingsAction(formData) {
  const patch = {};
  const strings = ["siteName", "domain", "description", "descriptionEn", "language", "feedLayout", "contactEmail", "newsletterTitle", "newsletterDescription", "adminName", "adminEmail"];
  const bools = ["newsletterEnabled", "showSubscriberCount", "maintenanceMode", "modulePosts", "moduleNewsletter", "moduleAds", "moduleAnalytics"];

  for (const key of strings) {
    if (formData.has(key)) patch[key] = String(formData.get(key) || "");
  }
  if (formData.has("postsPerPage")) patch.postsPerPage = Number(formData.get("postsPerPage") || 8);
  for (const key of bools) {
    if (formData.has(key)) patch[key] = formData.get(key) === "true";
  }

  updateSettings(patch);
  revalidateSite();
  return { success: true, message: "Ayarlar yerel veritabanına kaydedildi." };
}

export async function subscribeAction(formData) {
  const email = String(formData.get("email") || "").trim();
  if (!email.includes("@")) return { success: false, message: "Geçerli bir e-posta girin." };
  const result = addSubscriber(email, "Web sitesi");
  revalidatePath("/admin/e-bulten");
  return { success: result.ok, message: result.message };
}
