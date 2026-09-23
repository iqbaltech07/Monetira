export type Role = "Admin" | "User";
export type CategoryType = "Income" | "Expense";
export type TransactionType = "Income" | "Expense";
export type SavingStatus = "Active" | "Completed" | "Cancelled";
export type SavingLogType = "Deposit" | "Withdraw";
export type AssetType = "Crypto" | "Stock";
export type AiInsightType = "Monthly_Review" | "Savings_Advice" | "Risk_Alert";

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
  icon?: string;
  image?: string;
}

export interface UserPreferences {
  currency: "IDR" | "USD" | "EUR" | "SGD";
  monthlyBudget: number;
  emailNotifications: boolean;
  budgetAlerts: boolean;
  theme: "system" | "light" | "dark";
}
