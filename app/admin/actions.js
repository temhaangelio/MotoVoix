"use server";

import { revalidatePath, updateTag } from "next/cache";
import { cookies } from "next/headers";
import {
  addSubscriber,
  createAd,
  createSubscriber,
  deleteNewsletter,
  deleteSubscriber,
  updateNewsletter,
  updateSubscriber,
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
import { createUser, deleteUser, getCurrentUser, updateUser } from "../../lib/users";
import { NEWS_TAG, SETTINGS_TAG } from "../../lib/news";
import { PAGES_TAG } from "../../lib/pages";
import { createMessage, deleteMessage, updateMessageStatus } from "../../lib/messages";
import { SESSION_COOKIE } from "../../lib/auth-session";
import { listNewsImages, saveNewsImage } from "../../lib/news-images";

function revalidateSite() {
  // Ziyaretçi okumaları unstable_cache üzerinden geldiği için yol
  // temizliği tek başına yetmiyor; etiketi de düşürmek gerekiyor.
  // updateTag: Server Action içinde "kendi yazdığını hemen gör" semantiği
  // (Next 16'da tek argümanlı eski çağrı deprecated).
  updateTag(NEWS_TAG);
  updateTag(SETTINGS_TAG);
  updateTag(PAGES_TAG);
  revalidatePath("/admin", "layout");
  revalidatePath("/news");
  revalidatePath("/news", "layout");
  revalidatePath("/newsletter");
  revalidatePath("/sitemap.xml");
}

// Server action'lar proxy kontrolünün dışında kaldığı için oturum burada
// ayrıca doğrulanıyor. Yetkisiz çağrılar iş yapmadan geri döner.
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: { success: false, message: "Your session has expired. Please sign in again." } };
  return { user, error: null };
}

export async function logoutAdminAction() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  return { success: true };
}

export async function uploadNewsImageAction(formData) {
  const { error } = await requireAdmin();
  if (error) return error;

  return saveNewsImage(formData.get("file"));
}

export async function listNewsImagesAction() {
  const { error } = await requireAdmin();
  if (error) return error;

  return { success: true, images: await listNewsImages() };
}

export async function savePostAction(formData) {
  const { error } = await requireAdmin();
  if (error) return error;

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
    const updated = await updatePost(id, payload);
    if (!updated) return { success: false, message: "Post not found." };
  } else {
    await createPost(payload);
  }

  revalidateSite();
  return { success: true };
}

export async function deletePostAction(id) {
  const { error } = await requireAdmin();
  if (error) return error;

  const ok = await deletePost(id);
  if (!ok) return { success: false, message: "Post could not be deleted." };
  revalidateSite();
  return { success: true, message: "Post deleted." };
}

export async function savePageAction(formData) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = String(formData.get("id") || "");
  const payload = {
    title: String(formData.get("title") || "").trim(),
    heading: String(formData.get("heading") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    excerpt: String(formData.get("excerpt") || "").trim(),
    body: String(formData.get("body") || "").trim(),
    menu_order: Number(formData.get("menuOrder") || 1),
    published: String(formData.get("published") || "") === "true",
  };
  if (!payload.title) return { success: false, message: "Title is required." };
  if (id) {
    const updated = await updatePage(id, payload);
    if (!updated) return { success: false, message: "Page not found." };
  } else {
    await createPage(payload);
  }
  revalidateSite();
  return { success: true };
}

export async function deletePageAction(id) {
  const { error } = await requireAdmin();
  if (error) return error;

  const ok = await deletePage(id);
  if (!ok) return { success: false, message: "Page could not be deleted." };
  revalidateSite();
  return { success: true, message: "Page deleted." };
}

