"use client";

import { CalendarDays, Edit3, PlusCircle, Target, Trash2 } from "lucide-react";
import { Progress } from "~/components/ui/progress";
import { formatCurrency } from "~/lib/utils";
import type { Saving, SavingStatus } from "~/types/database";

interface SavingCardProps {
  item: Saving;
  onEdit?: (item: Saving) => void;
  onDelete?: (id: string) => void;
  onDeposit?: (item: Saving) => void;
}

const StatusBadge = ({ status }: { status: SavingStatus }) => {
  const styles = {
    Active:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Completed:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Cancelled:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {status === "Active"
        ? "Berjalan"
        : status === "Completed"
          ? "Tercapai"
          : "Dibatalkan"}
    </span>
  );
};

const SavingCard = ({ item, onEdit, onDelete, onDeposit }: SavingCardProps) => {
  const progress =
    item.target_amount > 0
      ? Math.min((item.current_amount / item.target_amount) * 100, 100)
      : 0;

  const getDaysLeft = () => {
    if (!item.deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(item.deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} hari lagi` : "Jatuh tempo";
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {/* HEADER: Emoji + Title + Actions */}
      <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-xl shadow-inner dark:bg-slate-800">
            {item.emoji || "💰"}
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm sm:text-base">
              {item.name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <StatusBadge status={item.status} />
              {item.deadline && (
                <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <CalendarDays className="h-3 w-3" />
                  {getDaysLeft()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit?.(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors dark:hover:bg-blue-950/50"
            title="Edit Target"
          >
            <Edit3 size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(item.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-red-950/50"
            title="Hapus Target"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* BODY: Money Info */}
      <div className="mb-3 space-y-1">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Terkumpul
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(item.current_amount)}
          </span>
          <span className="text-xs text-slate-400 font-medium truncate">
            / {formatCurrency(item.target_amount)}
          </span>
        </div>
      </div>

      {/* FOOTER: Progress Bar & Deposit Action */}
      <div className="space-y-2.5 pt-1">
        <div className="flex justify-between text-xs font-semibold">
          <span
            className={
              progress >= 100
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-blue-600 dark:text-blue-400"
            }
          >
            {progress.toFixed(1)}%
          </span>
          {progress < 100 ? (
            <span className="text-slate-400 font-normal">
              Kurang {formatCurrency(item.target_amount - item.current_amount)}
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
              <Target size={12} /> Target Tercapai!
            </span>
          )}
        </div>

        <Progress
          value={progress}
          className="h-2 bg-slate-100 dark:bg-slate-800"
          indicatorClassName={
            progress >= 100 ? "bg-emerald-500" : "bg-blue-600"
          }
        />

        {/* Setor Dana Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => onDeposit?.(item)}
            className="w-full py-1.5 px-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-200 text-xs font-semibold text-slate-700 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Setor / Tarik Tabungan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavingCard;
