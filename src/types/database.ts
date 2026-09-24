export type Role = "Admin" | "User";
export type AccountType = "MAIN" | "SAVINGS";
export type CategoryType = "Income" | "Expense";
export type TransactionType = "Income" | "Expense" | "Transfer";
export type SavingStatus = "Active" | "Completed" | "Cancelled";
export type SavingLogType = "Deposit" | "Withdraw";
export type AssetType = "Crypto" | "Stock";
export type AiInsightType = "Monthly_Review" | "Savings_Advice" | "Risk_Alert";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  savings_goal_id?: string | null;
  opening_balance?: number; // Initial balance for migration / opening funds
  created_at: Date;
  updated_at?: Date | null;
}

export interface User {
  id: string;
  email: string;
  password_hash?: string | null;
  name: string;
  image?: string | null;
  phone?: string | null;
  role: Role;
  created_at: Date;
  updated_at?: Date | null;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon?: string | null;
  created_by?: string | null; // Null = Default System Category
  created_at: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string | null; // Primary/legacy account (defaults to Saldo Utama)
  source_account_id?: string | null; // Originating account (for Transfer/Expense)
  destination_account_id?: string | null; // Receiving account (for Transfer/Income)
  category_id?: string | null;
  type: TransactionType;
  amount: number;
  date: Date;
  note?: string | null;
  created_at: Date;
  updated_at?: Date | null;
  // Joined fields for UI convenience
  category?: Category;
}

export interface Saving {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: Date | null;
  emoji?: string | null;
  status: SavingStatus;
  created_at: Date;
  updated_at?: Date | null;
}

export interface SavingLog {
  id: string;
  saving_id: string;
  amount: number;
  type: SavingLogType;
  created_at: Date;
}

export interface MarketWatchlist {
  id: string;
  user_id: string;
  asset_symbol: string;
  asset_type: AssetType;
  created_at: Date;
}

export interface AiInsight {
  id: string;
  user_id: string;
  type: AiInsightType;
  content: string;
  created_at: Date;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  category: "Crypto" | "Stock" | "Commodity" | "Forex";
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: string;
  sparkline: number[];
  unit?: string;
  currency?: string;
  icon?: string;
  image?: string;
}

export interface GoldQuote {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  unit: string;
  change24h: number;
  high24h?: number;
  low24h?: number;
  timestamp: string;
  priceInIdr?: number;
  perGramInIdr?: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: string;
  timestamp: string;
  sparkline?: number[];
}

export interface UserPreferences {
  currency: "IDR" | "USD" | "EUR" | "SGD";
  monthlyBudget: number;
  emailNotifications: boolean;
  budgetAlerts: boolean;
  theme: "system" | "light" | "dark";
}

// ==========================================
// PHASE 8: BUDGET, DEBT, & SPLIT BILL TYPES
// ==========================================

export type BudgetPeriod = "WEEKLY" | "MONTHLY";
export type BudgetStatus = "NOT_USED" | "ON_TRACK" | "WARNING" | "EXCEEDED";

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: BudgetPeriod;
  start_date: Date;
  created_at: Date;
  updated_at?: Date | null;
  category?: Category;
}

export interface CreateBudgetInput {
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate?: Date | string;
}

export interface UpdateBudgetInput {
  categoryId?: string;
  amount?: number;
  period?: BudgetPeriod;
  startDate?: Date | string;
}

export type DebtDirection = "OWED_BY_ME" | "OWED_TO_ME";
export type DebtStatus = "UNPAID" | "PARTIAL" | "PAID";

export interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  date: Date;
  transaction_id?: string | null;
  note?: string | null;
  created_at: Date;
}

export interface Debt {
  id: string;
  user_id: string;
  person_name: string;
  direction: DebtDirection;
  original_amount: number;
  remaining_amount: number;
  due_date?: Date | null;
  note?: string | null;
  status: DebtStatus;
  created_at: Date;
  updated_at?: Date | null;
  payments?: DebtPayment[];
}

export interface CreateDebtInput {
  personName: string;
  direction: DebtDirection;
  amount: number;
  dueDate?: Date | string | null;
  note?: string | null;
}

export interface UpdateDebtInput {
  personName?: string;
  dueDate?: Date | string | null;
  note?: string | null;
}

export interface SplitParticipant {
  id: string;
  name: string;
  amount: number;
  is_me: boolean;
  paid: boolean;
  settled_at?: Date | null;
  transaction_id?: string | null;
}

export interface SplitBill {
  id: string;
  user_id: string;
  title: string;
  total_amount: number;
  date: Date;
  note?: string | null;
  participants: SplitParticipant[];
  created_at: Date;
  updated_at?: Date | null;
}

export interface CreateSplitBillInput {
  title: string;
  totalAmount: number;
  date?: Date | string;
  note?: string | null;
  participants: Array<{
    name: string;
    amount: number;
    is_me: boolean;
  }>;
}

export interface UpdateSplitBillInput {
  title?: string;
  note?: string | null;
}

// ==========================================
// PHASE 11: SUBSCRIPTION & ENTITLEMENT TYPES
// ==========================================

export type SubscriptionPlan = "FREE" | "PRO";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";

export type Entitlement =
  | "AI_CHAT"
  | "AI_TRANSACTION"
  | "ADVANCED_REPORTS"
  | "SPLIT_BILL"
  | "DEBT"
  | "ADVANCED_INSIGHTS";

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  started_at: Date | string;
  expires_at: Date | string;
  created_at: Date | string;
  updated_at?: Date | string | null;
}

export interface AiUsageRecord {
  user_id: string;
  week_id: string; // e.g. "2026-W39"
  chat_count: number;
  transaction_parse_count: number;
  updated_at: Date | string;
}
