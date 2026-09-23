"use client";

import { BiTargetLock } from "react-icons/bi";
import { FaPiggyBank, FaStar } from "react-icons/fa6";
import ButtonNewTarget from "~/components/features/savings/ButtonNewTarget";
import SavingCard from "~/components/features/savings/SavingCard";
import { StatCard, type StatCardProps } from "~/components/shared/StatCard";
import { useGsapReveal } from "~/lib/gsap";
import { formatCurrency } from "~/lib/utils";
import type { Saving } from "~/types/database";

interface SavingsContentProps {
  savings: Saving[];
}

export function SavingsContent({ savings }: SavingsContentProps) {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.08, y: 20 });

  const totalSavings = savings.reduce(
    (acc, curr) => acc + curr.current_amount,
    0,
  );
  const activeTargets = savings.filter((s) => s.status === "Active").length;
  const completedTargets = savings.filter(
    (s) => s.status === "Completed",
  ).length;

  const summaryData: StatCardProps[] = [
    {
      title: "Total Tabungan",
      description: "Dari semua target bulanan",
      amount: formatCurrency(totalSavings),
      icon: FaPiggyBank,
      variant: "success",
      change: "+6.2%",
      changeColor: "success",
      changeDescription: "dari bulan lalu",
    },
    {
      title: "Target Aktif",
      description: `${activeTargets} Target sedang berjalan`,
      amount: formatCurrency(
        savings
          .filter((s) => s.status === "Active")
          .reduce((acc, curr) => acc + curr.target_amount, 0),
      ),
      icon: BiTargetLock,
      variant: "primary",
    },
    {
      title: "Target Tercapai",
      description: "Target yang telah selesai",
      amount: completedTargets.toString(),
      icon: FaStar,
      variant: "info",
    },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryData.map((item, idx) => (
          <div
            key={item.title}
            className={`gsap-fade-up ${idx === 2 ? "sm:col-span-2 lg:col-span-1" : ""}`}
          >
            <StatCard {...item} />
          </div>
        ))}
      </div>

      {/* Header and Action */}
      <div className="gsap-fade-up flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Daftar Target Saya
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Kelola dan pantau progres tabungan impian Anda
          </p>
        </div>
        <div className="shrink-0">
          <ButtonNewTarget />
        </div>
      </div>

      {/* Savings Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {savings.map((saving) => (
          <div key={saving.id} className="gsap-fade-up">
            <SavingCard item={saving} />
          </div>
        ))}
      </div>
    </div>
  );
}
