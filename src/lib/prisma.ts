import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Singleton Prisma Client untuk aplikasi.
 *
 * Prisma 7 memindahkan URL ke driver adapter, jadi kita wire PrismaPg di sini
 * dengan `DATABASE_URL`. Supabase-nya pakai PgBouncer saat production lewat
 * `?pgbouncer=true` di connection string (diatur di Vercel env).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL belum diset. Isi .env dengan connection string Supabase.",
    );
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
