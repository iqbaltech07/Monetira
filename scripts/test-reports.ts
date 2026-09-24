import assert from "node:assert";
import {
  calculateCategoryBreakdown,
  calculateExpense,
  calculateIncome,
  calculateLargestTransaction,
  calculateNetCashFlow,
  calculatePeriodComparison,
  generateFinancialReport,
} from "../src/lib/reports/calculations";
import {
  getPreviousPeriodRange,
  getReportPeriodRange,
  validateCustomDateRange,
} from "../src/lib/reports/periods";
import type {
  Account,
  Budget,
  Category,
  Debt,
  Saving,
  SplitBill,
  Transaction,
} from "../src/types/database";

console.log("=== RUNNING MONETIRA PHASE 9 FINANCIAL REPORTS TESTS ===\n");

// ── Test 1: Date Range Utilities & Validation ─────────────────────────────────
console.log("Test 1: Period range generation & custom date validation");

const now = new Date(2026, 8, 24); // 24 Sept 2026
const thisMonthRange = getReportPeriodRange(
  "THIS_MONTH",
  undefined,
  undefined,
  now,
);
assert.strictEqual(thisMonthRange.start.getDate(), 1);
assert.strictEqual(thisMonthRange.start.getMonth(), 8);
assert.strictEqual(thisMonthRange.end.getMonth(), 8);

const prevMonthRange = getPreviousPeriodRange("THIS_MONTH", thisMonthRange);
assert(prevMonthRange !== null);
assert.strictEqual(prevMonthRange.start.getMonth(), 7); // August

// Custom Range Validations
const validCustom = validateCustomDateRange("2026-09-01", "2026-09-24");
assert.strictEqual(validCustom.valid, true);

const invalidCustomOrder = validateCustomDateRange("2026-09-25", "2026-09-10");
assert.strictEqual(invalidCustomOrder.valid, false);
assert(invalidCustomOrder.error?.includes("tidak boleh melebihi"));

const invalidCustomDate = validateCustomDateRange("not-a-date", "2026-09-24");
assert.strictEqual(invalidCustomDate.valid, false);

console.log("✔ Period ranges and date validations passed.\n");

// ── Test 2: Core Income, Expense & Net Cash Flow (Transfers Excluded) ─────────
console.log("Test 2: Income, Expense, and Net Cash Flow (Transfers Excluded)");

const mockCategories: Category[] = [
  { id: "cat_food", name: "Makanan", type: "Expense", created_at: new Date() },
  {
    id: "cat_trans",
    name: "Transportasi",
    type: "Expense",
    created_at: new Date(),
  },
  { id: "cat_sal", name: "Gaji", type: "Income", created_at: new Date() },
];

const mockTransactions: Transaction[] = [
  {
    id: "tx_1",
    user_id: "user_1",
    type: "Income",
    amount: 5000000,
    date: new Date(2026, 8, 5),
    category_id: "cat_sal",
    created_at: new Date(),
  },
  {
    id: "tx_2",
    user_id: "user_1",
    type: "Expense",
    amount: 1500000,
    date: new Date(2026, 8, 10),
    category_id: "cat_food",
    created_at: new Date(),
  },
  {
    id: "tx_3",
    user_id: "user_1",
    type: "Expense",
    amount: 500000,
    date: new Date(2026, 8, 12),
    category_id: "cat_trans",
    created_at: new Date(),
  },
  // Transfer to savings (MUST BE EXCLUDED FROM INCOME AND EXPENSE)
  {
    id: "tx_4",
    user_id: "user_1",
    type: "Transfer",
    source_account_id: "acc_main_default",
    destination_account_id: "acc_sav_1",
    amount: 1000000,
    date: new Date(2026, 8, 15),
    created_at: new Date(),
  },
  // Previous month transaction (outside range)
  {
    id: "tx_5",
    user_id: "user_1",
    type: "Expense",
    amount: 2000000,
    date: new Date(2026, 7, 20),
    category_id: "cat_food",
    created_at: new Date(),
  },
];