export async function createAdAction(formData) {
  const { error } = await requireAdmin();
  if (error) return error;

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const targetUrl = String(formData.get("targetUrl") || "").trim();
  if (!title || !description || !targetUrl) return { success: false, message: "Title, description and destination URL are required." };
  await createAd({
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
  const { error } = await requireAdmin();
  if (error) return error;

  const updated = await updateAd(id, { active });
  if (!updated) return { success: false, message: "Ad not found." };
  revalidateSite();
  return { success: true, message: active ? "Ad published." : "Ad moved to drafts." };
}

export async function deleteAdAction(id) {
  const { error } = await requireAdmin();
  if (error) return error;

  const ok = await deleteAd(id);
  if (!ok) return { success: false, message: "Ad could not be deleted." };
  revalidateSite();
  return { success: true, message: "Ad deleted." };
}

export async function saveNewsletterAction(formData) {
  const { error } = await requireAdmin();
  if (error) return error;

  const subject = String(formData.get("subject") || "").trim();
  if (!subject) return { success: false, message: "Subject is required." };
  await createNewsletter({
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
  const { error } = await requireAdmin();
  if (error) return error;

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

  await updateSettings(patch);
  revalidateSite();
  return { success: true, message: "Settings saved to the local database." };
}

export async function subscribeAction(formData) {
  const email = String(formData.get("email") || "").trim();
  if (!email.includes("@")) return { success: false, message: "Enter a valid email address." };
  const result = await addSubscriber(email, "Web sitesi");
  revalidatePath("/admin/newsletter");
  return { success: result.ok, message: result.message };
}

export async function saveUserAction(formData) {
  const { user: current, error } = await requireAdmin();
  if (error) return error;

  const id = String(formData.get("id") || "");
  const payload = {
    email: String(formData.get("email") || "").trim(),
    name: String(formData.get("name") || "").trim(),
    password: String(formData.get("password") || ""),
    role: String(formData.get("role") || "admin"),
  };

  if (!payload.email) return { success: false, message: "Email is required." };

  if (id) {
    // Düzenlemede boş parola alanı "değiştirme" demek.
    const result = await updateUser(id, payload);
    if (!result.ok) return { success: false, message: result.message };
    revalidatePath("/admin/users");
    return { success: true, message: id === current.id ? "Your account has been updated." : "User updated." };
  }

  if (!payload.password) return { success: false, message: "Password is required for a new user." };

  const result = await createUser(payload);
  if (!result.ok) return { success: false, message: result.message };

  revalidatePath("/admin/users");
  return { success: true, message: "User created." };
}

export async function deleteUserAction(id) {
  const { user: current, error } = await requireAdmin();
  if (error) return error;

  if (String(id) === current.id) {
    return { success: false, message: "You cannot delete the account you are signed in with." };
  }

  const result = await deleteUser(id);
  if (!result.ok) return { success: false, message: result.message };

  revalidatePath("/admin/users");
  return { success: true, message: "User deleted." };
}

// ------------------------------------------------------------ e-bültenler

export async function updateNewsletterAction(formData) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = String(formData.get("id") || "");
  if (!id) return { success: false, message: "Newsletter not found." };

  const updated = await updateNewsletter(id, {
    subject: String(formData.get("subject") || "").trim(),
    preview_text: String(formData.get("previewText") || ""),
    content: String(formData.get("content") || ""),
    status: String(formData.get("status") || "draft"),
    scheduled_at: String(formData.get("scheduledAt") || "") || null,
  });

  if (!updated) return { success: false, message: "Newsletter could not be updated." };

  revalidateSite();
  return { success: true, message: "Newsletter updated." };
}

export async function deleteNewsletterAction(id) {
  const { error } = await requireAdmin();
  if (error) return error;

  const ok = await deleteNewsletter(id);
  if (!ok) return { success: false, message: "Newsletter could not be deleted." };

  revalidateSite();
  return { success: true, message: "Newsletter deleted." };
}

// ---------------------------------------------------------------- aboneler

export async function saveSubscriberAction(formData) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = String(formData.get("id") || "");
  const payload = {
    email: String(formData.get("email") || "").trim(),
    name: String(formData.get("name") || "").trim(),
    status: String(formData.get("status") || "active"),
    source: String(formData.get("source") || "").trim() || undefined,
  };

  const result = id ? await updateSubscriber(id, payload) : await createSubscriber(payload);
  if (!result.ok) return { success: false, message: result.message };

  revalidatePath("/admin/newsletter");
  return { success: true, message: id ? "Subscriber updated." : "Subscriber added." };
}

export async function deleteSubscriberAction(id) {
  const { error } = await requireAdmin();
  if (error) return error;

  const ok = await deleteSubscriber(id);
  if (!ok) return { success: false, message: "Subscriber could not be deleted." };

  revalidatePath("/admin/newsletter");
  return { success: true, message: "Subscriber deleted." };
}

// ---------------------------------------------------------------- mesajlar

// Ziyaretçiye açık: /contact formu buraya gönderiyor.
export async function sendContactMessageAction(formData) {
  const { headers } = await import("next/headers");
  const list = await headers();
  const ip = (list.get("x-forwarded-for") || "").split(",")[0].trim() || list.get("x-real-ip") || "";

  const result = await createMessage({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    ip,
  });

  if (result.ok) revalidatePath("/admin/messages");
  return { success: result.ok, message: result.message };
}

export async function setMessageStatusAction(id, status) {
  const { error } = await requireAdmin();
  if (error) return error;

  const updated = await updateMessageStatus(id, status);
  if (!updated) return { success: false, message: "Message not found." };

  revalidatePath("/admin/messages");
  return { success: true, message: "Message updated." };
}

export async function deleteMessageAction(id) {
  const { error } = await requireAdmin();
  if (error) return error;

  const ok = await deleteMessage(id);
  if (!ok) return { success: false, message: "Message could not be deleted." };

  revalidatePath("/admin/messages");
  return { success: true, message: "Message deleted." };
}

// --------------------------------------------------------------- reklamlar

export async function updateAdAction(formData) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = String(formData.get("id") || "");
  if (!id) return { success: false, message: "Ad not found." };

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const targetUrl = String(formData.get("targetUrl") || "").trim();
  if (!title || !description || !targetUrl) {
    return { success: false, message: "Title, description and destination URL are required." };
  }

  const updated = await updateAd(id, {
    title,
    description,
    targetUrl,
    ctaLabel: String(formData.get("ctaLabel") || "Discover"),
    imageUrl: String(formData.get("imageUrl") || ""),
    language: String(formData.get("language") || "en"),
    active: String(formData.get("active") || "true") === "true",
  });

  if (!updated) return { success: false, message: "Ad could not be updated." };

  revalidateSite();
  return { success: true, message: "Ad updated." };
}
