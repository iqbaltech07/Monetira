import type { Metadata } from "next";
import { ReportsContent } from "~/components/features/reports/ReportsContent";

export const metadata: Metadata = {
  title: "Laporan Keuangan | Monetira",
  description:
    "Laporan keuangan komprehensif, arus kas, dan analisis anggaran.",
};

export default function ReportsPage() {
  return <ReportsContent />;
}
