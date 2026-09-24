"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useMonetira } from "~/lib/store/monetira-context";
import type { Budget, BudgetPeriod } from "~/types/database";

interface BudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetToEdit?: Budget | null;
}

export function BudgetModal({
  open,
  onOpenChange,
  budgetToEdit,
}: BudgetModalProps) {
  const { categories, createBudget, updateBudget } = useMonetira();

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState<number | string>("");
  const [period, setPeriod] = useState<BudgetPeriod>("MONTHLY");
  const [error, setError] = useState<string | null>(null);

  const expenseCategories = categories.filter((c) => c.type === "Expense");

  useEffect(() => {
    if (open) {
      if (budgetToEdit) {
        setCategoryId(budgetToEdit.category_id);
        setAmount(budgetToEdit.amount);
        setPeriod(budgetToEdit.period);
      } else {
        setCategoryId(expenseCategories[0]?.id || "");
        setAmount("");
        setPeriod("MONTHLY");
      }
      setError(null);
    }
  }, [open, budgetToEdit, expenseCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = Number(amount);
    if (!categoryId) {
      setError("Pilih kategori pengeluaran terlebih dahulu.");
      return;
    }
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      setError("Masukkan batas nominal anggaran yang valid (> 0).");
      return;
    }

    if (budgetToEdit) {
      const res = updateBudget(budgetToEdit.id, {
        categoryId,
        amount: numAmount,
        period,
      });
      if (!res.success) {
        setError(res.error || "Gagal memperbarui anggaran.");
        return;
      }
    } else {
      const res = createBudget({
        categoryId,
        amount: numAmount,
        period,
      });
      if (!res.success) {
        setError(res.error || "Gagal membuat anggaran baru.");
        return;
      }
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {budgetToEdit ? "Edit Anggaran" : "Atur Anggaran Baru"}
          </DialogTitle>
          <DialogDescription>
            {budgetToEdit
              ? "Perbarui batas pengeluaran untuk kategori ini."
              : "Tentukan batas pengeluaran untuk mengontrol arus kas Anda."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 text-xs text-rose-600 dark:rose-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="category">Kategori Pengeluaran</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Batas Anggaran (Rp)</Label>
            <Input
              id="amount"
              type="number"
              min="1000"
              step="1000"
              placeholder="Contoh: 1500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="period">Periode Anggaran</Label>
            <Select
              value={period}
              onValueChange={(val) => setPeriod(val as BudgetPeriod)}
            >
              <SelectTrigger id="period" className="w-full">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">
                  Bulanan (Per Bulan Kalender)
                </SelectItem>
                <SelectItem value="WEEKLY">Mingguan (Per 7 Hari)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" className="bg-primary text-white">
              {budgetToEdit ? "Simpan Perubahan" : "Buat Anggaran"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
