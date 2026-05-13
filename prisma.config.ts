import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Konfigurasi Prisma 7.
 *
 * Supabase menyediakan dua connection string — satu pooled (PgBouncer) untuk
 * runtime aplikasi, satu direct untuk migrate/pull. Saat `DIRECT_URL` ada,
 * Prisma CLI akan pakai itu untuk operasi schema, lebih aman di Supabase.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
