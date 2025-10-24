import { BiMoney } from "react-icons/bi";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import ButtonNewTransaction from "~/components/features/transactions/ButtonNewTransaction";
import SearchFilterTransaction from "~/components/features/transactions/SearchFilterTransaction";
import { TransactionHistoryCard } from "~/components/features/transactions/TransactionHistoryCard";
import TransactionRowHistory, {
  HistoryTransaction,
} from "~/components/features/transactions/TransactionRowHistory";
import { PageHeader } from "~/components/shared/PageHeader";
import type { StatCardProps } from "~/components/shared/StatCard";
import { StatCard } from "~/components/shared/StatCard";

const summaryData: StatCardProps[] = [
  {
    title: "Total Pemasukan",
    description: "Semua dana masuk pada periode ini.",
    amount: "Rp 200.500.000",
    icon: FaArrowTrendUp,
    variant: "success",
  },
  {
    title: "Total Pengeluaran",
    description: "Semua dana keluar pada periode ini.",
    amount: "Rp 3.000.000",
    icon: FaArrowTrendDown,
    variant: "danger",
  },
  {
    title: "Net Flow",
    description: "Selisih pemasukan dan pengeluaran.",
    amount: "Rp 4.500.000",
    icon: BiMoney,
    variant: "primary",
  },
];

const historyTransactions: HistoryTransaction[] = [
  {
    id: "trx_1",
    title: "Gaji Bulanan",
    category: "gaji",
    icon: FaArrowTrendUp,
    type: "income",
    amount: 15_000_000,
    date: "2025-10-01T09:30:00+07:00",
  },
  {
    id: "trx_2",
    title: "Makan Siang",
    category: "makanan",
    icon: FaArrowTrendDown,
    type: "expense",
    amount: 45_000,
    date: "2025-10-03",
  },
  {
    id: "trx_3",
    title: "Project Freelance",
    category: "freelance",
    icon: FaArrowTrendUp,
    type: "income",
    amount: 3_500_000,
    date: "2025-10-05",
  },
  {
    id: "trx_4",
    title: "Transport Online",
    category: "transportasi",
    icon: FaArrowTrendDown,
    type: "expense",
    amount: 27_000,
    date: "2025-10-06",
  },
];

/** =========================
 *  Page
 *  ======================= */

export default function TransactionPage() {
  return (
    <div>
      <PageHeader
        title="Transaksi"
        description="Kelola semua transaksi keuangan Anda"
      >
        <ButtonNewTransaction />
      </PageHeader>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {summaryData.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </div>

        <div className="my-2">
          <SearchFilterTransaction />
        </div>

        <section className="rounded-lg bg-white py-4 px-6 shadow-xl shadow-slate-300/40 dark:bg-slate-900">
          <h4 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Riwayat Transaksi
          </h4>

          <div className="flex w-full flex-col gap-4">
            {historyTransactions.map((tx) => (
              <TransactionRowHistory key={tx.id} item={tx} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
