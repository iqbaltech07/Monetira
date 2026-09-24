"use client";

import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useGsapReveal } from "~/lib/gsap";
import { generateFinancialReport } from "~/lib/reports/calculations";
import { exportReportCSV, exportReportJSON } from "~/lib/reports/export";
import type { ReportPeriodType } from "~/lib/reports/periods";
import { useMonetira } from "~/lib/store/monetira-context";
import { BudgetPerformanceSection } from "./BudgetPerformanceSection";
import { CashFlowSection } from "./CashFlowSection";
import { CategoryBreakdownSection } from "./CategoryBreakdownSection";
import { ComparisonSection } from "./ComparisonSection";
import { DebtSplitReportSection } from "./DebtSplitReportSection";
import { InsightsSection } from "./InsightsSection";
import { PeriodSelector } from "./PeriodSelector";
import { SavingsSection } from "./SavingsSection";

export function ReportsContent() {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.05, y: 15 });

  const {
    transactions,
    accounts,
    savings,
    categories,
    budgets,
    debts,
    splitBills,
  } = useMonetira();

  const [selectedPeriod, setSelectedPeriod] =
    useState<ReportPeriodType>("THIS_MONTH");

  // Initial custom date defaults (1st of month to today)
  const today = new Date();
  const defaultStartStr = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const defaultEndStr = today.toISOString().split("T")[0];

  const [customStart, setCustomStart] = useState<string>(defaultStartStr);
  const [customEnd, setCustomEnd] = useState<string>(defaultEndStr);

  const handleApplyCustomRange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
  };

  // Generate full report data cleanly via calculation engine
  const report = useMemo(() => {
    return generateFinancialReport({
      periodType: selectedPeriod,
      customStart,
      customEnd,
      transactions,
      accounts,
      savings,
      categories,
      budgets,
      debts,
      splitBills,
    });
  }, [
    selectedPeriod,
    customStart,
    customEnd,
    transactions,
    accounts,
    savings,
    categories,
    budgets,
    debts,
    splitBills,
  ]);

  return (
    <div ref={containerRef} className="space-y-6 pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Laporan Keuangan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analisis arus kas, performa anggaran, tabungan, dan insight
            finansial berdasarkan ledger riil.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Period Selector with Custom Date Range Dialog */}
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
            customStart={customStart}
            customEnd={customEnd}
            onApplyCustomRange={handleApplyCustomRange}
          />

          {/* Export Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Ekspor</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
            >
              <DropdownMenuItem
                onClick={() => exportReportCSV(report)}
                className="flex items-center gap-2 py-2 cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Unduh CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportReportJSON(report)}
                className="flex items-center gap-2 py-2 cursor-pointer"
              >
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Unduh JSON</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 1. Cash Flow Section (Income, Expense, Net Cash Flow, Chart) */}
      <CashFlowSection
        overview={report.overview}
        periodLabel={report.dateRange.label}
      />

      {/* 2. Rule-Based Insights */}
      <InsightsSection insights={report.insights} />

      {/* 3. Period-over-Period Comparison (if applicable) */}
      {report.comparison && (
        <ComparisonSection
          comparison={report.comparison}
          currentLabel={report.dateRange.label}
        />
      )}

      {/* 4. Category Breakdown Section */}
      <CategoryBreakdownSection
        expenseBreakdown={report.expenseBreakdown}
        incomeBreakdown={report.incomeBreakdown}
        largestExpense={report.largestExpense}
        largestIncome={report.largestIncome}
        periodLabel={report.dateRange.label}
      />

      {/* 5. Budget Performance Section */}
      <BudgetPerformanceSection report={report.budgetPerformance} />

      {/* 6. Savings Section */}
      <SavingsSection
        report={report.savings}
        periodLabel={report.dateRange.label}
      />

      {/* 7. Debt & Split Bill Section */}
      <DebtSplitReportSection
        debts={report.debts}
        splitBills={report.splitBills}
      />
    </div>
  );
}
