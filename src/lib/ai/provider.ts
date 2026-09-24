/**
 * AI Provider Abstraction — Financial Chat
 *
 * ARCHITECTURE:
 *   FinancialContext (application-computed facts)
 *        ↓
 *   generateFinancialResponse() ← THIS MODULE
 *        ↓
 *   AI Provider (Gemini / OpenAI / Deterministic)
 *        ↓
 *   ChatResponse
 *
 * Provider selection:
 *   1. GEMINI_API_KEY present → Gemini 2.0 Flash
 *   2. OPENAI_API_KEY present → OpenAI (future)
 *   3. Neither → Deterministic rule-based responder (always functional)
 *
 * SECURITY:
 * - API keys live ONLY in process.env (server-side)
 * - NEXT_PUBLIC_ AI keys are FORBIDDEN
 * - User message is treated as UNTRUSTED INPUT
 * - Prompt is constructed server-side to prevent injection
 *
 * READ-ONLY CONTRACT:
 * - This provider NEVER mutates transactions, balances, or savings.
 * - Financial facts come ONLY from FinancialContext (pre-computed by application).
 * - AI explains facts — it does NOT recalculate them.
 */

import type { FinancialContext } from "./financial-context";

export interface ChatResponse {
  answer: string;
  provider: "gemini" | "openai" | "deterministic";
  isMutationRequest?: boolean; // true if user asked to create/modify transactions
}

// ─── System Prompt Builder ────────────────────────────────────────────────────

