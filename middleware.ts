/**
 * middleware.ts
 *
 * Next.js Edge Middleware for server-side route protection.
 *
 * Runs at the Edge — NO database calls, NO Prisma dependencies.
 * Session is verified statelessly via Auth.js JWT session token (httpOnly cookie).
 *
 * Public routes:
 *   /            — landing page
 *   /login       — sign-in page
 *   /register    — sign-up page
 *   /forgot-password
 *   /api/auth/*  — Auth.js handlers
 *   /api/market/* — market data (public read-only)
 *   /_next/*     — Next.js internals
 *   /images/*    — static assets
 */

import NextAuth from "next-auth";
import { authConfig } from "~/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password"];

const PUBLIC_PREFIXES = [
  "/api/auth",
  "/api/market",
  "/_next",
  "/images",
  "/favicon",
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default auth(
  (req: NextRequest & { auth: { user?: unknown } | null }) => {
    const { pathname } = req.nextUrl;

    // If authenticated user visits login or register, redirect to dashboard
    if (req.auth && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }

    if (isPublic(pathname)) return NextResponse.next();

    // No session — redirect to login with callbackUrl
    if (!req.auth) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  },
);

export const config = {
  matcher: [
    /*
     * Match all request paths except static files.
     * Middleware runs for: pages, API routes (except /api/auth and /api/market)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
