import { formatCurrency } from "~/lib/utils";
import type { ElementType } from "react";
import {
  Calendar,
  Edit3,
  Trash2,
  ArrowDown,
  ArrowLeftRight,
  Wallet,
  Laptop,
  TrendingUp,
  Utensils,
  Car,
  Home,
  Film,
  ShoppingBag,
  HeartPulse,
  BookOpen,
} from "lucide-react";
import { useMonetira } from "~/lib/store/monetira-context";
import type { Transaction, TransactionType } from "~/types/database";

/* =========================
 * Util: Format & Helpers
 * ========================= */

const formatSignedPrice = (amount: number, type: TransactionType) => {
  const abs = Math.abs(amount);
  if (type === "Transfer") {
    return {
      text: `⇄ ${formatCurrency(abs)}`,
      className: "text-blue-600 dark:text-blue-400 font-semibold",
    };
  }
  const prefix = type === "Income" ? "+" : "-";
  const className =
    type === "Income"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";
  return { text: `${prefix} ${formatCurrency(abs)}`, className };
};

const formatDateTimeID = (date: Date) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
};

/* =========================
 * Icon Mapping
 * ========================= */
const iconMap: Record<string, ElementType> = {
  Wallet,
  Laptop,
  TrendingUp,
  Utensils,
  Car,
  Home,
  Film,
  ShoppingBag,
  HeartPulse,
  BookOpen,
};

interface TransactionRowHistoryProps {
  item: Transaction;
  onEdit?: (item: Transaction) => void;
  onDelete?: (id: string) => void;
}

const TransactionRowHistory = ({
  item,
  onEdit,
  onDelete,
}: TransactionRowHistoryProps) => {
  const { accounts } = useMonetira();
  const { text, className } = formatSignedPrice(item.amount, item.type);

  const sourceAcc = accounts.find(
    (a) => a.id === (item.source_account_id || item.account_id),
  );
  const destAcc = accounts.find((a) => a.id === item.destination_account_id);

  // Determine icon
  const Icon =
    item.type === "Transfer"
      ? ArrowLeftRight
      : item.category?.icon && iconMap[item.category.icon]
        ? iconMap[item.category.icon]
        : item.type === "Income"
          ? TrendingUp
          : ArrowDown;

  const categoryColor =
    item.type === "Transfer"
      ? "text-blue-600 dark:text-blue-400 border-blue-400/40"
      : item.type === "Income"
        ? "text-emerald-700 dark:text-emerald-400 border-emerald-500/40"
        : "text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700";

  const transferLabel =
    sourceAcc && destAcc
      ? `⇄ ${sourceAcc.name} → ${destAcc.name}`
      : "⇄ Transfer";

  return (
    <div className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:px-4 sm:py-3.5 gap-2.5 sm:gap-3">
      {/* LEFT SECTION: Icon + Info */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0">
        {/* Icon Wrapper */}
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${
            item.type === "Transfer"
              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              : item.type === "Income"
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                : "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
          }`}
        >
          <Icon aria-hidden className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>

        {/* Text Details */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <p className="truncate text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
            {item.type === "Transfer"
              ? item.note ||
                `Transfer: ${sourceAcc?.name || "Saldo Utama"} → ${destAcc?.name || "Tabungan"}`
              : item.note || item.category?.name || "Transaksi"}
          </p>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {/* Category Indicator */}
            <span
              className={`inline-flex shrink-0 items-center text-[10px] sm:text-xs font-semibold tracking-wide border-b pb-0.5 ${categoryColor}`}
            >
              {item.type === "Transfer"
                ? transferLabel
                : item.category?.name || "Umum"}
            </span>

            {/* Date */}
            <span className="flex items-center gap-1 truncate text-[11px] text-slate-400">
              <Calendar aria-hidden className="h-3 w-3 shrink-0" />
              <span>{formatDateTimeID(item.date)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Price & Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 pl-1">
        <p
          className={`text-xs sm:text-base font-bold tabular-nums ${className}`}
        >
          {text}
        </p>

        {/* Actions */}
        <div className="flex items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit?.(item)}
            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            title="Edit Transaksi"
          >
            <Edit3 size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(item.id)}
            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Hapus Transaksi"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionRowHistory;
