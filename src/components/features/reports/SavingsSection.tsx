"use client";

import { CheckCircle2, PiggyBank, Target } from "lucide-react";
import { Progress } from "~/components/ui/progress";
import type { SavingsReport } from "~/lib/reports/calculations";
import { formatCurrency } from "~/lib/utils";

interface SavingsSectionProps {
  report: SavingsReport;
  periodLabel: string;
}

export function SavingsSection({ report, periodLabel }: SavingsSectionProps) {
  if (report.goals.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
          Target Tabungan (Savings)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Belum ada target tabungan yang dibuat. Silakan tambahkan target
          tabungan di menu Tabungan.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Progres Tabungan & Alokasi
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Status pencapaian target dan setoran tabungan ({periodLabel})
          </p>
        </div>

        {report.periodContributions > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40">
            <Target className="h-3.5 w-3.5" />
            Setoran Periode Ini: {formatCurrency(report.periodContributions)}
          </span>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs">
        <div>
          <div className="text-slate-500 dark:text-slate-400">
            Total Terkumpul
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {formatCurrency(report.totalSavings)}
          </div>
        </div>
        <div>
          <div className="text-slate-500 dark:text-slate-400">
            Total Target Rencana
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {formatCurrency(report.totalTarget)}
          </div>
        </div>
        <div>
          <div className="text-slate-500 dark:text-slate-400">
            Progres Keseluruhan
          </div>
          <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-0.5">
            {report.overallProgressPercentage}%
          </div>
        </div>
      </div>

      {/* Goal Items */}
      <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
        {report.goals.map((goal, idx) => (
          <div key={goal.id} className={idx > 0 ? "pt-3.5" : ""}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {goal.name}
                </span>
                {goal.status === "Completed" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Tercapai
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(goal.currentAmount)}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  / {formatCurrency(goal.targetAmount)}
                </span>
                <span className="text-[11px] font-bold ml-1 text-purple-600 dark:text-purple-400">
                  ({goal.progressPercentage}%)
                </span>
              </div>
            </div>

            <Progress
              value={goal.progressPercentage}
              className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-purple-600"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
