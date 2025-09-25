import { CheckCircle2 } from "lucide-react";

export const StepComplete = () => (
  <div className="flex flex-col items-center text-center gap-4 -mt-9 animate-in fade-in-0 duration-500 h-full justify-center">
    <CheckCircle2 className="w-20 h-20 text-secondary" />
    <h1 className="text-2xl font-bold">Pendaftaran Berhasil!</h1>
    <p className="text-balance text-muted-foreground text-sm max-w-sm">
      Selamat datang di Monetira! Akun Anda telah berhasil dibuat. Mari mulai
      perjalanan finansial Anda.
    </p>
  </div>
);
