"use client";

import { PieChart, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { CategoryBreakdownItem } from "~/lib/reports/calculations";
import { formatCurrency } from "~/lib/utils";
import type { Transaction } from "~/types/database";

interface CategoryBreakdownSectionProps {
  expenseBreakdown: CategoryBreakdownItem[];
  incomeBreakdown: CategoryBreakdownItem[];
  largestExpense: Transaction | null;
  largestIncome: Transaction | null;
  periodLabel: string;
}

export function CategoryBreakdownSection({
  expenseBreakdown,
  incomeBreakdown,
  largestExpense,
  largestIncome,
  periodLabel,
}: CategoryBreakdownSectionProps) {
  const [activeTab, setActiveTab] = useState<"Expense" | "Income">("Expense");

  const items = activeTab === "Expense" ? expenseBreakdown : incomeBreakdown;
  const isExpense = activeTab === "Expense";
  const largestTx = isExpense ? largestExpense : largestIncome;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Analisis per Kategori
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Proporsi nominal dan jumlah transaksi berdasarkan kategori (
            {periodLabel})
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "Expense" | "Income")}
        >
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
            <TabsTrigger
              value="Expense"
              className="text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-rose-600 dark:data-[state=active]:text-rose-400"
            >
              <TrendingDown className="h-3.5 w-3.5 mr-1.5" />
              Pengeluaran
            </TabsTrigger>
            <TabsTrigger
              value="Income"
              className="text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400"
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Pemasukan
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Largest Transaction Spotlight */}
      {largestTx && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            isExpense
              ? "bg-rose-50/60 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/40 text-rose-900 dark:text-rose-300"
              : "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300"
          }`}
        >
          <div>
            <span className="font-semibold block">
              {isExpense
                ? "Pengeluaran Tunggal Terbesar"
                : "Pemasukan Tunggal Terbesar"}
              :
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {largestTx.note ||
                largestTx.category?.name ||
                "Transaksi tanpa catatan"}
            </span>
          </div>
          <span className="font-bold text-sm whitespace-nowrap">
            {formatCurrency(largestTx.amount)}
          </span>
        </div>
      )}

      {/* Categories List */}
      {items.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
          Belum ada transaksi {isExpense ? "pengeluaran" : "pemasukan"} pada
          periode ini.
        </div>
      ) : (
        <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item, idx) => (
            <div key={item.categoryId} className={idx > 0 ? "pt-3.5" : ""}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.categoryName}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    ({item.count} transaksi)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.amount)}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 min-w-[46px] text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              <Progress
                value={item.percentage}
                className="h-2 bg-slate-100 dark:bg-slate-800"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
