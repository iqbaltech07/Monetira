import type { CreateDebtInput, Debt } from "~/types/database";

export interface DebtSummary {
  totalOwedByMe: number; // Total Hutang Saya (original)
  remainingOwedByMe: number; // Sisa Hutang Saya
  totalOwedToMe: number; // Total Piutang Saya (original)
  remainingOwedToMe: number; // Sisa Piutang Saya
  activeDebtsCount: number;
}

export function calculateDebtSummary(debts: Debt[]): DebtSummary {
  let totalOwedByMe = 0;
  let remainingOwedByMe = 0;
  let totalOwedToMe = 0;
  let remainingOwedToMe = 0;
  let activeDebtsCount = 0;

  for (const debt of debts) {
    if (debt.direction === "OWED_BY_ME") {
      totalOwedByMe += debt.original_amount;
      remainingOwedByMe += debt.remaining_amount;
    } else {
      totalOwedToMe += debt.original_amount;
      remainingOwedToMe += debt.remaining_amount;
    }

    if (debt.remaining_amount > 0) {
      activeDebtsCount += 1;
    }
  }

  return {
    totalOwedByMe,
    remainingOwedByMe,
    totalOwedToMe,
    remainingOwedToMe,
    activeDebtsCount,
  };
}

export function validateDebtInput(input: CreateDebtInput): {
  valid: boolean;
  error?: string;
} {
  if (!input.personName || input.personName.trim() === "") {
    return { valid: false, error: "Nama pihak terkait tidak boleh kosong." };
  }

  if (
    typeof input.amount !== "number" ||
    !Number.isFinite(input.amount) ||
    Number.isNaN(input.amount) ||
    input.amount <= 0
  ) {
    return {
      valid: false,
      error: "Nominal hutang/piutang harus lebih dari 0.",
    };
  }

  if (input.direction !== "OWED_BY_ME" && input.direction !== "OWED_TO_ME") {
    return { valid: false, error: "Arah hutang/piutang tidak valid." };
  }

  return { valid: true };
}

export function validateDebtPayment(
  debt: Debt,
  amount: number,
): { valid: boolean; error?: string } {
  if (debt.remaining_amount <= 0 || debt.status === "PAID") {
    return { valid: false, error: "Hutang/piutang ini sudah lunas." };
  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    Number.isNaN(amount) ||
    amount <= 0
  ) {
    return { valid: false, error: "Nominal pembayaran harus lebih dari 0." };
  }

  if (amount > debt.remaining_amount) {
    return {
      valid: false,
      error: `Nominal pembayaran melebihi sisa hutang/piutang (Maksimal: Rp${debt.remaining_amount.toLocaleString("id-ID")}).`,
    };
  }

  return { valid: true };
}
