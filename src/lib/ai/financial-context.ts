/**
 * Financial Query Engine
 *
 * Server-side query layer that extracts financial facts from the ledger.
 *
 * ARCHITECTURE:
 *   User Question
 *        ↓
 *   Financial Query (this module)  ← reads from ledger data
 *        ↓
 *   FinancialContext (structured facts)
 *        ↓
 *   AI Provider
 *        ↓
 *   Response
 *
 * INVARIANTS:
 * - Does NOT modify any transaction or balance.
 * - Does NOT produce account IDs as output to AI.
 * - All monetary values come from the ledger, never from AI calculation.
 * - Transfer transactions are excluded from Income/Expense totals.
 */

import type {
  Account,
  Budget,
  Category,
  Debt,
  Saving,
  SplitBill,
  Transaction,
} from "~/types/database";
import { calculateBudgetSpending } from "~/lib/budget/calculations";
import { calculateAccountBalance } from "~/lib/transactions/engine";
import type { DateRange, PeriodKey } from "./financial-period";
import { getPeriodRange } from "./financial-period";

// ─── Structured Financial Context ─────────────────────────────────────────────

export interface SavingsGoalFact {
  name: string;
  targetAmount: number;
  currentAmount: number;
  progressPercent: number;
  status: string;
  deadline?: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
}

export interface TransactionFact {
  type: string;
  amount: number;
  note: string | null;
  category: string | null;
  date: string;
}

export interface BudgetFact {
  category: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: string;
  period: string;
}

export interface DebtFact {
  totalOwedByMe: number;
  remainingOwedByMe: number;
  totalOwedToMe: number;
  remainingOwedToMe: number;
  activeCount: number;
  items: Array<{
    personName: string;
    direction: "OWED_BY_ME" | "OWED_TO_ME";
    remainingAmount: number;
    status: string;
    dueDate?: string;
  }>;
}

export interface SplitBillFact {
  totalBills: number;
  outstandingAmount: number;
  items: Array<{
    title: string;
    totalAmount: number;
    unsettledParticipants: Array<{
      name: string;
      amount: number;
    }>;
  }>;
}

export interface FinancialContext {
  // Computed at build time — application layer values, NOT AI calculations
  mainBalance: number;
  totalSavings: number;
  totalFunds: number;

  // All-time aggregates (Transfer excluded)
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number; // totalIncome - totalExpense

  // Period-specific (Transfer excluded)
  period: {
    label: string;
    key: PeriodKey;
    income: number;
    expense: number;
    netCashFlow: number;
    transactionCount: number;
  };

  // Category breakdown for period (Expense only)
  categoryBreakdown: CategoryBreakdown[];

  // Largest expense in period
  largestExpense: TransactionFact | null;

  // Savings goals
  savingsGoals: SavingsGoalFact[];

  // Phase 8 additions
  budgets?: BudgetFact[];
  debt?: DebtFact;
  splitBills?: SplitBillFact;

  // Phase 9 Financial Report Summary
  reportsSummary?: {
    periodLabel: string;
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
    largestExpenseCategory: string | null;
    largestExpenseAmount: number;
    budgetUtilization: number;
    overbudgetCount: number;
    activeDebtsCount: number;
    unsettledSplitBillsCount: number;
    insights: string[];
  };

  // Recent relevant transactions (max 10, to limit context size)
  recentTransactions: TransactionFact[];

