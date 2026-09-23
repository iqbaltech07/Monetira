"use client";

import { Edit3, Trash2, CalendarDays, Target } from "lucide-react";
import { formatCurrency } from "~/lib/utils";
import { Progress } from "~/components/ui/progress";
import type { Saving, SavingStatus } from "~/types/database";

interface SavingCardProps {
  item: Saving;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/* =========================
 * Helper Components
 * ========================= */

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
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
};

/* =========================
 * Main Component
 * ========================= */

const SavingCard = ({ item, onEdit, onDelete }: SavingCardProps) => {
  // Hitung persentase progress (cegah pembagian nol)
  const progress =
    item.target_amount > 0
      ? Math.min((item.current_amount / item.target_amount) * 100, 100)
      : 0;

  // Hitung sisa hari (jika deadline ada)
  const getDaysLeft = () => {
    if (!item.deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(item.deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} hari lagi` : "Jatuh tempo";
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {/* HEADER: Emoji + Title + Actions */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3">
          {/* Emoji Container */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-xl shadow-inner dark:bg-slate-800">
            {item.emoji || "💰"}
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
              {item.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={item.status} />
              {item.deadline && (
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <CalendarDays className="h-3 w-3" />
                  {getDaysLeft()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons (Opacity 0 -> 100 on hover untuk kesan bersih) */}
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={() => onEdit?.(item.id)}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit Tabungan"
          >
            <Edit3 size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(item.id)}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Hapus Tabungan"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* BODY: Money Info */}
      <div className="mb-4 space-y-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Terkumpul
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(item.current_amount)}
          </span>
          <span className="text-sm text-slate-400 font-medium">
            / {formatCurrency(item.target_amount)}
          </span>
        </div>
      </div>

      {/* FOOTER: Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium">
          <span
            className={progress >= 100 ? "text-emerald-600" : "text-blue-600"}
          >
            {progress.toFixed(1)}%
          </span>
          {progress < 100 ? (
            <span className="text-slate-400">
              Kurang {formatCurrency(item.target_amount - item.current_amount)}
            </span>
          ) : (
            <span className="text-emerald-600 flex items-center gap-1">
              <Target size={12} /> Tercapai!
            </span>
          )}
        </div>

        {/* Progress Component (Shadcn UI) */}
        <Progress
          value={progress}
          className="h-2.5 bg-slate-100 dark:bg-slate-800"
          // Tips: Anda bisa custom color indicator di global.css atau inline style jika perlu warna dinamis
          indicatorClassName={
            progress >= 100 ? "bg-emerald-500" : "bg-blue-600"
          }
        />
      </div>
    </div>
  );
};

export default SavingCard;
