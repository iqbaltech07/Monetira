import { DashboardContent } from "~/components/features/dashboard/DashboardContent";
import { getCategories, getSavings, getTransactions } from "~/lib/dummy-data";

export default async function DashboardPage() {
  const [transactions, savings] = await Promise.all([
    getTransactions(),
    getSavings(),
    getCategories(),
  ]);

  // Calculate total balance from all transactions
  const totalIncome = transactions
    .filter((t) => t.type === "Income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "Expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const userBalance = totalIncome - totalExpense;

  return (
    <DashboardContent
      transactions={transactions}
      savings={savings}
      userBalance={userBalance}
    />
  );
}
