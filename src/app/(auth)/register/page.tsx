"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { StepAccountInfo } from "~/components/auth/step-account-info";
import { StepComplete } from "~/components/auth/step-complete";
import { StepVerifyOtp } from "~/components/auth/step-verify-otp";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "~/components/ui/stepper";

const steps = [
  { step: 1, title: "Info Akun", description: "Lengkapi data akun Anda." },
  { step: 2, title: "Verifikasi", description: "Pastikan akun tetap aman." },
  { step: 3, title: "Selesai", description: "Akun siap digunakan." },
];

export default function RegisterPage() {
  const [activeStep, setActiveStep] = React.useState(1);

  const handleBack = () => {
    if (activeStep > 1) setActiveStep((prev) => prev - 1);
  };

  const handleNext = () => {
    if (activeStep < steps.length) {
      setActiveStep((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        <div className="mx-auto w-full max-w-[480px] space-y-6">
          <div className="flex justify-center mb-4 sm:mb-6">
            <Image
              src="/images/monetira-icon-title.svg"
              alt="Logo"
              width={170}
              height={170}
              priority
              draggable="false"
            />
          </div>

          <Card className="overflow-hidden shadow-lg">
            <CardHeader className="p-3 sm:p-4">
              <Stepper value={activeStep} onValueChange={setActiveStep}>
                {steps.map(({ step, title }) => (
                  <StepperItem
                    key={step}
                    step={step}
                    disabled={step > activeStep}
                    className="relative flex-1 flex-col!"
                  >
                    <StepperTrigger className="flex-col gap-3 rounded">
                      <StepperIndicator />
                      <div className="space-y-0.5 px-2">
                        <StepperTitle>{title}</StepperTitle>
                      </div>
                    </StepperTrigger>
                    {step < steps.length && (
                      <StepperSeparator className="absolute inset-x-0 top-3 left-[calc(50%+0.75rem+0.125rem)] -order-1 m-0 -translate-y-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
                    )}
                  </StepperItem>
                ))}
              </Stepper>
            </CardHeader>

            <CardContent className="min-h-[250px] sm:min-h-[300px] p-4 sm:p-6">
              {activeStep === 1 && (
                <StepAccountInfo
                  onValid={(values) => {
                    console.log("Step1 values:", values);
                    setActiveStep(2);
                  }}
                />
              )}
              {activeStep === 2 && <StepVerifyOtp />}
              {activeStep === 3 && <StepComplete />}
            </CardContent>

            <CardFooter className="p-4 sm:p-6">
              <div className="flex w-full gap-3 sm:gap-4">
                {activeStep > 1 && activeStep < 3 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-10 sm:h-11"
                    size="sm"
                  >
                    <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                    <span className="text-sm sm:text-base">Kembali</span>
                  </Button>
                )}

                {activeStep === 1 && (
                  <Button
                    type="submit"
                    form="account-info-form"
                    className="flex-1 h-10 sm:h-11"
                    size="sm"
                  >
                    <span className="text-sm sm:text-base">Lanjut</span>
                  </Button>
                )}

                {activeStep > 1 && activeStep < steps.length && (
                  <Button
                    onClick={handleNext}
                    className="flex-1 h-10 sm:h-11"
                    size="sm"
                  >
                    <span className="text-sm sm:text-base">Lanjut</span>
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>

          <div className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="underline font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Masuk
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden bg-gradient-to-bl from-primary/85 via-primary/80 to-primary/75 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 lg:block">
        <div className="flex h-full flex-col items-center justify-center p-8 xl:p-12 text-center">
          <div className="max-w-lg space-y-6">
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Satu Langkah Lebih Dekat Menuju Impian Finansial Anda
            </h2>
            <p className="text-lg text-white leading-relaxed">
              Bergabunglah dengan ribuan pengguna lain yang telah mengubah cara
              mereka mengelola uang bersama Monetira.
            </p>

            <div className="mt-8 flex justify-center space-x-4 opacity-60">
              <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
              <div
                className="h-2 w-2 bg-white rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="h-2 w-2 bg-white rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
