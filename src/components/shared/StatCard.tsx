import { Eye, EyeOff } from "lucide-react";
import type { ElementType } from "react";
import { Button } from "~/components/ui/button";

export interface StatCardProps {
  title: string;
  description?: string;
  amount: string;
  icon: ElementType;
  variant?: "primary" | "success" | "danger" | "info";
  change?: string;
  changeColor?: "success" | "danger" | "primary" | "warning";
  changeDescription?: string;
  isHidden?: boolean;
  onToggleHidden?: () => void;
  showEye?: boolean;
}

const variantStyles = {
  primary: {
    textColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-950/50",
  },
  success: {
    textColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
  },
  danger: {
    textColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-50 dark:bg-rose-950/50",
  },
  info: {
    textColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-50 dark:bg-purple-950/50",
  },
};

export function StatCard({
  title,
  description,
  amount,
  icon: Icon,
  variant = "primary",
  isHidden = false,
  onToggleHidden,
  showEye = false,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className="relative rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </h4>
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.iconBg} ${styles.textColor}`}
          >
            <Icon size={20} />
          </span>
        </div>
        <div className="mt-3 mb-1 flex items-baseline gap-2">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {isHidden ? "Rp ••••••••" : amount}
          </p>
          {showEye && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={onToggleHidden}
            >
              {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          )}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
