// İmzalı oturum çerezi. Yalnızca Web Crypto kullanır; hem sunucu
// bileşenlerinde hem de proxy.js (middleware) içinde çalışır.
//
// Jeton biçimi:  base64url(payload).base64url(hmacSha256)
// Payload:       { sub: <kullanıcı id>, exp: <unix saniye> }

export const SESSION_COOKIE = "mv_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 gün

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET tanımlı değil (en az 16 karakter olmalı).");
  }
  return secret;
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function importKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(data) {
  const key = await importKey();
  return toBase64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

export async function createSessionToken(userId, maxAge = SESSION_MAX_AGE) {
  const payload = { sub: String(userId), exp: Math.floor(Date.now() / 1000) + maxAge };
  const encoded = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  return `${encoded}.${await sign(encoded)}`;
}

// Geçerliyse payload, değilse null döner. Fırlatmaz.
export async function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  try {
    if (!timingSafeEqual(await sign(encoded), signature)) return null;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded)));
    if (!payload?.sub || typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 <= Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}
