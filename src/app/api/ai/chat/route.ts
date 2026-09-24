import { NextResponse } from "next/server";
import type { FinancialContext } from "~/lib/ai/financial-context";
import {
  generateFinancialResponse,
  type ChatResponse,
} from "~/lib/ai/provider";
import { checkAiChatAllowance } from "~/lib/subscription/ai-usage";
import type { Subscription } from "~/types/database";

/**
 * POST /api/ai/chat
 *
 * Financial Chat API Route — READ-ONLY.
 *
 * ARCHITECTURE:
 *   Client sends:
 *     - message: user question (untrusted)
 *     - context: FinancialContext built by application (trusted structure,
 *                but validated server-side before use)
 *     - subscription: client-reported subscription state
 *     - currentWeeklyUsage: client-reported weekly counter
 *
 *   Server:
 *     1. Validates message (empty, too long, injection guard)
 *     2. Validates context shape (not user-computed raw numbers)
 *     3. Validates subscription & usage allowance
 *     4. Passes to AI provider
 *     5. Returns answer
 *
 * NOTE ON SERVER SOURCE OF TRUTH:
 * Once server-side session authentication (OAuth) and PostgreSQL are live,
 * the server will read user_id from the session token and fetch the subscription
 * directly from the database, eliminating any client-reported usage parameters.
 */

interface ChatRequestBody {
  message: string;
  context: FinancialContext;
  subscription?: Subscription;
  currentWeeklyUsage?: number;
}

// Minimal structural validation — not business logic validation
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

// Basic prompt injection guard — strip known jailbreak patterns
function sanitizeMessage(msg: string): string {
  // Remove common injection patterns
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

  // ── Input Validation ──────────────────────────────────────────────────────
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

  // ── Subscription & Entitlement Check (Server Guard) ───────────────────────
  if (body.subscription) {
    const allowance = checkAiChatAllowance(
      body.subscription,
      body.currentWeeklyUsage ?? 0,
    );
    if (!allowance.allowed) {
      return NextResponse.json(
        { error: allowance.reason || "Batas penggunaan AI mingguan tercapai." },
        { status: 429 },
      );
    }
  }

  // ── Sanitize user message (prompt injection guard) ────────────────────────
  const sanitizedMessage = sanitizeMessage(message.trim());

  // ── Generate Response ─────────────────────────────────────────────────────
  try {
    const response = await generateFinancialResponse(sanitizedMessage, context);
    return NextResponse.json(response);
  } catch (err) {
    console.error(
      "[AI Chat] Unhandled error:",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json(
      {
        error: "AI sedang tidak tersedia. Coba lagi beberapa saat.",
      },
      { status: 503 },
    );
  }
}
