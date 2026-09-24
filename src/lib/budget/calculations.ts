import type {
  Budget,
  BudgetPeriod,
  BudgetStatus,
  CreateBudgetInput,
  Transaction,
} from "~/types/database";

/**
 * Calculates the active date window for a budget period relative to a reference date.
 */
export function getBudgetPeriodRange(
  period: BudgetPeriod,
  referenceDate: Date = new Date(),
): { start: Date; end: Date } {
  const ref = new Date(referenceDate);

  if (period === "WEEKLY") {
    // Current week: Monday to Sunday
    const day = ref.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const start = new Date(ref);
    start.setDate(ref.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  // Monthly: 1st of month to last millisecond of month
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(
    ref.getFullYear(),
    ref.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return { start, end };
}

export interface BudgetSpendingResult {
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
  statusLabel: string;
}

/**
 * Calculates spending for a budget strictly from relevant Expense transactions
 * within the active budget period.
 *
 * Rules:
 * - Only Expense transactions
 * - Matches category_id
 * - Within period range
 * - Transfers are completely excluded
 * - Income does NOT reduce spent
 */
export function calculateBudgetSpending(
  budget: Budget,
  transactions: Transaction[],
  referenceDate: Date = new Date(),
): BudgetSpendingResult {
  const { start, end } = getBudgetPeriodRange(budget.period, referenceDate);

  const spent = transactions
    .filter((t) => {
      if (t.type !== "Expense") return false;
      if (t.category_id !== budget.category_id) return false;
      const d = new Date(t.date);
      return d >= start && d <= end;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = Math.max(0, budget.amount - spent);
  const percentage =
    budget.amount > 0 ? Math.round((spent / budget.amount) * 100 * 10) / 10 : 0;

  let status: BudgetStatus = "ON_TRACK";
  let statusLabel = "Berjalan";

  if (spent === 0) {
    status = "NOT_USED";
    statusLabel = "Belum Digunakan";
  } else if (percentage >= 100) {
    status = "EXCEEDED";
    statusLabel = "Melebihi Budget";
  } else if (percentage >= 75) {
    status = "WARNING";
    statusLabel = "Mendekati Batas";
  } else {
    status = "ON_TRACK";
    statusLabel = "Aman";
  }

  return {
    spent,
    remaining,
    percentage,
    status,
    statusLabel,
  };
}

/**
 * Validates budget inputs.
 */
export function validateBudgetInput(
  input: CreateBudgetInput,
  existingBudgets: Budget[],
  excludeBudgetId?: string,
): { valid: boolean; error?: string } {
  if (!input.categoryId || input.categoryId.trim() === "") {
    return { valid: false, error: "Pilih kategori anggaran terlebih dahulu." };
  }

  if (
    typeof input.amount !== "number" ||
    !Number.isFinite(input.amount) ||
    Number.isNaN(input.amount) ||
    input.amount <= 0
  ) {
    return { valid: false, error: "Nominal anggaran harus lebih dari 0." };
  }

  if (input.period !== "WEEKLY" && input.period !== "MONTHLY") {
    return {
      valid: false,
      error: "Periode anggaran harus Mingguan atau Bulanan.",
    };
  }

  // Check for duplicate active budget for same category & period
  const duplicate = existingBudgets.find(
    (b) =>
      b.id !== excludeBudgetId &&
      b.category_id === input.categoryId &&
      b.period === input.period,
  );
  if (duplicate) {
    return {
      valid: false,
      error: `Anggaran untuk kategori ini dengan periode ${input.period === "MONTHLY" ? "Bulanan" : "Mingguan"} sudah ada.`,
    };
  }

  return { valid: true };
}
