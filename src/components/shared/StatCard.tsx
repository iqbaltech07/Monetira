import type { ElementType } from "react";

export interface StatCardProps {
  title: string;
  description?: string;
  amount: string;
  icon: ElementType;
  variant?: "primary" | "success" | "danger" | "info";
  change?: string;
  changeColor?: "success" | "danger" | "primary" | "warning";
  changeDescription?: string;
}

// const _variantChangeStyles = {
//   primary: {
//     textColor: "text-primary",
//   },
//   success: {
//     textColor: "text-secondary-dark",
//   },
//   danger: {
//     textColor: "text-destructive",
//   },
//   warning: {
//     textColor: "text-chart-5",
//   },
// };

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
}: // changeColor = "primary",
StatCardProps) {
  const styles = variantStyles[variant];
  // const changeStyles = variantChangeStyles[changeColor];

  return (
    <div className="relative rounded-lg bg-white p-4 shadow-xl shadow-slate-300/40">
      {/* <div className="absolute -left-3 -top-3 rounded-[45%] bg-slate-100 p-2">
        <div
          className={`${styles.bgColor} rounded-full p-2 text-white shadow-lg ${styles.shadowColor}`}
        >
          <Icon size={28} />
        </div>
      </div> */}
      {/* <div className="text-right text-sm font-medium text-slate-500">
        <span className={`${changeStyles.textColor || "text-slate-500"} mr-1`}>
          {change}
        </span>
        {changeDescription}
      </div> */}

      <div className={`flex flex-col`}>
        <div
          className={`flex items-center justify-between gap-2 ${styles.textColor}`}
        >
          <h4 className="font-semibold text-xl text-zinc-600">{title}</h4>
          <Icon size={26} />
        </div>
        <p
          className={`mt-4 mb-2 text-2xl font-bold md:text-xl ${styles.textColor}`}
        >
          {amount}
        </p>
        <p className="text-muted-foreground text-sm font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}
