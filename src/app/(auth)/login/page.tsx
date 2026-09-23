"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useGsapReveal } from "~/lib/gsap";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.1, y: 20 });

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate / trigger Google OAuth
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div
      ref={containerRef}
      className="w-full lg:grid lg:min-h-screen lg:grid-cols-2"
    >
      <div className="hidden bg-gradient-to-br from-primary/90 via-primary/80 to-primary/75 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 lg:block">
        <div className="flex flex-col justify-center items-center h-full p-12 text-center -mt-6">
          <div className="gsap-scale-in">
            <Image
              src="/images/ilustrations/finance-leaders.svg"
              alt="finance-leaders"
              width={400}
              height={400}
              draggable="false"
              priority
            />
          </div>
          <div className="max-w-lg space-y-4">
            <h2 className="gsap-fade-up text-3xl xl:text-4xl font-extrabold text-white leading-tight">
              Atur Keuangan, Capai Kebebasan Finansial
            </h2>
            <p className="gsap-fade-up text-base text-white/90 leading-relaxed">
              Monetira adalah partner terbaik Anda untuk mencatat, merencanakan,
              dan mencapai tujuan finansial dengan mudah dan transparan.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-slate-50/50 dark:bg-slate-950">
        <div className="mx-auto w-full max-w-[420px] space-y-6">
          <div className="text-center space-y-3">
            <div className="gsap-scale-in flex justify-center mb-2">
              <Image
                src="/images/monetira-icon-title.svg"
                alt="Monetira Logo"
                width={160}
                height={50}
                priority
                draggable="false"
              />
            </div>
            <h1 className="gsap-fade-up text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Selamat Datang
            </h1>
            <p className="gsap-fade-up text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Masuk dengan satu klik menggunakan Google untuk mulai mengelola
              keuangan Anda.
            </p>
          </div>

          <Card className="gsap-scale-in border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 rounded-2xl">
            <div className="space-y-5">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={handleGoogleLogin}
                className="w-full h-12 flex items-center justify-center gap-3 text-sm sm:text-base font-semibold border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 shadow-sm cursor-pointer transition-all hover:scale-[1.01]"
              >
                <svg
                  aria-label="Google"
                  role="img"
                  className="w-5 h-5 shrink-0"
                  viewBox="0 0 24 24"
                >
                  <title>Google</title>
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                {isLoading ? "Menghubungkan..." : "Lanjutkan dengan Google"}
              </Button>

              <div className="pt-2 text-center text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                Dengan melanjutkan, Anda menyetujui Ketentuan Layanan &
                Kebijakan Privasi Monetira.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
