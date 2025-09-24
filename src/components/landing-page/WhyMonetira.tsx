import { BarChart, ShieldCheck, TrendingUp, Users } from "lucide-react";

const reasons = [
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Aman & Terpercaya",
    description:
      "Data keuangan Anda dilindungi dengan teknologi keamanan modern.",
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "Fokus pada Hasil",
    description:
      "Bantu Anda mengelola keuangan agar lebih terarah menuju kebebasan finansial.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Mudah & Kolaboratif",
    description:
      "Cocok untuk pribadi maupun kelompok, seperti arisan atau split bill.",
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: "Insight yang Jelas",
    description:
      "Dapatkan laporan visual yang membantu pengambilan keputusan keuangan.",
  },
];

export const WhyMonetira = () => {
  return (
    <section id="why-monetira" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Kenapa Memilih Monetira?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Kami hadir untuk memudahkan setiap langkah perjalanan finansialmu,
            dari mencatat hingga merencanakan masa depan.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                {reason.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {reason.title}
              </h3>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
