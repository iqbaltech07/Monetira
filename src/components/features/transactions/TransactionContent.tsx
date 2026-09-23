"use client";

import { BiMoney } from "react-icons/bi";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import ButtonNewTransaction from "~/components/features/transactions/ButtonNewTransaction";
import SearchFilterTransaction from "~/components/features/transactions/SearchFilterTransaction";
import TransactionRowHistory from "~/components/features/transactions/TransactionRowHistory";
import { StatCard, type StatCardProps } from "~/components/shared/StatCard";
import { useGsapReveal } from "~/lib/gsap";
import { formatCurrency } from "~/lib/utils";
import type { Category, Transaction } from "~/types/database";

interface TransactionContentProps {
  transactions: Transaction[];
  categories: Category[];
}

export function TransactionContent({
  transactions,
  categories,
}: TransactionContentProps) {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.06, y: 20 });

  const totalIncome = transactions
    .filter((t) => t.type === "Income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "Expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netFlow = totalIncome - totalExpense;

  const summaryData: StatCardProps[] = [
    {
      title: "Total Pemasukan",
      description: "Semua dana masuk pada periode ini.",
      amount: formatCurrency(totalIncome),
      icon: FaArrowTrendUp,
      variant: "success",
    },
    {
      title: "Total Pengeluaran",
      description: "Semua dana keluar pada periode ini.",
      amount: formatCurrency(totalExpense),
      icon: FaArrowTrendDown,
      variant: "danger",
    },
    {
      title: "Net Flow",
      description: "Selisih pemasukan dan pengeluaran.",
      amount: formatCurrency(netFlow),
      icon: BiMoney,
      variant: "primary",
    },
  ];

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      {/* Responsive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {summaryData.map((item, idx) => (
          <div
            key={item.title}
            className={`gsap-fade-up ${idx === 2 ? "sm:col-span-2 lg:col-span-1" : ""}`}
          >
            <StatCard {...item} />
          </div>
        ))}
      </div>

      {/* Filter and Action bar */}
      <div className="gsap-fade-up flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <SearchFilterTransaction className="flex-1" />
        <div className="shrink-0">
          <ButtonNewTransaction categories={categories} />
        </div>
      </div>

      {/* Transaction History Section */}
      <section className="gsap-fade-up rounded-2xl border border-slate-200/80 bg-white py-5 px-4 md:px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            Riwayat Transaksi
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {transactions.length} Transaksi Terdata
          </span>
        </div>

        <div className="flex w-full flex-col gap-2.5 sm:gap-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="gsap-fade-up">
              <TransactionRowHistory item={tx} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
