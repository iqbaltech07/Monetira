"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  PiggyBank,
  Scale,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "~/components/ui/chart";
import { useMediaQuery } from "~/hooks/use-media-query";
import type { CashFlowOverview } from "~/lib/reports/calculations";
import { formatCurrency } from "~/lib/utils";

interface CashFlowSectionProps {
  overview: CashFlowOverview;
  periodLabel: string;
}

const chartConfig = {
  income: {
    label: "Pemasukan",
    color: "var(--chart-2)",
  },
  expense: {
    label: "Pengeluaran",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

export function CashFlowSection({
  overview,
  periodLabel,
}: CashFlowSectionProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const chartData = [
    {
      name: "Ringkasan Arus Kas",
      income: overview.totalIncome,
      expense: overview.totalExpense,
    },
  ];

  const isNetPositive = overview.netCashFlow >= 0;

  return (
    <div className="space-y-6">
      {/* 3 Primary Cash Flow Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Pemasukan
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(overview.totalIncome)}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Pemasukan tercatat pada {periodLabel}
          </p>
        </div>

        {/* Total Expense */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Pengeluaran
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(overview.totalExpense)}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Pengeluaran riil pada {periodLabel}
          </p>
        </div>

        {/* Net Cash Flow */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Arus Kas Bersih
            </span>
            <div
              className={`p-2 rounded-xl ${
                isNetPositive
                  ? "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400"
                  : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
              }`}
            >
              <Scale className="h-5 w-5" />
            </div>
          </div>
          <div
            className={`mt-3 text-2xl font-bold ${
              isNetPositive
                ? "text-teal-600 dark:text-teal-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {isNetPositive ? "+" : ""}
            {formatCurrency(overview.netCashFlow)}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isNetPositive
              ? "Surplus kas (Pemasukan > Pengeluaran)"
              : "Defisit kas (Pengeluaran > Pemasukan)"}
          </p>
        </div>
      </div>

      {/* Account Balances Snapshot Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Saldo Utama (Kas Siap Pakai)
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(overview.mainBalance)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-2xs">
            <PiggyBank className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Total Tabungan
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(overview.totalSavings)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Total Kekayaan (Seluruh Dana)
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(overview.totalFunds)}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Chart Comparison */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Perbandingan Arus Kas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perbandingan nominal pemasukan dan pengeluaran pada {periodLabel}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {overview.transactionCount} Transaksi
          </span>
        </div>

        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                left: isMobile ? 10 : 30,
                right: isMobile ? 10 : 30,
                top: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCurrency(val)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                hide
              />
              <ChartTooltip
                cursor={false}
                content={({ payload }) => {
                  if (!payload || payload.length === 0) return null;
                  return (
                    <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-md dark:border-slate-800 dark:bg-slate-950 text-xs">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                        Ringkasan Periode
                      </div>
                      <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400">
                        <span>Pemasukan:</span>
                        <span className="font-bold">
                          {formatCurrency(overview.totalIncome)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-rose-600 dark:text-rose-400 mt-1">
                        <span>Pengeluaran:</span>
                        <span className="font-bold">
                          {formatCurrency(overview.totalExpense)}
                        </span>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-800 mt-1.5 pt-1.5 flex items-center justify-between gap-4 text-slate-700 dark:text-slate-300">
                        <span>Arus Kas Bersih:</span>
                        <span className="font-bold">
                          {formatCurrency(overview.netCashFlow)}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="income"
                fill="var(--color-income)"
                radius={[0, 6, 6, 0]}
                barSize={28}
              />
              <Bar
                dataKey="expense"
                fill="var(--color-expense)"
                radius={[0, 6, 6, 0]}
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
