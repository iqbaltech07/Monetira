"use client";

import { CreditCard, Filter, HandCoins, Plus, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { DebtCard } from "~/components/features/debts/DebtCard";
import { DebtModal } from "~/components/features/debts/DebtModal";
import { DebtPaymentModal } from "~/components/features/debts/DebtPaymentModal";
import { StatCard } from "~/components/shared/StatCard";
import { Button } from "~/components/ui/button";
import { useGsapReveal } from "~/lib/gsap";
import { useMonetira } from "~/lib/store/monetira-context";
import { formatCurrency } from "~/lib/utils";
import type { Debt } from "~/types/database";

export function DebtsContent() {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.05, y: 15 });
  const { debts, debtSummary } = useMonetira();

  const [modalOpen, setModalOpen] = useState(false);
  const [debtToEdit, setDebtToEdit] = useState<Debt | null>(null);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [debtToPay, setDebtToPay] = useState<Debt | null>(null);

  const [filterTab, setFilterTab] = useState<
    "ALL" | "OWED_BY_ME" | "OWED_TO_ME" | "UNPAID" | "PAID"
  >("ALL");

  const filteredDebts = useMemo(() => {
    return debts.filter((d) => {
      if (filterTab === "ALL") return true;
      if (filterTab === "OWED_BY_ME") return d.direction === "OWED_BY_ME";
      if (filterTab === "OWED_TO_ME") return d.direction === "OWED_TO_ME";
      if (filterTab === "UNPAID") return d.remaining_amount > 0;
      if (filterTab === "PAID")
        return d.remaining_amount === 0 || d.status === "PAID";
      return true;
    });
  }, [debts, filterTab]);

  const handleOpenCreate = () => {
    setDebtToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (debt: Debt) => {
    setDebtToEdit(debt);
    setModalOpen(true);
  };

  const handlePay = (debt: Debt) => {
    setDebtToPay(debt);
    setPayModalOpen(true);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-6 md:gap-8">
      <DebtModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        debtToEdit={debtToEdit}
      />

      <DebtPaymentModal
        open={payModalOpen}
        onOpenChange={setPayModalOpen}
        debt={debtToPay}
      />

      {/* Header Banner */}
      <div className="gsap-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-5 sm:p-6 text-white shadow-md">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-100 mb-1.5">
            <HandCoins className="h-3.5 w-3.5 text-amber-200 shrink-0" />
            <span className="border-b border-amber-200/50 pb-0.5">
              Hutang & Piutang
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Pencatatan Kewajiban & Tagihan
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 max-w-lg mt-0.5">
            Catat pinjaman kepada rekan atau piutang yang harus Anda terima
            secara transparan dan terintegrasi dengan saldo utama.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl text-sm sm:text-base font-semibold bg-white text-amber-700 hover:bg-amber-50 shadow-sm cursor-pointer transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="size-4 sm:size-5" />
          <span>Catat Pinjaman Baru</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="gsap-fade-up">
          <StatCard
            title="Sisa Hutang Saya"
            description="Kewajiban yang belum dibayarkan"
            amount={formatCurrency(debtSummary.remainingOwedByMe)}
            icon={CreditCard}
            variant="danger"
          />
        </div>

        <div className="gsap-fade-up">
          <StatCard
            title="Sisa Piutang Saya"
            description="Uang Anda yang belum dikembalikan rekan"
            amount={formatCurrency(debtSummary.remainingOwedToMe)}
            icon={Wallet}
            variant="success"
          />
        </div>

        <div className="gsap-fade-up">
          <StatCard
            title="Total Hutang Awal"
            description="Total pokok hutang yang pernah dicatat"
            amount={formatCurrency(debtSummary.totalOwedByMe)}
            icon={CreditCard}
            variant="primary"
          />
        </div>

        <div className="gsap-fade-up">
          <StatCard
            title="Pinjaman Aktif"
            description="Catatan pinjaman yang belum lunas"
            amount={`${debtSummary.activeDebtsCount} Catatan`}
            icon={HandCoins}
            variant={debtSummary.activeDebtsCount > 0 ? "warning" : "info"}
          />
        </div>
      </div>

      {/* Filters and List */}
      <div className="gsap-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Daftar Catatan Pinjaman
          </span>
          <span className="text-xs text-slate-400">
            ({filteredDebts.length} catatan)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          <Button
            size="sm"
            variant={filterTab === "ALL" ? "default" : "ghost"}
            className="h-8 text-xs font-medium rounded-lg"
            onClick={() => setFilterTab("ALL")}
          >
            Semua
          </Button>
          <Button
            size="sm"
            variant={filterTab === "OWED_BY_ME" ? "default" : "ghost"}
            className="h-8 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400"
            onClick={() => setFilterTab("OWED_BY_ME")}
          >
            Hutang Saya
          </Button>
          <Button
            size="sm"
            variant={filterTab === "OWED_TO_ME" ? "default" : "ghost"}
            className="h-8 text-xs font-medium rounded-lg text-emerald-600 dark:text-emerald-400"
            onClick={() => setFilterTab("OWED_TO_ME")}
          >
            Piutang Saya
          </Button>
          <Button
            size="sm"
            variant={filterTab === "UNPAID" ? "default" : "ghost"}
            className="h-8 text-xs font-medium rounded-lg"
            onClick={() => setFilterTab("UNPAID")}
          >
            Belum Lunas
          </Button>
          <Button
            size="sm"
            variant={filterTab === "PAID" ? "default" : "ghost"}
            className="h-8 text-xs font-medium rounded-lg"
            onClick={() => setFilterTab("PAID")}
          >
            Lunas
          </Button>
        </div>
      </div>

      {/* Debts Grid */}
      {filteredDebts.length === 0 ? (
        <div className="gsap-fade-up rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <HandCoins className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Belum ada catatan hutang/piutang
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
            Catat pinjaman atau tagihan dengan rekan agar tidak terlupakan dan
            pembayaran tercatat rapi ke saldo Anda.
          </p>
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="mt-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Catat Pinjaman Baru
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredDebts.map((debt) => (
            <div key={debt.id} className="gsap-fade-up">
              <DebtCard debt={debt} onEdit={handleEdit} onPay={handlePay} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
