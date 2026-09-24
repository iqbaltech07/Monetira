/**
 * src/auth.ts
 *
 * Auth.js (NextAuth v5 beta) configuration for Monetira.
 *
 * ARCHITECTURE:
 * - Google OAuth only (no email/password)
 * - PrismaAdapter stores users, accounts, sessions in Neon PostgreSQL
 * - Session strategy: "database" (server-side, not JWT)
 * - Google account identity verified server-side via OAuth callback
 * - NEVER trust client-provided user ID or email
 *
 * CALLBACK URL:
 *   Development:  http://localhost:3000/api/auth/callback/google
 *   Production:   https://monetira.vercel.app/api/auth/callback/google
 *
 * Required env vars:
 *   AUTH_SECRET         — random secret for session signing
 *   GOOGLE_CLIENT_ID    — Google Cloud Console OAuth 2.0 client ID
 *   GOOGLE_CLIENT_SECRET — Google Cloud Console OAuth 2.0 client secret
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "~/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Always show account picker so users can switch accounts
          prompt: "select_account",
        },
      },
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    /**
     * Session callback: attach userId to client-accessible session.
     * ONLY user.id (from DB) is exposed — never provider account ID.
     */
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    /**
     * Redirect callback: after sign-in, always go to /dashboard.
     * Prevents open redirect by checking the URL is relative or same-origin.
     */
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },
  },
});

// Augment the Session type to include user.id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
