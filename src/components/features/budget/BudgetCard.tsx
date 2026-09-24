"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit2,
  MoreVertical,
  Trash2,
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
import type { Budget, BudgetStatus } from "~/types/database";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
}

export function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const { getBudgetSpending, deleteBudget } = useMonetira();
  const spending = getBudgetSpending(budget);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const getStatusBadge = (status: BudgetStatus, label: string) => {
    switch (status) {
      case "NOT_USED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="w-3 h-3" />
            {label}
          </span>
        );
      case "ON_TRACK":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
            <CheckCircle2 className="w-3 h-3" />
            {label}
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50">
            <AlertTriangle className="w-3 h-3" />
            {label}
          </span>
        );
      case "EXCEEDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50">
            <AlertTriangle className="w-3 h-3" />
            {label}
          </span>
        );
    }
  };

  const getProgressColor = (status: BudgetStatus) => {
    switch (status) {
      case "NOT_USED":
        return "bg-slate-300 dark:bg-slate-700";
      case "ON_TRACK":
        return "bg-emerald-500";
      case "WARNING":
        return "bg-amber-500";
      case "EXCEEDED":
        return "bg-rose-500";
    }
  };

  const progressPercentage = Math.min(spending.percentage, 100);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {budget.category?.name || "Kategori"}
            </h4>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              {budget.period === "MONTHLY" ? "Bulanan" : "Mingguan"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Batas:{" "}
            <span className="font-semibold">
              {formatCurrency(budget.amount)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {getStatusBadge(spending.status, spending.statusLabel)}

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
              <DropdownMenuItem onClick={() => onEdit(budget)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Anggaran
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
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400">
            Terpakai:{" "}
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(spending.spent)}
            </span>
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {spending.percentage}%
          </span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(spending.status)}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
          <span>
            {spending.status === "EXCEEDED"
              ? `Melebihi budget sebesar ${formatCurrency(spending.spent - budget.amount)}`
              : `Sisa anggaran: ${formatCurrency(spending.remaining)}`}
          </span>
        </div>
      </div>

      {confirmDelete && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-rose-600 dark:rose-400 font-medium">
            Hapus anggaran ini?
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
              onClick={() => deleteBudget(budget.id)}
            >
              Hapus
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
