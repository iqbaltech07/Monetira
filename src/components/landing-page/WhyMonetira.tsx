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
              className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <reason.icon className="h-8 w-8 text-primary" />
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
