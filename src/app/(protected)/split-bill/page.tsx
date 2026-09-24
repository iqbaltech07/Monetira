import type { Metadata } from "next";
import { SplitBillContent } from "~/components/features/split-bill/SplitBillContent";

export const metadata: Metadata = {
  title: "Split Bill | Monetira",
  description:
    "Bagi tagihan makan bersama, liburan, atau kebutuhan patungan dengan teman secara adil dan transparan.",
};

export default function SplitBillPage() {
  return <SplitBillContent />;
}
