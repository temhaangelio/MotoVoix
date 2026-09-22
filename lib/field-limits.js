// Form alanlarının karakter sınırları. prisma/schema.prisma'daki kolon
// boyutlarıyla aynı tutulmalı: şemada bir VarChar değişirse burası da değişir.
// Hem inputlardaki maxLength'te hem server action doğrulamasında kullanılıyor.
//
// TEXT kolonu 65.535 bayt. utf8mb4'te bir UTF-16 birimi en çok 3 bayt
// tuttuğu için (emoji 2 birim / 4 bayt) 20.000 karakter her durumda sığar.
// MEDIUMTEXT (16 MB) alanlarına sınır konmuyor.
export const TEXT_MAX = 20_000;

export const LIMITS = {
  post: {
    titleEn: 255,
    titleFr: 255,
    slug: 191,
    excerptEn: TEXT_MAX,
    excerptFr: TEXT_MAX,
    category: 64,
    tags: 1000,
    image: 500,
    sourceName: 191,
    sourceUrl: 500,
  },
  page: {
    title: 255,
    heading: 255,
    slug: 191,
    excerpt: TEXT_MAX,
  },
  ad: {
    title: 255,
    description: TEXT_MAX,
    ctaLabel: 120,
    targetUrl: 500,
    imageUrl: 500,
  },
  newsletter: {
    subject: 255,
    previewText: 255,
  },
  subscriber: {
    email: 191,
    name: 191,
    source: 64,
  },
  user: {
    email: 191,
    name: 191,
  },
  settings: {
    siteName: 120,
    domain: 191,
    description: TEXT_MAX,
    descriptionEn: TEXT_MAX,
    contactEmail: 191,
    newsletterTitle: 255,
    newsletterDescription: TEXT_MAX,
    adminName: 191,
    adminEmail: 191,
  },
  contact: {
    name: 191,
    email: 191,
    // lib/messages.js mesajı 5000 karakterle sınırlıyor.
    message: 5000,
  },
};

const FIELD_LABELS = {
  titleEn: "Title (English)",
  titleFr: "Title (French)",
  title: "Title",
  heading: "Heading",
  slug: "Slug",
  excerptEn: "Summary (English)",
  excerptFr: "Summary (French)",
  excerpt: "Summary",
  category: "Category",
  tags: "Tags",
  image: "Cover image",
  imageUrl: "Image URL",
  sourceName: "Source name",
  sourceUrl: "Source URL",
  description: "Description",
  descriptionEn: "English description",
  ctaLabel: "Button label",
  targetUrl: "Destination URL",
  subject: "Subject",
  previewText: "Preview text",
  email: "Email",
  name: "Name",
  source: "Source",
  siteName: "Site name",
  domain: "Domain",
  contactEmail: "Contact email",
  newsletterTitle: "Newsletter title",
  newsletterDescription: "Newsletter description",
  adminName: "Name",
  adminEmail: "Email",
  message: "Message",
};

// FormData'daki alanlardan sınırı aşan ilkini bulur; yoksa null döner.
// Dönen mesaj { success: false, message } biçiminde doğrudan action'dan dönebilir.
export function checkLengths(formData, limits) {
  for (const [field, max] of Object.entries(limits)) {
    const value = formData.get(field);
    if (typeof value === "string" && value.trim().length > max) {
      const label = FIELD_LABELS[field] || field;
      return { success: false, message: `${label} is too long (max ${max} characters).` };
    }
  }
  return null;
}
