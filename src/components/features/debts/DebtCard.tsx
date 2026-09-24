"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Edit2,
  History,
  MoreVertical,
  Trash2,
  Wallet,
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
import type { Debt } from "~/types/database";

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onPay: (debt: Debt) => void;
}

export function DebtCard({ debt, onEdit, onPay }: DebtCardProps) {
  const { deleteDebt } = useMonetira();
  const [showHistory, setShowHistory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwedByMe = debt.direction === "OWED_BY_ME";
  const isPaid = debt.status === "PAID" || debt.remaining_amount <= 0;
  const paidAmount = debt.original_amount - debt.remaining_amount;
  const progressPercent =
    debt.original_amount > 0
      ? Math.round((paidAmount / debt.original_amount) * 100)
      : 100;

  const getStatusBadge = () => {
    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/50">
          <CheckCircle2 className="w-3 h-3" />
          Lunas
        </span>
      );
    }
    if (debt.status === "PARTIAL") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/50">
          <History className="w-3 h-3" />
          Sebagian
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/50">
        <AlertCircle className="w-3 h-3" />
        Belum Lunas
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isOwedByMe
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
            }`}
          >
            {isOwedByMe ? (
              <CreditCard className="w-5 h-5" />
            ) : (
              <Wallet className="w-5 h-5" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-tight">
              {debt.person_name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  isOwedByMe
                    ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                }`}
              >
                {isOwedByMe ? "Hutang Saya (Bayar)" : "Piutang Saya (Terima)"}
              </span>
              {getStatusBadge()}
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
            <DropdownMenuItem onClick={() => onEdit(debt)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Informasi
            </DropdownMenuItem>
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

      {/* Note if any */}
      {debt.note && (
        <p className="text-xs text-slate-500 mb-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
          "{debt.note}"
        </p>
      )}

      {/* Progress & Numbers */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {isOwedByMe ? "Sisa Hutang:" : "Sisa Piutang:"}
          </span>
          <span
            className={`font-extrabold text-sm ${
              isOwedByMe
                ? "text-rose-600 dark:rose-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {formatCurrency(debt.remaining_amount)}
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOwedByMe ? "bg-rose-500" : "bg-emerald-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Total Pinjaman: {formatCurrency(debt.original_amount)}</span>
          <span>Terbayar: {progressPercent}%</span>
        </div>
      </div>

      {/* Due date and action button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {debt.due_date
              ? `Jatuh tempo: ${new Date(debt.due_date).toLocaleDateString(
                  "id-ID",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  },
                )}`
              : "Tanpa jatuh tempo"}
          </span>
        </div>

        {!isPaid ? (
          <Button
            size="sm"
            onClick={() => onPay(debt)}
            className={`h-8 px-3 text-xs font-semibold rounded-lg ${
              isOwedByMe
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isOwedByMe ? "Bayar Hutang" : "Terima Bayar"}
          </Button>
        ) : (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Lunas
          </span>
        )}
      </div>

      {/* Payment History Toggle */}
      {debt.payments && debt.payments.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full text-left text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <span>Riwayat Pembayaran ({debt.payments.length})</span>
            {showHistory ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showHistory && (
            <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-slate-200 dark:border-slate-700 text-xs">
              {debt.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center text-slate-600 dark:text-slate-400 py-0.5"
                >
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {formatCurrency(p.amount)}
                    </span>
                    {p.note && (
                      <span className="text-[11px] text-slate-400 block">
                        {p.note}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(p.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {confirmDelete && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-rose-600 dark:rose-400 font-medium">
            Hapus catatan ini?
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
              onClick={() => deleteDebt(debt.id)}
            >
              Hapus
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
