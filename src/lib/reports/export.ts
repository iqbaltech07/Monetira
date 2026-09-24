import { format } from "date-fns";
import type { FullFinancialReportData } from "./calculations";

/**
 * Exports financial report to a CSV file and triggers browser download.
 */
export function exportReportCSV(
  report: FullFinancialReportData,
  filename?: string,
): void {
  const lines: string[] = [];

  // Title & Period
  lines.push("LAPORAN KEUANGAN MONETIRA");
  lines.push(`Periode,"${report.dateRange.label}"`);
  lines.push(`Tanggal Ekspor,"${format(new Date(), "yyyy-MM-dd HH:mm:ss")}"`);
  lines.push("");

  // Ringkasan Arus Kas
  lines.push("=== RINGKASAN ARUS KAS ===");
  lines.push("Metrik,Nominal (IDR)");
  lines.push(`Total Pemasukan,${report.overview.totalIncome}`);
  lines.push(`Total Pengeluaran,${report.overview.totalExpense}`);
  lines.push(`Arus Kas Bersih (Net Cash Flow),${report.overview.netCashFlow}`);
  lines.push(`Saldo Utama,${report.overview.mainBalance}`);
  lines.push(`Total Tabungan,${report.overview.totalSavings}`);
  lines.push(`Total Seluruh Dana,${report.overview.totalFunds}`);
  lines.push(`Jumlah Transaksi Periode,${report.overview.transactionCount}`);
  lines.push("");

  // Pengeluaran per Kategori
  lines.push("=== PENGELUARAN PER KATEGORI ===");
  lines.push("Kategori,Nominal (IDR),Persentase (%),Jumlah Transaksi");
  for (const item of report.expenseBreakdown) {
    lines.push(
      `"${item.categoryName}",${item.amount},${item.percentage}%,${item.count}`,
    );
  }
  lines.push("");

  // Pemasukan per Kategori
  lines.push("=== PEMASUKAN PER KATEGORI ===");
  lines.push("Kategori,Nominal (IDR),Persentase (%),Jumlah Transaksi");
  for (const item of report.incomeBreakdown) {
    lines.push(
      `"${item.categoryName}",${item.amount},${item.percentage}%,${item.count}`,
    );
  }
  lines.push("");

  // Performa Anggaran
  lines.push("=== PERFORMA ANGGARAN ===");
  lines.push(
    "Kategori,Alokasi Budget,Realisasi Pengeluaran,Sisa,Persentase,Status",
  );
  for (const item of report.budgetPerformance.items) {
    lines.push(
      `"${item.categoryName}",${item.budgetAmount},${item.spentAmount},${item.remainingAmount},${item.percentage}%,${item.status}`,
    );
  }
  lines.push("");

  // Tabungan
  lines.push("=== TARGET TABUNGAN ===");
  lines.push("Nama Target,Terkumpul,Target,Progress (%),Status");
  for (const g of report.savings.goals) {
    lines.push(
      `"${g.name}",${g.currentAmount},${g.targetAmount},${g.progressPercentage}%,${g.status}`,
    );
  }
  lines.push("");

  // Hutang & Piutang
  lines.push("=== HUTANG & PIUTANG ===");
  lines.push("Kategori,Total Nilai,Sisa Belum Lunas");
  lines.push(
    `Hutang Saya,${report.debts.totalOwedByMe},${report.debts.remainingOwedByMe}`,
  );
  lines.push(
    `Piutang Saya,${report.debts.totalOwedToMe},${report.debts.remainingOwedToMe}`,
  );
  lines.push("");

  // Split Bill
  lines.push("=== SPLIT BILL ===");
  lines.push("Metrik,Nilai");
  lines.push(`Total Tagihan,${report.splitBills.totalAmount}`);
  lines.push(`Sisa Belum Dibayar Teman,${report.splitBills.outstandingAmount}`);
  lines.push(`Sudah Diterima,${report.splitBills.collectedAmount}`);
  lines.push("");

  // Financial Insights
  lines.push("=== INSIGHT KEUANGAN ===");
  lines.push("Tipe,Judul,Pesan");
  for (const ins of report.insights) {
    lines.push(`"${ins.type}","${ins.title}","${ins.message}"`);
  }

  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const defaultFilename = `laporan_keuangan_monetira_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", filename || defaultFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports financial report to a formatted JSON file and triggers browser download.
 */
export function exportReportJSON(
  report: FullFinancialReportData,
  filename?: string,
): void {
  const jsonString = JSON.stringify(
    {
      appName: "Monetira",
      reportType: "FinancialReport",
      exportedAt: new Date().toISOString(),
      report,
    },
    null,
    2,
  );

  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const defaultFilename = `laporan_keuangan_monetira_${format(new Date(), "yyyyMMdd_HHmm")}.json`;

  link.setAttribute("href", url);
  link.setAttribute("download", filename || defaultFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
