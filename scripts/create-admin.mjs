// Admin hesabı oluşturur veya var olanın parolasını değiştirir.
// Panelden giriş yapamadığınız durumda (ilk kurulum, unutulan parola)
// kullanılır.
//
//   node scripts/create-admin.mjs <e-posta> <parola> [ad]
//
// Örnek:
//   node scripts/create-admin.mjs admin@motovoix.com "cok-gizli-parola" "Piri Aykut"

try {
  process.loadEnvFile(".env");
} catch {
  // .env yoksa DATABASE_URL dışarıdan geliyordur.
}

const [email, password, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(" ");

if (!email || !password) {
  console.error("Kullanım: node scripts/create-admin.mjs <e-posta> <parola> [ad]");
  process.exit(1);
}

const { prisma } = await import("../lib/prisma.js");
const { hashPassword, MIN_PASSWORD_LENGTH } = await import("../lib/auth-password.js");

if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(`Parola en az ${MIN_PASSWORD_LENGTH} karakter olmalı.`);
  process.exit(1);
}

const normalized = email.trim().toLowerCase();

try {
  const passwordHash = await hashPassword(password);
  const existing = await prisma.user.findUnique({ where: { email: normalized }, select: { id: true } });

  const user = await prisma.user.upsert({
    where: { email: normalized },
    create: { email: normalized, name, passwordHash, role: "admin" },
    update: { passwordHash, ...(name ? { name } : {}) },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log(existing ? "Parola güncellendi:" : "Admin hesabı oluşturuldu:", user.email, `(${user.role})`);
  console.log("Giriş: /admin/giris");
} catch (error) {
  console.error("İşlem başarısız:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
