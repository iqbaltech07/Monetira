"use client";

import {
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useMonetira } from "~/lib/store/monetira-context";
import type { ParseResult, TransactionIntent } from "~/lib/ai/types";
import { formatCurrency } from "~/lib/utils";
import type { Account, Category } from "~/types/database";

// ─── Types ───────────────────────────────────────────────────────────────────

type AssistantState =
  | { stage: "idle" }
  | { stage: "parsing" }
  | { stage: "clarify"; message: string }
  | {
      stage: "preview";
      intent: TransactionIntent;
      resolvedSourceId?: string;
      resolvedDestId?: string;
      categoryId?: string;
    }
  | { stage: "success"; message: string }
  | { stage: "error"; message: string };

// ─── Account Resolution ───────────────────────────────────────────────────────

/**
 * Resolve an account name hint to an actual Account object.
 * Fuzzy match: case-insensitive substring.
 * Returns null when no match found — we NEVER create accounts here.
 */
function resolveAccount(
  nameHint: string | undefined,
  accounts: Account[],
  type?: "MAIN" | "SAVINGS",
): Account | null {
  if (!nameHint) return null;
  const query = nameHint.toLowerCase().trim();
  const filtered = type ? accounts.filter((a) => a.type === type) : accounts;
  // Exact match first
  const exact = filtered.find((a) => a.name.toLowerCase() === query);
  if (exact) return exact;
  // Substring match
  const sub = filtered.find(
    (a) =>
      a.name.toLowerCase().includes(query) ||
      query.includes(a.name.toLowerCase()),
  );
  return sub ?? null;
}

/**
 * Resolve a category name hint to a category_id.
 * Fuzzy substring match.
 */
