"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type {
  Category,
  Saving,
  Transaction,
  User,
  UserPreferences,
} from "~/types/database";
import {
  INITIAL_CATEGORIES,
  INITIAL_PREFERENCES,
  INITIAL_SAVINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER,
} from "./initial-data";

interface MonetiraContextType {
  isLoaded: boolean;
  // User & Settings
  user: User;
  preferences: UserPreferences;
  updateProfile: (data: Partial<User>) => void;
  updatePreferences: (data: Partial<UserPreferences>) => void;

  // Categories
  categories: Category[];

  // Transactions
  transactions: Transaction[];
  addTransaction: (
    data: Omit<Transaction, "id" | "created_at" | "user_id">,
  ) => Transaction;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  exportTransactionsCSV: () => void;

  // Savings
  savings: Saving[];
  addSaving: (
    data: Omit<
      Saving,
      "id" | "user_id" | "current_amount" | "created_at" | "status"
    >,
  ) => Saving;
  updateSaving: (id: string, data: Partial<Saving>) => void;
  deleteSaving: (id: string) => void;
  depositSaving: (id: string, amount: number) => void;
  withdrawSaving: (id: string, amount: number) => void;

  // Watchlist
  watchlist: string[];
  toggleWatchlist: (symbol: string) => void;
  isWatchlisted: (symbol: string) => boolean;

  // Computed
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  totalSavings: number;

  // System
  resetAllData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonStr: string) => boolean;
}

const STORAGE_KEYS = {
  USER: "monetira_user_v1",
  PREFS: "monetira_prefs_v1",
  TRANSACTIONS: "monetira_tx_v1",
  SAVINGS: "monetira_savings_v1",
  WATCHLIST: "monetira_watchlist_v1",
};

const MonetiraContext = createContext<MonetiraContextType | undefined>(
  undefined,
);

