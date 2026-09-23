"use client";

import {
  ArrowRight,
  CreditCard,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useGsapReveal } from "~/lib/gsap";

export const Hero = () => {
  const containerRef = useGsapReveal<HTMLElement>({ stagger: 0.1, y: 20 });

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 pt-8 pb-12 sm:py-16 lg:py-24"
    >
      {/* Decorative ambient background blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-400/15 blur-3xl sm:h-96 sm:w-96"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* LEFT: Text & Value Prop */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:col-span-6 space-y-4 sm:space-y-5">
            {/* Eyebrow Kicker with Underline */}
            <div className="gsap-fade-up inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide text-blue-600 dark:text-blue-400">
              <Wallet className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="border-b-2 border-blue-600 pb-0.5 dark:border-blue-400">
                Solusi Cerdas Kelola Finansial
              </span>
            </div>

            {/* Headline */}
            <h1 className="gsap-fade-up text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Atur Keuangan, Raih{" "}
              <span className="text-blue-600 dark:text-blue-500">
                Kebebasan Finansial
              </span>
            </h1>

            {/* Description */}
            <p className="gsap-fade-up text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Monetira membantu Anda mencatat pengeluaran, mengatur anggaran,
              dan merencanakan masa depan finansial dengan lebih mudah, rapi,
              dan aman.
            </p>

            {/* CTA Buttons */}
            <div className="gsap-fade-up flex flex-col w-full sm:w-auto sm:flex-row items-center gap-3 pt-2">
              <Link href="/login" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 px-8 text-base font-semibold cursor-pointer rounded-xl shadow-lg shadow-blue-500/25 bg-blue-600 hover:bg-blue-700 text-white transition-all hover:scale-105">
                  Mulai Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="gsap-fade-up flex items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> 100% Gratis
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <CreditCard className="h-4 w-4 text-blue-500" /> Tanpa Kartu
                Kredit
              </span>
            </div>
          </div>

          {/* RIGHT: Mockup Showcase with Ambient Glow & Floating Chips */}
          <div className="relative flex justify-center items-center lg:col-span-6 mt-4 lg:mt-0">
            {/* Ambient glow behind mockup */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-blue-500/20 via-indigo-500/10 to-emerald-500/15 blur-3xl scale-90 sm:scale-105"
            />

            <div className="gsap-scale-in relative w-full max-w-[290px] sm:max-w-[380px] md:max-w-[440px] lg:max-w-[500px] aspect-[4/4.2] flex items-center justify-center">
              {/* Floating Chip 1: Saldo Bertumbuh */}
              <div className="absolute top-4 left-0 sm:-left-4 z-20 flex items-center gap-2 sm:gap-2.5 rounded-2xl border border-white/80 bg-white/95 p-2 sm:p-2.5 shadow-xl shadow-slate-200/50 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-left pr-1">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight">
                    Saldo Bertumbuh
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    +24.8%
                  </p>
                </div>
              </div>

              {/* Floating Chip 2: Target Tercapai */}
              <div className="absolute bottom-4 right-0 sm:-right-4 z-20 flex items-center gap-2 sm:gap-2.5 rounded-2xl border border-white/80 bg-white/95 p-2 sm:p-2.5 shadow-xl shadow-slate-200/50 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <PiggyBank className="h-4 w-4" />
                </div>
                <div className="text-left pr-1">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight">
                    Target Tabungan
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    85% Tercapai
                  </p>
                </div>
              </div>

              {/* Mockup Image */}
              <Image
                src="/images/mockup.png"
                alt="Monetira App Interface Showcase"
                fill
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
