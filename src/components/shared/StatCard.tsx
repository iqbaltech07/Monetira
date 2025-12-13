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
    textColor: "text-primary",
    bgColor: "bg-primary",
    shadowColor: "shadow-primary-light-active",
  },
  success: {
    textColor: "text-secondary-dark",
    bgColor: "bg-secondary-dark",
    shadowColor: "shadow-secondary-light-active",
  },
  danger: {
    textColor: "text-destructive",
    bgColor: "bg-destructive",
    shadowColor: "shadow-destructive/30",
  },
  info: {
    textColor: "text-tertiary",
    bgColor: "bg-tertiary",
    shadowColor: "shadow-tertiary-light-active",
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
    <div className="relative rounded-lg bg-white p-4 shadow-xl shadow-slate-300/40 transition-all hover:shadow-slate-300/60">
      <div className="flex flex-col">
        <div
          className={`flex items-center justify-between gap-2 ${styles.textColor}`}
        >
          <h4 className="font-semibold text-xl text-zinc-600">{title}</h4>
          <Icon size={26} />
        </div>
        <div className="mt-4 mb-2 flex items-center gap-2">
          <p className={`text-2xl font-bold md:text-xl ${styles.textColor}`}>
            {isHidden ? "Rp ••••••••" : amount}
          </p>
          {showEye && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={onToggleHidden}
            >
              {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          )}
        </div>
        <p className="text-muted-foreground text-sm font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}
