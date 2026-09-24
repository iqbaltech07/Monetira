"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Account,
  AiUsageRecord,
  Budget,
  Category,
  CreateBudgetInput,
  CreateDebtInput,
  CreateSplitBillInput,
  Debt,
  DebtPayment,
  DebtStatus,
  Entitlement,
  Saving,
  SavingStatus,
  SplitBill,
  Subscription,
  SubscriptionPlan,
  Transaction,
  TransactionType,
  UpdateBudgetInput,
  UpdateDebtInput,
  UpdateSplitBillInput,
  User,
  UserPreferences,
} from "~/types/database";
import {
  type BudgetSpendingResult,
  calculateBudgetSpending,
  validateBudgetInput,
} from "~/lib/budget/calculations";
import {
  type DebtSummary,
  calculateDebtSummary,
  validateDebtInput,
  validateDebtPayment,
} from "~/lib/debts/calculations";
import {
  type SplitBillSummary,
  calculateSplitBillSummary,
  validateSplitBill,
} from "~/lib/split-bill/calculations";
import {
  canUseFeature,
  getEffectivePlan,
  isSubscriptionActive,
} from "~/lib/subscription/entitlements";
import { getWeeklyWindow } from "~/lib/subscription/weekly-window";
import {
  type CreateExpenseInput,
  type CreateIncomeInput,
  type CreateTransferInput,
  type TransactionEngineResult,
  type UpdateTransactionInput,
  calculateAccountBalance,
  validateAmount,
  validateBalance,
  validateTransferAccounts,
} from "~/lib/transactions/engine";
import {
  INITIAL_ACCOUNTS,
  INITIAL_AI_USAGE,
  INITIAL_BUDGETS,
  INITIAL_CATEGORIES,
  INITIAL_DEBTS,
  INITIAL_PREFERENCES,
  INITIAL_SAVINGS,
  INITIAL_SPLIT_BILLS,
  INITIAL_SUBSCRIPTION,
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

  // Accounts
  accounts: Account[];
  mainAccount: Account | null;
  getMainAccount: () => Account | null;
  getAccountBalance: (accountId: string) => number;

  // Categories
  categories: Category[];

  // Transactions State
  transactions: Transaction[];

  // Unified Transaction Engine (Phase 4)
  createIncome: (input: CreateIncomeInput) => TransactionEngineResult;
  createExpense: (input: CreateExpenseInput) => TransactionEngineResult;
  createTransfer: (input: CreateTransferInput) => TransactionEngineResult;
  updateTransaction: (
    id: string,
    data: UpdateTransactionInput,
  ) => TransactionEngineResult;
  deleteTransaction: (id: string) => TransactionEngineResult;

  // Compatibility Wrappers
  addTransaction: (
    data: Omit<Transaction, "id" | "created_at" | "user_id">,
  ) => Transaction;
  transferFunds: (params: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    date?: Date;
    note?: string;
    category_id?: string;
  }) => TransactionEngineResult;
  exportTransactionsCSV: () => void;

  // Savings
  savings: Saving[];
  getSavingBalance: (savingId: string) => number;
  addSaving: (
    data: Omit<
      Saving,
      "id" | "user_id" | "current_amount" | "created_at" | "status"
    >,
  ) => Saving;
  updateSaving: (id: string, data: Partial<Saving>) => void;
  deleteSaving: (id: string) => void;
  depositSaving: (id: string, amount: number) => TransactionEngineResult;
  withdrawSaving: (id: string, amount: number) => TransactionEngineResult;

  // Budgets (Phase 8)
  budgets: Budget[];
  createBudget: (input: CreateBudgetInput) => {
    success: boolean;
    budget?: Budget;
    error?: string;
  };
  updateBudget: (
    id: string,
    data: UpdateBudgetInput,
  ) => { success: boolean; budget?: Budget; error?: string };
  deleteBudget: (id: string) => { success: boolean; error?: string };
  getBudgetSpending: (budget: Budget) => BudgetSpendingResult;

  // Debts (Phase 8)
  debts: Debt[];
  debtSummary: DebtSummary;
  createDebt: (input: CreateDebtInput) => {
    success: boolean;
    debt?: Debt;
    error?: string;
  };
  updateDebt: (
    id: string,
    data: UpdateDebtInput,
  ) => { success: boolean; debt?: Debt; error?: string };
  deleteDebt: (id: string) => { success: boolean; error?: string };
  payDebt: (
    debtId: string,
    amount: number,
    note?: string,
  ) => TransactionEngineResult;

  // Split Bills (Phase 8)
  splitBills: SplitBill[];
  splitBillSummary: SplitBillSummary;
  createSplitBill: (input: CreateSplitBillInput) => {
    success: boolean;
    splitBill?: SplitBill;
    error?: string;
  };
  updateSplitBill: (
    id: string,
    data: UpdateSplitBillInput,
  ) => { success: boolean; splitBill?: SplitBill; error?: string };
  deleteSplitBill: (id: string) => { success: boolean; error?: string };
  settleSplitParticipant: (
    splitBillId: string,
    participantId: string,
    recordExpenseIfMe?: boolean,
  ) => TransactionEngineResult;

  // Watchlist
  watchlist: string[];
  toggleWatchlist: (symbol: string) => void;
  isWatchlisted: (symbol: string) => boolean;

  // Computed Financial Values (Determined from Ledger)
  totalIncome: number;
  totalExpense: number;
  netBalance: number; // Backward compatibility alias
  mainBalance: number; // Saldo Utama available spending balance
  totalSavings: number; // Total Tabungan (sum of all current savings)
  totalFunds: number; // Total Dana = Saldo Utama + Total Tabungan

  // System
  resetAllData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonStr: string) => boolean;

  // Subscription & Entitlements (Phase 11)
  subscription: Subscription;
  effectivePlan: SubscriptionPlan;
  isPro: boolean;
  canUse: (feature: Entitlement) => boolean;
  aiUsage: AiUsageRecord;
  incrementAiChatUsage: () => void;
  incrementAiParseUsage: () => void;
}

