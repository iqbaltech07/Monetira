"use client";

import { AlertCircle, Check, Info, Sparkles, Zap } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useMonetira } from "~/lib/store/monetira-context";
import { AI_LIMITS } from "~/lib/subscription/ai-usage";
import { getWeeklyWindow } from "~/lib/subscription/weekly-window";

export function PricingView() {
  const { isPro, effectivePlan, aiUsage } = useMonetira();
  const currentWindow = getWeeklyWindow();

  const chatLimit = AI_LIMITS[effectivePlan].CHAT_PER_WEEK;
  const chatsUsed = aiUsage.chat_count;
  const chatsRemaining = Math.max(0, chatLimit - chatsUsed);

  return (
    <div className="space-y-6">
      {/* Current Active Plan Status Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50 to-white p-5 sm:p-6 dark:border-slate-800 dark:from-slate-900/60 dark:to-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Paket Anda Saat Ini
              </span>
              <Badge
                variant={isPro ? "default" : "secondary"}
                className={
                  isPro
                    ? "bg-primary text-white"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }
              >
                {effectivePlan === "PRO" ? "MONETIRA PRO" : "MONETIRA FREE"}
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isPro
                ? "Akses Fitur Keuangan Tingkat Lanjut & AI Kuota Tinggi"
                : "Akses Finansial Dasar & Asisten AI Terbatas"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Siklus Mingguan Saat Ini:{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {currentWindow.weekId}
              </span>{" "}
              (Reset dalam {currentWindow.daysRemaining} hari)
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 shrink-0">
            <span className="text-[11px] font-medium text-slate-500">
              Kuota Asisten AI Minggu Ini
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                {chatsUsed}
              </span>
              <span className="text-xs text-slate-400">
                / {chatLimit} pesan
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {chatsRemaining > 0
                ? `Tersisa ${chatsRemaining} pesan`
                : "Batas minggu ini telah tercapai"}
            </span>
          </div>
        </div>
      </div>

      {/* Honest Architectural Status Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-sky-200/70 bg-sky-50/60 p-4 text-xs text-sky-900 dark:border-sky-950/60 dark:bg-sky-950/30 dark:text-sky-200">
        <Info className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">
            Status Arsitektur Pembayaran (Phase 11)
          </p>
          <p className="text-sky-800/90 dark:text-sky-300/90 leading-relaxed">
            Monetira mengedepankan integritas data dan keamanan transaksi.
            Gerbang pembayaran otomatis (QRIS / Virtual Account) akan
            diintegrasikan secara aman setelah autentikasi server-side (OAuth)
            dan database PostgreSQL terpasang di fase berikutnya. Sistem tidak
            menggunakan checkout palsu atau status lokal tiruan.
          </p>
        </div>
      </div>

      {/* Plan Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FREE PLAN */}
        <Card className="flex flex-col justify-between border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 rounded-2xl">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pilihan Dasar
              </span>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Free
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cocok untuk pencatatan dan pengelolaan keuangan esensial
                sehari-hari.
              </p>
            </div>

            <div className="flex items-baseline gap-1 py-2 border-y border-slate-100 dark:border-slate-800">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                Rp0
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / selamanya
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
              {[
                "Dasbor Finansial & Saldo Utama",
                "Pencatatan Transaksi & Multi-Akun Tabungan",
                "Anggaran Kategori Bulanan & Mingguan Dasar",
                "Manajemen Catatan Hutang & Piutang Dasar",
                "Fitur Patungan (Split Bill) Dasar",
                "Data Pasar Real-Time (Crypto, Forex, Emas, Saham)",
                "Asisten Finansial AI: 3 pertanyaan / minggu",
                "Ekspor Cadangan Data JSON Lokal",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6">
            <Button
              variant="outline"
              disabled
              className="w-full text-xs font-semibold cursor-default"
            >
              {effectivePlan === "FREE" ? "Paket Aktif" : "Paket Standar"}
            </Button>
          </div>
        </Card>

        {/* PRO PLAN */}
        <Card className="relative flex flex-col justify-between border-2 border-primary/40 bg-white p-6 dark:border-primary/50 dark:bg-slate-900 rounded-2xl shadow-sm">
          <div className="absolute -top-3 right-6">
            <Badge className="bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 shadow-sm">
              <Sparkles className="h-3 w-3 mr-1 inline" /> REKOMENDASI
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Tingkat Lanjut
              </span>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Pro
                <Zap className="h-4 w-4 fill-primary text-primary" />
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fitur lengkap dengan asisten cerdas AI dan analitik mendalam.
              </p>
            </div>

            <div className="flex items-baseline gap-1 py-2 border-y border-slate-100 dark:border-slate-800">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                Rp5.000
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / minggu
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
              {[
                "Semua kemampuan yang ada di paket Free",
                "Asisten Finansial AI Kuota Tinggi: 50 pertanyaan / minggu",
                "Input Transaksi Otomatis berbasis AI (Voice & Teks Bebas)",
                "Laporan & Analitik Keuangan Komparatif Multi-Bulan",
                "Saran Kesehatan Finansial & Deteksi Pola Pengeluaran",
                "Ekspor Laporan Lengkap (CSV / Spreadsheets)",
                "Prioritas update dan fitur baru Monetira",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6 space-y-2">
            <Button
              className="w-full text-xs font-semibold cursor-pointer bg-primary text-white hover:bg-primary/90"
              onClick={() => {
                alert(
                  "Integrasi Pembayaran (QRIS/VA) sedang dalam tahap persiapan arsitektur untuk rilis backend server-side. Data finansial lokal Anda tetap aman.",
                );
              }}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isPro
                ? "Perpanjang Paket Pro"
                : "Tingkatkan ke Pro (Rp5.000/minggu)"}
            </Button>
            <p className="text-[10px] text-center text-slate-400">
              Pembayaran aman & transparan. Tanpa komitmen jangka panjang.
            </p>
          </div>
        </Card>
      </div>

      {/* Expiry & Data Preservation Policy */}
      <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
          <AlertCircle className="h-4 w-4 text-slate-500" />
          <span>Kebijakan Retensi Data Finansial Monetira</span>
        </div>
        <p className="leading-relaxed">
          Jika masa aktif paket Pro Anda berakhir atau dibatalkan,{" "}
          <strong className="text-slate-700 dark:text-slate-300">
            seluruh data transaksi, saldo, target tabungan, anggaran, hutang,
            dan catatan Anda tidak akan pernah dihapus
          </strong>
          . Akun Anda hanya akan kembali ke kemampuan paket Free tanpa
          kehilangan satu pun riwayat finansial yang telah tercatat.
        </p>
      </div>
    </div>
  );
}
