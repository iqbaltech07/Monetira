import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * src/auth.config.ts
 *
 * Edge-compatible NextAuth configuration.
 * Does NOT import Prisma or Node.js-specific modules so it can safely run
 * inside Next.js Edge Middleware.
 */
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    /**
     * JWT callback: captures user id from DB adapter on sign in and persists to JWT.
     */
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    /**
     * Session callback: exposes user.id from token to client session.
     */
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    /**
     * Redirect callback: safely redirect to callbackUrl or /dashboard.
     */
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },
  },
} satisfies NextAuthConfig;
