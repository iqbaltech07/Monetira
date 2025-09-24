import { BarChart3, FilePlus, UserPlus } from "lucide-react";

const steps = [
  {
    step: "1",
    icon: <UserPlus className="h-10 w-10 text-primary" />,
    title: "Daftar & Masuk",
    description: "Buat akun dan login ke Monetira hanya dalam hitungan detik.",
  },
  {
    step: "2",
    icon: <FilePlus className="h-10 w-10 text-primary" />,
    title: "Catat & Kelola Transaksi",
    description:
      "Catat pemasukan, pengeluaran, tabungan, hingga hutang dengan mudah.",
  },
  {
    step: "3",
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: "Pantau Laporan & Progres",
    description:
      "Lihat laporan visual, progres tabungan, dan kelola keuangan lebih baik.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-primary/5 py-20 dark:bg-gray-900">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Mulai dalam 3 Langkah Mudah
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Hanya butuh beberapa menit untuk memulai perjalanan finansial Anda
            bersama Monetira.
          </p>
        </div>
        <div className="relative mt-16">
          <div className="absolute left-1/2 top-13 hidden h-px w-2/3 -translate-x-1/2 border-t-2 border-dashed border-gray-300 dark:border-gray-700 lg:block"></div>
          <div className="grid gap-12 lg:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800">
                  {step.icon}
                </div>
                <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-primary">
                  Langkah {step.step}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
