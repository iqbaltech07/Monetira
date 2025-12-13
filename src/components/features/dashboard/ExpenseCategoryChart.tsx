"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import type { mockCategoryExpenses } from "~/lib/placeholder-data";

interface ExpenseCategoryChartProps {
  data: typeof mockCategoryExpenses;
}

export function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    data.forEach((item) => {
      config[item.category] = {
        label: item.category,
        color: item.color,
      };
    });
    return config;
  }, [data]);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[300px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel nameKey="category" />}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="category"
          innerRadius={60}
          strokeWidth={5}
        >
          {data.map((entry) => (
            <Cell key={`cell-${entry.category}`} fill={entry.color} />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="category" />}
          className="flex-wrap gap-2 [&>*]:basis-auto [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