function buildSystemPrompt(ctx: FinancialContext): string {
  const goals = ctx.savingsGoals
    .map(
      (g) =>
        `- ${g.name}: target Rp${g.targetAmount.toLocaleString("id-ID")}, terkumpul Rp${g.currentAmount.toLocaleString("id-ID")} (${g.progressPercent}%)${g.deadline ? `, deadline ${g.deadline}` : ""}`,
    )
    .join("\n");

  const categories = ctx.categoryBreakdown
    .map(
      (c) =>
        `- ${c.category}: Rp${c.amount.toLocaleString("id-ID")} (${c.count} transaksi)`,
    )
    .join("\n");

  const recentTxs = ctx.recentTransactions
    .map(
      (t) =>
        `- [${t.type}] ${t.note ?? "-"} | ${t.category ?? "-"} | Rp${t.amount.toLocaleString("id-ID")} | ${t.date}`,
    )
    .join("\n");

  return `Kamu adalah asisten keuangan Monetira. Kamu HANYA boleh menjawab pertanyaan berdasarkan data finansial berikut yang sudah dihitung oleh sistem. Kamu TIDAK boleh menghitung ulang saldo, membuat asumsi angka, atau mengubah data apapun.

## Data Keuangan Pengguna (Dihitung oleh Sistem — Gunakan Nilai Ini)

### Saldo & Dana
- Saldo Utama: Rp${ctx.mainBalance.toLocaleString("id-ID")}
- Total Tabungan: Rp${ctx.totalSavings.toLocaleString("id-ID")}
- Total Dana (Saldo + Tabungan): Rp${ctx.totalFunds.toLocaleString("id-ID")}

### Ringkasan Semua Waktu (Transfer tidak termasuk)
- Total Pemasukan: Rp${ctx.totalIncome.toLocaleString("id-ID")}
- Total Pengeluaran: Rp${ctx.totalExpense.toLocaleString("id-ID")}
- Arus Kas Bersih: Rp${ctx.netCashFlow.toLocaleString("id-ID")}

### Periode: ${ctx.period.label}
- Pemasukan: Rp${ctx.period.income.toLocaleString("id-ID")}
- Pengeluaran: Rp${ctx.period.expense.toLocaleString("id-ID")}
- Arus Kas Bersih Periode: Rp${ctx.period.netCashFlow.toLocaleString("id-ID")}
- Jumlah Transaksi: ${ctx.period.transactionCount}

### Pengeluaran per Kategori (Periode Ini)
${categories || "Belum ada data pengeluaran kategori untuk periode ini."}

### Pengeluaran Terbesar Periode Ini
${ctx.largestExpense ? `- ${ctx.largestExpense.note ?? "-"} | ${ctx.largestExpense.category ?? "-"} | Rp${ctx.largestExpense.amount.toLocaleString("id-ID")} | ${ctx.largestExpense.date}` : "Belum ada pengeluaran untuk periode ini."}

### Target Tabungan
${goals || "Belum ada target tabungan."}

### Anggaran / Budget
${
  ctx.budgets && ctx.budgets.length > 0
    ? ctx.budgets
        .map(
          (b) =>
            `- ${b.category} (${b.period}): Budget Rp${b.amount.toLocaleString("id-ID")}, Terpakai Rp${b.spent.toLocaleString("id-ID")}, Sisa Rp${b.remaining.toLocaleString("id-ID")} (${b.percentage}%, Status: ${b.status})`,
        )
        .join("\n")
    : "Belum ada data anggaran yang diatur."
}

### Hutang & Piutang
${
  ctx.debt
    ? `- Total Hutang Saya: Rp${ctx.debt.remainingOwedByMe.toLocaleString("id-ID")}\n- Total Piutang Saya: Rp${ctx.debt.remainingOwedToMe.toLocaleString("id-ID")}\n- Rincian:\n` +
      (
        ctx.debt.items.length > 0
          ? ctx.debt.items
              .map(
                (d) =>
                  `  * ${d.personName}: Rp${d.remainingAmount.toLocaleString("id-ID")} (${d.direction === "OWED_BY_ME" ? "Saya berhutang" : "Berhutang ke saya"}) [${d.status}]`,
              )
              .join("\n")
          : "  (Tidak ada hutang aktif)"
      )
    : "Belum ada catatan hutang/piutang."
}

### Split Bill
${
  ctx.splitBills
    ? `- Total Tagihan Split Bill: ${ctx.splitBills.totalBills}\n- Tagihan Belum Lunas Teman: Rp${ctx.splitBills.outstandingAmount.toLocaleString("id-ID")}\n- Rincian:\n` +
      (
        ctx.splitBills.items.length > 0
          ? ctx.splitBills.items
              .map(
                (s) =>
                  `  * ${s.title}: Total Rp${s.totalAmount.toLocaleString("id-ID")} (${s.unsettledParticipants.length > 0 ? `Belum lunas: ${s.unsettledParticipants.map((p) => `${p.name} Rp${p.amount.toLocaleString("id-ID")}`).join(", ")}` : "Semua sudah lunas"})`,
              )
              .join("\n")
          : "  (Tidak ada split bill)"
      )
    : "Belum ada catatan split bill."
}

### Ringkasan Laporan & Insight
${
  ctx.reportsSummary
    ? `- Periode: ${ctx.reportsSummary.periodLabel}\n` +
      `- Pemasukan Periode: Rp${ctx.reportsSummary.totalIncome.toLocaleString("id-ID")}\n` +
      `- Pengeluaran Periode: Rp${ctx.reportsSummary.totalExpense.toLocaleString("id-ID")}\n` +
      `- Arus Kas Bersih: Rp${ctx.reportsSummary.netCashFlow.toLocaleString("id-ID")}\n` +
      `- Kategori Terbesar: ${ctx.reportsSummary.largestExpenseCategory ?? "-"} (Rp${ctx.reportsSummary.largestExpenseAmount.toLocaleString("id-ID")})\n` +
      `- Utilisasi Anggaran: ${ctx.reportsSummary.budgetUtilization}%\n` +
      `- Catatan Insight:\n` +
      (
        ctx.reportsSummary.insights.length > 0
          ? ctx.reportsSummary.insights.map((ins) => `  * ${ins}`).join("\n")
          : "  (Tidak ada catatan khusus)"
      )
    : "Belum ada ringkasan laporan."
}

### Transaksi Terbaru (Periode Ini, maks 10)
${recentTxs || "Belum ada transaksi untuk periode ini."}

---

## Aturan Penting

1. Jawab HANYA berdasarkan data di atas. Jangan mengarang angka.
2. Jika data tidak tersedia untuk pertanyaan tertentu, katakan secara eksplisit bahwa data belum tersedia.
3. Jangan menyarankan atau membuat transaksi. Jika user meminta mencatat transaksi, arahkan ke Transaction Assistant.
4. Gunakan Bahasa Indonesia yang jelas, ringkas, dan profesional.
5. Jangan mengungkapkan struktur data internal, ID akun, atau informasi sistem.
6. Transfer bukan Pemasukan maupun Pengeluaran — jangan mencampurnya.
7. Fokus pada pertanyaan user — jangan memberikan jawaban yang tidak diminta.

Data dihasilkan pada: ${new Date(ctx.generatedAt).toLocaleString("id-ID")}`;
}

