"use client";

import { AlertCircle, Plus, Trash2, Users } from "lucide-react";
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
import { useMonetira } from "~/lib/store/monetira-context";
import { formatCurrency } from "~/lib/utils";

interface ParticipantInput {
  name: string;
  amount: number | string;
  is_me: boolean;
}

interface SplitBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SplitBillModal({ open, onOpenChange }: SplitBillModalProps) {
  const { createSplitBill } = useMonetira();

  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState<number | string>("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [splitMode, setSplitMode] = useState<"EQUAL" | "CUSTOM">("EQUAL");

  const [participants, setParticipants] = useState<ParticipantInput[]>([
    { name: "Saya", amount: "", is_me: true },
    { name: "Teman 1", amount: "", is_me: false },
  ]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setTotalAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setNote("");
      setSplitMode("EQUAL");
      setParticipants([
        { name: "Saya", amount: "", is_me: true },
        { name: "Teman 1", amount: "", is_me: false },
      ]);
      setError(null);
    }
  }, [open]);

  // Recalculate amounts whenever totalAmount or participants count changes in EQUAL mode
  useEffect(() => {
    if (splitMode === "EQUAL" && totalAmount) {
      const numTotal = Number(totalAmount);
      if (
        Number.isFinite(numTotal) &&
        numTotal > 0 &&
        participants.length > 0
      ) {
        const share = Math.round(numTotal / participants.length);
        setParticipants((prev) =>
          prev.map((p, idx) => {
            // Adjust last participant for remainder rounding
            if (idx === prev.length - 1) {
              const assignedSoFar = share * (prev.length - 1);
              return { ...p, amount: numTotal - assignedSoFar };
            }
            return { ...p, amount: share };
          }),
        );
      }
    }
  }, [totalAmount, participants.length, splitMode]);

  const handleAddParticipant = () => {
    const nextNum = participants.length + 1;
    setParticipants((prev) => [
      ...prev,
      { name: `Teman ${nextNum - 1}`, amount: "", is_me: false },
    ]);
  };

  const handleRemoveParticipant = (index: number) => {
    if (participants.length <= 2) {
      setError("Split bill membutuhkan minimal 2 partisipan.");
      return;
    }
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleParticipantChange = (
    index: number,
    field: keyof ParticipantInput,
    value: string | number | boolean,
  ) => {
    setParticipants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const currentParticipantSum = participants.reduce((sum, p) => {
    const val = Number(p.amount);
    return sum + (Number.isFinite(val) ? val : 0);
  }, 0);

  const numTotal = Number(totalAmount) || 0;
  const difference = numTotal - currentParticipantSum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Judul tagihan tidak boleh kosong.");
      return;
    }

    if (numTotal <= 0) {
      setError("Total tagihan harus lebih dari 0.");
      return;
    }

    if (participants.length < 2) {
      setError("Minimal harus ada 2 partisipan.");
      return;
    }

    if (Math.abs(difference) > 1) {
      setError(
        `Total bagian partisipan (${formatCurrency(currentParticipantSum)}) tidak sama dengan total tagihan (${formatCurrency(numTotal)}). Selisih: ${formatCurrency(Math.abs(difference))}.`,
      );
      return;
    }

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.name.trim()) {
        setError(`Nama partisipan ke-${i + 1} tidak boleh kosong.`);
        return;
      }
      const pAmount = Number(p.amount);
      if (Number.isNaN(pAmount) || pAmount <= 0) {
        setError(`Nominal untuk ${p.name} harus berupa angka lebih dari 0.`);
        return;
      }
    }

    const res = createSplitBill({
      title: title.trim(),
      totalAmount: numTotal,
      date: date ? new Date(date) : new Date(),
      note: note.trim() || null,
      participants: participants.map((p) => ({
        name: p.name.trim(),
        amount: Number(p.amount),
        is_me: p.is_me,
      })),
    });

    if (!res.success) {
      setError(res.error || "Gagal membuat split bill.");
      return;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Bagi Tagihan (Split Bill)</DialogTitle>
              <DialogDescription className="text-xs">
                Bagi total tagihan dengan teman secara sama rata atau custom.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 text-xs text-rose-600 dark:rose-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="splitTitle">Acara / Judul Tagihan</Label>
            <Input
              id="splitTitle"
              placeholder="Contoh: Makan Siang Bersama di Resto Padang"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="splitTotal">Total Tagihan (Rp)</Label>
              <Input
                id="splitTotal"
                type="number"
                min="1000"
                step="1000"
                placeholder="Contoh: 300000"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="splitDate">Tanggal Tagihan</Label>
              <Input
                id="splitDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Mode Selector */}
          <div className="space-y-1.5">
            <Label>Metode Pembagian</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={splitMode === "EQUAL" ? "default" : "outline"}
                className="h-9 text-xs font-semibold"
                onClick={() => setSplitMode("EQUAL")}
              >
                Bagi Rata (Sama)
              </Button>
              <Button
                type="button"
                variant={splitMode === "CUSTOM" ? "default" : "outline"}
                className="h-9 text-xs font-semibold"
                onClick={() => setSplitMode("CUSTOM")}
              >
                Nominal Kustom
              </Button>
            </div>
          </div>

          {/* Participants list */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold">
                Daftar Partisipan ({participants.length} orang)
              </Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-purple-600 hover:text-purple-700"
                onClick={handleAddParticipant}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Tambah Orang
              </Button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {participants.map((p, index) => (
                <div
                  key={`part-${index}`}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
                >
                  <div className="flex-1 min-w-0">
                    <Input
                      className="h-8 text-xs font-medium"
                      placeholder="Nama Partisipan"
                      value={p.name}
                      onChange={(e) =>
                        handleParticipantChange(index, "name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      className="h-8 text-xs font-medium"
                      type="number"
                      placeholder="Nominal"
                      value={p.amount}
                      onChange={(e) =>
                        handleParticipantChange(index, "amount", e.target.value)
                      }
                      disabled={splitMode === "EQUAL"}
                      required
                    />
                  </div>
                  {p.is_me ? (
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 shrink-0">
                      Saya
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-rose-600 shrink-0"
                      onClick={() => handleRemoveParticipant(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Difference status */}
            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
              <span className="text-slate-600 dark:text-slate-400">
                Total Partisipan:{" "}
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(currentParticipantSum)}
                </span>
              </span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  Math.abs(difference) <= 1
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:rose-400"
                }`}
              >
                {Math.abs(difference) <= 1 ? (
                  "✓ Pas dengan tagihan"
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    Selisih: {formatCurrency(Math.abs(difference))}
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="splitNote">Catatan Tambahan (Opsional)</Label>
            <Input
              id="splitNote"
              placeholder="Contoh: Pembayaran ditransfer via QRIS"
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
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={numTotal <= 0 || Math.abs(difference) > 1}
            >
              Simpan Split Bill
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
