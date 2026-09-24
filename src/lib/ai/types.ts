import type { TransactionType } from "~/types/database";

/**
 * A single parsed transaction item within a multi-item input.
 *
 * Example: "martabak 45rb" → { description: "Martabak", amount: 45000, ... }
 */
export interface TransactionItem {
  /** Human-readable description extracted from input */
  description: string;

  /** Amount in IDR. Always > 0. Never fabricated — only from explicit input. */
  amount: number;

  /**
   * Category name hint from natural language.
   * Inferred per-item. Application layer resolves to category_id.
   * Parser NEVER produces category_id directly.
   */
  categoryHint?: string;
}

/**
 * Structured Multi-Transaction Intent — output of the AI/deterministic parser.
 *
 * AI is a PARSER ONLY. Mutation only through the Unified Transaction Engine.
 * AI must NOT calculate balances, write to storage, or bypass the engine.
 *
 * Supports both single-item and multi-item inputs in one unified structure.
 *
 * CRITICAL RULE:
 *   totalAmount MUST equal sum(items.map(i => i.amount))
 *   Never fabricated, never guessed.
 */
export interface TransactionIntent {
  /** Transaction type: Income | Expense | Transfer */
  type: TransactionType;

  /**
   * Parsed items. At least one item is always present when ok: true.
   *
   * For multi-item: ["martabak 45rb", "teh poci 5rb"] → 2 items
   * For single-item: ["kopi 25rb"] → 1 item
   */
  items: TransactionItem[];

  /**
   * Total amount in IDR.
   * MUST equal: items.reduce((s, i) => s + i.amount, 0)
   * Computed by parser, verified by API route before use.
   */
  totalAmount: number;

  /**
   * Source account name for Transfer/Expense.
   * Application layer resolves to account_id by fuzzy matching.
   * Parser NEVER produces account_id directly.
   */
  sourceAccountName?: string;

  /**
   * Destination account name for Transfer/Income.
   * Application layer resolves to account_id by fuzzy matching.
   */
  destinationAccountName?: string;

  /**
   * Date override. Defaults to current date if absent.
   * ISO string (yyyy-MM-dd) or omitted.
   */
  date?: string;

  /**
   * Parser confidence 0–1.
   * < 0.5: ambiguous, prompt user for clarification.
   * >= 0.5: show structured preview for confirmation.
   */
  confidence: number;

  /**
   * Reason for low confidence or missing fields.
   * Shown to user as clarification prompt.
   */
  clarificationNeeded?: string;

  /**
   * Parser that produced this result.
   */
  parsedBy?: "gemini" | "deterministic";
}

/**
 * Result of the parse operation.
 */
export type ParseResult =
  | { ok: true; intent: TransactionIntent }
  | { ok: false; error: string; clarification?: string };
