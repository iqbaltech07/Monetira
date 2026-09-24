import type {
  Entitlement,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from "~/types/database";

/**
 * Entitlement Matrix
 *
 * Capabilities mapping for Monetira plans.
 * Server is the authoritative source of truth.
 */
export const PLAN_CAPABILITIES: Record<
  SubscriptionPlan,
  Record<Entitlement, boolean>
> = {
  FREE: {
    AI_CHAT: true, // Limited to weekly quota (3 uses/week)
    AI_TRANSACTION: false, // Pro only: voice/natural language parsing
    ADVANCED_REPORTS: false, // Pro only: multi-month comparison, deep breakdown, export
    SPLIT_BILL: true, // Basic split bill included in Free
    DEBT: true, // Basic debt recording included in Free
    ADVANCED_INSIGHTS: false, // Pro only: automated financial health advisory
  },
  PRO: {
    AI_CHAT: true, // Higher/unlimited quota
    AI_TRANSACTION: true, // Full natural language transaction parser
    ADVANCED_REPORTS: true, // Complete analytical reports & exports
    SPLIT_BILL: true, // Full split bill features
    DEBT: true, // Full debt management
    ADVANCED_INSIGHTS: true, // Full smart financial insights
  },
};

/**
 * Checks whether a given subscription record is currently valid and active.
 *
 * Rules:
 * 1. Must exist (non-null/undefined).
 * 2. Status must be strictly "ACTIVE".
 * 3. Expiry timestamp must be strictly in the future (expires_at > evalDate).
 *    If expires_at <= evalDate, it is considered EXPIRED and inactive.
 */
export function isSubscriptionActive(
  subscription: Subscription | null | undefined,
  evalDate: Date = new Date(),
): boolean {
  if (!subscription) return false;
  if (subscription.status !== "ACTIVE") return false;

  const expiryTime = new Date(subscription.expires_at).getTime();
  const currentTime = evalDate.getTime();

  return expiryTime > currentTime;
}

/**
 * Resolves the effective plan for a user.
 * If subscription is missing, expired, or non-active, safely defaults to "FREE".
 */
export function getEffectivePlan(
  subscription: Subscription | null | undefined,
  evalDate: Date = new Date(),
): SubscriptionPlan {
  if (isSubscriptionActive(subscription, evalDate)) {
    return subscription?.plan || "FREE";
  }
  return "FREE";
}

/**
 * Resolves the operational status of a subscription, taking into account
 * automatic time-based expiry.
 */
export function getEffectiveStatus(
  subscription: Subscription | null | undefined,
  evalDate: Date = new Date(),
): SubscriptionStatus {
  if (!subscription) return "EXPIRED";

  if (subscription.status === "ACTIVE") {
    const expiryTime = new Date(subscription.expires_at).getTime();
    if (expiryTime <= evalDate.getTime()) {
      return "EXPIRED";
    }
  }

  return subscription.status;
}

/**
 * Centralized Entitlements getter.
 * Returns the capability set for the given subscription.
 */
export function getEntitlements(
  subscription: Subscription | null | undefined,
  evalDate: Date = new Date(),
): Record<Entitlement, boolean> {
  const plan = getEffectivePlan(subscription, evalDate);
  return PLAN_CAPABILITIES[plan];
}

/**
 * Centralized permission checker for specific features.
 * Use this across components and API routes instead of hardcoding `if (isPro)`.
 *
 * @example
 * if (!canUseFeature(userSubscription, "AI_TRANSACTION")) {
 *   // Prompt upgrade
 * }
 */
export function canUseFeature(
  subscription: Subscription | null | undefined,
  feature: Entitlement,
  evalDate: Date = new Date(),
): boolean {
  const entitlements = getEntitlements(subscription, evalDate);
  return entitlements[feature] ?? false;
}

/**
 * Factory for a safe default Free Subscription record.
 */
export function createDefaultFreeSubscription(
  userId = "user_01",
): Subscription {
  const now = new Date();
  const farFuture = new Date("2099-12-31T23:59:59.999Z");
  return {
    id: `sub_free_${userId}`,
    user_id: userId,
    plan: "FREE",
    status: "ACTIVE",
    started_at: now.toISOString(),
    expires_at: farFuture.toISOString(),
    created_at: now.toISOString(),
    updated_at: null,
  };
}
