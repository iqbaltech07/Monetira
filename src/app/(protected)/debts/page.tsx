import type { Metadata } from "next";
import { DebtsContent } from "~/components/features/debts/DebtsContent";

export const metadata: Metadata = {
  title: "Hutang & Piutang | Monetira",
  description:
    "Catat dan kelola pinjaman hutang dan piutang rekan Anda dengan transparan dan akurat.",
};

export default function DebtsPage() {
  return <DebtsContent />;
}
