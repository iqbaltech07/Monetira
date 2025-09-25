import * as React from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

const financialGoals = [
  { id: "saving", label: "Menabung Rutin" },
  { id: "investing", label: "Investasi" },
  { id: "debt-free", label: "Bebas Hutang" },
  { id: "buy-house", label: "Beli Rumah" },
  { id: "traveling", label: "Liburan & Jalan-jalan" },
  { id: "emergency-fund", label: "Dana Darurat" },
];

export const StepPersonalization = () => {
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([]);

  const handleGoalChange = (goalId: string) => {
    setSelectedGoals((prev) => {
      const isSelected = prev.includes(goalId);
      if (isSelected) {
        return prev.filter((id) => id !== goalId);
      }
      if (prev.length < 3) {
        return [...prev, goalId];
      }
      return prev;
    });
  };

  return (
    <div className="grid gap-4 pt-2 animate-in fade-in-0 duration-500">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">Sedikit Tentang Anda</h1>
        <p className="text-balance text-muted-foreground text-sm">
          Ini akan membantu kami memberikan insight yang lebih baik.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="age">Usia</Label>
        <Input id="age" type="number" placeholder="25" className="max-w-24" />
      </div>
      <div className="grid gap-2">
        <Label>Tujuan Keuangan (Pilih maks. 3)</Label>
        <div className="grid grid-cols-2 gap-4">
          {financialGoals.map((goal) => (
            <div key={goal.id} className="flex items-center space-x-2">
              <Checkbox
                id={goal.id}
                onCheckedChange={() => handleGoalChange(goal.id)}
                checked={selectedGoals.includes(goal.id)}
                disabled={
                  !selectedGoals.includes(goal.id) && selectedGoals.length >= 3
                }
              />
              <Label
                htmlFor={goal.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {goal.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="motivation">Motivasi Keuangan Anda</Label>
        <Textarea
          id="motivation"
          placeholder="Contoh: Ingin pensiun dini, menyiapkan pendidikan anak..."
        />
      </div>
    </div>
  );
};
