"use client";

import { useState } from "react";
import { BiTargetLock } from "react-icons/bi";
import { FaPiggyBank, FaStar } from "react-icons/fa6";
import ButtonNewTarget from "~/components/features/savings/ButtonNewTarget";
import { DepositModal } from "~/components/features/savings/DepositModal";
import SavingCard from "~/components/features/savings/SavingCard";
import { SavingForm } from "~/components/features/savings/SavingForm";
import { StatCard, type StatCardProps } from "~/components/shared/StatCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useGsapReveal } from "~/lib/gsap";
import { useMonetira } from "~/lib/store/monetira-context";
import { formatCurrency } from "~/lib/utils";
import type { Saving } from "~/types/database";

export function SavingsContent() {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.06, y: 20 });
  const { savings, deleteSaving, totalSavings } = useMonetira();

  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">(
    "all",
  );
  const [editingTarget, setEditingTarget] = useState<Saving | null>(null);
  const [depositingTarget, setDepositingTarget] = useState<Saving | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeTargets = savings.filter((s) => s.status === "Active");
  const completedTargets = savings.filter((s) => s.status === "Completed");

  const filteredSavings =
    activeTab === "active"
      ? activeTargets
      : activeTab === "completed"
        ? completedTargets
        : savings;

  const totalTargetAmount = activeTargets.reduce(
    (acc, curr) => acc + curr.target_amount,
    0,
  );

  const summaryData: StatCardProps[] = [
    {
      title: "Total Tabungan Terkumpul",
      description: "Dari seluruh target aktif & selesai",
      amount: formatCurrency(totalSavings),
      icon: FaPiggyBank,
      variant: "success",
      change: "+12.4%",
      changeColor: "success",
      changeDescription: "akumulasi bulan ini",
    },
    {
      title: "Target Sedang Berjalan",
      description: `${activeTargets.length} impian finansial aktif`,
      amount: formatCurrency(totalTargetAmount),
      icon: BiTargetLock,
      variant: "primary",
    },
    {
      title: "Target Telah Tercapai",
      description: "Impian yang sudah sukses",
      amount: `${completedTargets.length} Target`,
      icon: FaStar,
      variant: "info",
    },
  ];

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteSaving(deletingId);
      setDeletingId(null);
    }
  };

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
            Daftar Target Tabungan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Kelola, setor dana, dan pantau progres pencapaian target Anda
          </p>
        </div>
        <div className="shrink-0">
          <ButtonNewTarget />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="gsap-fade-up flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "all"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Semua ({savings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "active"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Sedang Berjalan ({activeTargets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "completed"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Tercapai ({completedTargets.length})
        </button>
      </div>

      {/* Savings Cards Grid */}
      {filteredSavings.length === 0 ? (
        <div className="gsap-fade-up rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-white dark:bg-slate-900">
          <p className="text-3xl mb-2">🎯</p>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            Belum ada target tabungan di kategori ini
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Buat target baru sekarang untuk mulai menyisihkan dana impian Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSavings.map((saving) => (
            <div key={saving.id} className="gsap-fade-up">
              <SavingCard
                item={saving}
                onEdit={(item) => setEditingTarget(item)}
                onDelete={(id) => setDeletingId(id)}
                onDeposit={(item) => setDepositingTarget(item)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Edit Target Modal */}
      <Dialog
        open={Boolean(editingTarget)}
        onOpenChange={(open) => !open && setEditingTarget(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Target Tabungan</DialogTitle>
            <DialogDescription>
              Perbarui target nominal, batas waktu, atau nama tabungan.
            </DialogDescription>
          </DialogHeader>
          {editingTarget && (
            <SavingForm
              initialData={editingTarget}
              onSuccess={() => setEditingTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Deposit / Withdraw Modal */}
      <DepositModal
        saving={depositingTarget}
        open={Boolean(depositingTarget)}
        onOpenChange={(open) => !open && setDepositingTarget(null)}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600">
              Hapus Target Tabungan?
            </DialogTitle>
            <DialogDescription>
              Tindakan ini akan menghapus target tabungan ini dari daftar Anda.
              Data yang sudah dihapus tidak dapat dipulihkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setDeletingId(null)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:text-slate-300"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
            >
              Ya, Hapus
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
