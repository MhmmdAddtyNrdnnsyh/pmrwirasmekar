import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

/**
 * Config Auth.js "full" — dengan Prisma lookup + bcrypt compare.
 * File ini bisa pakai module Node (Prisma, bcrypt) karena tidak dipakai di Edge.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username =
          typeof credentials?.username === "string"
            ? credentials.username.trim()
            : "";
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        if (!username || !password) return null;

        const admin = await prisma.admin.findUnique({ where: { username } });
        if (!admin) return null;

        const ok = await bcrypt.compare(password, admin.passwordHash);
        if (!ok) return null;

        return {
          id: admin.id,
          name: admin.username,
        };
      },
    }),
  ],
});