const incomeThisMonth = calculateIncome(mockTransactions, thisMonthRange);
const expenseThisMonth = calculateExpense(mockTransactions, thisMonthRange);
const netCashFlowThisMonth = calculateNetCashFlow(
  incomeThisMonth,
  expenseThisMonth,
);

assert.strictEqual(
  incomeThisMonth,
  5000000,
  "Income must strictly sum genuine Income transactions",
);
assert.strictEqual(
  expenseThisMonth,
  2000000,
  "Expense must strictly sum genuine Expense transactions (excluding Transfer of 1M)",
);
assert.strictEqual(
  netCashFlowThisMonth,
  3000000,
  "Net cash flow must be 5M - 2M = 3M",
);

console.log(
  "✔ Core financial calculations passed (Transfer successfully excluded).\n",
);

// ── Test 3: Category Breakdown & Sorting ───────────────────────────────────────
console.log("Test 3: Category breakdown, percentages, and sorting");

const breakdown = calculateCategoryBreakdown(
  mockTransactions,
  "Expense",
  mockCategories,
  thisMonthRange,
);

assert.strictEqual(breakdown.length, 2);
assert.strictEqual(breakdown[0].categoryName, "Makanan");
assert.strictEqual(breakdown[0].amount, 1500000);
assert.strictEqual(breakdown[0].percentage, 75); // 1.5M / 2M = 75%
assert.strictEqual(breakdown[1].categoryName, "Transportasi");
assert.strictEqual(breakdown[1].amount, 500000);
assert.strictEqual(breakdown[1].percentage, 25); // 0.5M / 2M = 25%

// Largest transaction check
const largestExp = calculateLargestTransaction(
  mockTransactions,
  "Expense",
  thisMonthRange,
);
assert.strictEqual(largestExp?.id, "tx_2");
assert.strictEqual(largestExp?.amount, 1500000);

console.log("✔ Category breakdown and largest transaction passed.\n");

// ── Test 4: Edge Cases (Empty, Zero, NaN, Negative) ───────────────────────────
console.log("Test 4: Edge cases (empty data, zeros, NaN, negative)");

assert.strictEqual(calculateIncome([]), 0);
assert.strictEqual(calculateExpense([]), 0);
assert.strictEqual(calculateNetCashFlow(0, 0), 0);
assert.strictEqual(calculateNetCashFlow(Number.NaN, 100), -100);

const emptyBreakdown = calculateCategoryBreakdown(
  [],
  "Expense",
  mockCategories,
);
assert.strictEqual(emptyBreakdown.length, 0);

const weirdTx: Transaction[] = [
  {
    id: "tx_bad",
    user_id: "u1",
    type: "Expense",
    amount: Number.NaN,
    date: new Date(),
    created_at: new Date(),
  },
  {
    id: "tx_neg",
    user_id: "u1",
    type: "Expense",
    amount: -500,
    date: new Date(),
    created_at: new Date(),
  },
];
assert.strictEqual(
  calculateExpense(weirdTx),
  0,
  "NaN and negative amounts must not corrupt total",
);

console.log("✔ Edge cases handled safely without NaN or crashes.\n");

// ── Test 5: Period Comparison (Current vs Previous) ───────────────────────────
console.log("Test 5: Period comparison & objective factual statements");

const comparison = calculatePeriodComparison(
  thisMonthRange,
  prevMonthRange,
  mockTransactions,
);
assert(comparison !== null);
assert.strictEqual(comparison.expense.current, 2000000);
assert.strictEqual(comparison.expense.previous, 2000000);
assert.strictEqual(comparison.expense.difference, 0);
assert.strictEqual(comparison.expense.trend, "UNCHANGED");

