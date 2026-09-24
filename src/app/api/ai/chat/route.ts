import { NextResponse } from "next/server";
import type { FinancialContext } from "~/lib/ai/financial-context";
import {
  generateFinancialResponse,
  type ChatResponse,
} from "~/lib/ai/provider";
import { checkAiChatAllowance as checkLocalAllowance } from "~/lib/subscription/ai-usage";
import {
  checkAiChatAllowance as checkDbAllowance,
  incrementChatUsage,
} from "~/lib/subscription/ai-usage-db";
import type { Subscription } from "~/types/database";
import { auth } from "~/auth";

/**
 * POST /api/ai/chat
 *
 * Financial Chat API Route — READ-ONLY.
 *
 * QUOTA STRATEGY (dual-mode during migration):
 *   - If Auth.js session exists: use DB-backed quota (server source of truth)
 *   - If no session: use client-reported quota (localStorage, backward compat)
 *
 * Once all users are authenticated, the client-reported fallback will be removed.
 *
 * SECURITY:
 * - User ID ONLY from Auth.js session (never from request body)
 * - DB quota cannot be spoofed by client
 */

interface ChatRequestBody {
  message: string;
  context: FinancialContext;
  subscription?: Subscription;
  currentWeeklyUsage?: number;
}

function isValidContext(ctx: unknown): ctx is FinancialContext {
  if (!ctx || typeof ctx !== "object") return false;
  const c = ctx as Record<string, unknown>;
  return (
    typeof c.mainBalance === "number" &&
    typeof c.totalSavings === "number" &&
    typeof c.totalFunds === "number" &&
    typeof c.totalIncome === "number" &&
    typeof c.totalExpense === "number" &&
    typeof c.netCashFlow === "number" &&
    typeof c.period === "object" &&
    c.period !== null &&
    Array.isArray(c.savingsGoals) &&
    Array.isArray(c.categoryBreakdown) &&
    Array.isArray(c.recentTransactions)
  );
}

function sanitizeMessage(msg: string): string {
  return msg
    .replace(
      /ignore (all )?(previous|prior|above) (instructions?|rules?|prompts?)/gi,
      "[filtered]",
    )
    .replace(/you are now|pretend you are|act as if/gi, "[filtered]")
    .replace(/reveal (your|the) (system |)prompt/gi, "[filtered]")
    .replace(/show (me|all) (the |)(database|storage|data)/gi, "[filtered]")
    .trim();
}

export async function POST(
  req: Request,
): Promise<NextResponse<ChatResponse | { error: string }>> {
  let body: ChatRequestBody;

  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Request body tidak valid." },
      { status: 400 },
    );
  }

  const { message, context } = body;

  if (typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json(
      { error: "Pertanyaan tidak boleh kosong." },
      { status: 400 },
    );
  }

  if (message.length > 500) {
    return NextResponse.json(
      { error: "Pertanyaan terlalu panjang (maksimum 500 karakter)." },
      { status: 400 },
    );
  }

  if (!isValidContext(context)) {
    return NextResponse.json(
      { error: "Konteks keuangan tidak valid. Muat ulang halaman." },
      { status: 400 },
    );
  }

  // ── QUOTA CHECK: DB-backed (authenticated) or client-reported (fallback) ──

  const session = await auth();

  if (session?.user?.id) {
    // AUTHENTICATED: Use server-side DB quota (cannot be spoofed)
    const allowance = await checkDbAllowance(session.user.id);
    if (!allowance.allowed) {
      return NextResponse.json(
        { error: allowance.reason || "Batas penggunaan AI mingguan tercapai." },
        { status: 429 },
      );
    }
  } else {
    // UNAUTHENTICATED: Fall back to client-reported quota
    if (body.subscription) {
      const allowance = checkLocalAllowance(
        body.subscription,
        body.currentWeeklyUsage ?? 0,
      );
      if (!allowance.allowed) {
        return NextResponse.json(
          {
            error: allowance.reason || "Batas penggunaan AI mingguan tercapai.",
          },
          { status: 429 },
        );
      }
    }
  }

  const sanitizedMessage = sanitizeMessage(message.trim());

  try {
    const response = await generateFinancialResponse(sanitizedMessage, context);

    // Increment DB counter AFTER successful response (authenticated only)
    if (session?.user?.id) {
      await incrementChatUsage(session.user.id).catch(() => {
        // Non-fatal: quota increment failure should not block the response
      });
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error(
      "[AI Chat] Unhandled error:",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json(
      { error: "AI sedang tidak tersedia. Coba lagi beberapa saat." },
      { status: 503 },
    );
  }
}
