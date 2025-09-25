"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import {
    Stepper,
    StepperDescription,
    StepperIndicator,
    StepperItem,
    StepperSeparator,
    StepperTitle,
    StepperTrigger,
} from "~/components/ui/stepper";

import { StepAccountInfo } from "~/components/auth/step-account-info";
import { StepPersonalization } from "~/components/auth/step-personalization";
import { StepComplete } from "~/components/auth/step-complete";
import { StepVerifyOtp } from "~/components/auth/step-verify-otp";

const steps = [
    { step: 1, title: "Info Akun", description: "Buat kredensial login Anda." },
    { step: 2, title: "Personalisasi", description: "Sesuaikan pengalaman Anda." },
    { step: 3, title: "Verifikasi", description: "Amankan akun anda" },
    { step: 4, title: "Selesai", description: "Siap untuk memulai.", },
];

export default function RegisterPage() {
    const [activeStep, setActiveStep] = React.useState(1);

    const handleNext = () => {
        if (activeStep < steps.length + 1) setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        if (activeStep > 1) setActiveStep((prev) => prev - 1);
    };

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            <div className="flex h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto grid w-full max-w-[480px] gap-6">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>

                    <Card className="overflow-hidden">
                        <CardHeader className="p-6">
                            <Stepper value={activeStep} onValueChange={setActiveStep}>
                                {steps.map(({ step, title, description }) => (
                                    <StepperItem
                                        key={step}
                                        step={step}
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

                        <CardContent className="min-h-[360px]">
                            {activeStep === 1 && <StepAccountInfo />}
                            {activeStep === 2 && <StepPersonalization />}
                            {activeStep === 3 && <StepVerifyOtp />}
                            {activeStep === 4 && <StepComplete />}
                        </CardContent>

                        <CardFooter>
                            <div className="flex w-full gap-4">
                                {activeStep > 1 && activeStep < 3 && (
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        className="flex-1"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Kembali
                                    </Button>
                                )}
                                {activeStep < steps.length && (
                                    <Button onClick={handleNext} className="flex-1">
                                        Lanjut
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>

                    <div className="text-center text-sm">
                        Sudah punya akun?{" "}
                        <Link href="/login" className="underline">
                            Masuk
                        </Link>
                    </div>
                </div>
            </div>

            <div className="hidden bg-primary/5 dark:bg-gray-950 lg:block">
                <div className="flex h-full flex-col items-center justify-center p-12 text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        Satu Langkah Lebih Dekat Menuju Impian Finansial Anda
                    </h2>
                    <p className="mt-4 max-w-md text-lg text-gray-600 dark:text-gray-400">
                        Bergabunglah dengan ribuan pengguna lain yang telah mengubah cara
                        mereka mengelola uang bersama Monetira.
                    </p>
                </div>
            </div>
        </div>
    );
}
