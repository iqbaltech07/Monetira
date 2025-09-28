import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export const Hero = () => {
  return (
    <section className="bg-white dark:bg-gray-900 h-auto sm:h-screen max-h-[1000px] flex flex-col justify-center">
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-5 py-14 md:grid-cols-2 lg:px-8 md:-mt-30">
        <div className="text-left flex flex-col gap-5">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl">
            Atur Keuangan, Raih{" "}
            <span className="text-primary"> Kebebasan Finansial </span>
          </h1>
          <p className="max-w-2xl text-md lg:text-lg text-gray-600 dark:text-gray-400 md:mx-0">
            Monetira membantu Anda mencatat pengeluaran, mengatur anggaran, dan
            merencanakan masa depan finansial dengan lebih mudah.
          </p>
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <Link href="/register">
              <Button className="w-auto !px-5 py-6 sm:!px-6 sm:py-7 text-md lg:text-lg cursor-pointer rounded-full">
                Mulai Sekarang
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-full flex justify-center md:justify-end">
          <div className="relative w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] md:w-[500px] md:h-[500px] lg:w-[800px] lg:h-[800px]">
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
