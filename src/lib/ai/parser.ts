/**
 * Deterministic Transaction Parser for Bahasa Indonesia
 *
 * This module provides rule-based parsing for natural language transaction input.
 * It is designed as the default implementation of the parser interface.
 *
 * Architecture:
 *   Natural Language
 *        ↓
 *   Deterministic Parser (this module)
 *        ↓
 *   TransactionIntent
 *        ↓
 *   Application Layer validation & account resolution
 *        ↓
 *   Unified Transaction Engine
 *
 * IMPORTANT: This parser NEVER:
 * - Calculates account balances
 * - Writes to localStorage
 * - Bypasses createIncome / createExpense / createTransfer
 * - Produces account_id directly (only name hints)
 */

import type { ParseResult, TransactionIntent } from "./types";

// ============================================================
// AMOUNT PARSING
// Handles Indonesian currency formats:
// 25rb, 25 ribu, 25.000, Rp25.000, 1jt, 1 juta, 1.5 juta
// ============================================================

const MULTIPLIERS: Record<string, number> = {
  rb: 1_000,
  ribu: 1_000,
  k: 1_000,
  jt: 1_000_000,
  juta: 1_000_000,
  m: 1_000_000,
  miliar: 1_000_000_000,
  b: 1_000_000_000,
};

/**
 * Parses Indonesian currency strings into a numeric IDR value.
 * Returns null if the string does not contain a recognisable amount.
 */
export function parseAmount(raw: string): number | null {
  // Normalize: lowercase, strip Rp prefix and thousands separators
  const cleaned = raw
    .toLowerCase()
    .replace(/rp\.?\s*/gi, "")
    .replace(/[,]/g, ""); // remove commas (e.g. 1,500,000)

  // Pattern: number (with optional decimal dot) + optional multiplier suffix
  // e.g. "1.5 juta", "25rb", "500ribu", "25.000"
  const pattern =
    /(\d+(?:[.,]\d+)?)\s*(rb|ribu|k(?!g)|jt|juta|m(?!g)|miliar|b(?!u))?/i;

  const match = cleaned.match(pattern);
  if (!match) return null;

  const [, numStr, unit] = match;

  // Parse base number: handle dots as thousands separators or decimal points
  // Heuristic: if the decimal part is exactly 3 digits, treat dot as thousands sep
  let base: number;
  if (numStr.includes(".")) {
    const parts = numStr.split(".");
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.length === 3 && parts.length === 2) {
      // "25.000" → 25000 (thousands separator)
      base = Number.parseFloat(numStr.replace(".", ""));
    } else {
      // "1.5" → 1.5 (decimal)
      base = Number.parseFloat(numStr);
    }
  } else {
    base = Number.parseFloat(numStr);
  }

  if (Number.isNaN(base)) return null;

  const multiplier = unit ? (MULTIPLIERS[unit.toLowerCase()] ?? 1) : 1;
  const result = base * multiplier;

  // Final guard
  if (!Number.isFinite(result) || result <= 0) return null;
  return result;
}

// ============================================================
// KEYWORD DICTIONARIES
// ============================================================

const EXPENSE_KEYWORDS = [
  "beli",
  "bayar",
  "ngopi",
  "makan",
  "belanja",
  "beli",
  "jajan",
  "nonton",
  "transport",
  "bensin",
  "ojek",
  "grab",
  "gojek",
  "listrik",
  "air",
  "iuran",
  "sewa",
  "kost",
  "cicilan",
  "langganan",
  "pulsa",
  "kuota",
  "obat",
  "parkir",
  "tol",
  "tiket",
  "top up",
  "topup",
  "refill",
  "beli makanan",
  "beli minuman",
  "beli baju",
  "tagihan",
  "beli kopi",
  "expense",
  "pengeluaran",
  "habiskan",
  "keluar",
  "spending",
  "fee",
  "biaya",
  "ongkos",
  "denda",
];

