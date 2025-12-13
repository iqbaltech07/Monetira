import { formatCurrency } from "~/lib/utils";
import type { ElementType } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";

/* =========================
 *  Util: Format & Helpers
 * ========================= */

const formatSignedPrice = (amount: number, type: TransactionType) => {
  const abs = Math.abs(amount);
  const prefix = type === "income" ? "+" : "-";
  const className =
    type === "income"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400";
  return { text: `${prefix} ${formatCurrency(abs)}`, className };
};

const formatDateTimeID = (iso: string) => {
  const d = new Date(iso);
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
 *  Types
 * ========================= */

type TransactionType = "income" | "expense";

type Category =
  | "gaji"
  | "freelance"
  | "makanan"
  | "transportasi"
  | "hiburan"
  | "tagihan"
  | "lainnya";

export interface HistoryTransaction {
  id: string;
  title: string;
  category: Category;
  icon: ElementType;
  type: TransactionType;
  amount: number;
  date: string; // ISO string: "2025-10-01T09:30:00+07:00"
}

/* =========================
 *  Badge Color Mapping
 * ========================= */

const categoryColorMap: Record<Category, string> = {
  gaji: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  freelance:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  makanan:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  transportasi:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
  hiburan: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
  tagihan:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  lainnya: "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300",
};

/* =========================
 *  Component
 * ========================= */

const TransactionRowHistory = ({ item }: { item: HistoryTransaction }) => {
  const { text, className } = formatSignedPrice(item.amount, item.type);
  const badgeColor = categoryColorMap[item.category];

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
            item.type === "income"
              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
          }`}
        >
          <item.icon aria-hidden />
        </span>

        <div className="flex flex-col">
          <p className="font-medium text-slate-900 dark:text-slate-100">
            {item.title}
          </p>

          <div className="flex items-center gap-2 text-sm mt-1">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${badgeColor}`}
            >
              {item.category}
            </span>

            <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <FaRegCalendarAlt aria-hidden className="h-3.5 w-3.5" />
              <span>{formatDateTimeID(item.date)}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className={`font-semibold tabular-nums ${className}`}>{text}</p>
      </div>
    </div>
  );
};

export default TransactionRowHistory;
