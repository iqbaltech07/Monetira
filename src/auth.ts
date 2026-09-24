/**
 * src/auth.ts
 *
 * Full Node.js runtime Auth.js (NextAuth v5 beta) configuration.
 *
 * ARCHITECTURE:
 * - Edge-compatible base config imported from ./auth.config
 * - PrismaAdapter connects to Neon PostgreSQL (Node.js runtime only)
 * - Session strategy: "jwt" (enables Edge Middleware route guards while saving Users/Accounts to DB)
 * - Google account identity verified server-side via OAuth callback
 *
 * Required env vars:
 *   AUTH_SECRET          — random secret for session signing & JWT encryption
 *   GOOGLE_CLIENT_ID     — Google Cloud Console OAuth 2.0 client ID
 *   GOOGLE_CLIENT_SECRET — Google Cloud Console OAuth 2.0 client secret
 *   DATABASE_URL         — Neon PostgreSQL connection string
 */

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "~/lib/db";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
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
