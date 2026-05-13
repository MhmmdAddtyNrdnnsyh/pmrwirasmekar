import type { NextAuthConfig } from "next-auth";

/**
 * Config Auth.js yang aman dipakai di Edge Runtime (middleware / proxy).
 * TIDAK boleh import Prisma, bcrypt, atau module Node-only di sini.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [], // providers didefinisikan di lib/auth.ts (bukan edge-safe)
  callbacks: {
    authorized({ auth: session, request }) {
      const { pathname } = request.nextUrl;

      if (pathname === "/admin/login") return true;
      if (pathname.startsWith("/admin")) return !!session;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && typeof token.id === "string") {
        session.user.id = token.id;
      }
      return session;
    },
  },
};
