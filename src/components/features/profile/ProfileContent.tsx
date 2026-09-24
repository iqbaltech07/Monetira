"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Database,
  Download,
  Key,
  RotateCcw,
  Shield,
  Sparkles,
  Upload,
  User as UserIcon,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { PricingView } from "~/components/features/subscription/PricingView";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useGsapReveal } from "~/lib/gsap";
import { useMonetira } from "~/lib/store/monetira-context";
import { formatCurrency } from "~/lib/utils";

export function ProfileContent() {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.05, y: 15 });
  const {
    user,
    preferences,
    updateProfile,
    updatePreferences,
    transactions,
    savings,
    totalSavings,
    resetAllData,
    exportBackupJSON,
    importBackupJSON,
  } = useMonetira();

  const [activeTab, setActiveTab] = useState<
    "profile" | "preferences" | "security" | "backup" | "subscription"
  >("profile");

  // Form states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "");
  const [bio, setBio] = useState(
    "Pengguna aktif Monetira yang sedang membangun kebiasaan finansial sehat.",
  );
  const [currency, setCurrency] = useState(preferences.currency);
  const [budget, setBudget] = useState(preferences.monthlyBudget);
  const [budgetAlerts, setBudgetAlerts] = useState(preferences.budgetAlerts);
  const [emailNotifications, setEmailNotifications] = useState(
    preferences.emailNotifications,
  );

  const [savedNotice, setSavedNotice] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, phone });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      currency,
      monthlyBudget: budget,
      budgetAlerts,
      emailNotifications,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJSON(content);
      if (success) {
        setImportNotice("Data berhasil dipulihkan dari cadangan!");
      } else {
        setImportNotice("Format file cadangan tidak valid.");
      }
      setTimeout(() => setImportNotice(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div ref={containerRef} className="space-y-6 max-w-5xl mx-auto">
      {/* User Header Profile Card */}
      <div className="gsap-fade-up rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-2xl border-2 border-blue-500/20 bg-blue-50 shadow-md dark:border-blue-500/30">
              <Image
                src={user.image || "/images/avatar-placeholder.png"}
                alt={user.name}
                fill
                className="object-cover"
                unoptimized={Boolean(user.image?.startsWith("http"))}
              />
            </div>
            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {user.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {user.email} • {user.phone || "Nomor telepon belum diatur"}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="border-b border-blue-400/40 pb-0.5">
                  Member Terverifikasi
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-left">
                <p className="text-[11px] font-semibold text-slate-400">
                  Transaksi
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tabular-nums">
                  {transactions.length}
                </p>
              </div>
              <div className="text-left">
                <p className="text-[11px] font-semibold text-slate-400">
                  Target Tabungan
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tabular-nums">
                  {savings.length}
                </p>
              </div>
              <div className="text-left">
                <p className="text-[11px] font-semibold text-slate-400">
                  Total Tabungan
                </p>
                <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatCurrency(totalSavings)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="gsap-fade-up flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: "profile" as const, label: "Profil Pribadi", icon: UserIcon },
          {
            id: "preferences" as const,
            label: "Preferensi Finansial",
            icon: Wallet,
          },
          { id: "security" as const, label: "Keamanan Akun", icon: Shield },
          {
            id: "subscription" as const,
            label: "Langganan & Paket",
            icon: Sparkles,
          },
          { id: "backup" as const, label: "Cadangan & Reset", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Success Notification */}
      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Perubahan berhasil disimpan dan disinkronkan ke sistem!</span>
        </div>
      )}

      {importNotice && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm font-medium flex items-center gap-2 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300">
          <Check className="h-4 w-4 text-blue-600 shrink-0" />
          <span>{importNotice}</span>
        </div>
      )}

      {/* TAB 1: Profil Pribadi */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleProfileSubmit}
          className="gsap-fade-up rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
            Informasi Pribadi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="profile-name-input"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Nama Lengkap
              </label>
              <Input
                id="profile-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label
                htmlFor="profile-email-input"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Alamat Email
              </label>
              <Input
                id="profile-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="profile-phone-input"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Nomor WhatsApp / Telepon
            </label>
            <Input
              id="profile-phone-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890"
              className="mt-1"
            />
          </div>

          <div>
            <label
              htmlFor="profile-bio-input"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Bio Finansial
            </label>
            <Textarea
              id="profile-bio-input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="mt-1 resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="h-10 px-6 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              Simpan Profil
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: Preferensi Finansial */}
      {activeTab === "preferences" && (
        <form
          onSubmit={handlePreferencesSubmit}
          className="gsap-fade-up rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
            Preferensi & Anggaran
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="pref-currency-select"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Mata Uang Tampilan
              </label>
              <select
                id="pref-currency-select"
                value={currency}
                onChange={(e) =>
                  setCurrency(e.target.value as "IDR" | "USD" | "EUR" | "SGD")
                }
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="IDR">Rupiah Indonesia (IDR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="SGD">Singapore Dollar (SGD)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="pref-budget-input"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Batas Anggaran Bulanan (Rp)
              </label>
              <Input
                id="pref-budget-input"
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 cursor-pointer">
              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={(e) => setBudgetAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Peringatan Batas Anggaran
                </p>
                <p className="text-slate-500">
                  Kirim pemberitahuan saat pengeluaran mendekati 80% dari batas
                  bulanan.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Pengingat Setor Tabungan Mingguan
                </p>
                <p className="text-slate-500">
                  Pengingat otomatis setiap hari Jumat untuk menyisihkan dana
                  tabungan impian.
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="h-10 px-6 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              Simpan Preferensi
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: Keamanan */}
      {activeTab === "security" && (
        <div className="gsap-fade-up rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
            Keamanan & Autentikasi
          </h2>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-850/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 border border-slate-200/80 dark:border-slate-700">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Google OAuth Single Sign-On
                  </p>
                  <p className="text-xs text-slate-500">
                    Terhubung sebagai{" "}
                    <span className="font-semibold">{user.email}</span>
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-xs bg-emerald-500" />
                <span className="border-b border-emerald-500/40 pb-0.5">
                  Aktif & Terlindungi
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-850/40 space-y-2">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Enkripsi Data Tingkat Bank
                </p>
                <p className="text-xs text-slate-500">
                  Semua transaksi finansial Anda disimpan dengan proteksi
                  standar 256-bit enkripsi end-to-end.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Cadangan & Reset */}
      {activeTab === "backup" && (
        <div className="gsap-fade-up rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            Manajemen Cadangan & Pemulihan Data
          </h2>
          <p className="text-xs text-slate-500">
            Kelola salinan data finansial Anda atau reset ke konfigurasi awal
            untuk pengujian.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Export JSON */}
            <div className="rounded-xl border border-slate-200/80 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850/40 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
                <Download className="h-4 w-4 text-blue-600" />
                <span>Cadangkan Data (JSON)</span>
              </div>
              <p className="text-xs text-slate-500">
                Unduh seluruh riwayat transaksi, target tabungan, dan profil
                dalam 1 file JSON aman.
              </p>
              <Button
                type="button"
                onClick={exportBackupJSON}
                variant="outline"
                className="w-full text-xs font-semibold"
              >
                Unduh File Cadangan
              </Button>
            </div>

            {/* Import JSON */}
            <div className="rounded-xl border border-slate-200/80 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850/40 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
                <Upload className="h-4 w-4 text-emerald-600" />
                <span>Pulihkan dari Cadangan</span>
              </div>
              <p className="text-xs text-slate-500">
                Unggah file JSON cadangan Monetira yang pernah Anda unduh
                sebelumnya.
              </p>
              <label
                htmlFor="import-backup-file-input"
                className="flex items-center justify-center w-full h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
              >
                <span>Pilih File Backup</span>
                <input
                  id="import-backup-file-input"
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Danger Zone: Reset Data */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 dark:border-rose-900/40 dark:bg-rose-950/20 space-y-2 mt-4">
            <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400 text-sm">
              <RotateCcw className="h-4 w-4" />
              <span>Kembalikan ke Data Sampel Default</span>
            </div>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
              Mereset seluruh data transaksi, tabungan, dan preferensi kembali
              ke data awal untuk kemudahan pengujian aplikasi.
            </p>
            <Button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    "Apakah Anda yakin ingin mereset seluruh data kembali ke default sampel?",
                  )
                ) {
                  resetAllData();
                  setImportNotice(
                    "Data berhasil direset ke konfigurasi sampel default!",
                  );
                  setTimeout(() => setImportNotice(null), 4000);
                }
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              Reset Data Sekarang
            </Button>
          </div>
        </div>
      )}

      {/* Tab: Subscription & Plans */}
      {activeTab === "subscription" && <PricingView />}
    </div>
  );
}
