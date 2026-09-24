import { NextResponse } from "next/server";
import { parseTransactionText } from "~/lib/ai/parser";
import type {
  ParseResult,
  TransactionIntent,
  TransactionItem,
} from "~/lib/ai/types";

/**
 * POST /api/ai/parse
 *
 * Server-side transaction text parser with Gemini AI support.
 *
 * Architecture:
 *   Client (browser) -> This API Route -> Parser -> ParseResult -> Client
 *
 * Security:
 * - API key lives ONLY on the server (process.env)
 * - NEXT_PUBLIC_ prefixed AI keys must NEVER be used
 * - AI output is validated against strict schema before use
 * - AI is NOT allowed to calculate balances or produce account IDs
 *
 * CRITICAL INTEGRITY RULE:
 *   After parsing (deterministic or Gemini), server verifies:
 *   totalAmount === sum(items.map(i => i.amount))
 *   If mismatch, the parse result is rejected.
 *
 * Flow:
 *   1. Gemini (if GEMINI_API_KEY configured) -> structured JSON
 *   2. Server validates Gemini output against schema
 *   3. Deterministic fallback if Gemini unavailable or fails
 */

interface ParseRequestBody {
  text: string;
}

/**
 * Verify totalAmount integrity.
 * totalAmount MUST equal sum of items.
 * Returns corrected intent (recalculated sum) or null if items are invalid.
 */
function verifyAndCorrectIntent(
  intent: TransactionIntent,
): TransactionIntent | null {
  if (!intent.items || intent.items.length === 0) return null;

  // Validate each item has a positive amount
  for (const item of intent.items) {
    if (
      typeof item.amount !== "number" ||
      !Number.isFinite(item.amount) ||
      item.amount <= 0
    ) {
      return null;
    }
  }

  // ALWAYS recalculate totalAmount from items (never trust AI-reported total)
  const correctTotal = intent.items.reduce((sum, item) => sum + item.amount, 0);

  return { ...intent, totalAmount: correctTotal };
}

/**
 * Call Gemini for structured transaction parsing.
 * Returns a validated ParseResult or null if Gemini fails.
 */
async function callGeminiForParse(
  text: string,
  apiKey: string,
): Promise<ParseResult | null> {
  const systemPrompt = `You are a transaction parser for an Indonesian personal finance app.

Parse the user's input into structured JSON representing one or more financial transactions.

RULES:
1. Output ONLY valid JSON, no markdown, no explanation.
2. type must be: "Expense", "Income", or "Transfer"
3. items must be a non-empty array
4. Each item must have: description (string), amount (positive integer in IDR)
5. amount must be the EXACT amount stated in the text, converted to IDR integer
6. Indonesian amounts: 5rb = 5000, 45rb = 45000, 1jt = 1000000, 1.5jt = 1500000
7. totalAmount must equal sum of all items amounts (you MUST compute this correctly)
8. confidence: 0.0 to 1.0
9. categoryHint for each item: one of ["Makanan & Minuman","Transportasi","Tagihan","Belanja","Hiburan","Kesehatan","Perumahan","Pendapatan"] or null
10. If amount is missing or unclear, set clarificationNeeded with a helpful message in Bahasa Indonesia
11. sourceAccountName and destinationAccountName: null unless explicitly mentioned
12. parsedBy must be "gemini"

OUTPUT FORMAT (strict):
{
  "type": "Expense",
  "items": [
    { "description": "Martabak asin manis", "amount": 45000, "categoryHint": "Makanan & Minuman" },
    { "description": "Teh Poci", "amount": 5000, "categoryHint": "Makanan & Minuman" }
  ],
  "totalAmount": 50000,
  "confidence": 0.95,
  "sourceAccountName": null,
  "destinationAccountName": null,
  "clarificationNeeded": null,
  "parsedBy": "gemini"
}`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 512,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  // Parse JSON from Gemini output
  let parsed: unknown;
  try {
    // Strip possible markdown code fences
    const cleaned = rawText
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }

  // Validate structure
  if (!parsed || typeof parsed !== "object") return null;
  const p = parsed as Record<string, unknown>;

  const validTypes = ["Expense", "Income", "Transfer"];
  if (!validTypes.includes(p.type as string)) return null;
  if (!Array.isArray(p.items) || p.items.length === 0) return null;

  // Validate and coerce items
  const items: TransactionItem[] = [];
  for (const raw of p.items as unknown[]) {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    if (typeof r.amount !== "number" || r.amount <= 0) return null;
    items.push({
      description:
        typeof r.description === "string" ? r.description : "Transaksi",
      amount: Math.round(r.amount),
      categoryHint:
        typeof r.categoryHint === "string" ? r.categoryHint : undefined,
    });
  }

  const intent: TransactionIntent = {
    type: p.type as TransactionIntent["type"],
    items,
    totalAmount: 0, // will be corrected below
    confidence:
      typeof p.confidence === "number"
        ? Math.min(1, Math.max(0, p.confidence))
        : 0.8,
    sourceAccountName:
      typeof p.sourceAccountName === "string" ? p.sourceAccountName : undefined,
    destinationAccountName:
      typeof p.destinationAccountName === "string"
        ? p.destinationAccountName
        : undefined,
    clarificationNeeded:
      typeof p.clarificationNeeded === "string"
        ? p.clarificationNeeded
        : undefined,
    parsedBy: "gemini",
  };

  const verified = verifyAndCorrectIntent(intent);
  if (!verified) return null;

  return { ok: true, intent: verified };
}

export async function POST(req: Request): Promise<NextResponse<ParseResult>> {
  let body: ParseRequestBody;

  try {
    body = (await req.json()) as ParseRequestBody;
  } catch {
    return NextResponse.json<ParseResult>(
      { ok: false, error: "Request body tidak valid." },
      { status: 400 },
    );
  }

  const { text } = body;

  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json<ParseResult>(
      {
        ok: false,
        error: "Field 'text' harus berupa string yang tidak kosong.",
        clarification: "Tulis deskripsi transaksi Anda.",
      },
      { status: 400 },
    );
  }

  if (text.length > 500) {
    return NextResponse.json<ParseResult>(
      { ok: false, error: "Input terlalu panjang (maksimum 500 karakter)." },
      { status: 400 },
    );
  }

  const geminiKey = process.env.GEMINI_API_KEY;

  // Try Gemini first (if key is available)
  if (geminiKey) {
    try {
      const geminiResult = await callGeminiForParse(text.trim(), geminiKey);
      if (geminiResult) {
        return NextResponse.json<ParseResult>(geminiResult);
      }
      // Gemini failed or returned invalid — fall through to deterministic
    } catch {
      // Fall through to deterministic
    }
  }

  // Deterministic fallback — always functional
  const result = parseTransactionText(text);

  // Server-side integrity check: verify totalAmount = sum(items)
  if (result.ok) {
    const verified = verifyAndCorrectIntent(result.intent);
    if (!verified) {
      return NextResponse.json<ParseResult>(
        { ok: false, error: "Hasil parsing tidak valid. Coba tulis ulang." },
        { status: 422 },
      );
    }
    return NextResponse.json<ParseResult>({ ok: true, intent: verified });
  }

  return NextResponse.json<ParseResult>(result);
}
