import { calculateBudgetSpending } from "~/lib/budget/calculations";
import {
  calculateDebtSummary,
  type DebtSummary,
} from "~/lib/debts/calculations";
import {
  calculateSplitBillSummary,
  type SplitBillSummary,
} from "~/lib/split-bill/calculations";
import { calculateAccountBalance } from "~/lib/transactions/engine";
import type {
  Account,
  Budget,
  BudgetPeriod,
  BudgetStatus,
  Category,
  Debt,
  Saving,
  SplitBill,
  Transaction,
} from "~/types/database";
import type { DateRange, ReportPeriodType } from "./periods";
import { getPreviousPeriodRange, getReportPeriodRange } from "./periods";

export { calculateDebtSummary, calculateSplitBillSummary };
export type { DebtSummary, SplitBillSummary };

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  count: number;
  color?: string;
}

export interface BudgetPerformanceItem {
  budgetId: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  status: BudgetStatus;
  period: BudgetPeriod;
}

export interface BudgetPerformanceReport {
  totalBudget: number;
  totalSpent: number;
  utilizationPercentage: number;
  items: BudgetPerformanceItem[];
  overbudgetCount: number;
  warningCount: number;
}

export interface SavingsGoalReportItem {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  status: string;
}

export interface SavingsReport {
  totalSavings: number;
  totalTarget: number;
  overallProgressPercentage: number;
  periodContributions: number;
  goals: SavingsGoalReportItem[];
}

export interface ComparisonMetric {
  current: number;
  previous: number;
  difference: number;
  percentageChange: number | null; // null if previous was 0
  trend: "INCREASED" | "DECREASED" | "UNCHANGED";
}

export interface PeriodComparisonSummary {
  previousPeriodLabel: string;
  income: ComparisonMetric;
  expense: ComparisonMetric;
  netCashFlow: ComparisonMetric;
  factualStatements: string[];
}

export interface FinancialInsight {
  id: string;
  type: "SUCCESS" | "WARNING" | "ALERT" | "INFO";
  title: string;
  message: string;
  priority: number; // lower number = higher priority
}

export interface CashFlowOverview {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  transactionCount: number;
  mainBalance: number;
  totalSavings: number;
  totalFunds: number;
}

export interface FullFinancialReportData {
  periodType: ReportPeriodType;
  dateRange: DateRange;
  overview: CashFlowOverview;
  expenseBreakdown: CategoryBreakdownItem[];
  incomeBreakdown: CategoryBreakdownItem[];
  largestExpense: Transaction | null;
  largestIncome: Transaction | null;
  budgetPerformance: BudgetPerformanceReport;
  savings: SavingsReport;
  debts: ReturnType<typeof calculateDebtSummary>;
  splitBills: ReturnType<typeof calculateSplitBillSummary>;
  comparison: PeriodComparisonSummary | null;
  insights: FinancialInsight[];
}

// ─── Filter Helpers ───────────────────────────────────────────────────────────

export function isTransactionInRange(
  tx: Transaction,
  range?: DateRange,
): boolean {
  if (!range) return true;
  const txDate = new Date(tx.date);
  return txDate >= range.start && txDate <= range.end;
}

// ─── Core Metric Calculations ─────────────────────────────────────────────────

/**
 * Calculates total genuine income within an optional date range.
 * Strictly excludes Transfers.
 */
export function calculateIncome(
  transactions: Transaction[],
  range?: DateRange,
): number {
  return transactions
    .filter((tx) => tx.type === "Income" && isTransactionInRange(tx, range))
    .reduce(
      (sum, tx) =>
        sum + (Number.isFinite(tx.amount) && tx.amount > 0 ? tx.amount : 0),
      0,
    );
}

/**
 * Calculates total genuine expense within an optional date range.
 * Strictly excludes Transfers.
 */
export function calculateExpense(
  transactions: Transaction[],
  range?: DateRange,
): number {
  return transactions
    .filter((tx) => tx.type === "Expense" && isTransactionInRange(tx, range))
    .reduce(
      (sum, tx) =>
        sum + (Number.isFinite(tx.amount) && tx.amount > 0 ? tx.amount : 0),
      0,
    );
}

/**
 * Calculates Net Cash Flow = Income - Expense.
 * Conceptually distinct from account balance.
 */
