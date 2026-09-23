import { BiMoney } from "react-icons/bi";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import ButtonNewTransaction from "~/components/features/transactions/ButtonNewTransaction";
import SearchFilterTransaction from "~/components/features/transactions/SearchFilterTransaction";
import TransactionRowHistory from "~/components/features/transactions/TransactionRowHistory";
import type { StatCardProps } from "~/components/shared/StatCard";
import { StatCard } from "~/components/shared/StatCard";
import { getCategories, getTransactions } from "~/lib/dummy-data";
import { formatCurrency } from "~/lib/utils";

export default async function TransactionPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

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
    <div>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {summaryData.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <SearchFilterTransaction className="flex-1" />
          <div className="shrink-0">
            <ButtonNewTransaction categories={categories} />
          </div>
        </div>

        <section className="rounded-xl border border-slate-200/80 bg-white py-5 px-4 md:px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h4 className="mb-4 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            Riwayat Transaksi
          </h4>

          <div className="flex w-full flex-col gap-3">
            {transactions.map((tx) => (
              <TransactionRowHistory key={tx.id} item={tx} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
