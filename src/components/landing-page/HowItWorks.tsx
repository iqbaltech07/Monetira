"use client";

import { STEPS } from "~/lib/constants";
import { useGsapReveal } from "~/lib/gsap";

export const HowItWorks = () => {
  const containerRef = useGsapReveal<HTMLElement>({ stagger: 0.1, y: 20 });

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="bg-blue-50/40 py-12 sm:py-20 dark:bg-slate-900/50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12">
          <h2 className="gsap-fade-up text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Mulai dalam 3 Langkah Mudah
          </h2>
          <p className="gsap-fade-up mt-2 sm:mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Hanya butuh beberapa detik untuk memulai perjalanan finansial Anda
            bersama Monetira.
          </p>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-8 hidden h-px w-2/3 -translate-x-1/2 border-t-2 border-dashed border-slate-300 dark:border-slate-700 lg:block"
          />
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="gsap-fade-up relative flex flex-col items-center text-center rounded-2xl border border-slate-200/60 sm:border-transparent bg-white/70 sm:bg-transparent p-4 sm:p-0 dark:border-slate-800 dark:bg-slate-900/60 sm:dark:bg-transparent"
              >
                <div className="relative z-10 mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white shadow-md border border-slate-100 dark:border-slate-800 dark:bg-slate-800">
                  <step.icon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Langkah {step.step}
                </p>
                <h3 className="mt-1 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
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
