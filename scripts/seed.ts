/**
 * Seeder akun admin — jalankan SEKALI untuk membuat admin pertama:
 *   npm run db:seed
 *
 * Variabel env yang dipakai (opsional, ada default):
 *   SEED_ADMIN_USERNAME  (default: "admin")
 *   SEED_ADMIN_PASSWORD  (wajib diset — seeder tidak akan lanjut tanpa ini)
 *
 * Data admin disimpan di Google Sheets (tab Admin).
 */
import "dotenv/config";
import bcrypt from "bcryptjs";

import { createAdmin, hasAnyAdmin } from "../src/lib/admin-store";

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME?.trim() || "admin";
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();

  if (!password) {
    console.error(
      "❌ SEED_ADMIN_PASSWORD belum diisi di .env. Set password dulu sebelum menjalankan seeder.",
    );
    process.exit(1);
  }

  const alreadyExists = await hasAnyAdmin();
  if (alreadyExists) {
    console.log(
      `⚠️  Admin sudah ada di Google Sheets. Seeder dibatalkan.`,
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await createAdmin({ username, passwordHash });
  console.log(`✅ Admin berhasil dibuat: username="${admin.username}"`);
}

main().catch((err) => {
  console.error("❌ Seeder gagal:", err);
  process.exit(1);
});
