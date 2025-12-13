import { BiTargetLock } from "react-icons/bi";
import { FaPiggyBank, FaStar } from "react-icons/fa6";
import ButtonNewTarget from "~/components/features/savings/ButtonNewTarget";
import SavingCard from "~/components/features/savings/SavingCard";
import { StatCard, type StatCardProps } from "~/components/shared/StatCard";
import { getSavings } from "~/lib/dummy-data";
import { formatCurrency } from "~/lib/utils";

export default async function SavingsPage() {
  const savings = await getSavings();

  const totalSavings = savings.reduce(
    (acc, curr) => acc + curr.current_amount,
    0,
  );
  const activeTargets = savings.filter((s) => s.status === "Active").length;
  const completedTargets = savings.filter(
    (s) => s.status === "Completed",
  ).length;

  const summaryData: StatCardProps[] = [
    {
      title: "Total Tabungan",
      description: "Dari semua target bulanan",
      amount: formatCurrency(totalSavings),
      icon: FaPiggyBank,
      variant: "success",
      change: "+6.2%",
      changeColor: "success",
      changeDescription: "dari bulan lalu",
    },
    {
      title: "Target Aktif",
      description: `${activeTargets} Target sedang berjalan`,
      amount: formatCurrency(
        savings
          .filter((s) => s.status === "Active")
          .reduce((acc, curr) => acc + curr.target_amount, 0),
      ),
      icon: BiTargetLock,
      variant: "primary",
    },
    {
      title: "Target Tercapai",
      description: "Target yang telah selesai",
      amount: completedTargets.toString(),
      icon: FaStar,
      variant: "info",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryData.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Daftar Target Saya
        </h2>
        <ButtonNewTarget />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {savings.map((saving) => (
          <SavingCard key={saving.id} item={saving} />
        ))}
      </div>
    </div>
  );
}
