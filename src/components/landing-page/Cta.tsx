"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { useGsapReveal } from "~/lib/gsap";

export const CTA = () => {
  const containerRef = useGsapReveal<HTMLElement>({ stagger: 0.1, y: 20 });

  return (
    <section
      ref={containerRef}
      className="bg-slate-50/50 py-12 sm:py-20 dark:bg-slate-950"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="gsap-scale-in relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-12 md:p-16 text-center shadow-xl">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/10 mix-blend-multiply"
          />
          <div className="relative z-10 flex flex-col justify-center items-center gap-4 sm:gap-5">
            <h2 className="gsap-fade-up text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Mulai Kendalikan Keuanganmu Hari Ini
            </h2>
            <p className="gsap-fade-up mx-auto max-w-xl text-sm sm:text-base text-blue-50/90 leading-relaxed">
              Gabung bersama Monetira sekarang dan wujudkan kebebasan
              finansialmu dengan pencatatan yang teratur dan otomatis.
            </p>
            <div className="gsap-fade-up pt-2">
              <Link href="/login">
                <Button className="h-12 px-7 sm:px-8 text-base font-bold rounded-full bg-white text-blue-600 shadow-lg hover:bg-white/95 cursor-pointer transition-all hover:scale-105">
                  Mulai Gratis Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
