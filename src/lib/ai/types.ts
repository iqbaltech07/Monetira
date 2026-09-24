import type { TransactionType } from "~/types/database";

/**
 * Structured Transaction Intent — output dari AI/deterministic parser.
 *
 * AI adalah PARSER hanya. Mutation hanya melalui Unified Transaction Engine.
 * AI tidak boleh menghitung saldo, menulis ke storage, atau bypass engine.
 */
export interface TransactionIntent {
  /** Transaction type: Income | Expense | Transfer */
  type: TransactionType;

  /**
   * Parsed amount in IDR (Rupiah).
   * Must be finite and > 0 after validation.
   */
  amount: number;

  /**
   * Human-readable description from user input.
   * Used as transaction note.
   */
  description?: string;

  /**
   * Category name hint from natural language.
   * Application layer resolves to category_id; parser never produces IDs.
   */
  categoryHint?: string;

  /**
   * Source account name for Transfer/Expense.
   * Application layer resolves to account_id by fuzzy matching account names.
   * Parser NEVER produces account_id directly.
   */
  sourceAccountName?: string;

  /**
   * Destination account name for Transfer/Income.
   * Application layer resolves to account_id by fuzzy matching account names.
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
}

/**
 * Result of the parse operation.
 */
export type ParseResult =
  | { ok: true; intent: TransactionIntent }
  | { ok: false; error: string; clarification?: string };
