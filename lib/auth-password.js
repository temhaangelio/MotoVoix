// Parola hash'leme — Node'un yerleşik scrypt'i (ek bağımlılık yok).
// Saklanan biçim:  scrypt$N$r$p$<saltHex>$<hashHex>
//
// Yalnızca sunucu tarafında kullanılır (giriş ucu, admin işlemleri, CLI).
// Proxy/middleware bu dosyayı import etmemeli — oturum imzası için
// lib/auth-session.js kullanılıyor.

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const COST = 16384; // N
const BLOCK_SIZE = 8; // r
const PARALLELIZATION = 1; // p
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

export const MIN_PASSWORD_LENGTH = 8;

export async function hashPassword(password) {
  const value = String(password ?? "");
  if (value.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const salt = randomBytes(SALT_LENGTH);
  const derived = await scrypt(value, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
  });

  return ["scrypt", COST, BLOCK_SIZE, PARALLELIZATION, salt.toString("hex"), derived.toString("hex")].join("$");
}

export async function verifyPassword(password, stored) {
  const parts = String(stored ?? "").split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, cost, blockSize, parallelization, saltHex, hashHex] = parts;

  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const derived = await scrypt(String(password ?? ""), salt, expected.length, {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallelization),
    });

    // Uzunluklar eşitse sabit zamanlı karşılaştırma yapılabilir.
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
