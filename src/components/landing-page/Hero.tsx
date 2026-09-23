import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export const Hero = () => {
  return (
    <section className="bg-white dark:bg-gray-900 h-auto sm:min-h-[85vh] flex flex-col justify-center">
      <div className="container mx-auto grid grid-cols-1 items-center gap-10 px-5 py-12 md:grid-cols-2 lg:px-8">
        <div className="text-left flex flex-col gap-5">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Atur Keuangan, Raih{" "}
            <span className="text-primary"> Kebebasan Finansial </span>
          </h1>
          <p className="max-w-xl text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Monetira membantu Anda mencatat pengeluaran, mengatur anggaran, dan
            merencanakan masa depan finansial dengan lebih mudah.
          </p>
          <div className="flex flex-col items-start gap-4 sm:flex-row pt-2">
            <Link href="/login">
              <Button className="h-12 px-6 sm:px-8 text-base font-semibold cursor-pointer rounded-full shadow-md hover:shadow-lg transition-all">
                Mulai Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-full flex justify-center md:justify-end">
          <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[460px] md:h-[460px] lg:w-[540px] lg:h-[540px]">
            <Image
              src="/images/mockup.png"
              alt="mockup"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};
