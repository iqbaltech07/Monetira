import type { Subscription, SubscriptionPlan } from "~/types/database";
import { getEffectivePlan } from "./entitlements";

/**
 * AI Usage Limits Configuration
 *
 * Free: 3 AI chat requests per calendar week.
 * Pro: Higher tier allowance (50 requests/week).
 */
export const AI_LIMITS = {
  FREE: {
    CHAT_PER_WEEK: 3,
    TRANSACTION_PARSE_PER_WEEK: 0, // Pro only capability
  },
  PRO: {
    CHAT_PER_WEEK: 50,
    TRANSACTION_PARSE_PER_WEEK: 100,
  },
} as const;

export interface AiAllowanceCheck {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  plan: SubscriptionPlan;
  reason?: string;
}

/**
 * Validates whether an AI Chat request can proceed based on current usage.
 *
 * CRITICAL ARCHITECTURAL PRINCIPLE:
 * In production with server-side authentication and database persistence:
 * 1. Client sends request with Auth Session cookie/token.
 * 2. Server decodes user identity.
 * 3. Server queries database for active subscription and usage counter in the current weekly window.
 * 4. Server performs this allowance check.
 * 5. If allowed, increments server usage count BEFORE calling AI model.
 * 6. Client cannot bypass this check by modifying localStorage.
 */
export function checkAiChatAllowance(
  subscription: Subscription | null | undefined,
  currentWeeklyChatCount: number,
  evalDate: Date = new Date(),
): AiAllowanceCheck {
  const plan = getEffectivePlan(subscription, evalDate);
  const limit = AI_LIMITS[plan].CHAT_PER_WEEK;
  const used = Math.max(0, currentWeeklyChatCount);
  const remaining = Math.max(0, limit - used);

  if (used >= limit) {
    const isFree = plan === "FREE";
    return {
      allowed: false,
      used,
      limit,
      remaining: 0,
      plan,
      reason: isFree
        ? "Batas penggunaan AI gratis (3x per minggu) telah tercapai. Upgrade ke Monetira Pro untuk akses lebih banyak."
        : "Batas mingguan AI Pro telah tercapai untuk periode minggu ini.",
    };
  }

  return {
    allowed: true,
    used,
    limit,
    remaining,
    plan,
  };
}

/**
 * Validates whether an AI Transaction Parser request can proceed.
 */
export function checkAiTransactionAllowance(
  subscription: Subscription | null | undefined,
  currentWeeklyParseCount: number,
  evalDate: Date = new Date(),
): AiAllowanceCheck {
  const plan = getEffectivePlan(subscription, evalDate);
  const limit = AI_LIMITS[plan].TRANSACTION_PARSE_PER_WEEK;
  const used = Math.max(0, currentWeeklyParseCount);
  const remaining = Math.max(0, limit - used);

  if (plan === "FREE") {
    return {
      allowed: false,
      used,
      limit: 0,
      remaining: 0,
      plan,
      reason:
        "Input Transaksi berbasis AI adalah fitur eksklusif Monetira Pro. Silakan upgrade untuk menikmati kemudahan pencatatan otomatis.",
    };
  }

  if (used >= limit) {
    return {
      allowed: false,
      used,
      limit,
      remaining: 0,
      plan,
      reason: "Batas mingguan input transaksi AI Pro telah tercapai.",
    };
  }

  return {
    allowed: true,
    used,
    limit,
    remaining,
    plan,
  };
}
