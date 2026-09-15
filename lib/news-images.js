import { randomBytes } from "node:crypto";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

// Repodaki kapak görselleri ile panelden yüklenenler aynı klasörde durur;
// yazılara kaydedilen yol her zaman /images/news/<dosya> biçimindedir.
export const NEWS_IMAGE_URL_PREFIX = "/images/news/";
// Panel tarafı (image-picker-field.js) aynı sınırı önceden kontrol eder;
// next.config.mjs'deki bodySizeLimit bunun biraz üstünde tutulmalı.
export const MAX_NEWS_IMAGE_BYTES = 8 * 1024 * 1024;

const NEWS_IMAGE_DIR = path.join(process.cwd(), "public", "images", "news");

const CONTENT_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

const TURKISH_LETTERS = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };

function extensionOf(name) {
  return path.extname(name).slice(1).toLowerCase();
}

// Tarayıcının bildirdiği MIME türüne güvenilmiyor; dosyanın ilk baytlarına bakılıyor.
// SVG bilerek dışarıda: içine script gömülebiliyor.
function detectImageType(bytes) {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (bytes.toString("latin1", 0, 4) === "RIFF" && bytes.toString("latin1", 8, 12) === "WEBP") return "webp";
  if (bytes.toString("latin1", 0, 4) === "GIF8") return "gif";
  if (bytes.toString("latin1", 4, 8) === "ftyp" && ["avif", "avis"].includes(bytes.toString("latin1", 8, 12))) return "avif";
  return null;
}

function slugify(name) {
  const slug = name
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşü]/g, (letter) => TURKISH_LETTERS[letter])
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return slug || "gorsel";
}

// Yalnızca klasörün içindeki, uzantısı görsel olan düz dosya adları.
// "../", alt klasör ve gizli dosyalar burada elenir.
function safeFileName(value) {
  const name = String(value || "");
  if (!name || name !== path.basename(name) || name.startsWith(".")) return null;
  return CONTENT_TYPES[extensionOf(name)] ? name : null;
}

export async function saveNewsImage(file) {
  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function" || !file.size) {
    return { success: false, message: "Choose an image file." };
  }
  if (file.size > MAX_NEWS_IMAGE_BYTES) {
    return { success: false, message: "The image must be 8 MB or smaller." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) return { success: false, message: "Only JPG, PNG, WebP, GIF or AVIF images can be uploaded." };

  // Benzersiz ek: aynı adla yüklenen iki görsel birbirini ezmez, repoya sonradan
  // eklenen bir dosyayla çakışmaz ve next/image önbelleği eski görseli göstermez.
  const base = slugify(path.basename(file.name || "", path.extname(file.name || "")));
  const fileName = `${base}-${Date.now().toString(36)}${randomBytes(2).toString("hex")}.${type}`;

  try {
    await mkdir(NEWS_IMAGE_DIR, { recursive: true });
    await writeFile(path.join(NEWS_IMAGE_DIR, fileName), bytes, { flag: "wx", mode: 0o644 });
  } catch (error) {
    if (error?.code === "EACCES" || error?.code === "EPERM" || error?.code === "EROFS") {
      return { success: false, message: "The server cannot write to public/images/news. Check the folder permissions." };
    }
    throw error;
  }

  return { success: true, message: "Image uploaded.", url: `${NEWS_IMAGE_URL_PREFIX}${fileName}` };
}

export async function listNewsImages() {
  let entries;
  try {
    entries = await readdir(NEWS_IMAGE_DIR, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }

  const images = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && safeFileName(entry.name))
      .map(async (entry) => {
        const info = await stat(path.join(NEWS_IMAGE_DIR, entry.name));
        return { name: entry.name, url: `${NEWS_IMAGE_URL_PREFIX}${entry.name}`, size: info.size, modifiedAt: info.mtimeMs };
      }),
  );
  return images.sort((a, b) => b.modifiedAt - a.modifiedAt);
}

export async function readNewsImage(value) {
  const name = safeFileName(value);
  if (!name) return null;
  try {
    const body = await readFile(path.join(NEWS_IMAGE_DIR, name));
    return { body, contentType: CONTENT_TYPES[extensionOf(name)] };
  } catch (error) {
    if (error?.code === "ENOENT" || error?.code === "EISDIR") return null;
    throw error;
  }
}
