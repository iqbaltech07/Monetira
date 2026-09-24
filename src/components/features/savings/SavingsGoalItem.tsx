"use client";

import { format } from "date-fns";
import { Progress } from "~/components/ui/progress";
import { formatCurrency } from "~/lib/utils";
import type { Saving } from "~/types/database";

interface SavingsGoalItemProps {
  goal: Saving;
}

export function SavingsGoalItem({ goal }: SavingsGoalItemProps) {
  // Guard: target_amount = 0 or missing → progress = 0 (avoids Infinity / NaN)
  const progress =
    goal.target_amount > 0
      ? Math.min(((goal.current_amount || 0) / goal.target_amount) * 100, 100)
      : 0;

  return (
    <div>
      <div className="mb-2 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-sm md:text-base flex items-center gap-2">
          {goal.emoji && <span>{goal.emoji}</span>}
          {goal.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(goal.current_amount)} /{" "}
          {formatCurrency(goal.target_amount)}
        </p>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <p>{progress.toFixed(1)}% tercapai</p>
        {goal.deadline && <p>Target: {format(goal.deadline, "dd/MM/yyyy")}</p>}
      </div>
    </div>
  );
}
