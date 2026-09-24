"use client";

import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
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
import { useMonetira } from "~/lib/store/monetira-context";
import { formatCurrency } from "~/lib/utils";
import type { Debt } from "~/types/database";

interface DebtPaymentModalProps {
  debt: Debt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DebtPaymentModal({
  debt,
  open,
  onOpenChange,
}: DebtPaymentModalProps) {
  const { payDebt, mainBalance } = useMonetira();

  const [amount, setAmount] = useState<number | string>("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && debt) {
      setAmount(debt.remaining_amount);
      setNote(
        debt.direction === "OWED_BY_ME"
          ? `Cicilan/Pelunasan hutang ke ${debt.person_name}`
          : `Penerimaan cicilan/pelunasan piutang dari ${debt.person_name}`,
      );
      setError(null);
    }
  }, [open, debt]);

  if (!debt) return null;

  const isOwedByMe = debt.direction === "OWED_BY_ME";

  const handlePreset = (fraction: number) => {
    const val = Math.round(debt.remaining_amount * fraction);
    setAmount(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = Number(amount);
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      setError("Masukkan nominal pembayaran yang valid.");
      return;
    }

    if (numAmount > debt.remaining_amount) {
      setError(
        `Nominal pembayaran melebihi sisa kewajiban (${formatCurrency(debt.remaining_amount)}).`,
      );
      return;
    }

    if (isOwedByMe && numAmount > mainBalance) {
      setError(
        `Saldo Utama Anda (${formatCurrency(mainBalance)}) tidak mencukupi untuk melakukan pembayaran ini.`,
      );
      return;
    }

    const res = payDebt(debt.id, numAmount, note);
    if (!res.success) {
      setError(res.error || "Gagal memproses transaksi pembayaran.");
      return;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`p-2 rounded-xl ${
                isOwedByMe
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                  : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
              }`}
            >
              {isOwedByMe ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownLeft className="h-5 w-5" />
              )}
            </div>
            <div>
              <DialogTitle>
                {isOwedByMe ? "Bayar Hutang" : "Terima Pembayaran Piutang"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isOwedByMe
                  ? `Pengeluaran dari Saldo Utama ke ${debt.person_name}`
                  : `Pemasukan ke Saldo Utama dari ${debt.person_name}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Info card */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3.5 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Pihak Terkait:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {debt.person_name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Pinjaman Awal:</span>
            <span className="text-slate-700 dark:text-slate-300">
              {formatCurrency(debt.original_amount)}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-200/60 dark:border-slate-800 pt-1.5 font-bold">
            <span className="text-slate-700 dark:text-slate-300">
              Sisa Kewajiban:
            </span>
            <span
              className={
                isOwedByMe
                  ? "text-rose-600 dark:rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }
            >
              {formatCurrency(debt.remaining_amount)}
            </span>
          </div>
          {isOwedByMe && (
            <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
              <span>Saldo Utama Tersedia:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {formatCurrency(mainBalance)}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 text-xs text-rose-600 dark:rose-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="payAmount">Nominal Pembayaran (Rp)</Label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePreset(0.5)}
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-700 underline"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(1.0)}
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-700 underline"
                >
                  Lunas (100%)
                </button>
              </div>
            </div>
            <Input
              id="payAmount"
              type="number"
              min="1000"
              max={debt.remaining_amount}
              step="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payNote">Catatan Pembayaran (Opsional)</Label>
            <Input
              id="payNote"
              placeholder="Contoh: Transfer bank via BCA"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className={
                isOwedByMe
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }
            >
              {isOwedByMe ? "Konfirmasi Bayar" : "Konfirmasi Terima Dana"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
