/**
 * Deterministic Transaction Parser for Bahasa Indonesia
 *
 * MULTI-ITEM ARCHITECTURE:
 *   One user input may contain multiple transaction items.
 *   Example: "beli martabak 45rb sama teh poci 5rb"
 *   -> items: [{ description: "Martabak", amount: 45000 }, { description: "Teh Poci", amount: 5000 }]
 *   -> totalAmount: 50000 (always sum of items, never guessed)
 *
 * ROOT CAUSE FIX:
 *   Previous parser used .match() which returns FIRST match only.
 *   This parser uses .matchAll() with g flag to find ALL amounts.
 *
 * IMPORTANT: This parser NEVER:
 * - Calculates account balances
 * - Writes to localStorage
 * - Bypasses createIncome / createExpense / createTransfer
 * - Produces account_id directly (only name hints)
 * - Fabricates amounts (totalAmount = sum of explicit item amounts only)
 */

import type { ParseResult, TransactionIntent, TransactionItem } from "./types";

// ============================================================
// AMOUNT PARSING
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
 * Parses a single raw token into IDR value.
 * Used for single-amount extraction (transfer, etc).
 */
export function parseAmount(raw: string): number | null {
  const cleaned = raw
    .toLowerCase()
    .replace(/rp\.?\s*/gi, "")
    .replace(/,/g, "");

  const singlePattern =
    /([\d]+(?:[.,][\d]+)?)\s*(rb|ribu|k(?!g)|jt|juta|m(?![a-z])|miliar|b(?!u))?/i;
  const match = cleaned.match(singlePattern);
  if (!match) return null;

  const [, numStr, unit] = match;
  if (!numStr) return null;

  let base: number;
  if (numStr.includes(".")) {
    const parts = numStr.split(".");
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.length === 3 && parts.length === 2) {
      base = Number.parseFloat(numStr.replace(".", ""));
    } else {
      base = Number.parseFloat(numStr);
    }
  } else {
    base = Number.parseFloat(numStr);
  }

  if (Number.isNaN(base)) return null;
  const multiplier = unit ? (MULTIPLIERS[unit.toLowerCase()] ?? 1) : 1;
  const result = base * multiplier;
  if (!Number.isFinite(result) || result <= 0) return null;
  return result;
}

/**
 * Finds ALL amount occurrences in a string using matchAll (global flag).
 *
 * ROOT CAUSE FIX: Previous parser used .match() (first match only).
 * This function uses .matchAll() to capture every amount token.
 */
export function parseAllAmounts(
  text: string,
): Array<{ raw: string; amount: number; index: number }> {
  const results: Array<{ raw: string; amount: number; index: number }> = [];
  const regex =
    /(?:rp\.?\s*)?([\d]+(?:[.,][\d]+)?)\s*(rb|ribu|k(?!g)|jt|juta|m(?![a-z])|miliar|b(?!u))?/gi;

  for (const match of text.matchAll(regex)) {
    const numStr = match[1];
    const unit = match[2];
    if (!numStr) continue;

    let base: number;
    const cleanedNum = numStr.replace(/,/g, "");

    if (cleanedNum.includes(".")) {
      const parts = cleanedNum.split(".");
      const lastPart = parts[parts.length - 1];
      if (lastPart && lastPart.length === 3 && parts.length === 2) {
        base = Number.parseFloat(cleanedNum.replace(".", ""));
      } else {
        base = Number.parseFloat(cleanedNum);
      }
    } else {
      base = Number.parseFloat(cleanedNum);
    }

    if (Number.isNaN(base)) continue;
    const multiplier = unit ? (MULTIPLIERS[unit.toLowerCase()] ?? 1) : 1;
    const amount = base * multiplier;
    if (!Number.isFinite(amount) || amount <= 0) continue;

    results.push({ raw: match[0], amount, index: match.index ?? 0 });
  }
  return results;
}

// ============================================================
// ITEM SEGMENTATION
// Split multi-item input into individual item segments.
// Connectors: sama, dan, lalu, terus, , ; &
// ============================================================

