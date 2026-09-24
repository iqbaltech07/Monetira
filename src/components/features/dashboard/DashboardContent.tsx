"use client";

import { useMemo, useState } from "react";
import { BiSolidWallet } from "react-icons/bi";
import { FaArrowTrendDown, FaArrowTrendUp, FaPiggyBank } from "react-icons/fa6";
import {
  ArrowRight,
  ArrowLeftRight,
  BarChart3,
  HandCoins,
  PieChart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  AssistantFloatingButton,
  TransactionAssistant,
} from "~/components/features/assistant/TransactionAssistant";
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

export function DashboardContent() {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.06, y: 15 });
  const {
    transactions,
    savings,
    categories,
    mainBalance,
    totalFunds,
    totalSavings,
    budgets,
    getBudgetSpending,
    debtSummary,
    splitBillSummary,
  } = useMonetira();

  const [hideBalance, setHideBalance] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  // Budget overview for dashboard
  const budgetOverview = useMemo(() => {
    let totalBudget = 0;
    let totalSpent = 0;
    let exceededCount = 0;
    for (const b of budgets) {
      totalBudget += b.amount;
      const res = getBudgetSpending(b);
      totalSpent += res.spent;
      if (res.status === "EXCEEDED") exceededCount += 1;
    }
    return { totalBudget, totalSpent, exceededCount };
  }, [budgets, getBudgetSpending]);

  // =========================================================================
  // TIME RANGE: Current calendar month — computed once on mount.
  // No dependency on live state; the calendar month only changes on page reload.
  // =========================================================================
  const { periodStart, periodEnd } = useMemo(() => {
    const now = new Date();
    return {
      periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
      periodEnd: new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      ),
    };
  }, []);

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= periodStart && d <= periodEnd;
    });
  }, [transactions, periodStart, periodEnd]);

  // =========================================================================
  // MONTHLY METRICS — only Income/Expense, Transfer excluded
  // =========================================================================
  const monthIncome = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === "Income")
      .reduce((acc, t) => acc + t.amount, 0);
  }, [currentMonthTransactions]);

  const monthExpense = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === "Expense")
      .reduce((acc, t) => acc + t.amount, 0);
  }, [currentMonthTransactions]);

  // Net Cash Flow = Income - Expense. Transfer is redistribution and must NOT affect this.
  const monthNetCashFlow = monthIncome - monthExpense;

  // =========================================================================
  // CATEGORY BREAKDOWN — Expense only, current month, Transfer excluded
  // =========================================================================
  const categoryExpenses = useMemo(() => {
    const categoryExpensesMap = new Map<string, number>();

    currentMonthTransactions
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
  }, [currentMonthTransactions]);

  // =========================================================================
  // RECENT TRANSACTIONS — latest 5 across all time, sorted by date desc
  // =========================================================================
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  return (
    <div ref={containerRef} className="flex flex-col gap-6 md:gap-8">
      {/* AI Transaction Assistant Overlay */}
      {assistantOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Tutup asisten transaksi"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
            onClick={() => setAssistantOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setAssistantOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <TransactionAssistant onClose={() => setAssistantOpen(false)} />
          </div>
        </div>
      )}
      {/* Quick Action & Greeting Banner */}
      <div className="gsap-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 sm:p-6 text-white shadow-md">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100 mb-1.5">
            <BiSolidWallet className="h-3.5 w-3.5 text-blue-200 shrink-0" />
            <span className="border-b border-blue-200/50 pb-0.5">
              Dasbor Finansial
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Ringkasan Finansial Anda
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg mt-0.5">
            Semua catatan pemasukan, pengeluaran, dan tabungan Anda sinkron
            secara otomatis.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <Link href="/reports">
            <Button
              variant="outline"
              className="h-10 px-3.5 bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 cursor-pointer"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Lihat Laporan Keuangan</span>
            </Button>
          </Link>
          <ButtonNewTransaction categories={categories} />
          <ButtonNewTarget />
        </div>
      </div>

      {/* ── PRIMARY FINANCIAL OVERVIEW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Saldo Utama — from ledger via context */}
        <div className="gsap-fade-up">
          <StatCard
            title="Saldo Utama"
            description={
              hideBalance
                ? "Total Dana: Rp ••••••••"
                : `Total Dana: ${formatCurrency(totalFunds)}`
            }
            amount={formatCurrency(mainBalance)}
            icon={BiSolidWallet}
            variant="primary"
            isHidden={hideBalance}
            onToggleHidden={() => setHideBalance(!hideBalance)}
            showEye={true}
          />
        </div>

        {/* Total Tabungan — sum of all savings ledger balances */}
        <div className="gsap-fade-up">
          <StatCard
            title="Total Tabungan"
            description={`${savings.filter((s) => s.status === "Active").length} target aktif`}
            amount={formatCurrency(totalSavings)}
            icon={FaPiggyBank}
            variant="info"
            isHidden={hideBalance}
          />
        </div>

        {/* Net Cash Flow Bulan Ini — Income minus Expense, Transfer excluded */}
        <div className="gsap-fade-up sm:col-span-2 lg:col-span-1">
          <StatCard
            title="Arus Kas Bersih Bulan Ini"
            description="Pemasukan dikurangi pengeluaran"
            amount={
              (monthNetCashFlow >= 0 ? "+" : "") +
              formatCurrency(Math.abs(monthNetCashFlow))
            }
            icon={monthNetCashFlow >= 0 ? FaArrowTrendUp : FaArrowTrendDown}
            variant={monthNetCashFlow >= 0 ? "success" : "danger"}
            isHidden={hideBalance}
          />
        </div>
      </div>

      {/* ── MONTHLY CASH FLOW BREAKDOWN ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Pemasukan Bulan Ini — only type === "Income" */}
        <div className="gsap-fade-up">
          <StatCard
            title="Pemasukan Bulan Ini"
            description="Semua transaksi Income periode ini"
            amount={formatCurrency(monthIncome)}
            icon={FaArrowTrendUp}
            variant="success"
            isHidden={hideBalance}
          />
        </div>

        {/* Pengeluaran Bulan Ini — only type === "Expense" */}
        <div className="gsap-fade-up">
          <StatCard
            title="Pengeluaran Bulan Ini"
            description="Semua transaksi Expense periode ini"
            amount={formatCurrency(monthExpense)}
            icon={FaArrowTrendDown}
            variant="danger"
            isHidden={hideBalance}
          />
        </div>
      </div>

      {/* ── CHARTS & SAVINGS ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="gsap-fade-up min-w-0 lg:col-span-7">
          <Card className="h-full border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Grafik Pemasukan dan Pengeluaran
              </CardTitle>
              <CardDescription>
                Arus kas 6 bulan terakhir. Transfer tidak dihitung.
              </CardDescription>
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

      {/* ── PHASE 8: FINANCIAL PLANNING & OBLIGATIONS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Pos Anggaran */}
        <div className="gsap-fade-up rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <PieChart className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {budgets.length} Pos
              </span>
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Anggaran Pengeluaran
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Terpakai {formatCurrency(budgetOverview.totalSpent)} dari{" "}
              {formatCurrency(budgetOverview.totalBudget)}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {budgetOverview.exceededCount > 0 ? (
                <span className="text-rose-600 dark:rose-400 font-bold">
                  {budgetOverview.exceededCount} Melebihi Batas
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Terkontrol Baik
                </span>
              )}
            </span>
            <Link
              href="/budget"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              <span>Kelola</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Hutang & Piutang */}
        <div className="gsap-fade-up rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <HandCoins className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {debtSummary.activeDebtsCount} Aktif
              </span>
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Hutang & Piutang
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Hutang: {formatCurrency(debtSummary.remainingOwedByMe)} • Piutang:{" "}
              {formatCurrency(debtSummary.remainingOwedToMe)}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {debtSummary.remainingOwedByMe > 0 ? (
                <span className="text-amber-600 dark:text-amber-400">
                  Ada Kewajiban Bayar
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Bebas Hutang
                </span>
              )}
            </span>
            <Link
              href="/debts"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1"
            >
              <span>Kelola</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Split Bill */}
        <div className="gsap-fade-up rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {splitBillSummary.totalBills} Acara
              </span>
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Bagi Tagihan (Split Bill)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Tertunda dari rekan:{" "}
              {formatCurrency(splitBillSummary.outstandingAmount)}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {splitBillSummary.unsettledCount > 0 ? (
                <span className="text-purple-600 dark:text-purple-400 font-bold">
                  {splitBillSummary.unsettledCount} Belum Tuntas
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Semua Lunas
                </span>
              )}
            </span>
            <Link
              href="/split-bill"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1"
            >
              <span>Kelola</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── RECENT TRANSACTIONS ── */}
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
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <p className="text-xs text-slate-400">
              Belum ada transaksi yang dicatat.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {recentTransactions.map((tx) => (
              <TransactionRowHistory key={tx.id} item={tx} />
            ))}
          </div>
        )}
      </div>

      {/* Floating AI Assistant trigger — above BottomNav (z-40) */}
      <AssistantFloatingButton onClick={() => setAssistantOpen(true)} />
    </div>
  );
}
