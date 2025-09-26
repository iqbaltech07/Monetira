import type { ElementType } from "react";

interface StatCardComponent {
  title: string;
  amount: string;
  icon: ElementType;
  variant?: "primary" | "success" | "danger";
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
};

export function StatCard({
  title,
  amount,
  icon: Icon,
  variant = "primary",
}: StatCardComponent) {
  const styles = variantStyles[variant];

  return (
    <div className="relative rounded-lg bg-white p-4 shadow-xl shadow-slate-300/40">
      <div className="absolute -left-3 -top-3 rounded-[45%] bg-slate-100 p-2">
        <div
          className={`${styles.bgColor} rounded-full p-2 text-white shadow-lg ${styles.shadowColor}`}
        >
          <Icon size={28} />
        </div>
      </div>
      <div className="text-right font-medium text-slate-500">Bulan ini</div>
      <div className="mt-6 flex flex-col">
        <h4 className="font-semibold text-lg text-slate-600">{title}</h4>
        <p
          className={`mt-4 text-2xl font-bold md:text-3xl ${styles.textColor}`}
        >
          {amount}
        </p>
      </div>
    </div>
  );
}
