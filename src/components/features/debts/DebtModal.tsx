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
import type { Debt, DebtDirection } from "~/types/database";

interface DebtModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debtToEdit?: Debt | null;
}

export function DebtModal({ open, onOpenChange, debtToEdit }: DebtModalProps) {
  const { createDebt, updateDebt } = useMonetira();

  const [personName, setPersonName] = useState("");
  const [direction, setDirection] = useState<DebtDirection>("OWED_BY_ME");
  const [amount, setAmount] = useState<number | string>("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (debtToEdit) {
        setPersonName(debtToEdit.person_name);
        setDirection(debtToEdit.direction);
        setAmount(debtToEdit.original_amount);
        setDueDate(
          debtToEdit.due_date
            ? new Date(debtToEdit.due_date).toISOString().split("T")[0]
            : "",
        );
        setNote(debtToEdit.note || "");
      } else {
        setPersonName("");
        setDirection("OWED_BY_ME");
        setAmount("");
        setDueDate("");
        setNote("");
      }
      setError(null);
    }
  }, [open, debtToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = personName.trim();
    if (!trimmedName) {
      setError("Nama pihak terkait tidak boleh kosong.");
      return;
    }

    if (debtToEdit) {
      const res = updateDebt(debtToEdit.id, {
        personName: trimmedName,
        dueDate: dueDate ? new Date(dueDate) : null,
        note,
      });
      if (!res.success) {
        setError(res.error || "Gagal memperbarui catatan hutang/piutang.");
        return;
      }
    } else {
      const numAmount = Number(amount);
      if (Number.isNaN(numAmount) || numAmount <= 0) {
        setError("Masukkan nominal hutang/piutang yang valid (> 0).");
        return;
      }

      const res = createDebt({
        personName: trimmedName,
        direction,
        amount: numAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        note,
      });
      if (!res.success) {
        setError(res.error || "Gagal mencatat hutang/piutang.");
        return;
      }
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {debtToEdit
              ? "Edit Catatan Hutang / Piutang"
              : "Catat Hutang / Piutang Baru"}
          </DialogTitle>
          <DialogDescription>
            {debtToEdit
              ? "Perbarui informasi pihak terkait atau jatuh tempo."
              : "Catat kewajiban membayar (Hutang) atau hak menagih (Piutang)."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 text-xs text-rose-600 dark:rose-400">
              {error}
            </div>
          )}

          {!debtToEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="direction">Jenis Pencatatan</Label>
              <Select
                value={direction}
                onValueChange={(val) => setDirection(val as DebtDirection)}
              >
                <SelectTrigger id="direction" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWED_BY_ME">
                    🔴 Hutang Saya (Saya meminjam uang / harus bayar)
                  </SelectItem>
                  <SelectItem value="OWED_TO_ME">
                    🟢 Piutang Saya (Orang lain meminjam ke saya / akan terima)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="personName">
              {direction === "OWED_BY_ME"
                ? "Nama Pemberi Pinjaman / Rekan"
                : "Nama Peminjam / Rekan"}
            </Label>
            <Input
              id="personName"
              placeholder="Contoh: Budi Santoso"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              required
            />
          </div>

          {!debtToEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="amount">Nominal Pinjaman (Rp)</Label>
              <Input
                id="amount"
                type="number"
                min="1000"
                step="1000"
                placeholder="Contoh: 500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="dueDate">Jatuh Tempo (Opsional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Keterangan / Keperluan (Opsional)</Label>
            <Input
              id="note"
              placeholder="Contoh: Talangan tiket bioskop / beli buku"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
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
              {debtToEdit ? "Simpan Perubahan" : "Simpan Catatan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
