import { STEPS } from "~/lib/constants";

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
        <div className="relative mt-12 sm:mt-16">
          <div className="absolute left-1/2 top-8 hidden h-px w-2/3 -translate-x-1/2 border-t-2 border-dashed border-gray-300 dark:border-gray-700 lg:block"></div>
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md border border-slate-100 dark:border-slate-800 dark:bg-gray-800">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">
                  Langkah {step.step}
                </p>
                <h3 className="mt-1.5 text-xl font-bold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
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
