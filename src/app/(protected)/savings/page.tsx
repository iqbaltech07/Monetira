import { BiTargetLock } from "react-icons/bi";
import { FaPiggyBank, FaStar } from "react-icons/fa6";
import ButtonNewTarget from "~/components/features/savings/ButtonNewTarget";
import { PageHeader } from "~/components/shared/PageHeader";
import type { StatCardProps } from "~/components/shared/StatCard";
import { StatCard } from "~/components/shared/StatCard";

const summaryData: StatCardProps[] = [
  {
    title: "Total Tabungan",
    description: "Dari semua target bulanan",
    amount: "Rp. 25.700.000",
    icon: FaPiggyBank,
    variant: "success",
    change: "+6.2%",
    changeColor: "success",
    changeDescription: "dari bulan lalu",
  },
  {
    title: "Target Aktif",
    description: "3 Target sedang berjalan",
    amount: "Rp 7.500.000",
    icon: BiTargetLock,
    variant: "primary",
  },
  {
    title: "Target Tercapai",
    description: "Target yang telah selesai",
    amount: "3",
    icon: FaStar,
    variant: "info",
  },
];

export default function SavingsPage() {
  return (
    <div>
      <PageHeader
        title="Tabungan & Target"
        description="Atur dan pantau target tabungan Anda"
      >
        <ButtonNewTarget />
      </PageHeader>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {summaryData.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </div>
        
      </div>
    </div>
  );
}
