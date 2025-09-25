import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { mockCategoryExpenses } from "~/lib/placeholder-data";
import { ExpenseCategoryChart } from "./ExpenseCategoryChart";

export function ExpenseCategoryCard() {
  const expenseData = mockCategoryExpenses;

  return (
    <Card className="shadow-slate-300/40 shadow-xl border-0">
      <CardHeader>
        <CardTitle>Kategori Pengeluaran</CardTitle>
      </CardHeader>
      <CardContent>
        <ExpenseCategoryChart data={expenseData} />
      </CardContent>
    </Card>
  );
}
