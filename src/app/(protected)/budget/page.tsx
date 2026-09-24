import type { Metadata } from "next";
import { BudgetContent } from "~/components/features/budget/BudgetContent";

export const metadata: Metadata = {
  title: "Kelola Anggaran | Monetira",
  description:
    "Atur dan pantau batas pengeluaran kategori keuangan Anda dengan rapi dan terkontrol.",
};

export default function BudgetPage() {
  return <BudgetContent />;
}