export function calculateNetCashFlow(income: number, expense: number): number {
  const inc = Number.isFinite(income) ? income : 0;
  const exp = Number.isFinite(expense) ? expense : 0;
  return inc - exp;
}

/**
 * Calculates breakdown by category for Expense or Income, sorted descending by amount.
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  type: "Expense" | "Income",
  categories: Category[],
  range?: DateRange,
): CategoryBreakdownItem[] {
  const filtered = transactions.filter(
    (tx) => tx.type === type && isTransactionInRange(tx, range),
  );

  const categoryMap = new Map<string, { amount: number; count: number }>();
  let totalAmount = 0;

  for (const tx of filtered) {
    const amount = Number.isFinite(tx.amount) && tx.amount > 0 ? tx.amount : 0;
    const catId = tx.category_id || "uncategorized";
    const existing = categoryMap.get(catId) || { amount: 0, count: 0 };
    existing.amount += amount;
    existing.count += 1;
    categoryMap.set(catId, existing);
    totalAmount += amount;
  }

  const result: CategoryBreakdownItem[] = [];

  for (const [catId, stats] of categoryMap.entries()) {
    let catName = "Lainnya";
    if (catId !== "uncategorized") {
      const found = categories.find((c) => c.id === catId);
      if (found) {
        catName = found.name;
      }
    }

    const percentage =
      totalAmount > 0
        ? Math.round((stats.amount / totalAmount) * 100 * 10) / 10
        : 0;

    result.push({
      categoryId: catId,
      categoryName: catName,
      amount: stats.amount,
      percentage,
      count: stats.count,
    });
  }

  // Sort descending by amount
  return result.sort((a, b) => b.amount - a.amount);
}

/**
 * Finds the largest transaction of a given type within range.
 */
export function calculateLargestTransaction(
  transactions: Transaction[],
  type: "Expense" | "Income",
  range?: DateRange,
): Transaction | null {
  const filtered = transactions.filter(
    (tx) => tx.type === type && isTransactionInRange(tx, range),
  );

  if (filtered.length === 0) return null;

  return filtered.reduce((prev, curr) => {
    return curr.amount > prev.amount ? curr : prev;
  }, filtered[0]);
}

/**
 * Evaluates budget performance across all active budgets using the budget engine.
 */
export function calculateBudgetPerformance(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
): BudgetPerformanceReport {
  let totalBudget = 0;
  let totalSpent = 0;
  let overbudgetCount = 0;
  let warningCount = 0;

  const items: BudgetPerformanceItem[] = budgets.map((b) => {
    const spending = calculateBudgetSpending(b, transactions);
    const cat = categories.find((c) => c.id === b.category_id);
    const categoryName = cat ? cat.name : "Kategori Tidak Diketahui";

    totalBudget += b.amount;
    totalSpent += spending.spent;

    if (spending.status === "EXCEEDED") overbudgetCount += 1;
    if (spending.status === "WARNING") warningCount += 1;

    return {
      budgetId: b.id,
      categoryName,
      budgetAmount: b.amount,
      spentAmount: spending.spent,
      remainingAmount: spending.remaining,
      percentage: spending.percentage,
      status: spending.status,
      period: b.period,
    };
  });

  const utilizationPercentage =
    totalBudget > 0
      ? Math.round((totalSpent / totalBudget) * 100 * 10) / 10
      : 0;

  return {
    totalBudget,
    totalSpent,
    utilizationPercentage,
    items,
    overbudgetCount,
    warningCount,
  };
}

/**
 * Calculates live savings progress and contributions in the report period.
 */
