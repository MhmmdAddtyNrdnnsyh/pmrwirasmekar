import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

/**
 * Guard admin-only untuk API route.
 * Return `null` kalau valid, atau `NextResponse` 401 kalau tidak.
 *
 * Pola pakai:
 *   const unauth = await requireAdmin();
 *   if (unauth) return unauth;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Tidak terautentikasi." },
      { status: 401 },
    );
  }
  return null;
}
