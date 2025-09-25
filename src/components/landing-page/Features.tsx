import { FEATURE_LIST } from "~/lib/constants";


export const Features = () => {
  return (
    <section id="features" className="bg-white py-20 dark:bg-gray-950">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Kelola Keuangan Jadi Lebih Mudah
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Semua yang kamu butuhkan untuk mencatat, mengatur, dan merencanakan
            keuangan ada di sini.
          </p>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {FEATURE_LIST.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-start rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-2 hover:bg-gray-50 dark:hover:bg-gray-800/80"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-primary/20 to-secondary/20 shadow-md">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