  // Metadata
  generatedAt: string; // ISO timestamp
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inRange(tx: Transaction, range: DateRange): boolean {
  const d = new Date(tx.date);
  return d >= range.start && d <= range.end;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrencyFact(amount: number): string {
  return `Rp${amount.toLocaleString("id-ID")}`;
}

// ─── Main Context Builder ──────────────────────────────────────────────────────

export interface BuildContextInput {
  transactions: Transaction[];
  accounts: Account[];
  savings: Saving[];
  categories: Category[];
  periodKey: PeriodKey;
  mainAccountId: string;
  budgets?: Budget[];
  debts?: Debt[];
  splitBills?: SplitBill[];
}

/**
 * Build a FinancialContext from application data.
 *
 * This is the ONLY function allowed to produce financial facts for AI.
 * The AI must ONLY explain these pre-computed facts; it must NOT recalculate them.
 */
export function buildFinancialContext(
  input: BuildContextInput,
): FinancialContext {
  const {
    transactions,
    accounts,
    savings,
    categories,
    periodKey,
    mainAccountId,
    budgets,
    debts,
    splitBills,
  } = input;

  const range = getPeriodRange(periodKey);
  const now = new Date();

  // ── 1. Account Balances ─────────────────────────────────────────────────────
  const mainAccount = accounts.find((a) => a.id === mainAccountId) ?? null;
  const savingsAccounts = accounts.filter((a) => a.type === "SAVINGS");

  const mainBalance = mainAccount
    ? calculateAccountBalance(mainAccount, transactions)
    : 0;

  const totalSavings = savingsAccounts.reduce(
    (sum, a) => sum + calculateAccountBalance(a, transactions),
    0,
  );

  const totalFunds = mainBalance + totalSavings;

  // ── 2. All-time Income / Expense (Transfer excluded) ────────────────────────
  const totalIncome = transactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpense;

  // ── 3. Period Metrics ────────────────────────────────────────────────────────
  const periodTxs = transactions.filter((t) => inRange(t, range));
  const periodIncome = periodTxs
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);
  const periodExpense = periodTxs
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const periodNonTransfer = periodTxs.filter((t) => t.type !== "Transfer");

  // ── 4. Category Breakdown (Expense, period) ──────────────────────────────────
  const categoryMap = new Map<string, { amount: number; count: number }>();
  for (const tx of periodTxs.filter((t) => t.type === "Expense")) {
    const catName = tx.category?.name ?? "Lainnya";
    const existing = categoryMap.get(catName) ?? { amount: 0, count: 0 };
    categoryMap.set(catName, {
      amount: existing.amount + tx.amount,
      count: existing.count + 1,
    });
  }
  const categoryBreakdown: CategoryBreakdown[] = Array.from(
    categoryMap.entries(),
  )
    .map(([category, { amount, count }]) => ({ category, amount, count }))
    .sort((a, b) => b.amount - a.amount);

  // ── 5. Largest Expense (period) ───────────────────────────────────────────────
  const periodExpenses = periodTxs.filter((t) => t.type === "Expense");
  const largestExpenseTx =
    periodExpenses.length > 0
      ? periodExpenses.reduce((max, t) => (t.amount > max.amount ? t : max))
      : null;
  const largestExpense: TransactionFact | null = largestExpenseTx
    ? {
        type: largestExpenseTx.type,
        amount: largestExpenseTx.amount,
        note: largestExpenseTx.note ?? null,
        category: largestExpenseTx.category?.name ?? null,
        date: formatDate(largestExpenseTx.date),
      }
    : null;

  // ── 6. Savings Goals ─────────────────────────────────────────────────────────
  const savingsGoals: SavingsGoalFact[] = savings.map((s) => {
    const acc = accounts.find(
      (a) => a.type === "SAVINGS" && a.savings_goal_id === s.id,
    );
    const currentAmount = acc
      ? calculateAccountBalance(acc, transactions)
      : s.current_amount;
    const progressPercent =
      s.target_amount > 0
        ? Math.min((currentAmount / s.target_amount) * 100, 100)
        : 0;
    return {
      name: s.name,
      targetAmount: s.target_amount,
      currentAmount,
      progressPercent: Math.round(progressPercent * 10) / 10,
      status: s.status,
      deadline: s.deadline
        ? new Date(s.deadline).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : undefined,
    };
  });

  // ── 7. Recent Transactions (period, max 10, sorted desc) ─────────────────────
  const recentTransactions: TransactionFact[] = [...periodNonTransfer]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .map((t) => ({
      type: t.type,
      amount: t.amount,
      note: t.note ?? null,
      category: t.category?.name ?? null,
      date: formatDate(t.date),
    }));

  // ── 8. Phase 8: Budgets ──────────────────────────────────────────────────
  const budgetFacts: BudgetFact[] | undefined = budgets
    ? budgets.map((b) => {
        const cat = categories.find((c) => c.id === b.category_id);
        const { spent, remaining, percentage, statusLabel } =
          calculateBudgetSpending(b, transactions);
        return {
          category: cat?.name ?? "Lainnya",
          amount: b.amount,
          spent,
          remaining,
          percentage,
          status: statusLabel,
          period: b.period === "MONTHLY" ? "Bulanan" : "Mingguan",
        };
      })
    : undefined;

  // ── 9. Phase 8: Debts ────────────────────────────────────────────────────
  const debtFacts: DebtFact | undefined = debts
    ? {
        totalOwedByMe: debts
          .filter((d) => d.direction === "OWED_BY_ME")
          .reduce((sum, d) => sum + d.original_amount, 0),
        remainingOwedByMe: debts
          .filter((d) => d.direction === "OWED_BY_ME")
          .reduce((sum, d) => sum + d.remaining_amount, 0),
        totalOwedToMe: debts
          .filter((d) => d.direction === "OWED_TO_ME")
          .reduce((sum, d) => sum + d.original_amount, 0),
        remainingOwedToMe: debts
          .filter((d) => d.direction === "OWED_TO_ME")
          .reduce((sum, d) => sum + d.remaining_amount, 0),
        activeCount: debts.filter((d) => d.remaining_amount > 0).length,
        items: debts.map((d) => ({
          personName: d.person_name,
          direction: d.direction,
          remainingAmount: d.remaining_amount,
          status: d.status,
          dueDate: d.due_date ? formatDate(d.due_date) : undefined,
        })),
      }
    : undefined;

  // ── 10. Phase 8: Split Bills ─────────────────────────────────────────────
  const splitBillFacts: SplitBillFact | undefined = splitBills
    ? {
        totalBills: splitBills.length,
        outstandingAmount: splitBills.reduce((acc, sb) => {
          return (
            acc +
            sb.participants
              .filter((p) => !p.is_me && !p.paid)
              .reduce((s, p) => s + p.amount, 0)
          );
        }, 0),
        items: splitBills.map((sb) => ({
          title: sb.title,
          totalAmount: sb.total_amount,
          unsettledParticipants: sb.participants
            .filter((p) => !p.paid)
            .map((p) => ({ name: p.name, amount: p.amount })),
        })),
      }
    : undefined;

  // Suppress unused var warning for categories (available for future use)
  void categories;
  void formatCurrencyFact;

  const topCategory = categoryBreakdown[0] ?? null;
  const totalBudgetAmt = (budgetFacts ?? []).reduce((s, b) => s + b.amount, 0);
  const totalBudgetSpent = (budgetFacts ?? []).reduce((s, b) => s + b.spent, 0);
  const overbudgetCount = (budgetFacts ?? []).filter(
    (b) => b.status === "EXCEEDED",
  ).length;

  const insightsList: string[] = [];
  if (periodIncome > periodExpense) {
    insightsList.push(
      `Arus kas surplus Rp${(periodIncome - periodExpense).toLocaleString("id-ID")}.`,
    );
  } else if (periodExpense > periodIncome) {
    insightsList.push(
      `Arus kas defisit Rp${(periodExpense - periodIncome).toLocaleString("id-ID")}.`,
    );
  }
  if (topCategory) {
    insightsList.push(
      `Pengeluaran terbesar pada kategori ${topCategory.category} (Rp${topCategory.amount.toLocaleString("id-ID")}).`,
    );
  }
  if (overbudgetCount > 0) {
    insightsList.push(
      `Terdapat ${overbudgetCount} kategori anggaran yang melebihi batas.`,
    );
  }

  const reportsSummary = {
    periodLabel: range.label,
    totalIncome: periodIncome,
    totalExpense: periodExpense,
    netCashFlow: periodIncome - periodExpense,
    largestExpenseCategory: topCategory ? topCategory.category : null,
    largestExpenseAmount: topCategory ? topCategory.amount : 0,
    budgetUtilization:
      totalBudgetAmt > 0
        ? Math.round((totalBudgetSpent / totalBudgetAmt) * 100 * 10) / 10
        : 0,
    overbudgetCount,
    activeDebtsCount: debtFacts ? debtFacts.activeCount : 0,
    unsettledSplitBillsCount: splitBillFacts
      ? splitBillFacts.items.filter((i) => i.unsettledParticipants.length > 0)
          .length
      : 0,
    insights: insightsList,
  };

  return {
    mainBalance,
    totalSavings,
    totalFunds,
    totalIncome,
    totalExpense,
    netCashFlow,
    period: {
      label: range.label,
      key: periodKey,
      income: periodIncome,
      expense: periodExpense,
      netCashFlow: periodIncome - periodExpense,
      transactionCount: periodNonTransfer.length,
    },
    categoryBreakdown,
    largestExpense,
    savingsGoals,
    budgets: budgetFacts,
    debt: debtFacts,
    splitBills: splitBillFacts,
    reportsSummary,
    recentTransactions,
    generatedAt: now.toISOString(),
  };
}

// ─── Query Helpers (used by the chat prompt builder) ─────────────────────────

export interface CategoryQueryResult {
  category: string;
  amount: number;
  count: number;
  found: boolean;
}

/**
 * Queries total expense for a specific category in a given period.
 * Application computes this — AI does NOT filter or sum.
 */
export function queryCategoryExpense(
  transactions: Transaction[],
  categoryName: string,
  range: DateRange,
): CategoryQueryResult {
  const matches = transactions.filter(
    (t) =>
      t.type === "Expense" &&
      inRange(t, range) &&
      (t.category?.name.toLowerCase().includes(categoryName.toLowerCase()) ||
        categoryName
          .toLowerCase()
          .includes(t.category?.name.toLowerCase() ?? "")),
  );

  const amount = matches.reduce((sum, t) => sum + t.amount, 0);
  return {
    category: categoryName,
    amount,
    count: matches.length,
    found: matches.length > 0,
  };
}
