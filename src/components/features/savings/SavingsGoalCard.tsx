import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { mockSavingsGoals } from "~/lib/placeholder-data";
import { SavingsGoalItem } from "./SavingsGoalItem";

export function SavingsGoalCard() {
  const savingsGoals = mockSavingsGoals;

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
          {savingsGoals.map((goal) => (
            <SavingsGoalItem key={goal.title} goal={goal} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