// ─── Gemini Provider ───────────────────────────────────────────────────────────

async function callGemini(
  userMessage: string,
  systemPrompt: string,
  apiKey: string,
): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ],
    generationConfig: {
      temperature: 0.2, // Low temp for factual financial answers
      maxOutputTokens: 512,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "unknown error");
    throw new Error(`Gemini API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
    error?: { message?: string };
  };

  if (data.error?.message) {
    throw new Error(`Gemini error: ${data.error.message}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response.");

  return text.trim();
}

// ─── Mutation Detection ────────────────────────────────────────────────────────

const MUTATION_KEYWORDS = [
  "catat",
  "tambahkan",
  "buat transaksi",
  "hapus",
  "ubah",
  "edit",
  "delete",
  "update",
  "simpan transaksi",
  "input transaksi",
  "masukkan transaksi",
  "beli",
  "bayar",
  "transfer ke",
  "pindahin",
  "setor ke",
];

export function detectMutationIntent(message: string): boolean {
  const lower = message.toLowerCase();
  // Only flag as mutation if contains amount AND mutation keyword
  const hasAmount = /\d/.test(lower);
  const hasMutationKw = MUTATION_KEYWORDS.some((kw) => lower.includes(kw));
  return hasAmount && hasMutationKw;
}

// ─── Deterministic Fallback Responder ────────────────────────────────────────

