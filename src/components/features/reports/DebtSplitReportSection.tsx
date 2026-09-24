"use client";

import { CreditCard, Users } from "lucide-react";
import type { DebtSummary, SplitBillSummary } from "~/lib/reports/calculations";
import { formatCurrency } from "~/lib/utils";

interface DebtSplitReportSectionProps {
  debts: DebtSummary;
  splitBills: SplitBillSummary;
}

export function DebtSplitReportSection({
  debts,
  splitBills,
}: DebtSplitReportSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Debts & Receivables Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Hutang & Piutang
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Piutang Saya */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Piutang Saya (Dipinjam Orang)
            </span>
            <div className="mt-1 text-base font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(debts.remainingOwedToMe)}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
              dari total {formatCurrency(debts.totalOwedToMe)}
            </span>
          </div>

          {/* Hutang Saya */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Hutang Saya (Wajib Dibayar)
            </span>
            <div className="mt-1 text-base font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(debts.remainingOwedByMe)}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
              dari total {formatCurrency(debts.totalOwedByMe)}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Terdapat{" "}
          <strong className="text-slate-800 dark:text-slate-200">
            {debts.activeDebtsCount}
          </strong>{" "}
          catatan hutang/piutang yang masih berstatus aktif.
        </div>
      </div>

      {/* Split Bill Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Tagihan Bersama (Split Bill)
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Outstanding */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Belum Dilunasi Teman
            </span>
            <div className="mt-1 text-base font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(splitBills.outstandingAmount)}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
              {splitBills.unsettledCount} tagihan belum lunas
            </span>
          </div>

          {/* Collected */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Sudah Diterima
            </span>
            <div className="mt-1 text-base font-bold text-teal-600 dark:text-teal-400">
              {formatCurrency(splitBills.collectedAmount)}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
              dari total {formatCurrency(splitBills.totalAmount)}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Total{" "}
          <strong className="text-slate-800 dark:text-slate-200">
            {splitBills.totalBills}
          </strong>{" "}
          aktivitas split bill tercatat pada sistem.
        </div>
      </div>
    </div>
  );
}
