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
    <Card className="shadow-slate-300/40 shadow-xl border-0 h-full">
      <CardHeader>
        <CardTitle>Kategori Pengeluaran</CardTitle>
      </CardHeader>
      <CardContent>
        <ExpenseCategoryChart data={data} />
      </CardContent>
    </Card>
  );
}
