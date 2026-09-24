import type { Metadata } from "next";
import { FinancialChat } from "~/components/features/assistant/FinancialChat";

export const metadata: Metadata = {
  title: "Asisten AI | Monetira",
  description:
    "Tanyakan kondisi keuangan Anda menggunakan bahasa natural. AI Financial Chat Monetira menjawab berdasarkan data transaksi dan tabungan Anda yang nyata.",
};

export default function AssistantPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)] flex-col rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      <FinancialChat />
    </div>
  );
}