function deterministicResponse(
  userMessage: string,
  ctx: FinancialContext,
): string {
  const lower = userMessage.toLowerCase();
  const fmt = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

  // Laporan keuangan / kondisi keuangan
  if (
    lower.includes("kondisi keuangan") ||
    lower.includes("laporan keuangan") ||
    lower.includes("ringkasan keuangan") ||
    lower.includes("kondisi finansial")
  ) {
    const net = ctx.period.netCashFlow;
    const isSurplus = net >= 0;
    const topCat = ctx.categoryBreakdown[0];
    return (
      `**Laporan Kondisi Keuangan (${ctx.period.label}):**\n\n` +
      `• **Pemasukan:** ${fmt(ctx.period.income)}\n` +
      `• **Pengeluaran:** ${fmt(ctx.period.expense)}\n` +
      `• **Arus Kas Bersih:** ${isSurplus ? "+" : ""}${fmt(net)} (${isSurplus ? "Surplus" : "Defisit"})\n` +
      (topCat
        ? `• **Pengeluaran Terbesar:** ${topCat.category} (${fmt(topCat.amount)})\n`
        : "") +
      `• **Saldo Utama Saat Ini:** ${fmt(ctx.mainBalance)}\n` +
      `• **Total Tabungan:** ${fmt(ctx.totalSavings)}\n\n` +
      `_Laporan lengkap dan ekspor data tersedia di menu **Laporan**._`
    );
  }

  // Bandingkan pengeluaran
  if (lower.includes("bandingkan") || lower.includes("perbandingan")) {
    return `Untuk membandingkan pengeluaran dan pemasukan antar periode (misalnya Bulan Ini vs Bulan Lalu), Anda dapat membuka halaman **Laporan** untuk melihat visualisasi dan persentase perubahan secara mendetail.`;
  }

  // Saldo / balance
  if (
    lower.includes("saldo") ||
    lower.includes("balance") ||
    lower.includes("berapa uang")
  ) {
    return (
      `**Ringkasan Saldo Anda:**\n\n` +
      `• **Saldo Utama:** ${fmt(ctx.mainBalance)}\n` +
      `• **Total Tabungan:** ${fmt(ctx.totalSavings)}\n` +
      `• **Total Dana:** ${fmt(ctx.totalFunds)}\n\n` +
      `_Data dihitung dari ledger transaksi Anda._`
    );
  }

  // Total dana
  if (
    lower.includes("total dana") ||
    lower.includes("total aset") ||
    lower.includes("total uang")
  ) {
    return `Total dana Anda saat ini adalah **${fmt(ctx.totalFunds)}** (Saldo Utama ${fmt(ctx.mainBalance)} + Tabungan ${fmt(ctx.totalSavings)}).`;
  }

  // Tabungan / savings
  if (
    lower.includes("tabungan") &&
    !lower.includes("kategori") &&
    !lower.includes("transfer")
  ) {
    if (ctx.savingsGoals.length === 0) {
      return "Anda belum memiliki target tabungan. Buat target tabungan baru di halaman Tabungan.";
    }
    const lines = ctx.savingsGoals
      .map(
        (g) =>
          `• **${g.name}:** ${fmt(g.currentAmount)} / ${fmt(g.targetAmount)} (${g.progressPercent}%)`,
      )
      .join("\n");
    return `**Target Tabungan Anda:**\n\n${lines}\n\n**Total Tabungan:** ${fmt(ctx.totalSavings)}`;
  }

  // Progress tabungan spesifik
  if (lower.includes("progress") || lower.includes("persen")) {
    const matched = ctx.savingsGoals.find((g) =>
      lower.includes(g.name.toLowerCase()),
    );
    if (matched) {
      return (
        `Progress tabungan **${matched.name}:** ${matched.progressPercent}%\n\n` +
        `• Terkumpul: ${fmt(matched.currentAmount)}\n` +
        `• Target: ${fmt(matched.targetAmount)}\n` +
        `• Sisa: ${fmt(matched.targetAmount - matched.currentAmount)}` +
        (matched.deadline ? `\n• Deadline: ${matched.deadline}` : "")
      );
    }
    // Generic progress
    if (ctx.savingsGoals.length > 0) {
      const lines = ctx.savingsGoals
        .map((g) => `• **${g.name}:** ${g.progressPercent}%`)
        .join("\n");
      return `**Progress Semua Tabungan:**\n\n${lines}`;
    }
    return "Belum ada target tabungan yang tersedia.";
  }

  // Pengeluaran bulan ini
  if (
    lower.includes("pengeluaran") ||
    lower.includes("keluar") ||
    lower.includes("expense")
  ) {
    const period = ctx.period;
    const topCat =
      ctx.categoryBreakdown[0]?.category ?? "belum ada data kategori";
    const topAmt = ctx.categoryBreakdown[0]?.amount ?? 0;
    let resp =
      `**Pengeluaran ${period.label}:** ${fmt(period.expense)}\n\n` +
      `• Jumlah transaksi: ${period.transactionCount}\n`;
    if (ctx.categoryBreakdown.length > 0) {
      resp += `• Terbesar: ${topCat} (${fmt(topAmt)})\n`;
    }
    if (ctx.largestExpense) {
      resp += `• Transaksi terbesar: ${ctx.largestExpense.note ?? "-"} — ${fmt(ctx.largestExpense.amount)}`;
    }
    return resp;
  }

  // Pemasukan
  if (
    lower.includes("pemasukan") ||
    lower.includes("income") ||
    lower.includes("gaji")
  ) {
    return `**Pemasukan ${ctx.period.label}:** ${fmt(ctx.period.income)}\n\nTotal pemasukan semua waktu: ${fmt(ctx.totalIncome)}`;
  }

  // Arus kas / net cash flow
  if (
    lower.includes("arus kas") ||
    lower.includes("net") ||
    lower.includes("lebih banyak")
  ) {
    const net = ctx.period.netCashFlow;
    const sign = net >= 0 ? "surplus" : "defisit";
    return (
      `**Arus Kas ${ctx.period.label}:**\n\n` +
      `• Pemasukan: ${fmt(ctx.period.income)}\n` +
      `• Pengeluaran: ${fmt(ctx.period.expense)}\n` +
      `• **${sign.charAt(0).toUpperCase() + sign.slice(1)}: ${net >= 0 ? "+" : ""}${fmt(Math.abs(net))}**\n\n` +
      (net >= 0
        ? "Keuangan Anda surplus untuk periode ini. Bagus! 👍"
        : "Pengeluaran melebihi pemasukan pada periode ini.")
    );
  }

  // Kategori spesifik
  const catMatch = ctx.categoryBreakdown.find((c) =>
    lower.includes(c.category.toLowerCase()),
  );
  if (catMatch) {
    return `Pengeluaran kategori **${catMatch.category}** pada ${ctx.period.label}: **${fmt(catMatch.amount)}** (${catMatch.count} transaksi).`;
  }

  // Transaksi terbesar
  if (
    lower.includes("terbesar") ||
    lower.includes("paling besar") ||
    lower.includes("biggest")
  ) {
    if (!ctx.largestExpense) {
      return `Belum ada pengeluaran yang tercatat untuk ${ctx.period.label}.`;
    }
    return (
      `Pengeluaran terbesar pada ${ctx.period.label}:\n\n` +
      `• **${ctx.largestExpense.note ?? "Tanpa keterangan"}**\n` +
      `• Kategori: ${ctx.largestExpense.category ?? "-"}\n` +
      `• Jumlah: **${fmt(ctx.largestExpense.amount)}**\n` +
      `• Tanggal: ${ctx.largestExpense.date}`
    );
  }

  // Transaksi terbaru
  if (
    lower.includes("transaksi") &&
    (lower.includes("tampilkan") ||
      lower.includes("lihat") ||
      lower.includes("daftar"))
  ) {
    if (ctx.recentTransactions.length === 0) {
      return `Belum ada transaksi yang tercatat untuk ${ctx.period.label}.`;
    }
    const lines = ctx.recentTransactions
      .map(
        (t) =>
          `• [${t.type}] ${t.note ?? "-"} | ${t.category ?? "-"} | ${fmt(t.amount)} | ${t.date}`,
      )
      .join("\n");
    return `**Transaksi ${ctx.period.label}** (maks 10 terbaru):\n\n${lines}`;
  }

  // Budget / Anggaran (Phase 8)
  if (lower.includes("budget") || lower.includes("anggaran")) {
    if (!ctx.budgets || ctx.budgets.length === 0) {
      return "Anda belum mengatur anggaran kategori apa pun. Anda dapat mengatur anggaran baru di menu Anggaran.";
    }
    // Check if user asked about a specific category
    const matchedBudget = ctx.budgets.find((b) =>
      lower.includes(b.category.toLowerCase()),
    );
    if (matchedBudget) {
      return (
        `**Status Anggaran ${matchedBudget.category} (${matchedBudget.period}):**\n\n` +
        `• **Batas Anggaran:** ${fmt(matchedBudget.amount)}\n` +
        `• **Sudah Terpakai:** ${fmt(matchedBudget.spent)} (${matchedBudget.percentage}%)\n` +
        `• **Sisa Anggaran:** ${fmt(matchedBudget.remaining)}\n` +
        `• **Status:** ${matchedBudget.status}`
      );
    }
    const lines = ctx.budgets
      .map(
        (b) =>
          `• **${b.category}:** Terpakai ${fmt(b.spent)} dari ${fmt(b.amount)} (Sisa: ${fmt(b.remaining)}, ${b.status})`,
      )
      .join("\n");
    return `**Ringkasan Anggaran Anda:**\n\n${lines}`;
  }

  // Hutang / Piutang (Phase 8)
  if (
    lower.includes("hutang") ||
    lower.includes("utang") ||
    lower.includes("piutang")
  ) {
    if (!ctx.debt) {
      return "Belum ada data hutang atau piutang yang tercatat.";
    }
    if (lower.includes("piutang") || lower.includes("orang hutang")) {
      return (
        `**Ringkasan Piutang Anda (Uang yang harus diterima):**\n\n` +
        `• **Total Sisa Piutang:** ${fmt(ctx.debt.remainingOwedToMe)}\n` +
        (ctx.debt.items.filter((d) => d.direction === "OWED_TO_ME").length > 0
          ? `• **Rincian:**\n` +
            ctx.debt.items
              .filter((d) => d.direction === "OWED_TO_ME")
              .map(
                (d) =>
                  `  - ${d.personName}: ${fmt(d.remainingAmount)} (${d.status})${d.dueDate ? ` - Jatuh tempo: ${d.dueDate}` : ""}`,
              )
              .join("\n")
          : "• Tidak ada piutang aktif.")
      );
    }
    return (
      `**Ringkasan Hutang & Piutang:**\n\n` +
      `• **Sisa Hutang Saya:** ${fmt(ctx.debt.remainingOwedByMe)}\n` +
      `• **Sisa Piutang Saya:** ${fmt(ctx.debt.remainingOwedToMe)}\n\n` +
      (ctx.debt.items.filter((d) => d.remainingAmount > 0).length > 0
        ? `**Daftar Hutang/Piutang Aktif:**\n` +
          ctx.debt.items
            .filter((d) => d.remainingAmount > 0)
            .map(
              (d) =>
                `• ${d.personName}: ${fmt(d.remainingAmount)} (${d.direction === "OWED_BY_ME" ? "Hutang Saya" : "Piutang"})`,
            )
            .join("\n")
        : "Semua hutang dan piutang telah lunas!")
    );
  }

  // Split Bill / Patungan (Phase 8)
  if (
    lower.includes("split bill") ||
    lower.includes("patungan") ||
    lower.includes("bagi tagihan")
  ) {
    if (!ctx.splitBills || ctx.splitBills.totalBills === 0) {
      return "Belum ada catatan Split Bill yang aktif.";
    }
    return (
      `**Status Split Bill:**\n\n` +
      `• **Total Tagihan Dibuat:** ${ctx.splitBills.totalBills}\n` +
      `• **Belum Dibayar Teman:** ${fmt(ctx.splitBills.outstandingAmount)}\n\n` +
      `**Daftar Tagihan:**\n` +
      ctx.splitBills.items
        .map(
          (sb) =>
            `• **${sb.title}:** Total ${fmt(sb.totalAmount)} ${
              sb.unsettledParticipants.length > 0
                ? `(Belum bayar: ${sb.unsettledParticipants.map((p) => `${p.name} ${fmt(p.amount)}`).join(", ")})`
                : "(Semua lunas)"
            }`,
        )
        .join("\n")
    );
  }

  // Fallback
  return (
    `Maaf, saya tidak dapat memahami pertanyaan tersebut dengan pasti. Coba tanyakan:\n\n` +
    `• "Berapa saldo saya?"\n` +
    `• "Pengeluaran bulan ini berapa?"\n` +
    `• "Berapa sisa budget makanan saya?"\n` +
    `• "Berapa total hutang saya?"\n` +
    `• "Siapa yang belum bayar split bill?"`
  );
}

