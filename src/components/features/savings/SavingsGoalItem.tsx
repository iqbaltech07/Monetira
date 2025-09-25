"use client";

import { format } from "date-fns";
import { Progress } from "~/components/ui/progress";
import type { SavingsGoal } from "~/lib/placeholder-data";
import { formatCurrency } from "~/lib/utils";

interface SavingsGoalItemProps {
  goal: SavingsGoal;
}

export function SavingsGoalItem({ goal }: SavingsGoalItemProps) {
  const progress = Math.min(
    (goal.currentAmount / goal.targetAmount) * 100,
    100,
  );

  return (
    <div>
      <div className="mb-2 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-sm md:text-base">{goal.title}</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(goal.currentAmount)} /{" "}
          {formatCurrency(goal.targetAmount)}
        </p>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <p>{progress.toFixed(1)}% tercapai</p>
        <p>Target: {format(goal.targetDate, "dd/MM/yyyy")}</p>
      </div>
    </div>
  );
}