const INCOME_KEYWORDS = [
  "gaji",
  "gajian",
  "terima",
  "dapat",
  "masuk",
  "income",
  "pemasukan",
  "freelance",
  "honor",
  "bonus",
  "dividen",
  "investasi cair",
  "uang masuk",
  "transfer masuk",
  "kiriman",
  "received",
  "dapet",
  "dapat uang",
  "gajinya",
  "hasil",
  "untung",
  "profit",
  "fee masuk",
  "komisi",
  "lembur",
];

const TRANSFER_KEYWORDS = [
  "pindahin",
  "pindahkan",
  "transfer",
  "masukkan ke",
  "masukkan",
  "setor ke",
  "setor",
  "simpan ke",
  "simpan",
  "alokasi",
  "alokasikan",
  "kirim ke",
  "tabung",
  "tabungin",
  "ke tabungan",
  "ke dana",
  "ke saldo",
];

// Account name hints that indicate transfer destination
const SAVINGS_HINTS = [
  "dana darurat",
  "darurat",
  "tabungan",
  "saving",
  "liburan",
  "jepang",
  "laptop",
  "rumah",
  "dp",
  "investasi",
  "emergency",
  "vacation",
  "holiday",
];

// Category keyword mapping (for Expense)
const CATEGORY_MAP: Array<{ keywords: string[]; category: string }> = [
  {
    keywords: [
      "makan",
      "makanan",
      "minum",
      "restoran",
      "warung",
      "cafe",
      "kopi",
      "sarapan",
      "siang",
      "malam",
      "jajan",
    ],
    category: "Makanan & Minuman",
  },
  {
    keywords: [
      "bensin",
      "bbm",
      "parkir",
      "tol",
      "ojek",
      "grab",
      "gojek",
      "transport",
      "bis",
      "kereta",
      "mrt",
      "lrt",
      "commuter",
    ],
    category: "Transportasi",
  },
  {
    keywords: [
      "listrik",
      "air",
      "pln",
      "pdam",
      "internet",
      "wifi",
      "pulsa",
      "kuota",
      "telpon",
      "tagihan",
    ],
    category: "Tagihan",
  },
  {
    keywords: [
      "baju",
      "sepatu",
      "beli",
      "belanja",
      "mall",
      "online shop",
      "shopee",
      "tokopedia",
      "fashion",
    ],
    category: "Belanja",
  },
  {
    keywords: [
      "nonton",
      "bioskop",
      "game",
      "hiburan",
      "rekreasi",
      "wisata",
      "liburan",
      "spotify",
      "netflix",
    ],
    category: "Hiburan",
  },
  {
    keywords: [
      "obat",
      "dokter",
      "rumah sakit",
      "klinik",
      "apotik",
      "kesehatan",
      "vitamin",
    ],
    category: "Kesehatan",
  },
  {
    keywords: ["sewa", "kost", "kontrakan", "cicilan", "kredit", "kpr"],
    category: "Perumahan",
  },
  {
    keywords: ["gaji", "freelance", "honor", "bonus", "dividen", "komisi"],
    category: "Pendapatan",
  },
];

function inferCategory(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const { keywords, category } of CATEGORY_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return undefined;
}

function inferDescription(text: string, type: string): string {
  // Remove common filler words to get a cleaner description
  const fillers = [
    /^tadi\s+/i,
    /^barusan\s+/i,
    /^habis\s+/i,
    /^udah\s+/i,
    /^sudah\s+/i,
    /\s+\d[\d.,]*\s*(rb|ribu|jt|juta|k|m|rp)?/gi,
    /rp\.?\s*[\d.,]+/gi,
    /\s+ke\s+\w+/gi,
    /\s+dari\s+\w+/gi,
  ];
  let desc = text;
  for (const f of fillers) {
    desc = desc.replace(f, " ");
  }
  desc = desc.trim().replace(/\s+/g, " ");
  if (!desc || desc.length < 2) {
    return type === "Income"
      ? "Pemasukan"
      : type === "Expense"
        ? "Pengeluaran"
        : "Transfer";
  }
  // Capitalize first letter
  return desc.charAt(0).toUpperCase() + desc.slice(1);
}