// ─── Main Public API ───────────────────────────────────────────────────────────

/**
 * Generate a financial response for the user's message.
 *
 * Selects provider based on available environment variables.
 * Falls back to deterministic responder if no provider is configured.
 */
export async function generateFinancialResponse(
  userMessage: string,
  ctx: FinancialContext,
): Promise<ChatResponse> {
  // Detect mutation intent — redirect to Transaction Assistant
  if (detectMutationIntent(userMessage)) {
    return {
      answer:
        "Untuk mencatat atau mengubah transaksi, silakan gunakan **Transaction Assistant** (tombol ✦ di dashboard atau halaman Transaksi). Financial Chat hanya digunakan untuk pertanyaan tentang kondisi keuangan Anda.",
      provider: "deterministic",
      isMutationRequest: true,
    };
  }

  const systemPrompt = buildSystemPrompt(ctx);

  // Try Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const answer = await callGemini(userMessage, systemPrompt, geminiKey);
      return { answer, provider: "gemini" };
    } catch (err) {
      // Log sanitized error (no key, no user data)
      console.error(
        "[AI Chat] Gemini provider error:",
        err instanceof Error ? err.message : "unknown",
      );
      // Fall through to deterministic
    }
  }

  // Deterministic fallback — always functional
  const answer = deterministicResponse(userMessage, ctx);
  return { answer, provider: "deterministic" };
}
