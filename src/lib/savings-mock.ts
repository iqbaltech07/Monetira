// src/lib/savings-mock.ts
import { addDays, differenceInCalendarDays, isBefore } from "date-fns";
import { id as localeID } from "date-fns/locale";

export type SavingStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";

export interface SavingGoal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: "Liburan" | "Darurat" | "Gadget" | "Pendidikan" | "Lainnya";
  isActive: boolean;
  status: SavingStatus;
  startAmount: number; // dana awal yang sudah ada
  targetAmount: number; // target akhir
  monthlyTarget: number; // rencana nabung per bulan
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
  favorite?: boolean;
}

export const mockSavings: SavingGoal[] = [
  {
    id: "sv_1",
    userId: "u_1",
    name: "Trip Bali 5D4N",
    description: "Liburan akhir semester, fokus Nusa Penida & Uluwatu.",
    category: "Liburan",
    isActive: true,
    status: "ACTIVE",
    startAmount: 3_000_000,
    targetAmount: 15_000_000,
    monthlyTarget: 1_500_000,
    deadline: addDays(new Date(), 85), // ~3 bulan
    createdAt: new Date(),
    updatedAt: new Date(),
    favorite: true,
  },
  {
    id: "sv_2",
    userId: "u_1",
    name: "Dana Darurat 6x",
    description: "Target 6x pengeluaran bulanan.",
    category: "Darurat",
    isActive: true,
    status: "ACTIVE",
    startAmount: 8_250_000,
    targetAmount: 30_000_000,
    monthlyTarget: 2_500_000,
    deadline: addDays(new Date(), 210),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sv_3",
    userId: "u_1",
    name: "MacBook Air M3",
    description: "Upgrade untuk produktivitas & freelance.",
    category: "Gadget",
    isActive: false,
    status: "PAUSED",
    startAmount: 5_000_000,
    targetAmount: 22_000_000,
    monthlyTarget: 2_000_000,
    deadline: addDays(new Date(), -10),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function calcProgressPct(goal: SavingGoal) {
  const pct = (goal.startAmount / goal.targetAmount) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export function formatCurrencyID(v: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);
}

export function remainingInfo(goal: SavingGoal) {
  const remaining = Math.max(0, goal.targetAmount - goal.startAmount);
  const daysLeft = differenceInCalendarDays(goal.deadline, new Date());
  const overdue = isBefore(goal.deadline, new Date());
  return { remaining, daysLeft, overdue };
}

export { localeID };
