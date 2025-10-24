import { subMonths } from "date-fns";
import type { Transaction } from "./utils";
import { Car, Film, Landmark, Salad, ShoppingBag } from "lucide-react";

const today = new Date();

export const mockTransactions: Transaction[] = [
  // --- Bulan Ini (September 2025) ---
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

  // --- 1 Bulan Lalu (Agustus 2025) ---
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
  {
    date: subMonths(today, 1),
    type: "EXPENSE",
    amount: 1_200_000,
    description: "Tagihan Kartu Kredit",
  },

  // --- 2 Bulan Lalu (Juli 2025) ---
  {
    date: subMonths(today, 2),
    type: "INCOME",
    amount: 9_200_000,
    description: "Gaji & Bonus Proyek",
  },
  {
    date: subMonths(today, 2),
    type: "EXPENSE",
    amount: 850_000,
    description: "Langganan & Utilitas (Netflix, Listrik)",
  },

  // --- 3 Bulan Lalu (Juni 2025) ---
  {
    date: subMonths(today, 3),
    type: "INCOME",
    amount: 8_000_000,
    description: "Gaji Bulanan Juni",
  },
  {
    date: subMonths(today, 3),
    type: "EXPENSE",
    amount: 6_000_000,
    description: "Biaya Liburan",
  },

  // --- 4 Bulan Lalu (Mei 2025) ---
  {
    date: subMonths(today, 4),
    type: "INCOME",
    amount: 8_000_000,
    description: "Gaji Bulanan Mei",
  },
  {
    date: subMonths(today, 4),
    type: "EXPENSE",
    amount: 1_500_000,
    description: "Makan & Transportasi",
  },

  // --- 5 Bulan Lalu (April 2025) ---
  {
    date: subMonths(today, 5),
    type: "INCOME",
    amount: 8_500_000,
    description: "Gaji & Uang Lembur",
  },
  {
    date: subMonths(today, 5),
    type: "EXPENSE",
    amount: 2_100_000,
    description: "Belanja Online",
  },
];

export type CategoryExpense = {
  category: string;
  value: number;
  color: string;
};

export const mockCategoryExpenses: CategoryExpense[] = [
  { category: "Makanan", value: 2000000, color: "var(--chart-1)" },
  { category: "Transportasi", value: 1500000, color: "var(--chart-2)" },
  { category: "Hiburan", value: 500000, color: "var(--chart-3)" },
  { category: "Belanja", value: 2500000, color: "var(--chart-4)" },
  { category: "Lainnya", value: 1000000, color: "var(--chart-5)" },
];

export type SavingsGoal = {
  title: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: Date;
};

export const mockSavingsGoals: SavingsGoal[] = [
  {
    title: "Liburan ke Bali",
    currentAmount: 8_500_000,
    targetAmount: 15_000_000,
    targetDate: new Date("2025-12-31"),
  },
  {
    title: "Emergency Fund",
    currentAmount: 32_000_000,
    targetAmount: 50_000_000,
    targetDate: new Date("2026-06-30"),
  },
  {
    title: "Laptop Baru",
    currentAmount: 15_000_000,
    targetAmount: 20_000_000,
    targetDate: new Date("2025-09-30"),
  },
];

export type DetailedTransaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  date: Date;
  category: {
    name: string;
    icon: React.ElementType;
  };
};

export const mockDetailedTransactions: DetailedTransaction[] = [
  {
    id: "1",
    type: "INCOME",
    amount: 7500000,
    description: "Gaji Bulanan",
    date: new Date("2025-09-01"),
    category: { name: "Gaji", icon: Landmark },
  },
  {
    id: "2",
    type: "EXPENSE",
    amount: 85000,
    description: "Makan Siang",
    date: new Date("2025-09-25"),
    category: { name: "Makanan", icon: Salad },
  },
  {
    id: "3",
    type: "EXPENSE",
    amount: 150000,
    description: "Nonton Bioskop",
    date: new Date("2025-09-24"),
    category: { name: "Hiburan", icon: Film },
  },
  {
    id: "4",
    type: "EXPENSE",
    amount: 50000,
    description: "Bensin Motor",
    date: new Date("2025-09-23"),
    category: { name: "Transportasi", icon: Car },
  },
  {
    id: "5",
    type: "EXPENSE",
    amount: 450000,
    description: "Beli Baju",
    date: new Date("2025-09-22"),
    category: { name: "Belanja", icon: ShoppingBag },
  },
];