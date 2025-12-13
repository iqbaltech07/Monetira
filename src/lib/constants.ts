import {
  Activity,
  BarChart,
  BarChart3,
  CreditCard,
  Download,
  FilePlus,
  PieChart,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

import { BsGridFill } from "react-icons/bs";
import { FaPiggyBank, FaUser } from "react-icons/fa6";
import { GiCardExchange } from "react-icons/gi";
import { SiBitcoin } from "react-icons/si";

export const NAV_ITEMS = [
  { href: "/dashboard", icon: BsGridFill, label: "Dashboard" },
  { href: "/transactions", icon: GiCardExchange, label: "Transaksi" },
  { href: "/savings", icon: FaPiggyBank, label: "Tabungan" },
  { href: "/market", icon: SiBitcoin, label: "Market" },
  { href: "/profile", icon: FaUser, label: "Akun Saya" },
];

export const NAV_LINKS = [
  { href: "#home", label: "Beranda" },
  { href: "#how-it-works", label: "Cara Kerja" },
  { href: "#features", label: "Fitur" },
  { href: "#faq", label: "FAQ" },
];

export const FEATURE_LIST = [
  {
    icon: PieChart,
    title: "Manajemen Keuangan",
    description: "Catat pemasukan dan pengeluaran untuk melihat arus kas Anda.",
  },
  {
    icon: PiggyBank,
    title: "Target Tabungan",
    description: "Buat target tabungan dan pantau progresnya secara visual.",
  },
  {
    icon: Users,
    title: "Split Bill",
    description: "Bagi tagihan dengan teman secara adil dan transparan.",
  },
  {
    icon: CreditCard,
    title: "Hutang & Piutang",
    description:
      "Kelola catatan hutang dan piutang agar tidak ada yang terlewat.",
  },
  {
    icon: Activity,
    title: "Arisan Digital",
    description: "Organisir dan kelola arisan komunitas Anda dengan mudah.",
  },
  {
    icon: Download,
    title: "Laporan Bulanan",
    description: "Dapatkan laporan detail untuk analisis keuangan mendalam.",
  },
];

export const STEPS = [
  {
    step: "1",
    icon: UserPlus,
    title: "Daftar & Masuk",
    description: "Buat akun dan login ke Monetira hanya dalam hitungan detik.",
  },
  {
    step: "2",
    icon: FilePlus,
    title: "Catat & Kelola Transaksi",
    description:
      "Catat pemasukan, pengeluaran, tabungan, hingga hutang dengan mudah.",
  },
  {
    step: "3",
    icon: BarChart3,
    title: "Pantau Laporan & Progres",
    description:
      "Lihat laporan visual, progres tabungan, dan kelola keuangan lebih baik.",
  },
];

export const REASONS = [
  {
    icon: ShieldCheck,
    title: "Aman & Terpercaya",
    description:
      "Data keuangan Anda dilindungi dengan teknologi keamanan modern.",
  },
  {
    icon: TrendingUp,
    title: "Fokus pada Hasil",
    description:
      "Bantu Anda mengelola keuangan agar lebih terarah menuju kebebasan finansial.",
  },
  {
    icon: Users,
    title: "Mudah & Kolaboratif",
    description:
      "Cocok untuk pribadi maupun kelompok, seperti arisan atau split bill.",
  },
  {
    icon: BarChart,
    title: "Insight yang Jelas",
    description:
      "Dapatkan laporan visual yang membantu pengambilan keputusan keuangan.",
  },
];

export const FAQS = [
  {
    question: "Apakah Monetira gratis digunakan?",
    answer:
      "Ya, Monetira bisa digunakan gratis untuk mencatat pemasukan, pengeluaran, tabungan, hingga arisan.",
  },
  {
    question: "Apakah data saya aman?",
    answer:
      "Sangat aman. Data keuangan Anda disimpan dengan enkripsi modern dan tidak dibagikan ke pihak ketiga.",
  },
  {
    question: "Apakah Monetira bisa diakses di semua perangkat?",
    answer:
      "Tentu saja. Karena berbasis web, Monetira dapat digunakan di laptop, tablet, maupun smartphone.",
  },
  {
    question: "Apakah Monetira bisa digunakan dalam mode offline?",
    answer:
      "Saat ini Monetira membutuhkan koneksi internet agar semua data tersimpan dengan aman. Namun, kami sedang merencanakan dukungan mode offline di versi mendatang.",
  },
];
