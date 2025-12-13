"use client";

import { format, startOfMonth, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "~/components/ui/chart";
import { useMediaQuery } from "~/hooks/use-media-query";
import { formatCurrency, type Transaction } from "~/lib/utils";
import { CustomChartTooltip } from "./CustomChartTooltip";

const chartConfig = {
  income: {
    label: "Pemasukan",
    color: "var(--chart-2)",
  },
  expense: {
    label: "Pengeluaran",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

export function IncomeExpenseChart({ data }: { data: Transaction[] }) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const chartData = useMemo(() => {
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
    const monthlyMap = new Map<
      string,
      { month: string; income: number; expense: number }
    >();

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, "yyyy-MM");
      const monthLabel = format(date, "MMM", { locale: id });
      monthlyMap.set(monthKey, { month: monthLabel, income: 0, expense: 0 });
    }

    for (const tx of data) {
      if (tx.date >= sixMonthsAgo) {
        const monthKey = format(tx.date, "yyyy-MM");
        const entry = monthlyMap.get(monthKey);
        if (entry) {
          if (tx.type === "INCOME") {
            entry.income += tx.amount;
          } else {
            entry.expense += tx.amount;
          }
        }
      }
    }

    return Array.from(monthlyMap.values());
  }, [data]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: isMobile ? -10 : 12,
            right: isMobile ? 10 : 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            interval={isMobile ? 1 : 0}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={isMobile ? 80 : 110}
            tickFormatter={formatCurrency}
          />
          <ChartTooltip cursor={false} content={<CustomChartTooltip />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="income" fill="var(--color-income)" radius={4} />
          <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

console.log("Hello World");
