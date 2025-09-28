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
import { mockTransactions } from "~/lib/placeholder-data";
import type { Transaction } from "~/lib/utils";

const summaryData = [
  {
    title: "Total Saldo",
    amount: "Rp. 25.700.000",
    icon: BiSolidWallet,
    variant: "primary",
  },
  {
    title: "Pemasukan",
    amount: "Rp 7.500.000",
    icon: FaArrowTrendUp,
    variant: "success",
  },
  {
    title: "Pengeluaran",
    amount: "Rp 3.250.000",
    icon: FaArrowTrendDown,
    variant: "danger",
  },
];

const getTransactions = async (): Promise<Transaction[]> => {
  console.log("Menggunakan mock data untuk development.");
  return mockTransactions;
};

export default async function DashboardPage() {
  const transactions = await getTransactions();

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div>
        <h1 className="font-poppins text-3xl font-bold md:text-4xl">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2 font-medium text-base md:text-lg">
          Berikut adalah ringkasan keuangan Anda bulan ini.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {summaryData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            amount={item.amount}
            icon={item.icon}
            variant={item.variant as "primary" | "success" | "danger"}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="min-w-0 lg:col-span-7">
          <Card className="h-full shadow-xl shadow-slate-300/40 border-0">
            <CardHeader>
              <CardTitle>Grafik Pemasukan dan Pengeluaran</CardTitle>
              <CardDescription>Ringkasan 6 bulan terakhir.</CardDescription>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart data={transactions} />
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 lg:col-span-5">
          <ExpenseCategoryCard />
        </div>

        <div className="lg:col-span-12">
          <SavingsGoalCard />
        </div>
      </div>
    </div>
  );
}
