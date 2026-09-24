/**
 * middleware.ts
 *
 * Next.js middleware for server-side route protection.
 *
 * Protected routes require an authenticated session.
 * Unauthenticated users are redirected to /login.
 *
 * This runs at the edge — no database calls in middleware.
 * Session is verified via Auth.js session token (httpOnly cookie).
 *
 * Public routes (no auth required):
 *   /            — landing page
 *   /login       — sign-in page
 *   /register    — sign-up page
 *   /forgot-password
 *   /api/auth/*  — Auth.js handlers
 *   /api/market/* — market data (public read-only)
 *   /_next/*     — Next.js internals
 *   /images/*    — static assets
 */

import { auth } from "~/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

    if (isPublic(pathname)) return NextResponse.next();

    // No session — redirect to login
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
