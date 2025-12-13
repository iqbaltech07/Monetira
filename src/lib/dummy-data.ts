import type {
  AiInsight,
  Category,
  MarketWatchlist,
  Saving,
  SavingLog,
  Transaction,
  User,
} from "~/types/database";

// 1. Users
export const DUMMY_USER: User = {
  id: "user_01",
  email: "iqbal@monetira.com",
  name: "Iqbal Tech",
  image: "https://github.com/shadcn.png",
  phone: "081234567890",
  role: "User",
  created_at: new Date("2024-01-01"),
};

// 2. Categories
export const DUMMY_CATEGORIES: Category[] = [
  // Income
  {
    id: "cat_inc_1",
    name: "Gaji",
    type: "Income",
    icon: "Wallet",
    created_at: new Date(),
  },
  {
    id: "cat_inc_2",
    name: "Freelance",
    type: "Income",
    icon: "Laptop",
    created_at: new Date(),
  },
  {
    id: "cat_inc_3",
    name: "Investasi",
    type: "Income",
    icon: "TrendingUp",
    created_at: new Date(),
  },

  // Expense
  {
    id: "cat_exp_1",
    name: "Makanan",
    type: "Expense",
    icon: "Utensils",
    created_at: new Date(),
  },
  {
    id: "cat_exp_2",
    name: "Transportasi",
    type: "Expense",
    icon: "Car",
    created_at: new Date(),
  },
  {
    id: "cat_exp_3",
    name: "Tempat Tinggal",
    type: "Expense",
    icon: "Home",
    created_at: new Date(),
  },
  {
    id: "cat_exp_4",
    name: "Hiburan",
    type: "Expense",
    icon: "Film",
    created_at: new Date(),
  },
  {
    id: "cat_exp_5",
    name: "Belanja",
    type: "Expense",
    icon: "ShoppingBag",
    created_at: new Date(),
  },
  {
    id: "cat_exp_6",
    name: "Kesehatan",
    type: "Expense",
    icon: "HeartPulse",
    created_at: new Date(),
  },
  {
    id: "cat_exp_7",
    name: "Pendidikan",
    type: "Expense",
    icon: "BookOpen",
    created_at: new Date(),
  },
];

// 3. Transactions
export const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    id: "trx_1",
    user_id: "user_01",
    category_id: "cat_inc_1",
    type: "Income",
    amount: 15000000,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // 1st of current month
    note: "Gaji Bulanan",
    created_at: new Date(),
    category: DUMMY_CATEGORIES.find((c) => c.id === "cat_inc_1"),
  },
  {
    id: "trx_2",
    user_id: "user_01",
    category_id: "cat_exp_3",
    type: "Expense",
    amount: 3500000,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 2),
    note: "Bayar Kost",
    created_at: new Date(),
    category: DUMMY_CATEGORIES.find((c) => c.id === "cat_exp_3"),
  },
  {
    id: "trx_3",
    user_id: "user_01",
    category_id: "cat_exp_1",
    type: "Expense",
    amount: 50000,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 3),
    note: "Makan Siang",
    created_at: new Date(),
    category: DUMMY_CATEGORIES.find((c) => c.id === "cat_exp_1"),
  },
  {
    id: "trx_4",
    user_id: "user_01",
    category_id: "cat_exp_2",
    type: "Expense",
    amount: 25000,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 3),
    note: "Ojek Online",
    created_at: new Date(),
    category: DUMMY_CATEGORIES.find((c) => c.id === "cat_exp_2"),
  },
  {
    id: "trx_5",
    user_id: "user_01",
    category_id: "cat_inc_2",
    type: "Income",
    amount: 2500000,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
    note: "Proyek Website",
    created_at: new Date(),
    category: DUMMY_CATEGORIES.find((c) => c.id === "cat_inc_2"),
  },
  {
    id: "trx_6",
    user_id: "user_01",
    category_id: "cat_exp_4",
    type: "Expense",
    amount: 150000,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 12),
    note: "Nonton Bioskop",
    created_at: new Date(),
    category: DUMMY_CATEGORIES.find((c) => c.id === "cat_exp_4"),
  },
];

// 4. Savings
export const DUMMY_SAVINGS: Saving[] = [
  {
    id: "sav_1",
    user_id: "user_01",
    name: "Dana Darurat",
    target_amount: 50000000,
    current_amount: 15000000,
    deadline: new Date("2025-12-31"),
    emoji: "🛡️",
    status: "Active",
    created_at: new Date("2024-01-01"),
  },
  {
    id: "sav_2",
    user_id: "user_01",
    name: "Liburan Jepang",
    target_amount: 30000000,
    current_amount: 5000000,
    deadline: new Date("2025-06-01"),
    emoji: "✈️",
    status: "Active",
    created_at: new Date("2024-02-01"),
  },
  {
    id: "sav_3",
    user_id: "user_01",
    name: "MacBook Pro M4",
    target_amount: 35000000,
    current_amount: 35000000,
    deadline: new Date("2024-12-01"),
    emoji: "💻",
    status: "Completed",
    created_at: new Date("2024-01-15"),
  },
];

// 5. Saving Logs
export const DUMMY_SAVING_LOGS: SavingLog[] = [
  {
    id: "log_1",
    saving_id: "sav_1",
    amount: 5000000,
    type: "Deposit",
    created_at: new Date("2024-01-01"),
  },
  {
    id: "log_2",
    saving_id: "sav_1",
    amount: 5000000,
    type: "Deposit",
    created_at: new Date("2024-02-01"),
  },
  {
    id: "log_3",
    saving_id: "sav_1",
    amount: 5000000,
    type: "Deposit",
    created_at: new Date("2024-03-01"),
  },
];

// 6. Market Watchlist
export const DUMMY_WATCHLIST: MarketWatchlist[] = [
  {
    id: "mw_1",
    user_id: "user_01",
    asset_symbol: "BTC",
    asset_type: "Crypto",
    created_at: new Date(),
  },
  {
    id: "mw_2",
    user_id: "user_01",
    asset_symbol: "ETH",
    asset_type: "Crypto",
    created_at: new Date(),
  },
  {
    id: "mw_3",
    user_id: "user_01",
    asset_symbol: "BBCA",
    asset_type: "Stock",
    created_at: new Date(),
  },
  {
    id: "mw_4",
    user_id: "user_01",
    asset_symbol: "NVDA",
    asset_type: "Stock",
    created_at: new Date(),
  },
];

// 7. AI Insights
export const DUMMY_INSIGHTS: AiInsight[] = [
  {
    id: "ai_1",
    user_id: "user_01",
    type: "Monthly_Review",
    content:
      "Pengeluaran Anda bulan ini lebih hemat 15% dibandingkan bulan lalu. Pertahankan!",
    created_at: new Date(),
  },
  {
    id: "ai_2",
    user_id: "user_01",
    type: "Savings_Advice",
    content:
      "Jika Anda menabung Rp 2.000.000 lagi bulan ini, Anda akan mencapai target Dana Darurat 6 bulan lebih cepat.",
    created_at: new Date(),
  },
];

// Helpers
export const getTransactions = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return DUMMY_TRANSACTIONS.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const getSavings = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return DUMMY_SAVINGS;
};

export const getCategories = async () => {
  return DUMMY_CATEGORIES;
};

export const getUser = async () => {
  return DUMMY_USER;
};
