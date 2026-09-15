import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Prisma 7 sürücü adaptörü kullanıyor; MySQL için resmi adaptör mariadb
// sürücüsünün üzerine kurulu. Havuzu adaptör kendi yönetiyor.
function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL tanımlı değil.");

  const adapter = new PrismaMariaDb(url, { connectionLimit: 10 });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// Dev'de hot reload her seferinde yeni bir havuz açmasın diye global'de tutuluyor.
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.__motovoixPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__motovoixPrisma = prisma;
}
