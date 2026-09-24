/**
 * src/lib/subscription/ai-usage-db.ts
 *
 * Server-side AI usage tracking backed by Neon PostgreSQL.
 *
 * Replaces client-trusted localStorage ai_usage once auth is established.
 * User ID comes from the VERIFIED server-side Auth.js session — never from
 * the request body.
 *
 * Quota (from Phase 11 entitlements):
 *   FREE: 3 AI chat uses / week
 *   PRO:  50 AI chat uses / week
 *
 * Week boundary: ISO week, starting Monday 00:00:00 UTC.
 */

import { db } from "~/lib/db";

const FREE_WEEKLY_LIMIT = 3;
const PRO_WEEKLY_LIMIT = 50;

/**
 * Returns the start of the current ISO week (Monday 00:00:00.000 UTC).
 */
function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

/**
 * Get or create the AiUsage record for the current user/week.
 */
async function getOrCreateUsage(userId: string) {
  const weekStart = getWeekStart();
  return db.aiUsage.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    create: { userId, weekStart, chatCount: 0, parseCount: 0 },
    update: {}, // no-op update to return existing record
  });
}

/**
 * Get the user subscription plan from DB.
 * Returns "FREE" if no subscription found.
 */
async function getUserPlan(userId: string): Promise<"FREE" | "PRO"> {
  const sub = await db.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true, expiresAt: true },
  });

  if (!sub || sub.status !== "active") return "FREE";
  if (sub.plan === "PRO") {
    // Check expiry
    if (sub.expiresAt && sub.expiresAt < new Date()) return "FREE";
    return "PRO";
  }
  return "FREE";
}

export interface AiChatCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  plan: "FREE" | "PRO";
  reason?: string;
}

/**
 * Check if a user is allowed to make an AI chat request.
 * Does NOT increment the counter — call incrementChatUsage() after.
 *
 * SECURITY: userId must come from Auth.js session, never from request body.
 */
export async function checkAiChatAllowance(
  userId: string,
): Promise<AiChatCheckResult> {
  const [plan, usage] = await Promise.all([
    getUserPlan(userId),
    getOrCreateUsage(userId),
  ]);

  const limit = plan === "PRO" ? PRO_WEEKLY_LIMIT : FREE_WEEKLY_LIMIT;
  const remaining = Math.max(0, limit - usage.chatCount);
  const allowed = usage.chatCount < limit;

  return {
    allowed,
    remaining,
    limit,
    plan,
    reason: allowed
      ? undefined
      : `Batas AI chat minggu ini (${limit}x) sudah tercapai. Upgrade ke PRO untuk kuota lebih banyak.`,
  };
}

/**
 * Increment the chat usage counter for the current user/week.
 * Call this AFTER the AI response is successfully generated.
 */
export async function incrementChatUsage(userId: string): Promise<void> {
  const weekStart = getWeekStart();
  await db.aiUsage.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    create: { userId, weekStart, chatCount: 1, parseCount: 0 },
    update: { chatCount: { increment: 1 } },
  });
}