const STORAGE_KEYS = {
  USER: "monetira_user_v1",
  PREFS: "monetira_prefs_v1",
  ACCOUNTS: "monetira_accounts_v1",
  TRANSACTIONS: "monetira_tx_v1",
  SAVINGS: "monetira_savings_v1",
  WATCHLIST: "monetira_watchlist_v1",
  BUDGETS: "monetira_budgets_v1",
  DEBTS: "monetira_debts_v1",
  SPLIT_BILLS: "monetira_split_bills_v1",
  SUBSCRIPTION: "monetira_subscription_v1",
  AI_USAGE: "monetira_ai_usage_v1",
};

const MonetiraContext = createContext<MonetiraContextType | undefined>(
  undefined,
);

export function MonetiraProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [preferences, setPreferences] =
    useState<UserPreferences>(INITIAL_PREFERENCES);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [savings, setSavings] = useState<Saving[]>(INITIAL_SAVINGS);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [debts, setDebts] = useState<Debt[]>(INITIAL_DEBTS);
  const [splitBills, setSplitBills] =
    useState<SplitBill[]>(INITIAL_SPLIT_BILLS);
  const [watchlist, setWatchlist] = useState<string[]>([
    "BTC",
    "ETH",
    "BBCA",
    "GOLD",
  ]);
  const [subscription, setSubscription] =
    useState<Subscription>(INITIAL_SUBSCRIPTION);
  const [aiUsage, setAiUsage] = useState<AiUsageRecord>(INITIAL_AI_USAGE);

  // Load from LocalStorage on mount with Non-Destructive Deterministic Migration
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) setUser(JSON.parse(storedUser));

        const storedPrefs = localStorage.getItem(STORAGE_KEYS.PREFS);
        if (storedPrefs) setPreferences(JSON.parse(storedPrefs));

        // 1. Load raw data
        let loadedAccounts: Account[] = INITIAL_ACCOUNTS;
        const storedAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
        if (storedAccounts) {
          try {
            const parsed = JSON.parse(storedAccounts) as Account[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedAccounts = parsed.map((a) => ({
                ...a,
                created_at: new Date(a.created_at),
              }));
            }
          } catch (e) {
            console.error("Failed to parse accounts:", e);
          }
        }

        let loadedSavings: Saving[] = INITIAL_SAVINGS;
        const storedSavings = localStorage.getItem(STORAGE_KEYS.SAVINGS);
        if (storedSavings) {
          try {
            const parsed = JSON.parse(storedSavings) as Saving[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedSavings = parsed.map((s) => ({
                ...s,
                created_at: new Date(s.created_at),
                deadline: s.deadline ? new Date(s.deadline) : undefined,
              }));
            }
          } catch (e) {
            console.error("Failed to parse savings:", e);
          }
        }

        let loadedTransactions: Transaction[] = INITIAL_TRANSACTIONS;
        const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        if (storedTx) {
          try {
            const parsed = JSON.parse(storedTx) as Transaction[];
            if (Array.isArray(parsed)) {
              loadedTransactions = parsed.map((t) => ({
                ...t,
                date: new Date(t.date),
                created_at: new Date(t.created_at),
                category: categories.find((c) => c.id === t.category_id),
              }));
            }
          } catch (e) {
            console.error("Failed to parse transactions:", e);
          }
        }

        // 2. Migration: Ensure default MAIN account exists
        let accountsUpdated = false;
        if (!loadedAccounts.some((a) => a.type === "MAIN")) {
          const mainAcc = INITIAL_ACCOUNTS[0];
          loadedAccounts.unshift(mainAcc);
          accountsUpdated = true;
        }

        // Map accounts by id and goal id for lookup
        const accountsMap = new Map<string, Account>();
        loadedAccounts.forEach((acc) => {
          accountsMap.set(acc.id, acc);
          if (acc.savings_goal_id) {
            accountsMap.set(`goal_${acc.savings_goal_id}`, acc);
          }
        });

        // Ensure every savings goal has an associated SAVINGS account
        loadedSavings.forEach((s) => {
          const expectedAccId = `acc_sav_${s.id}`;
          const existingAcc =
            accountsMap.get(expectedAccId) || accountsMap.get(`goal_${s.id}`);
          if (!existingAcc) {
            const newAcc: Account = {
              id: expectedAccId,
              user_id: user.id,
              name: s.name,
              type: "SAVINGS",
              savings_goal_id: s.id,
              opening_balance: s.current_amount || 0,
              created_at: s.created_at || new Date(),
            };
            loadedAccounts.push(newAcc);
            accountsMap.set(newAcc.id, newAcc);
            accountsMap.set(`goal_${s.id}`, newAcc);
            accountsUpdated = true;
          }
        });

        // 3. Migration: Convert legacy savings deposit/withdrawal transactions to Transfers
        let txUpdated = false;
        loadedTransactions = loadedTransactions.map((tx) => {
          if (
            tx.type === "Expense" &&
            tx.note &&
            tx.note.startsWith("Setor Tabungan:")
          ) {
            const targetName = tx.note.replace("Setor Tabungan:", "").trim();
            const matchingSaving = loadedSavings.find(
              (s) => s.name.toLowerCase() === targetName.toLowerCase(),
            );
            const targetAcc = matchingSaving
              ? accountsMap.get(`acc_sav_${matchingSaving.id}`) ||
                accountsMap.get(`goal_${matchingSaving.id}`)
              : null;
            if (targetAcc) {
              txUpdated = true;
              return {
                ...tx,
                type: "Transfer" as TransactionType,
                source_account_id: "acc_main_default",
                destination_account_id: targetAcc.id,
              };
            }
          }

          if (
            tx.type === "Income" &&
            tx.note &&
            tx.note.startsWith("Pencairan Tabungan:")
          ) {
            const targetName = tx.note
              .replace("Pencairan Tabungan:", "")
              .trim();
            const matchingSaving = loadedSavings.find(
              (s) => s.name.toLowerCase() === targetName.toLowerCase(),
            );
            const targetAcc = matchingSaving
              ? accountsMap.get(`acc_sav_${matchingSaving.id}`) ||
                accountsMap.get(`goal_${matchingSaving.id}`)
              : null;
            if (targetAcc) {
              txUpdated = true;
              return {
                ...tx,
                type: "Transfer" as TransactionType,
                source_account_id: targetAcc.id,
                destination_account_id: "acc_main_default",
              };
            }
          }

          return tx;
        });

        // Reconcile opening_balance for accounts that have legacy transactions migrated
        // to guarantee opening_balance + netTransfers === current_amount
        if (txUpdated) {
          loadedAccounts = loadedAccounts.map((acc) => {
            if (acc.type === "SAVINGS" && acc.savings_goal_id) {
              const matchingSaving = loadedSavings.find(
                (s) => s.id === acc.savings_goal_id,
              );
              if (matchingSaving) {
                const trfIn = loadedTransactions
                  .filter(
                    (t) =>
                      t.type === "Transfer" &&
                      t.destination_account_id === acc.id,
                  )
                  .reduce((sum, t) => sum + t.amount, 0);
                const trfOut = loadedTransactions
                  .filter(
                    (t) =>
                      t.type === "Transfer" && t.source_account_id === acc.id,
                  )
                  .reduce((sum, t) => sum + t.amount, 0);
                const correctedOpening = Math.max(
                  0,
                  matchingSaving.current_amount - (trfIn - trfOut),
                );
                return { ...acc, opening_balance: correctedOpening };
              }
            }
            return acc;
          });
          accountsUpdated = true;
        }

        setAccounts(loadedAccounts);
        setSavings(loadedSavings);
        setTransactions(loadedTransactions);

        if (accountsUpdated) {
          localStorage.setItem(
            STORAGE_KEYS.ACCOUNTS,
            JSON.stringify(loadedAccounts),
          );
        }
        if (txUpdated) {
          localStorage.setItem(
            STORAGE_KEYS.TRANSACTIONS,
            JSON.stringify(loadedTransactions),
          );
        }

        const storedWatchlist = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
        if (storedWatchlist) setWatchlist(JSON.parse(storedWatchlist));

        // Load Budgets (Phase 8)
        let loadedBudgets: Budget[] = INITIAL_BUDGETS;
        const storedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
        if (storedBudgets) {
          try {
            const parsed = JSON.parse(storedBudgets) as Budget[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedBudgets = parsed.map((b) => ({
                ...b,
                start_date: new Date(b.start_date),
                created_at: new Date(b.created_at),
                updated_at: b.updated_at ? new Date(b.updated_at) : undefined,
                category: categories.find((c) => c.id === b.category_id),
              }));
            }
          } catch (e) {
            console.error("Failed to parse budgets:", e);
          }
        }

        // Load Debts (Phase 8)
        let loadedDebts: Debt[] = INITIAL_DEBTS;
        const storedDebts = localStorage.getItem(STORAGE_KEYS.DEBTS);
        if (storedDebts) {
          try {
            const parsed = JSON.parse(storedDebts) as Debt[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedDebts = parsed.map((d) => ({
                ...d,
                due_date: d.due_date ? new Date(d.due_date) : undefined,
                created_at: new Date(d.created_at),
                updated_at: d.updated_at ? new Date(d.updated_at) : undefined,
                payments: Array.isArray(d.payments)
                  ? d.payments.map((p) => ({
                      ...p,
                      date: new Date(p.date),
                      created_at: new Date(p.created_at),
                    }))
                  : [],
              }));
            }
          } catch (e) {
            console.error("Failed to parse debts:", e);
          }
        }

        // Load Split Bills (Phase 8)
        let loadedSplitBills: SplitBill[] = INITIAL_SPLIT_BILLS;
        const storedSplit = localStorage.getItem(STORAGE_KEYS.SPLIT_BILLS);
        if (storedSplit) {
          try {
            const parsed = JSON.parse(storedSplit) as SplitBill[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedSplitBills = parsed.map((s) => ({
                ...s,
                date: new Date(s.date),
                created_at: new Date(s.created_at),
                updated_at: s.updated_at ? new Date(s.updated_at) : undefined,
                participants: Array.isArray(s.participants)
                  ? s.participants.map((p) => ({
                      ...p,
                      settled_at: p.settled_at
                        ? new Date(p.settled_at)
                        : undefined,
                    }))
                  : [],
              }));
            }
          } catch (e) {
            console.error("Failed to parse split bills:", e);
          }
        }

        setBudgets(loadedBudgets);
        setDebts(loadedDebts);
        setSplitBills(loadedSplitBills);

        const storedSub = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
        if (storedSub) {
          try {
            const parsedSub = JSON.parse(storedSub);
            setSubscription(parsedSub);
          } catch (e) {
            console.error("Failed to parse stored subscription:", e);
          }
        }

        const storedAiUsage = localStorage.getItem(STORAGE_KEYS.AI_USAGE);
        if (storedAiUsage) {
          try {
            const parsedUsage = JSON.parse(storedAiUsage) as AiUsageRecord;
            const currentWin = getWeeklyWindow();
            if (parsedUsage.week_id !== currentWin.weekId) {
              setAiUsage({
                user_id: user.id,
                week_id: currentWin.weekId,
                chat_count: 0,
                transaction_parse_count: 0,
                updated_at: new Date().toISOString(),
              });
            } else {
              setAiUsage(parsedUsage);
            }
          } catch (e) {
            console.error("Failed to parse stored AI usage:", e);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load local state:", e);
    } finally {
      setIsLoaded(true);
    }
  }, [categories, user.id]);

  // Actions: User & Preferences
  const updateProfile = (data: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...data, updated_at: new Date() }));
  };

  const updatePreferences = (data: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...data }));
  };

  // Primary account resolution
  const mainAccount =
    accounts.find((a) => a.type === "MAIN") || accounts[0] || null;
  const getMainAccount = () => mainAccount;

  // Account Balance Calculation (Determined strictly from Ledger & Opening Balance)
  const getAccountBalance = useCallback(
    (accountId: string): number => {
      const acc = accounts.find((a) => a.id === accountId);
      if (!acc) return 0;
      return calculateAccountBalance(acc, transactions);
    },
    [accounts, transactions],
  );

  const getSavingBalance = useCallback(
    (savingId: string): number => {
      const savAcc = accounts.find(
        (a) => a.savings_goal_id === savingId || a.id === `acc_sav_${savingId}`,
      );
      if (!savAcc) return 0;
      return getAccountBalance(savAcc.id);
    },
    [accounts, getAccountBalance],
  );

  // Dynamic Savings with live, ledger-derived balances (Eliminating dual sources of truth)
  const liveSavings = useMemo(() => {
    return savings.map((s) => {
      const balance = getSavingBalance(s.id);
      const isCompleted = s.target_amount > 0 && balance >= s.target_amount;
      return {
        ...s,
        current_amount: balance,
        status: (isCompleted
          ? "Completed"
          : s.status === "Completed"
            ? "Active"
            : s.status) as SavingStatus,
      };
    });
  }, [savings, getSavingBalance]);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(preferences));
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      localStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(transactions),
      );
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(liveSavings));
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
      localStorage.setItem(
        STORAGE_KEYS.SPLIT_BILLS,
        JSON.stringify(splitBills),
      );
      localStorage.setItem(
        STORAGE_KEYS.SUBSCRIPTION,
        JSON.stringify(subscription),
      );
      localStorage.setItem(STORAGE_KEYS.AI_USAGE, JSON.stringify(aiUsage));
    } catch (e) {
      console.error("Failed to persist state:", e);
    }
  }, [
    user,
    preferences,
    accounts,
    transactions,
    liveSavings,
    watchlist,
    budgets,
    debts,
    splitBills,
    subscription,
    aiUsage,
    isLoaded,
  ]);

  // Derived Subscription & Entitlements (Phase 11)
  const effectivePlan = useMemo(
    () => getEffectivePlan(subscription),
    [subscription],
  );

  const isPro = useMemo(
    () => isSubscriptionActive(subscription) && subscription.plan === "PRO",
    [subscription],
  );

  const canUse = useCallback(
    (feature: Entitlement) => canUseFeature(subscription, feature),
    [subscription],
  );

  const incrementAiChatUsage = useCallback(() => {
    const currentWindow = getWeeklyWindow();
    setAiUsage((prev) => {
      const isNewWeek = prev.week_id !== currentWindow.weekId;
      const newCount = isNewWeek ? 1 : prev.chat_count + 1;
      return {
        ...prev,
        week_id: currentWindow.weekId,
        chat_count: newCount,
        updated_at: new Date().toISOString(),
      };
    });
  }, []);

  const incrementAiParseUsage = useCallback(() => {
    const currentWindow = getWeeklyWindow();
    setAiUsage((prev) => {
      const isNewWeek = prev.week_id !== currentWindow.weekId;
      const newCount = isNewWeek ? 1 : prev.transaction_parse_count + 1;
      return {
        ...prev,
        week_id: currentWindow.weekId,
        transaction_parse_count: newCount,
        updated_at: new Date().toISOString(),
      };
    });
  }, []);

  // =========================================================================
  // UNIFIED TRANSACTION ENGINE (Phase 4 Domain Engine)
  // =========================================================================

  const createIncome = (input: CreateIncomeInput): TransactionEngineResult => {
    const amountVal = validateAmount(input.amount);
    if (!amountVal.valid) {
      return { success: false, error: amountVal.error };
    }

    const primaryAccount =
      mainAccount || accounts.find((a) => a.type === "MAIN") || accounts[0];
    const targetAccountId =
      input.accountId || primaryAccount?.id || "acc_main_default";
    const targetAcc = accounts.find((a) => a.id === targetAccountId);
    if (!targetAcc) {
      return { success: false, error: "Rekening tujuan tidak ditemukan." };
    }

    const category = categories.find((c) => c.id === input.categoryId);
    const newTx: Transaction = {
      id: `trx_inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: user.id,
      account_id: targetAccountId,
      destination_account_id: targetAccountId,
      category_id: input.categoryId || null,
      type: "Income",
      amount: input.amount,
      date: input.date ? new Date(input.date) : new Date(),
      note: input.note || null,
      created_at: new Date(),
      category,
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { success: true, transaction: newTx };
  };

  const createExpense = (
    input: CreateExpenseInput,
  ): TransactionEngineResult => {
    const amountVal = validateAmount(input.amount);
    if (!amountVal.valid) {
      return { success: false, error: amountVal.error };
    }

    const primaryAccount =
      mainAccount || accounts.find((a) => a.type === "MAIN") || accounts[0];
    const sourceAccountId =
      input.accountId || primaryAccount?.id || "acc_main_default";
    const sourceAcc = accounts.find((a) => a.id === sourceAccountId);
    if (!sourceAcc) {
      return { success: false, error: "Rekening sumber tidak ditemukan." };
    }

    const sourceBalance = getAccountBalance(sourceAccountId);
    const balanceVal = validateBalance(
      input.amount,
      sourceBalance,
      sourceAcc.name,
    );
    if (!balanceVal.valid) {
      return { success: false, error: balanceVal.error };
    }

    const category = categories.find((c) => c.id === input.categoryId);
    const newTx: Transaction = {
      id: `trx_exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: user.id,
      account_id: sourceAccountId,
      source_account_id: sourceAccountId,
      category_id: input.categoryId || null,
      type: "Expense",
      amount: input.amount,
      date: input.date ? new Date(input.date) : new Date(),
      note: input.note || null,
      created_at: new Date(),
      category,
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { success: true, transaction: newTx };
  };

  const createTransfer = (
    input: CreateTransferInput,
  ): TransactionEngineResult => {
    const amountVal = validateAmount(input.amount);
    if (!amountVal.valid) {
      return { success: false, error: amountVal.error };
    }

    const accountsVal = validateTransferAccounts(
      input.sourceAccountId,
      input.destinationAccountId,
      accounts,
    );
    if (!accountsVal.valid || !accountsVal.source || !accountsVal.destination) {
      return { success: false, error: accountsVal.error };
    }

    const sourceBalance = getAccountBalance(input.sourceAccountId);
    const balanceVal = validateBalance(
      input.amount,
      sourceBalance,
      accountsVal.source.name,
    );
    if (!balanceVal.valid) {
      return { success: false, error: balanceVal.error };
    }

    const newTx: Transaction = {
      id: `trx_trf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: user.id,
      account_id: input.sourceAccountId,
      source_account_id: input.sourceAccountId,
      destination_account_id: input.destinationAccountId,
      category_id: input.categoryId || null,
      type: "Transfer",
      amount: input.amount,
      date: input.date ? new Date(input.date) : new Date(),
      note:
        input.note ||
        `Transfer: ${accountsVal.source.name} → ${accountsVal.destination.name}`,
      created_at: new Date(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { success: true, transaction: newTx };
  };

  const updateTransaction = (
    id: string,
    data: UpdateTransactionInput,
  ): TransactionEngineResult => {
    const existing = transactions.find((t) => t.id === id);
    if (!existing) {
      return { success: false, error: "Transaksi tidak ditemukan." };
    }

    if (data.amount !== undefined) {
      const amountVal = validateAmount(data.amount);
      if (!amountVal.valid) {
        return { success: false, error: amountVal.error };
      }
    }

    const newType = data.type ?? existing.type;
    const newAmount = data.amount ?? existing.amount;
    const newSourceId =
      data.sourceAccountId ??
      data.accountId ??
      existing.source_account_id ??
      existing.account_id ??
      "acc_main_default";
    const newDestId =
      data.destinationAccountId ??
      data.accountId ??
      existing.destination_account_id ??
      existing.account_id ??
      "acc_main_default";

    // Validate overdraft on update if Expense or Transfer using exact ledger simulation
    if (newType === "Expense") {
      const sourceAcc = accounts.find((a) => a.id === newSourceId);
      if (!sourceAcc) {
        return { success: false, error: "Rekening sumber tidak ditemukan." };
      }
      const candidateTx: Transaction = {
        ...existing,
        type: "Expense",
        amount: newAmount,
        account_id: newSourceId,
        source_account_id: newSourceId,
        destination_account_id: null,
      };
      const candidateTransactions = transactions.map((t) =>
        t.id === id ? candidateTx : t,
      );
      const simBalance = calculateAccountBalance(
        sourceAcc,
        candidateTransactions,
      );
      if (simBalance < 0) {
        const available = simBalance + newAmount;
        return {
          success: false,
          error: `Saldo tidak mencukupi untuk pembaruan transaksi ini. Saldo ${sourceAcc.name} tersedia: Rp${Math.max(0, available).toLocaleString("id-ID")}.`,
        };
      }
    } else if (newType === "Transfer") {
      const trfVal = validateTransferAccounts(newSourceId, newDestId, accounts);
      if (!trfVal.valid || !trfVal.source || !trfVal.destination) {
        return { success: false, error: trfVal.error };
      }
      const candidateTx: Transaction = {
        ...existing,
        type: "Transfer",
        amount: newAmount,
        account_id: newSourceId,
        source_account_id: newSourceId,
        destination_account_id: newDestId,
      };
      const candidateTransactions = transactions.map((t) =>
        t.id === id ? candidateTx : t,
      );
      const simBalance = calculateAccountBalance(
        trfVal.source,
        candidateTransactions,
      );
      if (simBalance < 0) {
        const available = simBalance + newAmount;
        return {
          success: false,
          error: `Saldo tidak mencukupi untuk transfer ini. Saldo ${trfVal.source.name} tersedia: Rp${Math.max(0, available).toLocaleString("id-ID")}.`,
        };
      }
    }

    const categoryId =
      data.categoryId !== undefined ? data.categoryId : existing.category_id;
    const category = categories.find((c) => c.id === categoryId);

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          type: newType,
          amount: newAmount,
          account_id:
            newType === "Transfer"
              ? newSourceId
              : (data.accountId ?? t.account_id),
          source_account_id:
            newType === "Expense" || newType === "Transfer"
              ? newSourceId
              : null,
          destination_account_id:
            newType === "Income" || newType === "Transfer" ? newDestId : null,
          category_id: categoryId,
          category: category ?? t.category,
          date: data.date ? new Date(data.date) : t.date,
          note: data.note !== undefined ? data.note : t.note,
          updated_at: new Date(),
        };
      }),
    );

    return { success: true };
  };

  const deleteTransaction = (id: string): TransactionEngineResult => {
    const existing = transactions.find((t) => t.id === id);
    if (!existing) {
      return { success: false, error: "Transaksi tidak ditemukan." };
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    return { success: true };
  };

  // Compatibility wrapper delegating to unified engine
  const addTransaction = (
    data: Omit<Transaction, "id" | "created_at" | "user_id">,
  ) => {
    if (data.type === "Income") {
      const res = createIncome({
        accountId: data.destination_account_id || data.account_id,
        amount: data.amount,
        categoryId: data.category_id,
        date: data.date,
        note: data.note,
      });
      if (!res.success || !res.transaction) {
        throw new Error(res.error || "Gagal membuat transaksi pemasukan.");
      }
      return res.transaction;
    }
    if (data.type === "Transfer") {
      const res = createTransfer({
        sourceAccountId: data.source_account_id || "acc_main_default",
        destinationAccountId: data.destination_account_id || "acc_main_default",
        amount: data.amount,
        date: data.date,
        note: data.note,
      });
      if (!res.success || !res.transaction) {
        throw new Error(res.error || "Gagal membuat transaksi transfer.");
      }
      return res.transaction;
    }
    const res = createExpense({
      accountId: data.source_account_id || data.account_id,
      amount: data.amount,
      categoryId: data.category_id,
      date: data.date,
      note: data.note,
    });
    if (!res.success || !res.transaction) {
      throw new Error(res.error || "Gagal membuat transaksi pengeluaran.");
    }
    return res.transaction;
  };

  const transferFunds = (params: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    date?: Date;
    note?: string;
    category_id?: string;
  }) => {
    return createTransfer({
      sourceAccountId: params.sourceAccountId,
      destinationAccountId: params.destinationAccountId,
      amount: params.amount,
      date: params.date,
      note: params.note,
      categoryId: params.category_id,
    });
  };

  const exportTransactionsCSV = () => {
    if (typeof window === "undefined") return;
    const headers = ["ID", "Tipe", "Kategori", "Nominal", "Tanggal", "Catatan"];
    const rows = transactions.map((t) => [
      t.id,
      t.type,
      t.category?.name || (t.type === "Transfer" ? "Transfer" : "-"),
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

  // Actions: Savings (Delegating to unified engine)
  const addSaving = (
    data: Omit<
      Saving,
      "id" | "user_id" | "current_amount" | "created_at" | "status"
    >,
  ) => {
    const savingId = `sav_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newSaving: Saving = {
      ...data,
      id: savingId,
      user_id: user.id,
      current_amount: 0,
      status: "Active",
      created_at: new Date(),
    };

    const newAccount: Account = {
      id: `acc_sav_${savingId}`,
      user_id: user.id,
      name: data.name,
      type: "SAVINGS",
      savings_goal_id: savingId,
      opening_balance: 0,
      created_at: new Date(),
    };

    setAccounts((prev) => [...prev, newAccount]);
    setSavings((prev) => [newSaving, ...prev]);
    return newSaving;
  };

  const updateSaving = (id: string, data: Partial<Saving>) => {
    setSavings((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return { ...s, ...data, updated_at: new Date() };
      }),
    );
    if (data.name) {
      const newName = data.name;
      setAccounts((prev) =>
        prev.map((a) =>
          a.savings_goal_id === id || a.id === `acc_sav_${id}`
            ? { ...a, name: newName, updated_at: new Date() }
            : a,
        ),
      );
    }
  };

  const deleteSaving = (id: string) => {
    // Resolve the savings account ID before removing it
    const savAccId =
      accounts.find((a) => a.savings_goal_id === id || a.id === `acc_sav_${id}`)
        ?.id || `acc_sav_${id}`;

    // Cascade: remove all Transfer transactions referencing this savings account
    // This prevents orphan transfers from corrupting MAIN balance after deletion
    setTransactions((prev) =>
      prev.filter((t) => {
        if (t.type !== "Transfer") return true;
        return (
          t.source_account_id !== savAccId &&
          t.destination_account_id !== savAccId
        );
      }),
    );

    setSavings((prev) => prev.filter((s) => s.id !== id));
    setAccounts((prev) =>
      prev.filter((a) => a.savings_goal_id !== id && a.id !== `acc_sav_${id}`),
    );
  };

  const depositSaving = (id: string, amount: number) => {
    const mainAcc = mainAccount || accounts.find((a) => a.type === "MAIN");
    const savAcc = accounts.find(
      (a) => a.savings_goal_id === id || a.id === `acc_sav_${id}`,
    );
    if (!mainAcc || !savAcc) {
      return { success: false, error: "Rekening tabungan tidak ditemukan." };
    }
    const target = savings.find((s) => s.id === id);
    return createTransfer({
      sourceAccountId: mainAcc.id,
      destinationAccountId: savAcc.id,
      amount,
      note: `Setor Tabungan: ${target?.name || "Target Tabungan"}`,
    });
  };

  const withdrawSaving = (id: string, amount: number) => {
    const mainAcc = mainAccount || accounts.find((a) => a.type === "MAIN");
    const savAcc = accounts.find(
      (a) => a.savings_goal_id === id || a.id === `acc_sav_${id}`,
    );
    if (!mainAcc || !savAcc) {
      return { success: false, error: "Rekening tabungan tidak ditemukan." };
    }
    const target = savings.find((s) => s.id === id);
    return createTransfer({
      sourceAccountId: savAcc.id,
      destinationAccountId: mainAcc.id,
      amount,
      note: `Pencairan Tabungan: ${target?.name || "Target Tabungan"}`,
    });
  };

  // =========================================================================
  // BUDGET ACTIONS (Phase 8)
  // =========================================================================

  const getBudgetSpending = useCallback(
    (budget: Budget): BudgetSpendingResult => {
      return calculateBudgetSpending(budget, transactions);
    },
    [transactions],
  );

  const createBudget = (
    input: CreateBudgetInput,
  ): { success: boolean; budget?: Budget; error?: string } => {
    const val = validateBudgetInput(input, budgets);
    if (!val.valid) {
      return { success: false, error: val.error };
    }

    const category = categories.find((c) => c.id === input.categoryId);
    const newBudget: Budget = {
      id: `bud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: user.id,
      category_id: input.categoryId,
      amount: input.amount,
      period: input.period,
      start_date: input.startDate ? new Date(input.startDate) : new Date(),
      created_at: new Date(),
      category,
    };

    setBudgets((prev) => [newBudget, ...prev]);
    return { success: true, budget: newBudget };
  };

  const updateBudget = (
    id: string,
    data: UpdateBudgetInput,
  ): { success: boolean; budget?: Budget; error?: string } => {
    const existing = budgets.find((b) => b.id === id);
    if (!existing) {
      return { success: false, error: "Anggaran tidak ditemukan." };
    }

    const candidate: CreateBudgetInput = {
      categoryId: data.categoryId ?? existing.category_id,
      amount: data.amount ?? existing.amount,
      period: data.period ?? existing.period,
      startDate: data.startDate ?? existing.start_date,
    };

    const val = validateBudgetInput(candidate, budgets, id);
    if (!val.valid) {
      return { success: false, error: val.error };
    }

    const category = categories.find((c) => c.id === candidate.categoryId);
    let updated: Budget | undefined;

    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        updated = {
          ...b,
          category_id: candidate.categoryId,
          amount: candidate.amount,
          period: candidate.period,
          start_date: new Date(candidate.startDate ?? b.start_date),
          updated_at: new Date(),
          category,
        };
        return updated;
      }),
    );

    return { success: true, budget: updated };
  };

  const deleteBudget = (id: string): { success: boolean; error?: string } => {
    const existing = budgets.find((b) => b.id === id);
    if (!existing) {
      return { success: false, error: "Anggaran tidak ditemukan." };
    }
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    return { success: true };
  };

  // =========================================================================
  // DEBT ACTIONS (Phase 8)
  // =========================================================================

  const debtSummary = useMemo(() => calculateDebtSummary(debts), [debts]);

  const createDebt = (
    input: CreateDebtInput,
  ): { success: boolean; debt?: Debt; error?: string } => {
    const val = validateDebtInput(input);
    if (!val.valid) {
      return { success: false, error: val.error };
    }

    const newDebt: Debt = {
      id: `debt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: user.id,
      person_name: input.personName.trim(),
      direction: input.direction,
      original_amount: input.amount,
      remaining_amount: input.amount,
      due_date: input.dueDate ? new Date(input.dueDate) : null,
      note: input.note?.trim() || null,
      status: "UNPAID",
      created_at: new Date(),
      payments: [],
    };

    setDebts((prev) => [newDebt, ...prev]);
    return { success: true, debt: newDebt };
  };

  const updateDebt = (
    id: string,
    data: UpdateDebtInput,
  ): { success: boolean; debt?: Debt; error?: string } => {
    const existing = debts.find((d) => d.id === id);
    if (!existing) {
      return { success: false, error: "Hutang/piutang tidak ditemukan." };
    }

    let updated: Debt | undefined;
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        updated = {
          ...d,
          person_name:
            data.personName !== undefined
              ? data.personName.trim()
              : d.person_name,
          due_date:
            data.dueDate !== undefined
              ? data.dueDate
                ? new Date(data.dueDate)
                : null
              : d.due_date,
          note: data.note !== undefined ? data.note?.trim() || null : d.note,
          updated_at: new Date(),
        };
        return updated;
      }),
    );

    return { success: true, debt: updated };
  };

  const deleteDebt = (id: string): { success: boolean; error?: string } => {
    const existing = debts.find((d) => d.id === id);
    if (!existing) {
      return { success: false, error: "Hutang/piutang tidak ditemukan." };
    }
    setDebts((prev) => prev.filter((d) => d.id !== id));
    return { success: true };
  };

  const payDebt = (
    debtId: string,
    amount: number,
    note?: string,
  ): TransactionEngineResult => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) {
      return {
        success: false,
        error: "Catatan hutang/piutang tidak ditemukan.",
      };
    }

    const val = validateDebtPayment(debt, amount);
    if (!val.valid) {
      return { success: false, error: val.error };
    }

    const primaryAcc = mainAccount || accounts.find((a) => a.type === "MAIN");
    if (!primaryAcc) {
      return { success: false, error: "Rekening Saldo Utama tidak ditemukan." };
    }

    let txResult: TransactionEngineResult;

    if (debt.direction === "OWED_BY_ME") {
      // User pays someone -> Expense from Saldo Utama
      const debtExpCategory =
        categories.find((c) => c.id === "cat_exp_debt") ||
        categories.find((c) => c.type === "Expense");
      txResult = createExpense({
        accountId: primaryAcc.id,
        amount,
        categoryId: debtExpCategory?.id || null,
        note: note || `Pembayaran hutang ke ${debt.person_name}`,
      });
    } else {
      // Debtor pays user -> Income to Saldo Utama
      const debtIncCategory =
        categories.find((c) => c.id === "cat_inc_debt") ||
        categories.find((c) => c.type === "Income");
      txResult = createIncome({
        accountId: primaryAcc.id,
        amount,
        categoryId: debtIncCategory?.id || null,
        note: note || `Penerimaan piutang dari ${debt.person_name}`,
      });
    }

    if (!txResult.success || !txResult.transaction) {
      return txResult;
    }

    const payment: DebtPayment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      debt_id: debt.id,
      amount,
      date: new Date(),
      transaction_id: txResult.transaction.id,
      note: note || null,
      created_at: new Date(),
    };

    const newRemaining = Math.max(0, debt.remaining_amount - amount);
    const newStatus: DebtStatus = newRemaining === 0 ? "PAID" : "PARTIAL";

    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== debtId) return d;
        return {
          ...d,
          remaining_amount: newRemaining,
          status: newStatus,
          updated_at: new Date(),
          payments: [...(d.payments || []), payment],
        };
      }),
    );

    return { success: true, transaction: txResult.transaction };
  };

  // =========================================================================
  // SPLIT BILL ACTIONS (Phase 8)
  // =========================================================================

  const splitBillSummary = useMemo(
    () => calculateSplitBillSummary(splitBills),
    [splitBills],
  );

  const createSplitBill = (
    input: CreateSplitBillInput,
  ): { success: boolean; splitBill?: SplitBill; error?: string } => {
    const val = validateSplitBill(input);
    if (!val.valid) {
      return { success: false, error: val.error };
    }

    const newSplitBill: SplitBill = {
      id: `sb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: user.id,
      title: input.title.trim(),
      total_amount: input.totalAmount,
      date: input.date ? new Date(input.date) : new Date(),
      note: input.note?.trim() || null,
      participants: input.participants.map((p, index) => ({
        id: `part_${Date.now()}_${index}`,
        name: p.name.trim(),
        amount: p.amount,
        is_me: p.is_me,
        paid: p.is_me, // User paid upfront
      })),
      created_at: new Date(),
    };

    setSplitBills((prev) => [newSplitBill, ...prev]);
    return { success: true, splitBill: newSplitBill };
  };

  const updateSplitBill = (
    id: string,
    data: UpdateSplitBillInput,
  ): { success: boolean; splitBill?: SplitBill; error?: string } => {
    const existing = splitBills.find((s) => s.id === id);
    if (!existing) {
      return { success: false, error: "Split bill tidak ditemukan." };
    }

    let updated: SplitBill | undefined;
    setSplitBills((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        updated = {
          ...s,
          title: data.title !== undefined ? data.title.trim() : s.title,
          note: data.note !== undefined ? data.note?.trim() || null : s.note,
          updated_at: new Date(),
        };
        return updated;
      }),
    );

    return { success: true, splitBill: updated };
  };

  const deleteSplitBill = (
    id: string,
  ): { success: boolean; error?: string } => {
    const existing = splitBills.find((s) => s.id === id);
    if (!existing) {
      return { success: false, error: "Split bill tidak ditemukan." };
    }
    setSplitBills((prev) => prev.filter((s) => s.id !== id));
    return { success: true };
  };

  const settleSplitParticipant = (
    splitBillId: string,
    participantId: string,
    recordExpenseIfMe = false,
  ): TransactionEngineResult => {
    const bill = splitBills.find((s) => s.id === splitBillId);
    if (!bill) {
      return { success: false, error: "Split bill tidak ditemukan." };
    }

    const participant = bill.participants.find((p) => p.id === participantId);
    if (!participant) {
      return { success: false, error: "Partisipan tidak ditemukan." };
    }

    if (participant.paid) {
      return { success: false, error: "Bagian partisipan ini sudah lunas." };
    }

    const primaryAcc = mainAccount || accounts.find((a) => a.type === "MAIN");
    if (!primaryAcc) {
      return { success: false, error: "Rekening Saldo Utama tidak ditemukan." };
    }

    let txResult: TransactionEngineResult = { success: true };

    if (!participant.is_me) {
      // Participant reimburses user -> Income to Saldo Utama
      const splitCategory =
        categories.find((c) => c.id === "cat_inc_split") ||
        categories.find((c) => c.type === "Income");
      txResult = createIncome({
        accountId: primaryAcc.id,
        amount: participant.amount,
        categoryId: splitCategory?.id || null,
        note: `Pelunasan Split Bill "${bill.title}" dari ${participant.name}`,
      });
    } else if (recordExpenseIfMe) {
      // User records their own share as Expense
      const expCategory =
        categories.find((c) => c.id === "cat_exp_5") ||
        categories.find((c) => c.type === "Expense");
      txResult = createExpense({
        accountId: primaryAcc.id,
        amount: participant.amount,
        categoryId: expCategory?.id || null,
        note: `Bagian saya di Split Bill: ${bill.title}`,
      });
    }

    if (!txResult.success) {
      return txResult;
    }

    setSplitBills((prev) =>
      prev.map((b) => {
        if (b.id !== splitBillId) return b;
        return {
          ...b,
          updated_at: new Date(),
          participants: b.participants.map((p) => {
            if (p.id !== participantId) return p;
            return {
              ...p,
              paid: true,
              settled_at: new Date(),
              transaction_id: txResult.transaction?.id || null,
            };
          }),
        };
      }),
    );

    return txResult;
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
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSavings(INITIAL_SAVINGS);
    setBudgets(INITIAL_BUDGETS);
    setDebts(INITIAL_DEBTS);
    setSplitBills(INITIAL_SPLIT_BILLS);
    setWatchlist(["BTC", "ETH", "BBCA", "GOLD"]);
    setSubscription(INITIAL_SUBSCRIPTION);
    setAiUsage(INITIAL_AI_USAGE);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.PREFS);
      localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.SAVINGS);
      localStorage.removeItem(STORAGE_KEYS.WATCHLIST);
      localStorage.removeItem(STORAGE_KEYS.BUDGETS);
      localStorage.removeItem(STORAGE_KEYS.DEBTS);
      localStorage.removeItem(STORAGE_KEYS.SPLIT_BILLS);
      localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION);
      localStorage.removeItem(STORAGE_KEYS.AI_USAGE);
    }
  };

  const exportBackupJSON = () => {
    if (typeof window === "undefined") return;
    const backup = {
      version: "1.4",
      timestamp: new Date().toISOString(),
      user,
      preferences,
      accounts,
      transactions,
      savings: liveSavings,
      budgets,
      debts,
      splitBills,
      watchlist,
      subscription,
      aiUsage,
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
      if (
        data.accounts &&
        Array.isArray(data.accounts) &&
        data.accounts.length > 0
      ) {
        setAccounts(
          (data.accounts as Account[]).map((a) => ({
            ...a,
            created_at: new Date(a.created_at),
          })),
        );
      } else {
        setAccounts(INITIAL_ACCOUNTS);
      }
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
      if (data.budgets && Array.isArray(data.budgets)) {
        setBudgets(
          (data.budgets as Budget[]).map((b) => ({
            ...b,
            start_date: new Date(b.start_date),
            created_at: new Date(b.created_at),
            updated_at: b.updated_at ? new Date(b.updated_at) : undefined,
          })),
        );
      }
      if (data.debts && Array.isArray(data.debts)) {
        setDebts(
          (data.debts as Debt[]).map((d) => ({
            ...d,
            due_date: d.due_date ? new Date(d.due_date) : undefined,
            created_at: new Date(d.created_at),
            updated_at: d.updated_at ? new Date(d.updated_at) : undefined,
            payments: Array.isArray(d.payments)
              ? d.payments.map((p) => ({
                  ...p,
                  date: new Date(p.date),
                  created_at: new Date(p.created_at),
                }))
              : [],
          })),
        );
      }
      if (data.splitBills && Array.isArray(data.splitBills)) {
        setSplitBills(
          (data.splitBills as SplitBill[]).map((s) => ({
            ...s,
            date: new Date(s.date),
            created_at: new Date(s.created_at),
            updated_at: s.updated_at ? new Date(s.updated_at) : undefined,
            participants: Array.isArray(s.participants)
              ? s.participants.map((p) => ({
                  ...p,
                  settled_at: p.settled_at ? new Date(p.settled_at) : undefined,
                }))
              : [],
          })),
        );
      }
      if (data.user) setUser(data.user);
      if (data.preferences) setPreferences(data.preferences);
      if (data.watchlist) setWatchlist(data.watchlist);
      if (data.subscription && typeof data.subscription === "object") {
        setSubscription(data.subscription);
      }
      if (data.aiUsage && typeof data.aiUsage === "object") {
        setAiUsage(data.aiUsage);
      }
      return true;
    } catch (e) {
      console.error("Failed to import backup:", e);
      return false;
    }
  };

  // Global genuine living transaction totals (Excludes Transfers)
  const totalIncome = transactions
    .filter((t) => t.type === "Income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "Expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Saldo Utama (Main account spending money)
  const mainBalance = mainAccount ? getAccountBalance(mainAccount.id) : 0;

  // Total Tabungan (Calculated directly from live savings account balances)
  const totalSavings = liveSavings.reduce(
    (acc, curr) => acc + curr.current_amount,
    0,
  );

  // Total Dana = Saldo Utama + Total Tabungan
  const totalFunds = mainBalance + totalSavings;

  // Backward compatibility alias for components referencing netBalance
  const netBalance = mainBalance;

  return (
    <MonetiraContext.Provider
      value={{
        isLoaded,
        user,
        preferences,
        updateProfile,
        updatePreferences,
        accounts,
        mainAccount,
        getMainAccount,
        getAccountBalance,
        createIncome,
        createExpense,
        createTransfer,
        updateTransaction,
        deleteTransaction,
        addTransaction,
        transferFunds,
        categories,
        transactions,
        exportTransactionsCSV,
        savings: liveSavings,
        getSavingBalance,
        addSaving,
        updateSaving,
        deleteSaving,
        depositSaving,
        withdrawSaving,
        budgets,
        createBudget,
        updateBudget,
        deleteBudget,
        getBudgetSpending,
        debts,
        debtSummary,
        createDebt,
        updateDebt,
        deleteDebt,
        payDebt,
        splitBills,
        splitBillSummary,
        createSplitBill,
        updateSplitBill,
        deleteSplitBill,
        settleSplitParticipant,
        watchlist,
        toggleWatchlist,
        isWatchlisted,
        totalIncome,
        totalExpense,
        netBalance,
        mainBalance,
        totalSavings,
        totalFunds,
        resetAllData,
        exportBackupJSON,
        importBackupJSON,
        subscription,
        effectivePlan,
        isPro,
        canUse,
        aiUsage,
        incrementAiChatUsage,
        incrementAiParseUsage,
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
