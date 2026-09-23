"use client";

import { useState } from "react";
import { BiSolidWallet } from "react-icons/bi";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { ExpenseCategoryCard } from "~/components/features/dashboard/ExpenseCategoryCard";
import { IncomeExpenseChart } from "~/components/features/dashboard/IncomeExpenseChart";
import { SavingsGoalCard } from "~/components/features/savings/SavingsGoalCard";
import { StatCard } from "~/components/shared/StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useGsapReveal } from "~/lib/gsap";
import { formatCurrency } from "~/lib/utils";
import type { Saving, Transaction } from "~/types/database";

interface DashboardContentProps {
  transactions: Transaction[];
  savings: Saving[];
  userBalance: number;
}

export function DashboardContent({
  transactions,
  savings,
  userBalance,
}: DashboardContentProps) {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.08, y: 20 });
  const [hideBalance, setHideBalance] = useState(false);

  // Calculate totals for the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthTransactions = transactions.filter(
    (t) =>
      t.date.getMonth() === currentMonth &&
      t.date.getFullYear() === currentYear,
  );

  const income = currentMonthTransactions
    .filter((t) => t.type === "Income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expense = currentMonthTransactions
    .filter((t) => t.type === "Expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Calculate category expenses for the chart
  const categoryExpensesMap = new Map<string, number>();

  transactions
    .filter((t) => t.type === "Expense")
    .forEach((t) => {
      const categoryName = t.category?.name || "Uncategorized";
      const current = categoryExpensesMap.get(categoryName) || 0;
      categoryExpensesMap.set(categoryName, current + t.amount);
    });

  const categoryExpenses = Array.from(categoryExpensesMap.entries()).map(
    ([category, value], index) => ({
      category,
      value,
      color: `var(--chart-${(index % 5) + 1})`,
    }),
  );

  return (
    <div ref={containerRef} className="flex flex-col gap-6 md:gap-8">
      {/* Stat Cards - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="gsap-fade-up">
          <StatCard
            title="Total Saldo"
            description="Total dana Anda saat ini."
            amount={formatCurrency(userBalance)}
            icon={BiSolidWallet}
            variant="primary"
            isHidden={hideBalance}
            onToggleHidden={() => setHideBalance(!hideBalance)}
            showEye={true}
          />
        </div>
        <div className="gsap-fade-up">
          <StatCard
            title="Pemasukan"
            description="Pendapatan bulan ini."
            amount={formatCurrency(income)}
            icon={FaArrowTrendUp}
            variant="success"
            isHidden={hideBalance}
          />
        </div>
        <div className="gsap-fade-up sm:col-span-2 lg:col-span-1">
          <StatCard
            title="Pengeluaran"
            description="Pengeluaran bulan ini."
            amount={formatCurrency(expense)}
            icon={FaArrowTrendDown}
            variant="danger"
            isHidden={hideBalance}
          />
        </div>
      </div>

      {/* Charts & Goals Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="gsap-fade-up min-w-0 lg:col-span-7">
          <Card className="h-full border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Grafik Pemasukan dan Pengeluaran
              </CardTitle>
              <CardDescription>Ringkasan 6 bulan terakhir.</CardDescription>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart data={transactions} />
            </CardContent>
          </Card>
        </div>

        <div className="gsap-fade-up min-w-0 lg:col-span-5">
          <ExpenseCategoryCard data={categoryExpenses} />
        </div>

        <div className="gsap-fade-up lg:col-span-12">
          <SavingsGoalCard savings={savings} />
        </div>
      </div>
    </div>
  );
}
