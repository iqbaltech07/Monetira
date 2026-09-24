import type { Account, Transaction, TransactionType } from "~/types/database";

export interface CreateIncomeInput {
  accountId?: string | null;
  amount: number;
  categoryId?: string | null;
  date?: Date | string;
  note?: string | null;
}

export interface CreateExpenseInput {
  accountId?: string | null;
  amount: number;
  categoryId?: string | null;
  date?: Date | string;
  note?: string | null;
}

export interface CreateTransferInput {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  date?: Date | string;
  note?: string | null;
  categoryId?: string | null;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: number;
  accountId?: string | null;
  sourceAccountId?: string | null;
  destinationAccountId?: string | null;
  categoryId?: string | null;
  date?: Date | string;
  note?: string | null;
}

export interface TransactionEngineResult {
  success: boolean;
  error?: string;
  transaction?: Transaction;
}

/**
 * Validates transaction nominal amount.
 * Must be a finite number strictly greater than 0.
 */
export function validateAmount(amount: unknown): {
  valid: boolean;
  error?: string;
} {
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    Number.isNaN(amount)
  ) {
    return {
      valid: false,
      error: "Nominal transaksi harus berupa angka yang valid.",
    };
  }
  if (amount <= 0) {
    return {
      valid: false,
      error: "Nominal transaksi harus lebih dari 0.",
    };
  }
  return { valid: true };
}

/**
 * Validates that an account exists in the user's account repository.
 */
export function validateAccountExists(
  accountId: string,
  accounts: Account[],
): { valid: boolean; account?: Account; error?: string } {
  const account = accounts.find((a) => a.id === accountId);
  if (!account) {
    return {
      valid: false,
      error: "Rekening tidak ditemukan.",
    };
  }
  return { valid: true, account };
}

/**
 * Validates transfer accounts:
 * - Source and Destination must exist
 * - Source and Destination must be distinct
 */
export function validateTransferAccounts(
  sourceId: string,
  destinationId: string,
  accounts: Account[],
): {
  valid: boolean;
  source?: Account;
  destination?: Account;
  error?: string;
} {
  if (sourceId === destinationId) {
    return {
      valid: false,
      error: "Rekening sumber dan tujuan tidak boleh sama.",
    };
  }
  const sourceValidation = validateAccountExists(sourceId, accounts);
  if (!sourceValidation.valid || !sourceValidation.account) {
    return {
      valid: false,
      error: "Rekening sumber transfer tidak ditemukan.",
    };
  }
  const destValidation = validateAccountExists(destinationId, accounts);
  if (!destValidation.valid || !destValidation.account) {
    return {
      valid: false,
      error: "Rekening tujuan transfer tidak ditemukan.",
    };
  }
  return {
    valid: true,
    source: sourceValidation.account,
    destination: destValidation.account,
  };
}

/**
 * Validates that the source account has sufficient balance to prevent overdrafts.
 */
export function validateBalance(
  amount: number,
  currentBalance: number,
  accountName: string,
): { valid: boolean; error?: string } {
  if (currentBalance < amount) {
    return {
      valid: false,
      error: `Saldo tidak mencukupi. Saldo ${accountName} saat ini: Rp${currentBalance.toLocaleString("id-ID")}.`,
    };
  }
  return { valid: true };
}

/**
 * Pure ledger calculation: derives an account balance deterministically
 * from its opening balance and all associated transactions.
 */
export function calculateAccountBalance(
  account: Account,
  transactions: Transaction[],
): number {
  const opening = account.opening_balance || 0;

  if (account.type === "MAIN") {
    const income = transactions
      .filter((t) => {
        if (t.type !== "Income") return false;
        if (t.destination_account_id)
          return t.destination_account_id === account.id;
        if (t.account_id) return t.account_id === account.id;
        return true; // legacy income defaults to MAIN
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => {
        if (t.type !== "Expense") return false;
        if (t.source_account_id) return t.source_account_id === account.id;
        if (t.account_id) return t.account_id === account.id;
        return true; // legacy expense defaults to MAIN
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const transfersIn = transactions
      .filter(
        (t) => t.type === "Transfer" && t.destination_account_id === account.id,
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const transfersOut = transactions
      .filter(
        (t) => t.type === "Transfer" && t.source_account_id === account.id,
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return opening + income - expense + transfersIn - transfersOut;
  }

  if (account.type === "SAVINGS") {
    const transfersIn = transactions
      .filter(
        (t) => t.type === "Transfer" && t.destination_account_id === account.id,
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const transfersOut = transactions
      .filter(
        (t) => t.type === "Transfer" && t.source_account_id === account.id,
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return opening + transfersIn - transfersOut;
  }

  return opening;
}
