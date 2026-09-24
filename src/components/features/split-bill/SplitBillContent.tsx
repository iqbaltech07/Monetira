"use client";

import {
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Receipt,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { SplitBillCard } from "~/components/features/split-bill/SplitBillCard";
import { SplitBillModal } from "~/components/features/split-bill/SplitBillModal";
import { StatCard } from "~/components/shared/StatCard";
import { Button } from "~/components/ui/button";
import { useGsapReveal } from "~/lib/gsap";
import { useMonetira } from "~/lib/store/monetira-context";
import { formatCurrency } from "~/lib/utils";

export function SplitBillContent() {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.05, y: 15 });
  const { splitBills, splitBillSummary } = useMonetira();

  const [modalOpen, setModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"ALL" | "UNSETTLED" | "SETTLED">(
    "ALL",
  );

  const filteredBills = useMemo(() => {
    return splitBills.filter((bill) => {
      const allSettled = bill.participants.every((p) => p.paid);
      if (filterTab === "UNSETTLED") return !allSettled;
      if (filterTab === "SETTLED") return allSettled;
      return true;
    });
  }, [splitBills, filterTab]);

  return (
    <div ref={containerRef} className="flex flex-col gap-6 md:gap-8">
      <SplitBillModal open={modalOpen} onOpenChange={setModalOpen} />

      {/* Header Banner */}
      <div className="gsap-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-5 sm:p-6 text-white shadow-md">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1.5">
            <Users className="h-3.5 w-3.5 text-purple-200 shrink-0" />
            <span className="border-b border-purple-200/50 pb-0.5">
              Split Bill
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Bagi Tagihan Adil & Transparan
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-lg mt-0.5">
            Bagi pengeluaran bersama rekan makan atau liburan. Saat rekan
            membayar bagiannya, dana otomatis tercatat ke saldo Anda.
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl text-sm sm:text-base font-semibold bg-white text-purple-700 hover:bg-purple-50 shadow-sm cursor-pointer transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="size-4 sm:size-5" />
          <span>Bagi Tagihan Baru</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="gsap-fade-up">
          <StatCard
            title="Tertunda dari Rekan"
            description="Bagian rekan yang belum ditransfer"
            amount={formatCurrency(splitBillSummary.outstandingAmount)}
            icon={Clock}
            variant="warning"
          />
        </div>

        <div className="gsap-fade-up">
          <StatCard
            title="Terkumpul dari Rekan"
            description="Realisasi dana yang sudah diterima"
            amount={formatCurrency(splitBillSummary.collectedAmount)}
            icon={CheckCircle2}
            variant="success"
          />
        </div>

        <div className="gsap-fade-up">
          <StatCard
            title="Total Nilai Tagihan"
            description="Akumulasi tagihan split bill"
            amount={formatCurrency(splitBillSummary.totalAmount)}
            icon={Receipt}
            variant="primary"
          />
        </div>

        <div className="gsap-fade-up">
          <StatCard
            title="Tagihan Aktif"
            description="Tagihan yang belum tuntas 100%"
            amount={`${splitBillSummary.unsettledCount} Acara`}
            icon={Users}
            variant={splitBillSummary.unsettledCount > 0 ? "warning" : "info"}
          />
        </div>
      </div>

      {/* Filters and List */}
      <div className="gsap-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Daftar Tagihan Bersama
          </span>
          <span className="text-xs text-slate-400">
            ({filteredBills.length} tagihan)
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
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
            variant={filterTab === "UNSETTLED" ? "default" : "ghost"}
            className="h-8 text-xs font-medium rounded-lg text-purple-600 dark:text-purple-400"
            onClick={() => setFilterTab("UNSETTLED")}
          >
            Belum Lunas
          </Button>
          <Button
            size="sm"
            variant={filterTab === "SETTLED" ? "default" : "ghost"}
            className="h-8 text-xs font-medium rounded-lg"
            onClick={() => setFilterTab("SETTLED")}
          >
            Semua Lunas
          </Button>
        </div>
      </div>

      {/* Split Bills Grid */}
      {filteredBills.length === 0 ? (
        <div className="gsap-fade-up rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Belum ada catatan split bill
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
            Bagi tagihan makan bersama, sewa villa, atau hadiah patungan dengan
            teman secara rapi dan otomatis.
          </p>
          <Button
            onClick={() => setModalOpen(true)}
            size="sm"
            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Bagi Tagihan Sekarang
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredBills.map((bill) => (
            <div key={bill.id} className="gsap-fade-up">
              <SplitBillCard bill={bill} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
