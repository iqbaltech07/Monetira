import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ExpenseCategoryChart } from "./ExpenseCategoryChart";

interface ExpenseCategoryCardProps {
  data: {
    category: string;
    value: number;
    color: string;
  }[];
}

export function ExpenseCategoryCard({ data }: ExpenseCategoryCardProps) {
  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 h-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
          Kategori Pengeluaran
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ExpenseCategoryChart data={data} />
      </CardContent>
    </Card>
  );
}
