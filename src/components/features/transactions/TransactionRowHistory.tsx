import { formatCurrency } from "~/lib/utils";
import type { ElementType } from "react";
import { Calendar } from "lucide-react";
import type { Transaction } from "~/types/database";
import {
  ArrowDown,
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

/* =========================
 * Util: Format & Helpers
 * ========================= */

const formatSignedPrice = (amount: number, type: "Income" | "Expense") => {
  const abs = Math.abs(amount);
  const prefix = type === "Income" ? "+" : "-";
  const className =
    type === "Income"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400";
  return { text: `${prefix} ${formatCurrency(abs)}`, className };
};

const formatDateTimeID = (date: Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

/* =========================
 * Icon Mapping
 * ========================= */
const iconMap: Record<string, ElementType> = {
  Wallet: Wallet,
  Laptop: Laptop,
  TrendingUp: TrendingUp,
  Utensils: Utensils,
  Car: Car,
  Home: Home,
  Film: Film,
  ShoppingBag: ShoppingBag,
  HeartPulse: HeartPulse,
  BookOpen: BookOpen,
};

/* =========================
 * Component
 * ========================= */

const TransactionRowHistory = ({ item }: { item: Transaction }) => {
  const { text, className } = formatSignedPrice(item.amount, item.type);

  // Determine icon
  const Icon =
    item.category?.icon && iconMap[item.category.icon]
      ? iconMap[item.category.icon]
      : item.type === "Income"
        ? TrendingUp
        : ArrowDown;

  // Determine badge color based on type for now, or category name if needed
  const badgeColor =
    item.type === "Income"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
      : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";

  return (
    <div className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:px-4 sm:py-3 gap-3">
      {/* LEFT SECTION: Icon + Info */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Icon Wrapper */}
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${
            item.type === "Income"
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
              : "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
          }`}
        >
          <Icon aria-hidden className="h-5 w-5 sm:h-6 sm:w-6" />
        </span>

        {/* Text Details */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-base">
            {item.note || item.category?.name || "Transaksi"}
          </p>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {/* Category Badge */}
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide ${badgeColor}`}
            >
              {item.category?.name || "Uncategorized"}
            </span>

            {/* Date */}
            <span className="flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
              <Calendar aria-hidden className="h-3.5 w-3.5 shrink-0" />
              <span>{formatDateTimeID(item.date)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Price */}
      <div className="text-right shrink-0 pl-1">
        <p
          className={`text-sm sm:text-base font-bold tabular-nums ${className}`}
        >
          {text}
        </p>
      </div>
    </div>
  );
};

export default TransactionRowHistory;
