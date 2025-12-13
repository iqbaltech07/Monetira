import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Saving } from "~/types/database";
import { SavingsGoalItem } from "./SavingsGoalItem";

interface SavingsGoalCardProps {
  savings: Saving[];
}

export function SavingsGoalCard({ savings }: SavingsGoalCardProps) {
  return (
    <Card className="shadow-slate-300/40 shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
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
