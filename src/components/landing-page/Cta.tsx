import Link from "next/link";
import { Button } from "../ui/button";

export const CTA = () => {
  return (
    <section className="bg-white py-20 dark:bg-gray-950">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-secondary p-12 text-center shadow-xl md:p-16">
          <div className="absolute inset-0 bg-black/15 mix-blend-multiply"></div>
          <div className="relative z-10 flex flex-col justify-center items-center gap-5">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Mulai Kendalikan Keuanganmu Hari Ini
            </h2>
            <p className="mx-auto max-w-2xl text-md sm:text-lg text-gray-200">
              Gabung dengan pengguna Monetira lainnya dan wujudkan tujuan
              finansialmu dengan lebih mudah.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button className="h-12 px-7 sm:px-8 text-base font-bold rounded-full bg-white text-primary shadow-lg hover:bg-white/90 cursor-pointer transition-all hover:scale-105">
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
