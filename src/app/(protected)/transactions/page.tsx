import { TransactionContent } from "~/components/features/transactions/TransactionContent";
import { getCategories, getTransactions } from "~/lib/dummy-data";

export default async function TransactionPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

  return (
    <TransactionContent transactions={transactions} categories={categories} />
  );
}
