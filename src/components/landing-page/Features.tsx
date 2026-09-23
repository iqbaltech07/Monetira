"use client";

import { FEATURE_LIST } from "~/lib/constants";
import { useGsapReveal } from "~/lib/gsap";

export const Features = () => {
  const containerRef = useGsapReveal<HTMLElement>({ stagger: 0.08, y: 20 });

  return (
    <section
      id="features"
      ref={containerRef}
      className="bg-slate-50/50 py-12 sm:py-20 dark:bg-slate-950"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12">
          <h2 className="gsap-fade-up text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Kelola Keuangan Jadi Lebih Mudah
          </h2>
          <p className="gsap-fade-up mt-2 sm:mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Semua yang kamu butuhkan untuk mencatat, mengatur, dan merencanakan
            keuangan tersedia lengkap dalam satu aplikasi.
          </p>
        </div>

        {/* 2 Cards per Row on Mobile as requested */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {FEATURE_LIST.map((feature) => (
            <div
              key={feature.title}
              className="gsap-fade-up flex flex-col items-start rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-6 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="mb-3 sm:mb-4 flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <feature.icon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                {feature.title}
              </h3>
              <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
