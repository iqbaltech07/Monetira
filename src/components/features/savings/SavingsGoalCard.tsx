import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Saving } from "~/types/database";
import { SavingsGoalItem } from "./SavingsGoalItem";

interface SavingsGoalCardProps {
  savings: Saving[];
}

export function SavingsGoalCard({ savings }: SavingsGoalCardProps) {
  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
          <Target className="h-5 w-5 text-primary" />
          <span>Target Tabungan</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {savings.map((goal) => (
            <SavingsGoalItem key={goal.id} goal={goal} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
