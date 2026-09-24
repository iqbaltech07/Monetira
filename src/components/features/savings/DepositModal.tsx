"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useMonetira } from "~/lib/store/monetira-context";
import { formatCurrency } from "~/lib/utils";
import type { Saving } from "~/types/database";

interface DepositModalProps {
  saving: Saving | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_AMOUNTS = [50000, 100000, 250000, 500000, 1000000];

export function DepositModal({
  saving,
  open,
  onOpenChange,
}: DepositModalProps) {
  const { depositSaving, withdrawSaving, mainBalance } = useMonetira();
  const [type, setType] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState<number>(100000);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setType("deposit");
      setAmount(100000);
      setErrorMessage(null);
    }
  }, [open]);

  if (!saving) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setErrorMessage(null);

    if (type === "deposit") {
      // Phase 3: Pure ledger Transfer from Saldo Utama to Savings Account
      const result = depositSaving(saving.id, amount);
      if (!result.success) {
        setErrorMessage(result.error || "Gagal menyetor dana ke tabungan.");
        return;
      }
    } else {
      // Phase 3: Pure ledger Transfer from Savings Account to Saldo Utama
      const result = withdrawSaving(saving.id, amount);
      if (!result.success) {
        setErrorMessage(result.error || "Gagal menarik dana dari tabungan.");
        return;
      }
    }

    onOpenChange(false);
  };

  const previewAmount =
    type === "deposit"
      ? saving.current_amount + (amount || 0)
      : Math.max(0, saving.current_amount - (amount || 0));

  const previewProgress = Math.min(
    100,
    Math.round((previewAmount / (saving.target_amount || 1)) * 100),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{saving.emoji || "💰"}</span>
            <span>{saving.name}</span>
          </DialogTitle>
          <DialogDescription>
            Atur pemasukan dana atau penarikan saldo untuk target ini.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selector: Setor vs Tarik */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setType("deposit");
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              type === "deposit"
                ? "bg-white text-emerald-600 shadow-xs dark:bg-slate-900 dark:text-emerald-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            Setor Tabungan
          </button>
          <button
            type="button"
            onClick={() => {
              setType("withdraw");
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              type === "withdraw"
                ? "bg-white text-rose-600 shadow-xs dark:bg-slate-900 dark:text-rose-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <ArrowDownLeft className="h-4 w-4" />
            Tarik Dana
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label
              htmlFor="deposit-amount-input"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Nominal {type === "deposit" ? "Setoran" : "Penarikan"} (Rp)
            </label>
            <div className="mt-1.5">
              <Input
                id="deposit-amount-input"
                type="number"
                min="1000"
                step="1000"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Contoh: 100000"
                className="text-base font-semibold"
                required
              />
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                  amount === val
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                +{formatCurrency(val)}
              </button>
            ))}
          </div>

          {/* Live Preview Card */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Estimasi Saldo Setelah Aksi</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {previewProgress}% Target
              </span>
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(previewAmount)}{" "}
              <span className="text-xs font-normal text-slate-500">
                / {formatCurrency(saving.target_amount)}
              </span>
            </p>
            {type === "deposit" && (
              <p className="text-xs text-slate-400 border-t border-slate-200/80 dark:border-slate-800 pt-2">
                Saldo Utama tersedia:{" "}
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {formatCurrency(mainBalance)}
                </span>
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50">
              {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            className={`w-full h-11 font-semibold text-white ${
              type === "deposit"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {type === "deposit"
              ? "Konfirmasi Setor Dana"
              : "Konfirmasi Tarik Dana"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
