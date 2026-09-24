import { NextResponse } from "next/server";
import { parseTransactionText } from "~/lib/ai/parser";
import type { ParseResult } from "~/lib/ai/types";

/**
 * POST /api/ai/parse
 *
 * Server-side transaction text parser.
 *
 * Architecture:
 *   Client (browser) → This API Route → Parser → ParseResult → Client
 *
 * Security:
 * - API key (if any) lives ONLY on the server (process.env)
 * - NEXT_PUBLIC_ prefixed AI keys must NEVER be used
 * - Currently uses deterministic parser (no external API calls)
 * - When an AI provider is configured, swap parseTransactionText for
 *   the AI provider adapter here — client code stays unchanged
 *
 * AI Provider Status:
 *   GEMINI_API_KEY:    NOT CONFIGURED
 *   OPENAI_API_KEY:    NOT CONFIGURED
 *   ANTHROPIC_API_KEY: NOT CONFIGURED
 *
 * Current implementation: deterministic rule-based parser (src/lib/ai/parser.ts)
 */

interface ParseRequestBody {
  text: string;
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
      {
        ok: false,
        error: "Input terlalu panjang (maksimum 500 karakter).",
      },
      { status: 400 },
    );
  }

  // -------------------------------------------------------------------
  // AI Provider Adapter (plug-in point)
  // When a real AI provider is available, replace this block:
  //
  //   const result = await callGemini(text, process.env.GEMINI_API_KEY);
  //
  // The result must conform to ParseResult from "~/lib/ai/types".
  // The parser must return TransactionIntent, not calculate balances.
  // -------------------------------------------------------------------
  const result = parseTransactionText(text);

  return NextResponse.json<ParseResult>(result);
}
