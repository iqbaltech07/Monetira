import { REASONS } from "~/lib/constants";

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
          {REASONS.map((reason) => (
            <div
              key={reason.title}
              className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <reason.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {reason.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
