"use client";

import { AlertTriangle, CheckCircle2, DollarSign, XCircle } from "lucide-react";
import { Progress } from "~/components/ui/progress";
import type { BudgetPerformanceReport } from "~/lib/reports/calculations";
import { formatCurrency } from "~/lib/utils";

interface BudgetPerformanceSectionProps {
  report: BudgetPerformanceReport;
}

export function BudgetPerformanceSection({
  report,
}: BudgetPerformanceSectionProps) {
  if (report.items.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
          Performa Anggaran (Budget)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Belum ada anggaran yang dibuat. Silakan tambahkan anggaran di menu
          Anggaran.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Performa Anggaran (Budget vs Realisasi)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoring penggunaan alokasi pengeluaran per kategori
          </p>
        </div>

        {/* Status Highlights */}
        <div className="flex items-center gap-2">
          {report.overbudgetCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
              <XCircle className="h-3 w-3" />
              {report.overbudgetCount} Melebihi Batas
            </span>
          )}
          {report.warningCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
              <AlertTriangle className="h-3 w-3" />
              {report.warningCount} Waspada
            </span>
          )}
          {report.overbudgetCount === 0 && report.warningCount === 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
              <CheckCircle2 className="h-3 w-3" />
              Semua Aman
            </span>
          )}
        </div>
      </div>

      {/* Aggregate Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs">
        <div>
          <div className="text-slate-500 dark:text-slate-400">
            Total Alokasi Budget
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {formatCurrency(report.totalBudget)}
          </div>
        </div>
        <div>
          <div className="text-slate-500 dark:text-slate-400">
            Total Terpakai
          </div>
          <div className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">
            {formatCurrency(report.totalSpent)}
          </div>
        </div>
        <div>
          <div className="text-slate-500 dark:text-slate-400">
            Tingkat Utilisasi
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {report.utilizationPercentage}%
          </div>
        </div>
      </div>

      {/* Budget Items List */}
      <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
        {report.items.map((item, idx) => {
          let badgeColor =
            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50";
          let badgeLabel = "Terkendali";
          let progressColor = "bg-emerald-600";

          if (item.status === "EXCEEDED") {
            badgeColor =
              "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-900/50";
            badgeLabel = "Melebihi Batas";
            progressColor = "bg-rose-600";
          } else if (item.status === "WARNING") {
            badgeColor =
              "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
            badgeLabel = "Mendekati Batas";
            progressColor = "bg-amber-500";
          }

          return (
            <div key={item.budgetId} className={idx > 0 ? "pt-4" : ""}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.categoryName}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {item.period === "WEEKLY" ? "Mingguan" : "Bulanan"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}
                  >
                    {badgeLabel}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              <Progress
                value={Math.min(100, item.percentage)}
                className={`h-2 bg-slate-100 dark:bg-slate-800 [&>div]:${progressColor}`}
              />

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                <span>
                  Terpakai:{" "}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {formatCurrency(item.spentAmount)}
                  </strong>{" "}
                  dari {formatCurrency(item.budgetAmount)}
                </span>
                <span>
                  Sisa:{" "}
                  <strong
                    className={
                      item.remainingAmount === 0 &&
                      item.spentAmount > item.budgetAmount
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }
                  >
                    {item.remainingAmount === 0 &&
                    item.spentAmount > item.budgetAmount
                      ? `-${formatCurrency(item.spentAmount - item.budgetAmount)}`
                      : formatCurrency(item.remainingAmount)}
                  </strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
