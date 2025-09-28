import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp";

export const StepVerifyOtp = () => (
  <div className="flex flex-col items-center justify-center gap-4 pt-2 animate-in fade-in-0 duration-500">
    <div className="text-center mb-4">
      <h1 className="text-2xl font-bold">Verifikasi Email Anda</h1>
      <p className="text-balance text-muted-foreground text-sm max-w-sm">
        Kami telah mengirim kode verifikasi ke{" "}
        <span className="font-bold">user@email.com</span>. Masukkan kode
        tersebut di bawah ini untuk melanjutkan.
      </p>
    </div>
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
    <p className="text-sm text-muted-foreground">
      Tidak menerima kode?{" "}
      <button type="button" className="underline underline-offset-2">
        Kirim ulang
      </button>
    </p>
  </div>
);
