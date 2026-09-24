"use client";

import { ArrowDown, ArrowUp, GitCompare, Minus } from "lucide-react";
import type { PeriodComparisonSummary } from "~/lib/reports/calculations";
import { formatCurrency } from "~/lib/utils";

interface ComparisonSectionProps {
  comparison: PeriodComparisonSummary | null;
  currentLabel: string;
}

export function ComparisonSection({
  comparison,
  currentLabel,
}: ComparisonSectionProps) {
  if (!comparison) return null;

  const renderTrend = (
    metric: PeriodComparisonSummary["expense"],
    isExpense = false,
  ) => {
    const diffAbs = Math.abs(metric.difference);
    const pct =
      metric.percentageChange !== null
        ? `${Math.abs(metric.percentageChange)}%`
        : "";

    if (metric.trend === "UNCHANGED") {
      return (
        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-semibold">
          <Minus className="h-3.5 w-3.5" />
          Tidak Berubah
        </span>
      );
    }

    // For expense: decreased is green, increased is red
    // For income: increased is green, decreased is red
    const isPositiveOutcome = isExpense
      ? metric.trend === "DECREASED"
      : metric.trend === "INCREASED";

    const colorClass = isPositiveOutcome
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";

    const Icon = metric.trend === "INCREASED" ? ArrowUp : ArrowDown;

    return (
      <div
        className={`flex items-center gap-1 text-xs font-bold ${colorClass}`}
      >
        <Icon className="h-3.5 w-3.5" />
        <span>
          {metric.trend === "INCREASED" ? "+" : "-"}
          {formatCurrency(diffAbs)} {pct ? `(${pct})` : ""}
        </span>
      </div>
    );
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <GitCompare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Perbandingan Antar Periode
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentLabel} dibandingkan dengan {comparison.previousPeriodLabel}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Pemasukan */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Pemasukan
          </span>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(comparison.income.current)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Sebelumnya: {formatCurrency(comparison.income.previous)}
          </div>
          <div className="pt-1">{renderTrend(comparison.income, false)}</div>
        </div>

        {/* Pengeluaran */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Pengeluaran
          </span>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(comparison.expense.current)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Sebelumnya: {formatCurrency(comparison.expense.previous)}
          </div>
          <div className="pt-1">{renderTrend(comparison.expense, true)}</div>
        </div>

        {/* Arus Kas Bersih */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Arus Kas Bersih
          </span>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(comparison.netCashFlow.current)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Sebelumnya: {formatCurrency(comparison.netCashFlow.previous)}
          </div>
          <div className="pt-1">
            {renderTrend(comparison.netCashFlow, false)}
          </div>
        </div>
      </div>

      {/* Factual Statements */}
      {comparison.factualStatements.length > 0 && (
        <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-950 dark:text-blue-300 space-y-1">
          {comparison.factualStatements.map((stmt, idx) => (
            <p key={`stmt-${idx}-${stmt.slice(0, 15)}`}>• {stmt}</p>
          ))}
        </div>
      )}
    </div>
  );
}
