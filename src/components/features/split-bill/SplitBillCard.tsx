"use client";

import {
  Calendar,
  CheckCircle2,
  Clock,
  MoreVertical,
  Receipt,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useMonetira } from "~/lib/store/monetira-context";
import { formatCurrency } from "~/lib/utils";
import type { SplitBill, SplitParticipant } from "~/types/database";

interface SplitBillCardProps {
  bill: SplitBill;
}

export function SplitBillCard({ bill }: SplitBillCardProps) {
  const { settleSplitParticipant, deleteSplitBill } = useMonetira();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const unpaidFriends = bill.participants.filter((p) => !p.is_me && !p.paid);
  const outstandingAmount = unpaidFriends.reduce((sum, p) => sum + p.amount, 0);
  const allSettled = bill.participants.every((p) => p.paid);

  const handleSettle = async (participant: SplitParticipant) => {
    setSettlingId(participant.id);
    try {
      settleSplitParticipant(bill.id, participant.id, false);
    } finally {
      setSettlingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-tight">
                {bill.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">
                  Total:{" "}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(bill.total_amount)}
                  </span>
                </span>
                {allSettled ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Lunas
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                    <Clock className="w-3 h-3" />
                    {unpaidFriends.length} belum lunas
                  </span>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-rose-600 focus:text-rose-600"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {bill.note && (
          <p className="text-xs text-slate-500 mb-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
            "{bill.note}"
          </p>
        )}

        {/* Outstanding summary if not all settled */}
        {!allSettled && (
          <div className="mb-3 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 flex justify-between items-center text-xs">
            <span className="text-purple-700 dark:text-purple-300 font-medium">
              Sisa Tertunda dari Teman:
            </span>
            <span className="font-extrabold text-purple-700 dark:text-purple-300">
              {formatCurrency(outstandingAmount)}
            </span>
          </div>
        )}

        {/* Participants list */}
        <div className="space-y-2 mb-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Rincian Bagian ({bill.participants.length} Partisipan)
          </div>

          <div className="space-y-1.5">
            {bill.participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {p.name}
                  </span>
                  {p.is_me && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 shrink-0">
                      Saya
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(p.amount)}
                  </span>

                  {p.paid ? (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Lunas
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-[11px] font-semibold rounded-md border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50"
                      onClick={() => handleSettle(p)}
                      disabled={settlingId === p.id}
                    >
                      <UserCheck className="w-3 h-3 mr-1" />
                      Terima Dana
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date(bill.date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <span>
            {allSettled ? "Semua telah lunas" : "Sebagian belum ditransfer"}
          </span>
        </div>

        {confirmDelete && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-rose-600 dark:rose-400 font-medium">
              Hapus split bill ini?
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setConfirmDelete(false)}
              >
                Batal
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs"
                onClick={() => deleteSplitBill(bill.id)}
              >
                Hapus
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
