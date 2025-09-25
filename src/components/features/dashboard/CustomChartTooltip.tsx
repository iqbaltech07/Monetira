"use client";

import type { TooltipProps } from "recharts";
import { formatCurrency } from "~/lib/utils";

type CustomTooltipProps = TooltipProps<number, string>;

export const CustomChartTooltip = ({
  active,
  payload,
  label,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="overflow-hidden rounded-lg border bg-background p-2 shadow-md">
        <p className="mb-1 font-medium">{label}</p>
        {payload.map((p, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: p.color || "#000" }}
              />
              <span>{p.name}</span>
            </div>

            <span className="font-medium" style={{ color: p.color || "#000" }}>
              {formatCurrency(p.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};
