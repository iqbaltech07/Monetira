"use client";

import { useMemo, useState } from "react";
import { BiSolidWallet } from "react-icons/bi";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ExpenseCategoryCard } from "~/components/features/dashboard/ExpenseCategoryCard";
import { IncomeExpenseChart } from "~/components/features/dashboard/IncomeExpenseChart";
import ButtonNewTarget from "~/components/features/savings/ButtonNewTarget";
import { SavingsGoalCard } from "~/components/features/savings/SavingsGoalCard";
import ButtonNewTransaction from "~/components/features/transactions/ButtonNewTransaction";
import TransactionRowHistory from "~/components/features/transactions/TransactionRowHistory";
import { StatCard } from "~/components/shared/StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useGsapReveal } from "~/lib/gsap";
import { useMonetira } from "~/lib/store/monetira-context";
import { formatCurrency } from "~/lib/utils";
import type { Saving, Transaction } from "~/types/database";

interface DashboardContentProps {
  transactions?: Transaction[];
  savings?: Saving[];
  userBalance?: number;
}

export function DashboardContent({
  transactions: propTx,
  savings: propSavings,
}: DashboardContentProps) {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.06, y: 15 });
  const {
    transactions: storeTx,
    savings: storeSavings,
    categories,
    netBalance,
    totalIncome,
    totalExpense,
  } = useMonetira();

  const [hideBalance, setHideBalance] = useState(false);

  // Use store data by default
  const transactions = propTx || storeTx;
  const savings = propSavings || storeSavings;

  // Calculate totals for the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  const monthIncome = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === "Income")
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [currentMonthTransactions]);

  const monthExpense = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === "Expense")
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [currentMonthTransactions]);

  // Calculate category expenses for the chart
  const categoryExpenses = useMemo(() => {
    const categoryExpensesMap = new Map<string, number>();

    transactions
      .filter((t) => t.type === "Expense")
      .forEach((t) => {
        const categoryName = t.category?.name || "Lainnya";
        const current = categoryExpensesMap.get(categoryName) || 0;
        categoryExpensesMap.set(categoryName, current + t.amount);
      });

    return Array.from(categoryExpensesMap.entries()).map(
      ([category, value], index) => ({
        category,
        value,
        color: `var(--chart-${(index % 5) + 1})`,
      }),
    );
  }, [transactions]);

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  return (
    <div ref={containerRef} className="flex flex-col gap-6 md:gap-8">
      {/* Quick Action & Greeting Banner */}
      <div className="gsap-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 sm:p-6 text-white shadow-md">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white inline-block mb-2 backdrop-blur-xs">
            ✨ Dasbor Keuangan Terintegrasi
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Ringkasan Finansial Anda
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg mt-0.5">
            Semua catatan pemasukan, pengeluaran, dan tabungan Anda sinkron
            secara otomatis.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <ButtonNewTransaction categories={categories} />
          <ButtonNewTarget />
        </div>
      </div>

      {/* Stat Cards - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="gsap-fade-up">
          <StatCard
            title="Total Saldo Bersih"
            description="Total dana Anda saat ini."
            amount={formatCurrency(netBalance)}
            icon={BiSolidWallet}
            variant="primary"
            isHidden={hideBalance}
            onToggleHidden={() => setHideBalance(!hideBalance)}
            showEye={true}
          />
        </div>
        <div className="gsap-fade-up">
          <StatCard
            title="Pemasukan Bulan Ini"
            description="Pendapatan periode aktif."
            amount={formatCurrency(monthIncome || totalIncome)}
            icon={FaArrowTrendUp}
            variant="success"
            isHidden={hideBalance}
          />
        </div>
        <div className="gsap-fade-up sm:col-span-2 lg:col-span-1">
          <StatCard
            title="Pengeluaran Bulan Ini"
            description="Pengeluaran periode aktif."
            amount={formatCurrency(monthExpense || totalExpense)}
            icon={FaArrowTrendDown}
            variant="danger"
            isHidden={hideBalance}
          />
        </div>
      </div>

      {/* Charts & Goals Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="gsap-fade-up min-w-0 lg:col-span-7">
          <Card className="h-full border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Grafik Pemasukan dan Pengeluaran
              </CardTitle>
              <CardDescription>Arus kas transaksi Anda.</CardDescription>
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

      {/* Recent Transactions List on Dashboard */}
      <div className="gsap-fade-up rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Transaksi Terkini
            </h3>
            <p className="text-xs text-slate-500">
              Aktivitas catatan keuangan terbaru Anda
            </p>
          </div>
          <Link
            href="/transactions"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <span>Lihat Semua Transaksi</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Belum ada transaksi yang dicatat.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {recentTransactions.map((tx) => (
              <TransactionRowHistory key={tx.id} item={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
