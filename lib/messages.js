// /contact formundan gelen mesajlar.

import { createHash } from "node:crypto";
import { prisma } from "./prisma.js";

const str = (value, fallback = "") => (value == null ? fallback : String(value).trim());

const STATUSES = new Set(["new", "read", "archived"]);

export function messageStatus(value, fallback = "new") {
  const normalized = str(value).toLowerCase();
  return STATUSES.has(normalized) ? normalized : fallback;
}

// IP'yi düz saklamıyoruz; yalnızca spam tespitine yetecek bir özet.
function hashIp(ip) {
  if (!ip) return "";
  const salt = process.env.ADMIN_SESSION_SECRET || "motovoix";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export async function getMessages({ status } = {}) {
  return prisma.contactMessage.findMany({
    where: status ? { status: messageStatus(status) } : undefined,
    orderBy: { created_at: "desc" },
  });
}

export async function getMessageById(id) {
  if (!id) return null;
  return prisma.contactMessage.findUnique({ where: { id: String(id) } });
}

export async function getMessageStats() {
  const [total, unread, archived] = await Promise.all([
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: "new" } }),
    prisma.contactMessage.count({ where: { status: "archived" } }),
  ]);
  return { total, unread, archived };
}

export async function createMessage({ name, email, subject, message, ip }) {
  const data = {
    name: str(name),
    email: str(email).toLowerCase(),
    subject: str(subject).slice(0, 255),
    message: str(message),
    ip_hash: hashIp(ip),
  };

  if (!data.name) return { ok: false, message: "Please enter your name." };
  if (!data.email.includes("@")) return { ok: false, message: "Please enter a valid email address." };
  if (data.message.length < 10) return { ok: false, message: "Please write a message of at least 10 characters." };
  if (data.message.length > 5000) return { ok: false, message: "Your message is too long (max 5000 characters)." };

  // Aynı gönderenin arka arkaya form doldurmasını sınırlıyoruz.
  if (data.ip_hash) {
    const recent = await prisma.contactMessage.count({
      where: { ip_hash: data.ip_hash, created_at: { gte: new Date(Date.now() - 60_000) } },
    });
    if (recent >= 3) return { ok: false, message: "Too many messages. Please try again in a minute." };
  }

  await prisma.contactMessage.create({ data });
  return { ok: true, message: "Thanks — your message has reached the desk." };
}

export async function updateMessageStatus(id, status) {
  try {
    return await prisma.contactMessage.update({
      where: { id: String(id) },
      data: { status: messageStatus(status) },
    });
  } catch {
    return null;
  }
}

export async function deleteMessage(id) {
  try {
    await prisma.contactMessage.delete({ where: { id: String(id) } });
    return true;
  } catch {
    return false;
  }
}
