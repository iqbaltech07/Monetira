"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
} from "lucide-react";
import type { FinancialInsight } from "~/lib/reports/calculations";

interface InsightsSectionProps {
  insights: FinancialInsight[];
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  if (insights.length === 0) {
    return null;
  }

  const getInsightIcon = (type: FinancialInsight["type"]) => {
    switch (type) {
      case "SUCCESS":
        return (
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        );
      case "WARNING":
        return (
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
        );
      case "ALERT":
        return (
          <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
        );
      case "INFO":
        return (
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
        );
    }
  };

  const getInsightClasses = (type: FinancialInsight["type"]) => {
    switch (type) {
      case "SUCCESS":
        return "bg-emerald-50/70 border-emerald-200/80 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-200";
      case "WARNING":
        return "bg-amber-50/70 border-amber-200/80 text-amber-950 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200";
      case "ALERT":
        return "bg-rose-50/70 border-rose-200/80 text-rose-950 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-200";
      case "INFO":
        return "bg-blue-50/70 border-blue-200/80 text-blue-950 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-200";
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Catatan & Insight Keuangan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Observasi otomatis berbasis aturan dari transaksi dan saldo aktual
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${getInsightClasses(
              ins.type,
            )}`}
          >
            {getInsightIcon(ins.type)}
            <div>
              <h4 className="text-xs font-bold">{ins.title}</h4>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                {ins.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
