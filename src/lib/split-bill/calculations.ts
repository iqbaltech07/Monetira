import type { CreateSplitBillInput, SplitBill } from "~/types/database";

export interface SplitBillSummary {
  totalBills: number;
  totalAmount: number;
  outstandingAmount: number; // Friends owe user
  collectedAmount: number; // Friends paid user
  unsettledCount: number;
}

export function calculateSplitBillSummary(
  bills: SplitBill[],
): SplitBillSummary {
  let totalAmount = 0;
  let outstandingAmount = 0;
  let collectedAmount = 0;
  let unsettledCount = 0;

  for (const bill of bills) {
    totalAmount += bill.total_amount;
    let hasUnsettled = false;

    for (const p of bill.participants) {
      if (!p.is_me) {
        if (!p.paid) {
          outstandingAmount += p.amount;
          hasUnsettled = true;
        } else {
          collectedAmount += p.amount;
        }
      }
    }

    if (hasUnsettled) {
      unsettledCount += 1;
    }
  }

  return {
    totalBills: bills.length,
    totalAmount,
    outstandingAmount,
    collectedAmount,
    unsettledCount,
  };
}

export function validateSplitBill(input: CreateSplitBillInput): {
  valid: boolean;
  error?: string;
} {
  if (!input.title || input.title.trim() === "") {
    return { valid: false, error: "Judul tagihan tidak boleh kosong." };
  }

  if (
    typeof input.totalAmount !== "number" ||
    !Number.isFinite(input.totalAmount) ||
    Number.isNaN(input.totalAmount) ||
    input.totalAmount <= 0
  ) {
    return { valid: false, error: "Total tagihan harus lebih dari 0." };
  }

  if (!input.participants || input.participants.length < 2) {
    return {
      valid: false,
      error: "Tagihan harus melibatkan minimal 2 orang partisipan.",
    };
  }

  let sum = 0;
  let hasMe = false;

  for (let i = 0; i < input.participants.length; i++) {
    const p = input.participants[i];
    if (!p.name || p.name.trim() === "") {
      return {
        valid: false,
        error: `Nama partisipan ke-${i + 1} tidak boleh kosong.`,
      };
    }

    if (
      typeof p.amount !== "number" ||
      !Number.isFinite(p.amount) ||
      Number.isNaN(p.amount) ||
      p.amount <= 0
    ) {
      return {
        valid: false,
        error: `Nominal untuk ${p.name} harus berupa angka lebih dari 0.`,
      };
    }

    sum += p.amount;
    if (p.is_me) hasMe = true;
  }

  if (!hasMe) {
    return {
      valid: false,
      error: "Harus ada minimal satu partisipan sebagai 'Saya'.",
    };
  }

  // Tolerance of 1 IDR for small rounding difference
  if (Math.abs(sum - input.totalAmount) > 1) {
    return {
      valid: false,
      error: `Total bagian partisipan (Rp${Math.round(sum).toLocaleString("id-ID")}) tidak sama dengan total tagihan (Rp${input.totalAmount.toLocaleString("id-ID")}).`,
    };
  }

  return { valid: true };
}