function resolveCategory(
  hint: string | undefined,
  categories: Category[],
  txType: "Income" | "Expense" | "Transfer",
): string | undefined {
  if (!hint || txType === "Transfer") return undefined;
  const expectedCatType = txType === "Income" ? "Income" : "Expense";
  const relevant = categories.filter((c) => c.type === expectedCatType);
  const q = hint.toLowerCase();
  const match = relevant.find(
    (c) => c.name.toLowerCase().includes(q) || q.includes(c.name.toLowerCase()),
  );
  return match?.id;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function typeLabel(type: TransactionIntent["type"]) {
  return type === "Income"
    ? "Pemasukan"
    : type === "Expense"
      ? "Pengeluaran"
      : "Transfer";
}

function TypeIcon({ type }: { type: TransactionIntent["type"] }) {
  if (type === "Income")
    return <TrendingUp className="h-4 w-4 text-emerald-600" />;
  if (type === "Expense")
    return <TrendingDown className="h-4 w-4 text-rose-600" />;
  return <ArrowLeftRight className="h-4 w-4 text-blue-600" />;
}

const typeColors: Record<TransactionIntent["type"], string> = {
  Income:
    "bg-emerald-50 border-emerald-200/80 dark:bg-emerald-950/30 dark:border-emerald-900/50",
  Expense:
    "bg-rose-50 border-rose-200/80 dark:bg-rose-950/30 dark:border-rose-900/50",
  Transfer:
    "bg-blue-50 border-blue-200/80 dark:bg-blue-950/30 dark:border-blue-900/50",
};

const typeAmountColor: Record<TransactionIntent["type"], string> = {
  Income: "text-emerald-700 dark:text-emerald-400",
  Expense: "text-rose-700 dark:text-rose-400",
  Transfer: "text-blue-700 dark:text-blue-400",
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface TransactionAssistantProps {
  onClose?: () => void;
}

export function TransactionAssistant({ onClose }: TransactionAssistantProps) {
  const {
    accounts,
    categories,
    mainAccount,
    getAccountBalance,
    createIncome,
    createExpense,
    createTransfer,
  } = useMonetira();

  const [input, setInput] = useState("");
  const [state, setState] = useState<AssistantState>({ stage: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── PARSE ─────────────────────────────────────────────────────────────────

  async function handleParse(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setState({ stage: "parsing" });

    let result: ParseResult;
    try {
      const res = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      result = (await res.json()) as ParseResult;
    } catch {
      setState({
        stage: "error",
        message: "Tidak dapat terhubung ke server. Coba lagi.",
      });
      return;
    }

    if (!result.ok) {
      setState({
        stage: "clarify",
        message: result.clarification ?? result.error,
      });
      return;
    }

    const { intent } = result;

    // Low confidence or clarification needed
    if (intent.confidence < 0.5 || intent.clarificationNeeded) {
      setState({
        stage: "clarify",
        message: intent.clarificationNeeded ?? "Coba tulis lebih spesifik.",
      });
      return;
    }

    // Resolve accounts
    let resolvedSourceId: string | undefined;
    let resolvedDestId: string | undefined;

    if (intent.type === "Transfer") {
      // Source: default to main account
      const src = intent.sourceAccountName
        ? resolveAccount(intent.sourceAccountName, accounts)
        : mainAccount;
      if (!src) {
        setState({
          stage: "error",
          message: "Rekening sumber tidak ditemukan.",
        });
        return;
      }
      resolvedSourceId = src.id;

      // Destination: must be resolved from savings
      const dest = resolveAccount(
        intent.destinationAccountName,
        accounts,
        "SAVINGS",
      );
      if (!dest) {
        const savingNames = accounts
          .filter((a) => a.type === "SAVINGS")
          .map((a) => `"${a.name}"`)
          .join(", ");
        setState({
          stage: "clarify",
          message: `Target tabungan "${intent.destinationAccountName ?? ""}" tidak ditemukan. Tabungan tersedia: ${savingNames || "belum ada"}`,
        });
        return;
      }
      resolvedDestId = dest.id;
    }

    // Resolve category
    const categoryId = resolveCategory(
      intent.categoryHint,
      categories,
      intent.type,
    );

    setState({
      stage: "preview",
      intent,
      resolvedSourceId,
      resolvedDestId,
      categoryId,
    });
  }

  // ─── CONFIRM ───────────────────────────────────────────────────────────────

  function handleConfirm() {
    if (state.stage !== "preview") return;
    const { intent, resolvedSourceId, resolvedDestId, categoryId } = state;

    let result:
      | ReturnType<typeof createIncome>
      | ReturnType<typeof createExpense>
      | ReturnType<typeof createTransfer>;

    if (intent.type === "Income") {
      const destAccount = mainAccount;
      result = createIncome({
        accountId: destAccount?.id ?? null,
        amount: intent.amount,
        categoryId: categoryId ?? null,
        note: intent.description ?? null,
        date: intent.date ? new Date(intent.date) : new Date(),
      });
    } else if (intent.type === "Expense") {
      const srcAccount = mainAccount;
      result = createExpense({
        accountId: srcAccount?.id ?? null,
        amount: intent.amount,
        categoryId: categoryId ?? null,
        note: intent.description ?? null,
        date: intent.date ? new Date(intent.date) : new Date(),
      });
    } else {
      // Transfer
      if (!resolvedSourceId || !resolvedDestId) {
        setState({ stage: "error", message: "Rekening tidak lengkap." });
        return;
      }

      // Pre-validate balance before calling engine
      const srcBalance = getAccountBalance(resolvedSourceId);
      if (srcBalance < intent.amount) {
        const srcName =
          accounts.find((a) => a.id === resolvedSourceId)?.name ?? "Sumber";
        setState({
          stage: "error",
          message: `Saldo tidak mencukupi. Saldo ${srcName}: ${formatCurrency(srcBalance)}`,
        });
        return;
      }

      result = createTransfer({
        sourceAccountId: resolvedSourceId,
        destinationAccountId: resolvedDestId,
        amount: intent.amount,
        note: intent.description ?? null,
        date: intent.date ? new Date(intent.date) : new Date(),
      });
    }

    if (!result.success) {
      setState({ stage: "error", message: result.error ?? "Transaksi gagal." });
      return;
    }

    setState({
      stage: "success",
      message: `${typeLabel(intent.type)} ${formatCurrency(intent.amount)} berhasil dicatat.`,
    });
    setInput("");

    setTimeout(() => {
      setState({ stage: "idle" });
      onClose?.();
    }, 2200);
  }

  function handleReset() {
    setState({ stage: "idle" });
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && state.stage === "idle" && input.trim()) {
      handleParse(input);
    }
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Catat Transaksi dengan Bahasa Natural
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ketik transaksi Anda, AI akan menginterpretasikannya
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="contoh: Beli kopi 25 ribu, Gaji masuk 5 juta..."
          disabled={
            state.stage === "parsing" ||
            state.stage === "preview" ||
            state.stage === "success"
          }
          className="flex-1 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600"
        />
        <button
          type="button"
          onClick={() => handleParse(input)}
          disabled={
            !input.trim() ||
            state.stage === "parsing" ||
            state.stage === "preview" ||
            state.stage === "success"
          }
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {state.stage === "parsing" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {state.stage === "parsing" ? "Menganalisa..." : "Proses"}
          </span>
        </button>
      </div>

      {/* Examples */}
      {state.stage === "idle" && (
        <div className="flex flex-wrap gap-1.5">
          {[
            "Beli kopi 25rb",
            "Gaji masuk 5 juta",
            "Bayar listrik 300 ribu",
            "Transfer 500rb ke Dana Darurat",
          ].map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setInput(ex);
                handleParse(ex);
              }}
              className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Clarification */}
      {state.stage === "clarify" && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
            Perlu Klarifikasi
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {state.message}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-2.5 text-xs font-semibold text-amber-700 dark:text-amber-400 underline underline-offset-2"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Preview (confirmation) */}
      {state.stage === "preview" && (
        <PreviewCard
          intent={state.intent}
          resolvedSourceId={state.resolvedSourceId}
          resolvedDestId={state.resolvedDestId}
          accounts={accounts}
          mainAccount={mainAccount}
          onConfirm={handleConfirm}
          onCancel={handleReset}
        />
      )}

      {/* Success */}
      {state.stage === "success" && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500">
            <Check className="h-3.5 w-3.5 text-white" />
          </div>
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
            {state.message}
          </p>
        </div>
      )}

      {/* Error */}
      {state.stage === "error" && (
        <div className="rounded-xl border border-rose-200/80 bg-rose-50 p-3.5 dark:border-rose-900/50 dark:bg-rose-950/30">
          <p className="text-sm font-medium text-rose-800 dark:text-rose-300 mb-1">
            Transaksi Gagal
          </p>
          <p className="text-sm text-rose-700 dark:text-rose-400">
            {state.message}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-2.5 text-xs font-semibold text-rose-700 dark:text-rose-400 underline underline-offset-2"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Preview Card ─────────────────────────────────────────────────────────────

interface PreviewCardProps {
  intent: TransactionIntent;
  resolvedSourceId?: string;
  resolvedDestId?: string;
  accounts: Account[];
  mainAccount: Account | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function PreviewCard({
  intent,
  resolvedSourceId,
  resolvedDestId,
  accounts,
  mainAccount,
  onConfirm,
  onCancel,
}: PreviewCardProps) {
  const srcAccount = resolvedSourceId
    ? accounts.find((a) => a.id === resolvedSourceId)
    : mainAccount;
  const destAccount = resolvedDestId
    ? accounts.find((a) => a.id === resolvedDestId)
    : mainAccount;

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${typeColors[intent.type]}`}
    >
      {/* Type badge */}
      <div className="flex items-center gap-2">
        <TypeIcon type={intent.type} />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {typeLabel(intent.type)}
        </span>
        <ChevronDown className="h-3 w-3 text-slate-400 ml-auto" />
        <span className="text-xs text-slate-400">Konfirmasi</span>
      </div>

      {/* Amount */}
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
          Nominal
        </p>
        <p
          className={`text-2xl font-bold tabular-nums ${typeAmountColor[intent.type]}`}
        >
          {formatCurrency(intent.amount)}
        </p>
      </div>

      {/* Description */}
      {intent.description && (
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
            Keterangan
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {intent.description}
          </p>
        </div>
      )}

      {/* Accounts */}
      <div className="grid grid-cols-2 gap-2">
        {intent.type === "Expense" && srcAccount && (
          <div className="col-span-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              Dari
            </p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
              {srcAccount.name}
            </p>
          </div>
        )}
        {intent.type === "Income" && destAccount && (
          <div className="col-span-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              Ke
            </p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              {destAccount.name}
            </p>
          </div>
        )}
        {intent.type === "Transfer" && (
          <>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                Dari
              </p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {srcAccount?.name ?? "Saldo Utama"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                Ke
              </p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {destAccount?.name ?? "-"}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Category hint */}
      {intent.categoryHint && intent.type !== "Transfer" && (
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
            Kategori Terdeteksi
          </p>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {intent.categoryHint}
          </p>
        </div>
      )}

      {/* Confidence indicator */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Sparkles className="h-3 w-3" />
        <span>Kepercayaan parser: {Math.round(intent.confidence * 100)}%</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-slate-200/80 bg-white/80 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
        >
          Batalkan
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`flex-1 rounded-xl py-2 text-sm font-semibold text-white transition-colors flex items-center justify-center gap-1.5 ${
            intent.type === "Income"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : intent.type === "Expense"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <Check className="h-4 w-4" />
          <span>
            {intent.type === "Transfer"
              ? "Simpan Transfer"
              : `Simpan ${typeLabel(intent.type)}`}
          </span>
        </button>
      </div>

      {/* Transfer warning: engine handles overdraft */}
      {intent.type === "Transfer" && (
        <p className="text-xs text-slate-400 text-center">
          Validasi saldo dilakukan sebelum transaksi disimpan
        </p>
      )}
    </div>
  );
}

// ─── Floating Trigger Button ──────────────────────────────────────────────────

export function AssistantFloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      id="assistant-floating-btn"
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all md:bottom-6 md:right-6"
      aria-label="Buka AI Transaction Assistant"
    >
      <Sparkles className="h-4 w-4" />
      <span className="hidden sm:inline">Catat Cepat</span>
    </button>
  );
}

// ─── Inline Entry (for embedding in Transaction page) ─────────────────────────

export function AssistantInlineCard() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-blue-200/60 bg-white shadow-xs dark:border-blue-900/40 dark:bg-slate-900 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Catat dengan Bahasa Natural
          </p>
          <p className="text-xs text-slate-500">
            &quot;Beli kopi 25rb&quot;, &quot;Gaji 5 juta&quot;, &quot;Transfer
            500rb ke Dana Darurat&quot;
          </p>
        </div>
        <ArrowUpRight
          className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-slate-200/80 dark:border-slate-800 px-4 pb-4 pt-3">
          <TransactionAssistant onClose={() => setExpanded(false)} />
        </div>
      )}
    </div>
  );
}