export function calculateSavingsProgress(
  savings: Saving[],
  accounts: Account[],
  transactions: Transaction[],
  range?: DateRange,
): SavingsReport {
  let totalSavings = 0;
  let totalTarget = 0;

  const goals: SavingsGoalReportItem[] = savings.map((s) => {
    // Find associated savings account
    const savAcc = accounts.find(
      (a) => a.savings_goal_id === s.id || a.id === `acc_sav_${s.id}`,
    );
    const balance = savAcc ? calculateAccountBalance(savAcc, transactions) : 0;

    totalSavings += balance;
    totalTarget += s.target_amount;

    const progressPercentage =
      s.target_amount > 0
        ? Math.min(100, Math.round((balance / s.target_amount) * 100 * 10) / 10)
        : 0;

    return {
      id: s.id,
      name: s.name,
      targetAmount: s.target_amount,
      currentAmount: balance,
      progressPercentage,
      status: s.status,
    };
  });

  const overallProgressPercentage =
    totalTarget > 0
      ? Math.min(100, Math.round((totalSavings / totalTarget) * 100 * 10) / 10)
      : 0;

  // Period contributions = Transfers into any savings account during the date range
  const periodContributions = transactions
    .filter((tx) => {
      if (tx.type !== "Transfer") return false;
      if (!isTransactionInRange(tx, range)) return false;
      const destAcc = accounts.find((a) => a.id === tx.destination_account_id);
      return destAcc?.type === "SAVINGS";
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  return {
    totalSavings,
    totalTarget,
    overallProgressPercentage,
    periodContributions,
    goals,
  };
}

/**
 * Calculates period-over-period comparison between current and previous range.
 */
export function calculatePeriodComparison(
  currentRange: DateRange,
  previousRange: DateRange | null,
  transactions: Transaction[],
): PeriodComparisonSummary | null {
  if (!previousRange) return null;

  const curIncome = calculateIncome(transactions, currentRange);
  const curExpense = calculateExpense(transactions, currentRange);
  const curNet = calculateNetCashFlow(curIncome, curExpense);

  const prevIncome = calculateIncome(transactions, previousRange);
  const prevExpense = calculateExpense(transactions, previousRange);
  const prevNet = calculateNetCashFlow(prevIncome, prevExpense);

  const makeMetric = (curr: number, prev: number): ComparisonMetric => {
    const difference = curr - prev;
    const percentageChange =
      prev !== 0
        ? Math.round((difference / Math.abs(prev)) * 100 * 10) / 10
        : null;

    let trend: "INCREASED" | "DECREASED" | "UNCHANGED" = "UNCHANGED";
    if (difference > 0) trend = "INCREASED";
    else if (difference < 0) trend = "DECREASED";

    return {
      current: curr,
      previous: prev,
      difference,
      percentageChange,
      trend,
    };
  };

  const incomeMetric = makeMetric(curIncome, prevIncome);
  const expenseMetric = makeMetric(curExpense, prevExpense);
  const netMetric = makeMetric(curNet, prevNet);

  const factualStatements: string[] = [];

  // Factual statement for Expense
  if (expenseMetric.trend === "DECREASED") {
    const diffAbs = Math.abs(expenseMetric.difference);
    const pctStr =
      expenseMetric.percentageChange !== null
        ? ` (${Math.abs(expenseMetric.percentageChange)}%)`
        : "";
    factualStatements.push(
      `Pengeluaran periode ini Rp${diffAbs.toLocaleString("id-ID")} lebih rendah dibanding ${previousRange.label}${pctStr}.`,
    );
  } else if (expenseMetric.trend === "INCREASED") {
    const diffAbs = Math.abs(expenseMetric.difference);
    const pctStr =
      expenseMetric.percentageChange !== null
        ? ` (+${expenseMetric.percentageChange}%)`
        : "";
    factualStatements.push(
      `Pengeluaran periode ini Rp${diffAbs.toLocaleString("id-ID")} lebih tinggi dibanding ${previousRange.label}${pctStr}.`,
    );
  } else {
    factualStatements.push(
      `Pengeluaran periode ini sama dengan ${previousRange.label}.`,
    );
  }

  // Factual statement for Income
  if (incomeMetric.trend === "INCREASED") {
    const diffAbs = Math.abs(incomeMetric.difference);
    const pctStr =
      incomeMetric.percentageChange !== null
        ? ` (+${incomeMetric.percentageChange}%)`
        : "";
    factualStatements.push(
      `Pemasukan periode ini Rp${diffAbs.toLocaleString("id-ID")} lebih tinggi dibanding ${previousRange.label}${pctStr}.`,
    );
  } else if (incomeMetric.trend === "DECREASED") {
    const diffAbs = Math.abs(incomeMetric.difference);
    const pctStr =
      incomeMetric.percentageChange !== null
        ? ` (${incomeMetric.percentageChange}%)`
        : "";
    factualStatements.push(
      `Pemasukan periode ini Rp${diffAbs.toLocaleString("id-ID")} lebih rendah dibanding ${previousRange.label}${pctStr}.`,
    );
  }

  return {
    previousPeriodLabel: previousRange.label,
    income: incomeMetric,
    expense: expenseMetric,
    netCashFlow: netMetric,
    factualStatements,
  };
}

/**
 * Generates rule-based objective financial observations from report data.
 * Does NOT offer unsolicited investment or lifestyle advice.
 */
export function generateFinancialInsights(
  overview: CashFlowOverview,
  expenseBreakdown: CategoryBreakdownItem[],
  budgetPerf: BudgetPerformanceReport,
  savings: SavingsReport,
  debts: ReturnType<typeof calculateDebtSummary>,
  splitBills: ReturnType<typeof calculateSplitBillSummary>,
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  // 1. Net Cash Flow Insight
  if (overview.netCashFlow > 0) {
    insights.push({
      id: "insight_cashflow_surplus",
      type: "SUCCESS",
      title: "Arus Kas Positif (Surplus)",
      message: `Pemasukan periode ini lebih besar Rp${overview.netCashFlow.toLocaleString("id-ID")} dibanding pengeluaran.`,
      priority: 1,
    });
  } else if (overview.netCashFlow < 0) {
    insights.push({
      id: "insight_cashflow_deficit",
      type: "ALERT",
      title: "Arus Kas Negatif (Defisit)",
      message: `Pengeluaran periode ini melebihi pemasukan sebesar Rp${Math.abs(overview.netCashFlow).toLocaleString("id-ID")}.`,
      priority: 1,
    });
  } else if (overview.totalIncome > 0 && overview.netCashFlow === 0) {
    insights.push({
      id: "insight_cashflow_balanced",
      type: "INFO",
      title: "Arus Kas Seimbang",
      message:
        "Pemasukan dan pengeluaran pada periode ini berada pada nominal yang sama persis.",
      priority: 3,
    });
  }

  // 2. Largest Expense Category
  if (expenseBreakdown.length > 0 && expenseBreakdown[0].amount > 0) {
    const top = expenseBreakdown[0];
    insights.push({
      id: "insight_largest_expense",
      type: "INFO",
      title: "Kategori Pengeluaran Terbesar",
      message: `${top.categoryName} merupakan pengeluaran terbesar (${top.percentage}% dari total pengeluaran, senilai Rp${top.amount.toLocaleString("id-ID")}).`,
      priority: 2,
    });
  }

  // 3. Overbudget categories
  const overbudgetItems = budgetPerf.items.filter(
    (b) => b.status === "EXCEEDED",
  );
  if (overbudgetItems.length > 0) {
    const names = overbudgetItems.map((b) => b.categoryName).join(", ");
    const totalOver = overbudgetItems.reduce(
      (sum, b) => sum + (b.spentAmount - b.budgetAmount),
      0,
    );
    insights.push({
      id: "insight_overbudget",
      type: "ALERT",
      title: `${overbudgetItems.length} Anggaran Melebihi Batas`,
      message: `Anggaran kategori ${names} telah melampaui alokasi dengan total kelebihan Rp${totalOver.toLocaleString("id-ID")}.`,
      priority: 1,
    });
  }

  // 4. Warning budget categories
  const warningItems = budgetPerf.items.filter((b) => b.status === "WARNING");
  if (warningItems.length > 0) {
    const names = warningItems.map((b) => b.categoryName).join(", ");
    insights.push({
      id: "insight_warning_budget",
      type: "WARNING",
      title: `${warningItems.length} Anggaran Mendekati Batas`,
      message: `Pengeluaran pada kategori ${names} sudah mencapai lebih dari 75% dari batas yang ditentukan.`,
      priority: 2,
    });
  }

  // 5. Savings Progress
  if (savings.periodContributions > 0) {
    insights.push({
      id: "insight_savings_contribution",
      type: "SUCCESS",
      title: "Kontribusi Tabungan Aktif",
      message: `Anda telah menyisihkan Rp${savings.periodContributions.toLocaleString("id-ID")} ke rekening tabungan pada periode ini.`,
      priority: 2,
    });
  }

  // 6. Outstanding Receivables & Debts
  if (debts.remainingOwedToMe > 0) {
    insights.push({
      id: "insight_receivable_pending",
      type: "INFO",
      title: "Piutang Belum Diterima",
      message: `Terdapat Rp${debts.remainingOwedToMe.toLocaleString("id-ID")} piutang yang masih menunggu pelunasan dari pihak terkait.`,
      priority: 3,
    });
  }

  if (debts.remainingOwedByMe > 0) {
    insights.push({
      id: "insight_debt_payable",
      type: "WARNING",
      title: "Kewajiban Hutang Aktif",
      message: `Anda memiliki sisa kewajiban hutang yang perlu dilunasi sebesar Rp${debts.remainingOwedByMe.toLocaleString("id-ID")}.`,
      priority: 2,
    });
  }

  // 7. Split Bill
  if (splitBills.outstandingAmount > 0) {
    insights.push({
      id: "insight_split_bill_unsettled",
      type: "INFO",
      title: "Tagihan Split Bill Belum Lunas",
      message: `Terdapat Rp${splitBills.outstandingAmount.toLocaleString("id-ID")} dari tagihan bersama yang belum dilunasi oleh teman.`,
      priority: 3,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}

// ─── Master Report Generator ──────────────────────────────────────────────────

export interface GenerateReportInput {
  periodType: ReportPeriodType;
  customStart?: Date | string;
  customEnd?: Date | string;
  transactions: Transaction[];
  accounts: Account[];
  savings: Saving[];
  categories: Category[];
  budgets: Budget[];
  debts: Debt[];
  splitBills: SplitBill[];
  referenceDate?: Date;
}

/**
 * Pure generator creating a full Financial Report snapshot.
 * Derived completely from actual ledger data; never mutates application state.
 */
export function generateFinancialReport(
  input: GenerateReportInput,
): FullFinancialReportData {
  const {
    periodType,
    customStart,
    customEnd,
    transactions,
    accounts,
    savings,
    categories,
    budgets,
    debts,
    splitBills,
    referenceDate = new Date(),
  } = input;

  const dateRange = getReportPeriodRange(
    periodType,
    customStart,
    customEnd,
    referenceDate,
  );
  const previousRange = getPreviousPeriodRange(periodType, dateRange);

  // Main account and balances
  const mainAccount =
    accounts.find((a) => a.type === "MAIN") ||
    accounts.find((a) => a.id === "acc_main_default");
  const mainBalance = mainAccount
    ? calculateAccountBalance(mainAccount, transactions)
    : 0;

  // Overview metrics
  const totalIncome = calculateIncome(transactions, dateRange);
  const totalExpense = calculateExpense(transactions, dateRange);
  const netCashFlow = calculateNetCashFlow(totalIncome, totalExpense);

  const rangeTxCount = transactions.filter((tx) =>
    isTransactionInRange(tx, dateRange),
  ).length;

  // Breakdowns
  const expenseBreakdown = calculateCategoryBreakdown(
    transactions,
    "Expense",
    categories,
    dateRange,
  );
  const incomeBreakdown = calculateCategoryBreakdown(
    transactions,
    "Income",
    categories,
    dateRange,
  );

  // Largest transactions
  const largestExpense = calculateLargestTransaction(
    transactions,
    "Expense",
    dateRange,
  );
  const largestIncome = calculateLargestTransaction(
    transactions,
    "Income",
    dateRange,
  );

  // Specialized reports
  const budgetPerformance = calculateBudgetPerformance(
    budgets,
    transactions,
    categories,
  );
  const savingsReport = calculateSavingsProgress(
    savings,
    accounts,
    transactions,
    dateRange,
  );
  const debtSummary = calculateDebtSummary(debts);
  const splitBillSummary = calculateSplitBillSummary(splitBills);

  const totalFunds = mainBalance + savingsReport.totalSavings;

  const overview: CashFlowOverview = {
    totalIncome,
    totalExpense,
    netCashFlow,
    transactionCount: rangeTxCount,
    mainBalance,
    totalSavings: savingsReport.totalSavings,
    totalFunds,
  };

  const comparison = calculatePeriodComparison(
    dateRange,
    previousRange,
    transactions,
  );

  const insights = generateFinancialInsights(
    overview,
    expenseBreakdown,
    budgetPerformance,
    savingsReport,
    debtSummary,
    splitBillSummary,
  );

  return {
    periodType,
    dateRange,
    overview,
    expenseBreakdown,
    incomeBreakdown,
    largestExpense,
    largestIncome,
    budgetPerformance,
    savings: savingsReport,
    debts: debtSummary,
    splitBills: splitBillSummary,
    comparison,
    insights,
  };
}
