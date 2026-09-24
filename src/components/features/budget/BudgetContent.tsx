"use client";

import {
  AlertCircle,
  CheckCircle2,
  Filter,
  PieChart,
  Plus,
  TrendingDown,
} from "lucide-react";
import { useMemo, useState } from "react";
import { BudgetCard } from "~/components/features/budget/BudgetCard";
import { BudgetModal } from "~/components/features/budget/BudgetModal";
import { StatCard } from "~/components/shared/StatCard";
import { Button } from "~/components/ui/button";
import { useGsapReveal } from "~/lib/gsap";
import { useMonetira } from "~/lib/store/monetira-context";
import { formatCurrency } from "~/lib/utils";
import type { Budget, BudgetPeriod } from "~/types/database";

export function BudgetContent() {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.05, y: 15 });
  const { budgets, getBudgetSpending } = useMonetira();

  const [modalOpen, setModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<"ALL" | BudgetPeriod>("ALL");

  const filteredBudgets = useMemo(() => {
    if (filterPeriod === "ALL") return budgets;
    return budgets.filter((b) => b.period === filterPeriod);
  }, [budgets, filterPeriod]);

  // Aggregate stats
  const {
    totalBudgeted,
    totalSpent,
    totalRemaining,
    exceededCount,
    warningCount,
  } = useMemo(() => {
    let bSum = 0;
    let sSum = 0;
    let rSum = 0;
    let exceeded = 0;
    let warning = 0;

    for (const b of budgets) {
      const res = getBudgetSpending(b);
      bSum += b.amount;
      sSum += res.spent;
      rSum += res.remaining;
      if (res.status === "EXCEEDED") exceeded += 1;
      if (res.status === "WARNING") warning += 1;
    }

    return {
      totalBudgeted: bSum,
      totalSpent: sSum,
      totalRemaining: rSum,
      exceededCount: exceeded,
      warningCount: warning,
    };
  }, [budgets, getBudgetSpending]);

  const handleOpenCreate = () => {
    setBudgetToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (budget: Budget) => {
    setBudgetToEdit(budget);
    setModalOpen(true);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-6 md:gap-8">
      <BudgetModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        budgetToEdit={budgetToEdit}
      />

      {/* Header Banner */}
      <div className="gsap-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 sm:p-6 text-white shadow-md">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-100 mb-1.5">
            <PieChart className="h-3.5 w-3.5 text-emerald-200 shrink-0" />
            <span className="border-b border-emerald-200/50 pb-0.5">
              Kelola Anggaran
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Perencanaan & Batas Pengeluaran
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mt-0.5">
            Kendalikan pos pengeluaran berdasarkan kategori agar arus kas Anda
            tetap sehat dan terarah.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl text-sm sm:text-base font-semibold bg-white text-emerald-700 hover:bg-emerald-50 shadow-sm cursor-pointer transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="size-4 sm:size-5" />
          <span>Atur Anggaran Baru</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="gsap-fade-up">
          <StatCard
            title="Total Anggaran"
            description={`${budgets.length} pos anggaran aktif`}
            amount={formatCurrency(totalBudgeted)}
            icon={PieChart}
            variant="primary"
          />
        </div>

        <div className="gsap-fade-up">
          <StatCard
            title="Total Terpakai"
            description="Realisasi pengeluaran dari transaksi"
            amount={formatCurrency(totalSpent)}
            icon={TrendingDown}
            variant="danger"
          />
        </div>

        <div className="gsap-fade-up">
          <StatCard
            title="Sisa Anggaran"
            description="Batas dana yang masih aman digunakan"
            amount={formatCurrency(totalRemaining)}
            icon={CheckCircle2}
            variant="success"
          />
        </div>

        <div className="gsap-fade-up">
          <StatCard
            title="Evaluasi Batas"
            description={
              exceededCount > 0
                ? `${exceededCount} pos melebihi batas!`
                : warningCount > 0
                  ? `${warningCount} pos mendekati batas`
                  : "Semua anggaran dalam batas aman"
            }
            amount={
              exceededCount > 0 ? `${exceededCount} Melebihi` : "Terkendali"
            }
            icon={exceededCount > 0 ? AlertCircle : CheckCircle2}
            variant={
              exceededCount > 0
                ? "danger"
                : warningCount > 0
                  ? "warning"
                  : "info"
            }
          />
        </div>
      </div>

      {/* Filter and Content Header */}
      <div className="gsap-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Daftar Anggaran
          </span>
          <span className="text-xs text-slate-400">
            ({filteredBudgets.length} kategori)
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
          <Button
            size="sm"
            variant={filterPeriod === "ALL" ? "default" : "ghost"}
            className="h-8 text-xs font-medium rounded-lg"
            onClick={() => setFilterPeriod("ALL")}
          >
            Semua
          </Button>
          <Button
            size="sm"
            variant={filterPeriod === "MONTHLY" ? "default" : "ghost"}
            className="h-8 text-xs font-medium rounded-lg"
            onClick={() => setFilterPeriod("MONTHLY")}
          >
            Bulanan
          </Button>
          <Button
            size="sm"
            variant={filterPeriod === "WEEKLY" ? "default" : "ghost"}
            className="h-8 text-xs font-medium rounded-lg"
            onClick={() => setFilterPeriod("WEEKLY")}
          >
            Mingguan
          </Button>
        </div>
      </div>

      {/* Budget Cards Grid */}
      {filteredBudgets.length === 0 ? (
        <div className="gsap-fade-up rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <PieChart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Belum ada anggaran
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
            Atur batas pengeluaran untuk kategori favorit Anda agar tidak
            terjadi pemborosan tanpa sadar.
          </p>
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Atur Anggaran Sekarang
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredBudgets.map((budget) => (
            <div key={budget.id} className="gsap-fade-up">
              <BudgetCard budget={budget} onEdit={handleEdit} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
