import { subMonths } from "date-fns";
import { Car, Film, Landmark, Salad, ShoppingBag } from "lucide-react";

const today = new Date();

// =========================================
// 1. DATA UNTUK CHART DASHBOARD
// =========================================
export const mockTransactions = [
  {
    date: new Date(),
    type: "INCOME",
    amount: 12_000_000,
    description: "Gaji Bulanan September",
  },
  {
    date: new Date(),
    type: "EXPENSE",
    amount: 4_500_000,
    description: "Bayar Sewa Apartemen",
  },
  {
    date: new Date(),
    type: "EXPENSE",
    amount: 750_000,
    description: "Belanja Bulanan",
  },
  {
    date: subMonths(today, 1),
    type: "INCOME",
    amount: 12_000_000,
    description: "Gaji Bulanan Agustus",
  },
  {
    date: subMonths(today, 1),
    type: "EXPENSE",
    amount: 3_200_000,
    description: "Cicilan Kendaraan",
  },
];

// =========================================
// 2. DATA UNTUK PIE CHART KATEGORI
// =========================================
export const mockCategoryExpenses = [
  { category: "Makanan", value: 2000000, color: "var(--chart-1)" },
  { category: "Transportasi", value: 1500000, color: "var(--chart-2)" },
  { category: "Hiburan", value: 500000, color: "var(--chart-3)" },
  { category: "Belanja", value: 2500000, color: "var(--chart-4)" },
  { category: "Lainnya", value: 1000000, color: "var(--chart-5)" },
];

// =========================================
// 3. DATA SAVINGS (VERSI BARU - PAGE SAVINGS)
// Digunakan di: src/app/(protected)/savings/page.tsx
// =========================================
export const mockSavingsData = [
  {
    id: "sav_001",
    name: "Liburan ke Bali",
    targetAmount: 20000000,
    currentAmount: 5500000,
    deadline: "2025-12-25",
    emoji: "🌴",
    status: "Active" as const,
  },
  {
    id: "sav_002",
    name: "MacBook Pro M3",
    targetAmount: 30000000,
    currentAmount: 28500000,
    deadline: "2025-06-30",
    emoji: "💻",
    status: "Active" as const,
  },
  {
    id: "sav_003",
    name: "Dana Darurat",
    targetAmount: 50000000,
    currentAmount: 50000000,
    deadline: undefined,
    emoji: "🛡️",
    status: "Completed" as const,
  },
];

// =========================================
// 4. DATA SAVINGS GOALS (VERSI LAMA - DASHBOARD)
// Digunakan di: src/app/(protected)/dashboard/page.tsx (Mungkin)
// Kita pertahankan ini agar dashboard tidak error
// =========================================
export const mockSavingsGoals = [
  {
    title: "Liburan ke Bali",
    currentAmount: 5_500_000,
    targetAmount: 20_000_000,
    targetDate: new Date("2025-12-25"),
  },
  {
    title: "Emergency Fund",
    currentAmount: 50_000_000,
    targetAmount: 50_000_000,
    targetDate: new Date("2026-06-30"),
  },
  {
    title: "Laptop Baru",
    currentAmount: 28_500_000,
    targetAmount: 30_000_000,
    targetDate: new Date("2025-09-30"),
  },
];

// =========================================
// 5. DATA TRANSAKSI DETAIL (VERSI BARU)
// Digunakan di: TransactionRowHistory
// =========================================
export const mockDetailedTransactions = [
  {
    id: "1",
    type: "income" as const,
    amount: 7500000,
    title: "Gaji Bulanan",
    date: new Date("2025-09-01T09:00:00").toISOString(),
    category: "gaji" as const,
    icon: Landmark,
  },
  {
    id: "2",
    type: "expense" as const,
    amount: 85000,
    title: "Makan Siang",
    date: new Date("2025-09-25T12:30:00").toISOString(),
    category: "makanan" as const,
    icon: Salad,
  },
  {
    id: "3",
    type: "expense" as const,
    amount: 150000,
    title: "Nonton Bioskop",
    date: new Date("2025-09-24T19:00:00").toISOString(),
    category: "hiburan" as const,
    icon: Film,
  },
  {
    id: "4",
    type: "expense" as const,
    amount: 50000,
    title: "Bensin Motor",
    date: new Date("2025-09-23T08:00:00").toISOString(),
    category: "transportasi" as const,
    icon: Car,
  },
  {
    id: "5",
    type: "expense" as const,
    amount: 450000,
    title: "Beli Baju",
    date: new Date("2025-09-22T15:45:00").toISOString(),
    category: "tagihan" as const,
    icon: ShoppingBag,
  },
];

export type DetailedTransaction = (typeof mockDetailedTransactions)[number];