export function MonetiraProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [preferences, setPreferences] =
    useState<UserPreferences>(INITIAL_PREFERENCES);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [savings, setSavings] = useState<Saving[]>(INITIAL_SAVINGS);
  const [watchlist, setWatchlist] = useState<string[]>([
    "BTC",
    "ETH",
    "BBCA",
    "GOLD",
  ]);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) setUser(JSON.parse(storedUser));

        const storedPrefs = localStorage.getItem(STORAGE_KEYS.PREFS);
        if (storedPrefs) setPreferences(JSON.parse(storedPrefs));

        const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        if (storedTx) {
          const parsed = JSON.parse(storedTx) as Transaction[];
          // Re-hydrate Date objects
          setTransactions(
            parsed.map((t) => ({
              ...t,
              date: new Date(t.date),
              created_at: new Date(t.created_at),
              category: categories.find((c) => c.id === t.category_id),
            })),
          );
        }

        const storedSavings = localStorage.getItem(STORAGE_KEYS.SAVINGS);
        if (storedSavings) {
          const parsed = JSON.parse(storedSavings) as Saving[];
          setSavings(
            parsed.map((s) => ({
              ...s,
              created_at: new Date(s.created_at),
              deadline: s.deadline ? new Date(s.deadline) : undefined,
            })),
          );
        }

        const storedWatchlist = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
        if (storedWatchlist) setWatchlist(JSON.parse(storedWatchlist));
      }
    } catch (e) {
      console.error("Failed to load local state:", e);
    } finally {
      setIsLoaded(true);
    }
  }, [categories]);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(preferences));
      localStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(transactions),
      );
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savings));
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    } catch (e) {
      console.error("Failed to persist state:", e);
    }
  }, [user, preferences, transactions, savings, watchlist, isLoaded]);

  // Actions: User & Preferences
  const updateProfile = (data: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...data, updated_at: new Date() }));
  };

  const updatePreferences = (data: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...data }));
  };

  // Actions: Transactions
  const addTransaction = (
    data: Omit<Transaction, "id" | "created_at" | "user_id">,
  ) => {
    const category = categories.find((c) => c.id === data.category_id);
    const newTx: Transaction = {
      ...data,
      id: `trx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: user.id,
      created_at: new Date(),
      category,
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const categoryId = data.category_id ?? t.category_id;
        const category = categories.find((c) => c.id === categoryId);
        return {
          ...t,
          ...data,
          category: category ?? t.category,
          updated_at: new Date(),
        };
      }),
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const exportTransactionsCSV = () => {
    if (typeof window === "undefined") return;
    const headers = ["ID", "Tipe", "Kategori", "Nominal", "Tanggal", "Catatan"];
    const rows = transactions.map((t) => [
      t.id,
      t.type,
      t.category?.name || "-",
      t.amount.toString(),
      new Date(t.date).toISOString().split("T")[0],
      `"${(t.note || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `monetira_transaksi_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Actions: Savings
  const addSaving = (
    data: Omit<
      Saving,
      "id" | "user_id" | "current_amount" | "created_at" | "status"
    >,
  ) => {
    const newSaving: Saving = {
      ...data,
      id: `sav_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: user.id,
      current_amount: 0,
      status: "Active",
      created_at: new Date(),
    };
    setSavings((prev) => [newSaving, ...prev]);
    return newSaving;
  };

  const updateSaving = (id: string, data: Partial<Saving>) => {
    setSavings((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...data, updated_at: new Date() };
        // Otomatis ubah status jika target tercapai
        if (updated.current_amount >= updated.target_amount) {
          updated.status = "Completed";
        } else if (updated.status === "Completed") {
          updated.status = "Active";
        }
        return updated;
      }),
    );
  };

  const deleteSaving = (id: string) => {
    setSavings((prev) => prev.filter((s) => s.id !== id));
  };

  const depositSaving = (id: string, amount: number) => {
    const target = savings.find((s) => s.id === id);
    if (!target) return;
    const newCurrent = target.current_amount + amount;
    const newStatus =
      newCurrent >= target.target_amount ? "Completed" : target.status;

    setSavings((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              current_amount: newCurrent,
              status: newStatus,
              updated_at: new Date(),
            }
          : s,
      ),
    );
  };

  const withdrawSaving = (id: string, amount: number) => {
    const target = savings.find((s) => s.id === id);
    if (!target) return;
    const newCurrent = Math.max(0, target.current_amount - amount);
    const newStatus =
      newCurrent >= target.target_amount ? "Completed" : "Active";

    setSavings((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              current_amount: newCurrent,
              status: newStatus,
              updated_at: new Date(),
            }
          : s,
      ),
    );
  };

  // Actions: Watchlist
  const toggleWatchlist = (symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol],
    );
  };

  const isWatchlisted = (symbol: string) => watchlist.includes(symbol);

  // Actions: System & Backup
  const resetAllData = () => {
    setUser(INITIAL_USER);
    setPreferences(INITIAL_PREFERENCES);
    setTransactions(INITIAL_TRANSACTIONS);
    setSavings(INITIAL_SAVINGS);
    setWatchlist(["BTC", "ETH", "BBCA", "GOLD"]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.PREFS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.SAVINGS);
      localStorage.removeItem(STORAGE_KEYS.WATCHLIST);
    }
  };

  const exportBackupJSON = () => {
    if (typeof window === "undefined") return;
    const backup = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      user,
      preferences,
      transactions,
      savings,
      watchlist,
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(backup, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute(
      "download",
      `monetira_backup_${new Date().toISOString().split("T")[0]}.json`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importBackupJSON = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.transactions && Array.isArray(data.transactions)) {
        setTransactions(
          (data.transactions as Transaction[]).map((t) => ({
            ...t,
            date: new Date(t.date),
            created_at: new Date(t.created_at),
          })),
        );
      }
      if (data.savings && Array.isArray(data.savings)) {
        setSavings(
          (data.savings as Saving[]).map((s) => ({
            ...s,
            created_at: new Date(s.created_at),
            deadline: s.deadline ? new Date(s.deadline) : undefined,
          })),
        );
      }
      if (data.user) setUser(data.user);
      if (data.preferences) setPreferences(data.preferences);
      if (data.watchlist) setWatchlist(data.watchlist);
      return true;
    } catch (e) {
      console.error("Failed to import backup:", e);
      return false;
    }
  };

  // Computed values
  const totalIncome = transactions
    .filter((t) => t.type === "Income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "Expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const totalSavings = savings.reduce(
    (acc, curr) => acc + curr.current_amount,
    0,
  );

  return (
    <MonetiraContext.Provider
      value={{
        isLoaded,
        user,
        preferences,
        updateProfile,
        updatePreferences,
        categories,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        exportTransactionsCSV,
        savings,
        addSaving,
        updateSaving,
        deleteSaving,
        depositSaving,
        withdrawSaving,
        watchlist,
        toggleWatchlist,
        isWatchlisted,
        totalIncome,
        totalExpense,
        netBalance,
        totalSavings,
        resetAllData,
        exportBackupJSON,
        importBackupJSON,
      }}
    >
      {children}
    </MonetiraContext.Provider>
  );
}

export function useMonetira() {
  const context = useContext(MonetiraContext);
  if (!context) {
    throw new Error("useMonetira must be used within a MonetiraProvider");
  }
  return context;
}
