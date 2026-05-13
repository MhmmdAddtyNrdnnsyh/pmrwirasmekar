/**
 * Seeder akun admin — jalankan SEKALI setelah DB siap:
 *   npm run db:seed
 *
 * Variabel env yang dipakai (opsional, ada default):
 *   SEED_ADMIN_USERNAME  (default: "admin")
 *   SEED_ADMIN_PASSWORD  (wajib diset — seeder tidak akan lanjut tanpa ini)
 */
import "dotenv/config";
import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma";

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME?.trim() || "admin";
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();

  if (!password) {
    console.error(
      "❌ SEED_ADMIN_PASSWORD belum diisi di .env. Set password dulu sebelum menjalankan seeder.",
    );
    process.exit(1);
  }

  const existing = await prisma.admin.findFirst();
  if (existing) {
    console.log(
      `⚠️  Admin sudah ada (username: "${existing.username}"). Seeder dibatalkan.`,
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({
    data: { username, passwordHash },
  });
  console.log(`✅ Admin berhasil dibuat: username="${admin.username}"`);
}

main()
  .catch((err) => {
    console.error("❌ Seeder gagal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
