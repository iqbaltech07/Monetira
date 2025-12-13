import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { DetailedTransaction } from "~/lib/placeholder-data";

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function TransactionItem({ tx }: { tx: DetailedTransaction }) {
  const Icon = tx.icon;
  const isIncome = tx.type === "income";

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">{tx.title}</p>
          <p className="text-xs text-muted-foreground">
            {format(tx.date, "d MMMM yyyy", { locale: id })}
          </p>
        </div>
      </div>
      <p
        className={cn(
          "font-semibold text-sm md:text-base",
          isIncome ? "text-green-600" : "text-slate-800",
        )}
      >
        {isIncome ? "+" : "-"} {formatIDR(tx.amount)}
      </p>
    </div>
  );
}
