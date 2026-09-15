// Admin kullanıcıları — okuma, yazma ve oturumdaki kullanıcıyı çözme.

import { prisma } from "./prisma.js";
import { hashPassword, verifyPassword } from "./auth-password.js";
import { SESSION_COOKIE, verifySessionToken } from "./auth-session.js";

// Parola hash'i asla dışarı sızmasın diye her okuma bu seçimle yapılıyor.
const PUBLIC_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  created_at: true,
};

const normalizeEmail = (value) => String(value ?? "").trim().toLowerCase();

export async function getUsers() {
  return prisma.user.findMany({ select: PUBLIC_FIELDS, orderBy: { created_at: "asc" } });
}

export async function getUserById(id) {
  if (!id) return null;
  return prisma.user.findUnique({ where: { id: String(id) }, select: PUBLIC_FIELDS });
}

export async function getUserCount() {
  return prisma.user.count();
}

export async function createUser({ email, name, password, role = "admin" }) {
  const normalized = normalizeEmail(email);
  if (!normalized.includes("@")) return { ok: false, message: "Enter a valid email address." };

  const exists = await prisma.user.findUnique({ where: { email: normalized }, select: { id: true } });
  if (exists) return { ok: false, message: "A user with this email already exists." };

  let passwordHash;
  try {
    passwordHash = await hashPassword(password);
  } catch (error) {
    return { ok: false, message: error.message };
  }

  const user = await prisma.user.create({
    data: { email: normalized, name: String(name ?? "").trim(), passwordHash, role: String(role || "admin") },
    select: PUBLIC_FIELDS,
  });

  return { ok: true, user };
}

export async function updateUser(id, { email, name, password, role }) {
  const current = await prisma.user.findUnique({ where: { id: String(id) }, select: { id: true } });
  if (!current) return { ok: false, message: "User not found." };

  const data = {};

  if (email != null) {
    const normalized = normalizeEmail(email);
    if (!normalized.includes("@")) return { ok: false, message: "Enter a valid email address." };
    const clash = await prisma.user.findUnique({ where: { email: normalized }, select: { id: true } });
    if (clash && clash.id !== current.id) return { ok: false, message: "A user with this email already exists." };
    data.email = normalized;
  }

  if (name != null) data.name = String(name).trim();
  if (role != null) data.role = String(role) || "admin";

  // Boş parola alanı "değiştirme" anlamına geliyor.
  if (password) {
    try {
      data.passwordHash = await hashPassword(password);
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  const user = await prisma.user.update({ where: { id: current.id }, data, select: PUBLIC_FIELDS });
  return { ok: true, user };
}

export async function deleteUser(id) {
  const total = await prisma.user.count();
  if (total <= 1) return { ok: false, message: "The last remaining admin cannot be deleted." };

  try {
    await prisma.user.delete({ where: { id: String(id) } });
    return { ok: true };
  } catch {
    return { ok: false, message: "User could not be deleted." };
  }
}

// Giriş denemesi. Kullanıcı yoksa da parola doğrulaması yapılır ki
// yanıt süresi e-postanın kayıtlı olup olmadığını ele vermesin.
const DUMMY_HASH = "scrypt$16384$8$1$00000000000000000000000000000000$00";

export async function authenticate(email, password) {
  const normalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalized } });

  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

// Oturum çerezindeki kullanıcıyı çözer; geçersizse null.
// next/headers yalnızca burada, istek bağlamında yükleniyor — böylece bu
// modül CLI script'lerinden de import edilebiliyor.
export async function getCurrentUser() {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  const payload = await verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  return getUserById(payload.sub);
}
