"use client";

import {
  Bot,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMonetira } from "~/lib/store/monetira-context";
import {
  buildFinancialContext,
  type FinancialContext,
} from "~/lib/ai/financial-context";
import { detectPeriod } from "~/lib/ai/financial-period";
import type { ChatResponse } from "~/lib/ai/provider";
import { checkAiChatAllowance } from "~/lib/subscription/ai-usage";
import { formatCurrency } from "~/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: ChatResponse["provider"];
  isMutationRequest?: boolean;
}

// ─── Suggested Questions ──────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  "Berapa saldo saya sekarang?",
  "Pengeluaran bulan ini berapa?",
  "Total tabungan saya berapa?",
  "Pengeluaran terbesar saya apa?",
  "Progress tabungan saya bagaimana?",
  "Bulan ini surplus atau defisit?",
];

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMarkdown(text: string): string {
  // Defense-in-depth: escape raw HTML first, then apply safe markdown transforms
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FinancialChat() {
  const {
    transactions,
    accounts,
    savings,
    categories,
    mainAccount,
    mainBalance,
    totalSavings,
    totalFunds,
    totalIncome,
    totalExpense,
    budgets,
    debts,
    splitBills,
    subscription,
    effectivePlan,
    aiUsage,
    incrementAiChatUsage,
  } = useMonetira();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on every render — bottomRef is a stable ref, not reactive state
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — scroll on every render
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Build Context (client-side, from engine) ──────────────────────────────

  function buildContext(userMessage: string): FinancialContext {
    const periodKey = detectPeriod(userMessage);
    return buildFinancialContext({
      transactions,
      accounts,
      savings,
      categories,
      periodKey,
      mainAccountId: mainAccount?.id ?? "acc_main_default",
      budgets,
      debts,
      splitBills,
    });
  }

  // ─── Send ──────────────────────────────────────────────────────────────────

  async function handleSend(text?: string) {
    const message = (text ?? input).trim();
    if (!message || isLoading) return;

    // Check weekly quota allowance
    const allowance = checkAiChatAllowance(subscription, aiUsage.chat_count);
    if (!allowance.allowed) {
      setError(
        allowance.reason ||
          "Batas penggunaan AI gratis (3x per minggu) telah tercapai. Upgrade ke Monetira Pro untuk akses lebih banyak.",
      );
      return;
    }

    setInput("");
    setError(null);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const context = buildContext(message);

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context,
          subscription,
          currentWeeklyUsage: aiUsage.chat_count,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error ?? `Server error ${res.status}`);
      }

      const data = (await res.json()) as ChatResponse;

      // Successful response — count usage
      incrementAiChatUsage();

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
        provider: data.provider,
        isMutationRequest: data.isMutationRequest,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errMessage =
        err instanceof Error
          ? err.message
          : "AI sedang tidak tersedia. Coba lagi beberapa saat.";
      setError(errMessage);
      // Add error as assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content: `⚠️ ${errMessage}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col">
      {/* ── Quota & Plan Status Banner ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-[11px]">
        <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
          <Sparkles className="h-3 w-3 text-primary shrink-0" />
          <span>
            Paket:{" "}
            <strong className="text-slate-900 dark:text-slate-100 font-semibold">
              {effectivePlan === "PRO" ? "Monetira Pro" : "Free"}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <span>Kuota AI Minggu Ini:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
            {aiUsage.chat_count}
          </span>
          <span>/</span>
          <span>{effectivePlan === "PRO" ? "50" : "3"}</span>
        </div>
      </div>

      {/* ── Empty State / Welcome ── */}
      {isEmpty && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
          {/* Financial snapshot */}
          <div className="w-full max-w-sm space-y-3">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50">
                <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  AI Financial Chat
                </h2>
                <p className="text-xs text-slate-500">
                  Tanya tentang kondisi keuangan Anda
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "Saldo Utama",
                  value: formatCurrency(mainBalance),
                  color: "text-blue-600 dark:text-blue-400",
                },
                {
                  label: "Tabungan",
                  value: formatCurrency(totalSavings),
                  color: "text-purple-600 dark:text-purple-400",
                },
                {
                  label: "Total Dana",
                  value: formatCurrency(totalFunds),
                  color: "text-emerald-600 dark:text-emerald-400",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-200/80 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p
                    className={`text-xs font-bold tabular-nums mt-0.5 ${stat.color}`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400">
              Pemasukan: {formatCurrency(totalIncome)} · Pengeluaran:{" "}
              {formatCurrency(totalExpense)}
            </p>
          </div>

          {/* Suggested questions */}
          <div className="w-full max-w-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Coba Tanya
            </p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                  className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                >
                  <MessageCircle className="inline h-3.5 w-3.5 mr-1.5 text-slate-400" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      {!isEmpty && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : msg.isMutationRequest
                      ? "bg-amber-50 border border-amber-200/80 text-slate-800 rounded-tl-sm dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-slate-200"
                      : "bg-white border border-slate-200/80 text-slate-800 rounded-tl-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: markdown-lite renderer, content is AI-generated not user input
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(msg.content),
                    }}
                  />
                ) : (
                  msg.content
                )}
                {/* Provider badge */}
                {msg.role === "assistant" && msg.provider && (
                  <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" />
                    {msg.provider === "gemini"
                      ? "Gemini AI"
                      : "Asisten Finansial"}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Bot className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-slate-200/80 bg-white px-3.5 py-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  <span className="text-xs text-slate-500">Menganalisa...</span>
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>
      )}

      {/* ── Suggested questions (after first message) ── */}
      {!isEmpty && !isLoading && messages.length <= 3 && (
        <div className="border-t border-slate-200/80 bg-slate-50/80 px-4 py-2 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="shrink-0 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-rose-200/80 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* ── Input ── */}
      <div className="border-t border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanyakan tentang keuangan Anda..."
            disabled={isLoading}
            maxLength={500}
            className="flex-1 rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center rounded-xl bg-blue-600 px-3.5 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-center text-slate-400">
          Financial Chat hanya membaca data — tidak mengubah transaksi atau
          saldo
        </p>
      </div>
    </div>
  );
}
