// Next.js 16 mengganti `middleware.ts` dengan `proxy.ts`.
// Proxy Auth.js ini dijalankan di Edge Runtime, jadi import config edge-safe
// dari lib/auth.config.ts (bukan lib/auth.ts yang memuat bcrypt).
import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