function extractAccountName(text: string): string | null {
  // Match "ke [account name]" patterns
  const keMatch = text.match(/ke\s+([a-zA-Z\s]+?)(?:\s+\d|$)/i);
  if (keMatch?.[1]) {
    const name = keMatch[1].trim();
    // Filter out generic words
    if (!["saldo", "rekening", "tabungan saya"].includes(name.toLowerCase())) {
      return name;
    }
  }
  // Match known savings hints directly
  const lower = text.toLowerCase();
  for (const hint of SAVINGS_HINTS) {
    if (lower.includes(hint)) {
      // Capitalize each word
      return hint.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }
  return null;
}

// ============================================================
// MAIN PARSER
// ============================================================

/**
 * Parse a natural language transaction string into a TransactionIntent.
 *
 * This is a deterministic, regex-based parser.
 * It does NOT call any external API.
 * It does NOT calculate balances.
 * It does NOT produce account IDs.
 */
export function parseTransactionText(input: string): ParseResult {
  const text = input.trim();
  if (!text || text.length < 2) {
    return {
      ok: false,
      error: "Input terlalu pendek.",
      clarification: "Coba tulis lebih lengkap, contoh: 'Beli kopi 25 ribu'",
    };
  }

  const lower = text.toLowerCase();

  // ── 1. DETECT AMOUNT ──────────────────────────────────────
  const amount = parseAmount(text);
  if (amount === null) {
    return {
      ok: false,
      error: "Nominal tidak ditemukan.",
      clarification:
        "Sertakan nominal, contoh: 'Beli makan 30rb' atau 'Gaji 5 juta'",
    };
  }

  // ── 2. DETECT TYPE ────────────────────────────────────────
  let type: TransactionIntent["type"];
  let confidence = 0.5;
  let destinationAccountName: string | undefined;
  let sourceAccountName: string | undefined;

  // Transfer detection (highest priority — must come before Expense)
  const isTransfer = TRANSFER_KEYWORDS.some((kw) => lower.includes(kw));
  const hasDestinationHint = SAVINGS_HINTS.some((hint) => lower.includes(hint));

  if (isTransfer || (hasDestinationHint && lower.includes("ke"))) {
    type = "Transfer";
    confidence = isTransfer ? 0.9 : 0.7;
    const dest = extractAccountName(text);
    if (dest) destinationAccountName = dest;
    // Source: default MAIN unless "dari [account]" is mentioned
    const dariMatch = text.match(/dari\s+([a-zA-Z\s]+?)(?:\s+ke|\s+\d|$)/i);
    if (dariMatch?.[1]) sourceAccountName = dariMatch[1].trim();
  } else if (INCOME_KEYWORDS.some((kw) => lower.includes(kw))) {
    type = "Income";
    confidence = 0.85;
  } else if (EXPENSE_KEYWORDS.some((kw) => lower.includes(kw))) {
    type = "Expense";
    confidence = 0.85;
  } else {
    // Fallback: treat as Expense (most common transaction)
    type = "Expense";
    confidence = 0.55;
  }

  // ── 3. INFER DESCRIPTION & CATEGORY ──────────────────────
  const description = inferDescription(text, type);
  const categoryHint = type !== "Transfer" ? inferCategory(lower) : undefined;

  // ── 4. VALIDATE TRANSFER HAS DESTINATION ─────────────────
  let clarificationNeeded: string | undefined;
  if (type === "Transfer" && !destinationAccountName) {
    clarificationNeeded = "Ke tabungan mana? Sebutkan nama target tabungan.";
    confidence = 0.4;
  }

  const intent: TransactionIntent = {
    type,
    amount,
    description,
    categoryHint,
    sourceAccountName,
    destinationAccountName,
    confidence,
    clarificationNeeded,
  };

  return { ok: true, intent };
}
