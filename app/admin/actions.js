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
    title: String(formData.get("titleEn") || "").trim(),
    titleEn: String(formData.get("titleEn") || "").trim(),
    titleFr: String(formData.get("titleFr") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    excerpt: String(formData.get("excerptEn") || "").trim(),
    description: String(formData.get("excerptEn") || "").trim(),
    body: String(formData.get("bodyEn") || "").trim(),
    excerptEn: String(formData.get("excerptEn") || "").trim(),
    excerptFr: String(formData.get("excerptFr") || "").trim(),
    bodyEn: String(formData.get("bodyEn") || "").trim(),
    bodyFr: String(formData.get("bodyFr") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    tags: String(formData.get("tags") || "").trim(),
    image: String(formData.get("image") || "").trim(),
    status: String(formData.get("status") || "draft"),
    scheduled_at: String(formData.get("scheduledAt") || "") || null,
    source_name: String(formData.get("sourceName") || "").trim(),
    source_url: String(formData.get("sourceUrl") || "").trim(),
  };

  if (!payload.titleEn || !payload.bodyEn || !payload.titleFr || !payload.bodyFr) {
    return { success: false, message: "English and French titles and article content are required." };
  }

  if (id) {
    const updated = updatePost(id, payload);
    if (!updated) return { success: false, message: "Post not found." };
  } else {
    createPost(payload);
  }

  revalidateSite();
  return { success: true };
}

export async function deletePostAction(id) {
  const ok = deletePost(id);
  if (!ok) return { success: false, message: "Post could not be deleted." };
  revalidateSite();
  return { success: true, message: "Post deleted." };
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
  if (!payload.title) return { success: false, message: "Title is required." };
  if (id) {
    const updated = updatePage(id, payload);
    if (!updated) return { success: false, message: "Page not found." };
  } else {
    createPage(payload);
  }
  revalidateSite();
  return { success: true };
}

export async function deletePageAction(id) {
  const ok = deletePage(id);
  if (!ok) return { success: false, message: "Page could not be deleted." };
  revalidateSite();
  return { success: true, message: "Page deleted." };
}

export async function createAdAction(formData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const targetUrl = String(formData.get("targetUrl") || "").trim();
  if (!title || !description || !targetUrl) return { success: false, message: "Title, description and destination URL are required." };
  createAd({
    title,
    description,
    targetUrl,
    ctaLabel: String(formData.get("ctaLabel") || "Discover"),
    imageUrl: String(formData.get("imageUrl") || ""),
    language: String(formData.get("language") || "en"),
    active: String(formData.get("active") || "true") === "true",
  });
  revalidateSite();
  return { success: true, message: "Ad added." };
}

export async function toggleAdAction(id, active) {
  const updated = updateAd(id, { active });
  if (!updated) return { success: false, message: "Ad not found." };
  revalidateSite();
  return { success: true, message: active ? "Ad published." : "Ad moved to drafts." };
}

export async function deleteAdAction(id) {
  const ok = deleteAd(id);
  if (!ok) return { success: false, message: "Ad could not be deleted." };
  revalidateSite();
  return { success: true, message: "Ad deleted." };
}

export async function saveNewsletterAction(formData) {
  const subject = String(formData.get("subject") || "").trim();
  if (!subject) return { success: false, message: "Subject is required." };
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
  return { success: true, message: "Settings saved to the local database." };
}

export async function subscribeAction(formData) {
  const email = String(formData.get("email") || "").trim();
  if (!email.includes("@")) return { success: false, message: "Enter a valid email address." };
  const result = addSubscriber(email, "Web sitesi");
  revalidatePath("/admin/e-bulten");
  return { success: result.ok, message: result.message };
}
