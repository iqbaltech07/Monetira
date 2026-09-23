"use client";

import { useMemo, useState } from "react";
import { BiMoney } from "react-icons/bi";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { ReceiptText } from "lucide-react";
import ButtonNewTransaction from "~/components/features/transactions/ButtonNewTransaction";
import SearchFilterTransaction from "~/components/features/transactions/SearchFilterTransaction";
import { TransactionForm } from "~/components/features/transactions/TransactionForm";
import TransactionRowHistory from "~/components/features/transactions/TransactionRowHistory";
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
import type { Transaction } from "~/types/database";

export function TransactionContent() {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.05, y: 20 });
  const {
    transactions,
    categories,
    deleteTransaction,
    exportTransactionsCSV,
    totalIncome,
    totalExpense,
    netBalance,
  } = useMonetira();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (filterType !== "all" && tx.type !== filterType) return false;

      // Category filter
      if (selectedCategory !== "all" && tx.category_id !== selectedCategory)
        return false;

      // Search term filter
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const noteMatch = tx.note?.toLowerCase().includes(query) ?? false;
        const catMatch =
          tx.category?.name.toLowerCase().includes(query) ?? false;
        if (!noteMatch && !catMatch) return false;
      }

      return true;
    });
  }, [transactions, filterType, selectedCategory, searchTerm]);

  const summaryData: StatCardProps[] = [
    {
      title: "Total Pemasukan",
      description: "Semua dana masuk tercatat",
      amount: formatCurrency(totalIncome),
      icon: FaArrowTrendUp,
      variant: "success",
    },
    {
      title: "Total Pengeluaran",
      description: "Semua dana keluar tercatat",
      amount: formatCurrency(totalExpense),
      icon: FaArrowTrendDown,
      variant: "danger",
    },
    {
      title: "Arus Kas Bersih",
      description: "Selisih pemasukan & pengeluaran",
      amount: formatCurrency(netBalance),
      icon: BiMoney,
      variant: netBalance >= 0 ? "primary" : "danger",
    },
  ];

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteTransaction(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      {/* Responsive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {summaryData.map((item, idx) => (
          <div
            key={item.title}
            className={`gsap-fade-up ${idx === 2 ? "sm:col-span-2 lg:col-span-1" : ""}`}
          >
            <StatCard {...item} />
          </div>
        ))}
      </div>

      {/* Filter and Action bar */}
      <div className="gsap-fade-up flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <SearchFilterTransaction
          className="flex-1"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          onExportCSV={exportTransactionsCSV}
        />
        <div className="shrink-0">
          <ButtonNewTransaction categories={categories} />
        </div>
      </div>

      {/* Transaction History Section */}
      <section className="gsap-fade-up rounded-2xl border border-slate-200/80 bg-white py-5 px-4 md:px-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            Riwayat Transaksi
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            {filteredTransactions.length} dari {transactions.length} Transaksi
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <ReceiptText className="h-6 w-6" />
              </div>
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              Tidak ada transaksi yang cocok
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Coba sesuaikan kata kunci pencarian atau reset filter
              tipe/kategori.
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2.5 sm:gap-3">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="gsap-fade-up">
                <TransactionRowHistory
                  item={tx}
                  onEdit={(item) => setEditingTx(item)}
                  onDelete={(id) => setDeletingId(id)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit Transaction Modal */}
      <Dialog
        open={Boolean(editingTx)}
        onOpenChange={(open) => !open && setEditingTx(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Transaksi</DialogTitle>
            <DialogDescription>
              Perbarui rincian, jumlah, kategori, atau catatan transaksi ini.
            </DialogDescription>
          </DialogHeader>
          {editingTx && (
            <TransactionForm
              initialData={editingTx}
              categories={categories}
              onSuccess={() => setEditingTx(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600">
              Hapus Transaksi?
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus catatan transaksi ini? Tindakan
              ini tidak dapat dibatalkan.
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