const SEGMENT_SEPARATOR_REGEX =
  /\s+(?:sama|dan|lalu|terus|kemudian|plus|juga|serta)\s+|[,;]\s*|\s+&\s+/gi;

/**
 * Splits input text into segments around connectors.
 * Returns at least one segment (the original text if no connectors found).
 */
export function segmentItems(text: string): string[] {
  const segments = text
    .split(SEGMENT_SEPARATOR_REGEX)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return segments.length > 0 ? segments : [text];
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
  "tagihan",
  "expense",
  "pengeluaran",
  "habiskan",
  "keluar",
  "spending",
  "fee",
  "biaya",
  "ongkos",
  "denda",
  "abis",
  "habis",
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
  "alokasi",
  "alokasikan",
  "kirim ke",
  "tabung",
  "tabungin",
  "ke tabungan",
  "ke dana",
  "ke saldo",
];

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

// ============================================================
// CATEGORY MAP — Per-item inference
// RULE: Category inferred per segment, not from full sentence.
// This prevents "parkir" in one segment dominating "martabak" in another.
// ============================================================

const CATEGORY_MAP: Array<{ keywords: string[]; category: string }> = [
  {
    keywords: [
      "makan",
      "makanan",
      "minum",
      "minuman",
      "restoran",
      "warung",
      "cafe",
      "kopi",
      "sarapan",
      "siang",
      "malam",
      "jajan",
      "martabak",
      "nasi",
      "ayam",
      "bakso",
      "mie",
      "soto",
      "teh",
      "es",
      "jus",
      "burger",
      "pizza",
      "sate",
      "gado",
      "pecel",
      "bubur",
      "roti",
      "snack",
      "cemilan",
      "poci",
      "indomie",
      "gorengan",
      "cireng",
      "siomay",
      "batagor",
      "kwetiau",
      "pempek",
      "lontong",
      "ketupat",
      "rendang",
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
      "angkot",
      "taxi",
      "uber",
      "maxim",
    ],
    category: "Transportasi",
  },
  {
    keywords: [
      "listrik",
      "pln",
      "pdam",
      "internet",
      "wifi",
      "pulsa",
      "kuota",
      "telpon",
      "tagihan",
      "token",
    ],
    category: "Tagihan",
  },
  {
    keywords: [
      "baju",
      "sepatu",
      "belanja",
      "mall",
      "online shop",
      "shopee",
      "tokopedia",
      "fashion",
      "pakaian",
      "sandal",
      "tas",
      "jam",
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
      "disney",
      "youtube",
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
      "apotek",
      "kesehatan",
      "vitamin",
      "suplemen",
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

/**
 * Infer category from a SINGLE item segment text.
 * Operates on per-item text to prevent cross-item category contamination.
 */
export function inferCategory(segmentText: string): string | undefined {
  const lower = segmentText.toLowerCase();
  for (const { keywords, category } of CATEGORY_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return undefined;
}

/**
 * Clean a segment to produce a human-readable description.
 * Removes amount tokens and common filler words.
 */
function cleanSegmentDescription(segment: string): string {
  const desc = segment
    .replace(
      /(?:rp\.?\s*)?[\d]+(?:[.,][\d]+)?\s*(?:rb|ribu|k|jt|juta|m|miliar|b)?\b/gi,
      "",
    )
    .replace(/^(?:tadi|barusan|habis|abis|udah|sudah|beli|bayar)\s+/i, "")
    .replace(/\s+ke\s+[\w\s]*/gi, "")
    .replace(/\s+dari\s+[\w\s]*/gi, "")
    .trim()
    .replace(/\s+/g, " ");

  if (!desc || desc.length < 2) return "";
  return desc.charAt(0).toUpperCase() + desc.slice(1);
}

function extractAccountName(text: string): string | null {
  const keMatch = text.match(/ke\s+([a-zA-Z\s]+?)(?:\s+\d|$)/i);
  if (keMatch?.[1]) {
    const name = keMatch[1].trim();
    if (!["saldo", "rekening", "tabungan saya"].includes(name.toLowerCase())) {
      return name;
    }
  }
  const lower = text.toLowerCase();
  for (const hint of SAVINGS_HINTS) {
    if (lower.includes(hint)) {
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
 * Supports MULTIPLE ITEMS in a single input.
 * totalAmount is ALWAYS the sum of items[].amount — never guessed.
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

  // 1. DETECT TRANSACTION TYPE
  let type: TransactionIntent["type"];
  let confidence = 0.5;
  let destinationAccountName: string | undefined;
  let sourceAccountName: string | undefined;

  const isTransfer = TRANSFER_KEYWORDS.some((kw) => lower.includes(kw));
  const hasDestinationHint = SAVINGS_HINTS.some((hint) => lower.includes(hint));

  if (isTransfer || (hasDestinationHint && lower.includes("ke"))) {
    type = "Transfer";
    confidence = isTransfer ? 0.9 : 0.7;
    const dest = extractAccountName(text);
    if (dest) destinationAccountName = dest;
    const dariMatch = text.match(/dari\s+([a-zA-Z\s]+?)(?:\s+ke|\s+\d|$)/i);
    if (dariMatch?.[1]) sourceAccountName = dariMatch[1].trim();
  } else if (INCOME_KEYWORDS.some((kw) => lower.includes(kw))) {
    type = "Income";
    confidence = 0.85;
  } else if (EXPENSE_KEYWORDS.some((kw) => lower.includes(kw))) {
    type = "Expense";
    confidence = 0.85;
  } else {
    type = "Expense";
    confidence = 0.55;
  }

  // 2. TRANSFER: single amount, no segmentation needed
  if (type === "Transfer") {
    const amount = parseAmount(text);
    if (amount === null) {
      return {
        ok: false,
        error: "Nominal tidak ditemukan.",
        clarification:
          "Sertakan nominal transfer, contoh: 'Transfer 500rb ke Dana Darurat'",
      };
    }

    let clarificationNeeded: string | undefined;
    if (!destinationAccountName) {
      clarificationNeeded = "Ke tabungan mana? Sebutkan nama target tabungan.";
      confidence = 0.4;
    }

    const item: TransactionItem = {
      description: "Transfer",
      amount,
    };

    const intent: TransactionIntent = {
      type,
      items: [item],
      totalAmount: amount,
      sourceAccountName,
      destinationAccountName,
      confidence,
      clarificationNeeded,
      parsedBy: "deterministic",
    };

    return { ok: true, intent };
  }

  // 3. INCOME / EXPENSE: segment-based multi-item parsing

  // Step 3a: Split on connectors
  const segments = segmentItems(text);

  // Step 3b: Parse each segment independently
  const items: TransactionItem[] = [];

  for (const segment of segments) {
    const amounts = parseAllAmounts(segment);
    if (amounts.length === 0) continue;

    // Use the last detected amount per segment (most likely the price)
    const detected = amounts[amounts.length - 1]!;

    const desc = cleanSegmentDescription(segment);
    const categoryHint = inferCategory(segment); // per-item, not full sentence

    items.push({
      description: desc || (type === "Income" ? "Pemasukan" : "Pengeluaran"),
      amount: detected.amount,
      categoryHint,
    });
  }

  // Step 3c: Must have at least one item
  if (items.length === 0) {
    return {
      ok: false,
      error: "Nominal tidak ditemukan.",
      clarification:
        "Sertakan nominal, contoh: 'Beli makan 30rb' atau 'Gaji 5 juta'",
    };
  }

  // Step 3d: CRITICAL — totalAmount = sum(items.amount), never guessed
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const intent: TransactionIntent = {
    type,
    items,
    totalAmount,
    sourceAccountName,
    destinationAccountName,
    confidence,
    parsedBy: "deterministic",
  };

  return { ok: true, intent };
}