// Add a test where previous had different expense
const txsWithDiff: Transaction[] = [
  ...mockTransactions,
  {
    id: "tx_prev_extra",
    user_id: "user_1",
    type: "Expense",
    amount: 1000000,
    date: new Date(2026, 7, 15),
    created_at: new Date(),
  },
];
const compWithDiff = calculatePeriodComparison(
  thisMonthRange,
  prevMonthRange,
  txsWithDiff,
);
assert(compWithDiff !== null);
assert.strictEqual(compWithDiff.expense.previous, 3000000);
assert.strictEqual(compWithDiff.expense.difference, -1000000);
assert.strictEqual(compWithDiff.expense.trend, "DECREASED");
assert(compWithDiff.factualStatements[0].includes("lebih rendah"));

console.log("✔ Period comparison and non-judgmental statements passed.\n");

// ── Test 6: Full Master Report Generator Integration ──────────────────────────
console.log("Test 6: Master generateFinancialReport integration");

const mockAccounts: Account[] = [
  {
    id: "acc_main_default",
    name: "Saldo Utama",
    type: "MAIN",
    user_id: "user_1",
    opening_balance: 10000000,
    created_at: new Date(),
  },
  {
    id: "acc_sav_1",
    name: "Tabungan Darurat",
    type: "SAVINGS",
    savings_goal_id: "sav_1",
    user_id: "user_1",
    created_at: new Date(),
  },
];

const mockSavings: Saving[] = [
  {
    id: "sav_1",
    user_id: "user_1",
    name: "Dana Darurat",
    target_amount: 10000000,
    current_amount: 1000000,
    status: "Active",
    created_at: new Date(),
  },
];

const mockBudgets: Budget[] = [
  {
    id: "b_1",
    user_id: "user_1",
    category_id: "cat_food",
    amount: 1000000, // spent was 1.5M -> EXCEEDED
    period: "MONTHLY",
    start_date: new Date(),
    created_at: new Date(),
  },
];

const mockDebts: Debt[] = [
  {
    id: "debt_1",
    user_id: "user_1",
    person_name: "Budi",
    direction: "OWED_TO_ME",
    original_amount: 500000,
    remaining_amount: 500000,
    status: "UNPAID",
    created_at: new Date(),
    payments: [],
  },
];

const mockSplitBills: SplitBill[] = [
  {
    id: "split_1",
    user_id: "user_1",
    title: "Dinner Tim",
    total_amount: 300000,
    date: new Date(),
    created_at: new Date(),
    participants: [
      { id: "p1", name: "Saya", amount: 150000, is_me: true, paid: true },
      { id: "p2", name: "Rian", amount: 150000, is_me: false, paid: false },
    ],
  },
];

const fullReport = generateFinancialReport({
  periodType: "THIS_MONTH",
  transactions: mockTransactions,
  accounts: mockAccounts,
  savings: mockSavings,
  categories: mockCategories,
  budgets: mockBudgets,
  debts: mockDebts,
  splitBills: mockSplitBills,
  referenceDate: now,
});

assert.strictEqual(fullReport.overview.totalIncome, 5000000);
assert.strictEqual(fullReport.overview.totalExpense, 2000000);
assert.strictEqual(fullReport.overview.netCashFlow, 3000000);
assert.strictEqual(fullReport.savings.totalSavings, 1000000); // 1M transferred to sav_1
assert.strictEqual(fullReport.savings.periodContributions, 1000000);
assert.strictEqual(fullReport.budgetPerformance.overbudgetCount, 1);
assert.strictEqual(fullReport.debts.remainingOwedToMe, 500000);
assert.strictEqual(fullReport.splitBills.outstandingAmount, 150000);

// Insights check
assert(fullReport.insights.length >= 2);
const surplusInsight = fullReport.insights.find(
  (i) => i.id === "insight_cashflow_surplus",
);
assert(surplusInsight !== undefined);
const overbudgetInsight = fullReport.insights.find(
  (i) => i.id === "insight_overbudget",
);
assert(overbudgetInsight !== undefined);

console.log("✔ Master generateFinancialReport integration passed.\n");

console.log("=================================================");
console.log("🎉 ALL PHASE 9 FINANCIAL REPORTS TESTS PASSED! 🎉");
console.log("=================================================");
