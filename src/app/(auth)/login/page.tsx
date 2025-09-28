"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { FaGoogle } from "react-icons/fa6";
import type z from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { loginFormSchema } from "~/schema/formSchemas";

type LoginFormSchema = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
  });

  const { handleSubmit, control } = form;

  const onSubmit = handleSubmit((value) => {
    alert(`email: ${value.email} | Password: ${value.password}`);
  });

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-primary/85 via-primary/80 to-primary/75 lg:block">
        <div className="flex flex-col justify-center items-center h-full p-12 text-center -mt-10">
          <Image
            src="/images/ilustrations/finance-leaders.svg"
            alt="finance-leaders"
            width={400}
            height={400}
            draggable="false"
            priority
          />
          <div className="max-w-lg space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Atur Keuangan, Capai Kebebasan Finansial
            </h2>
            <p className="mt-4 text-lg text-white leading-relaxed">
              Monetira adalah partner terbaik Anda untuk mencatat, merencanakan,
              dan mencapai tujuan finansial.
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 h-screen">
        <div className="mx-auto grid w-full max-w-[400px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/images/monetira-icon-title.svg"
                alt="Logo"
                width={170}
                height={170}
                priority
                draggable="false"
              />
            </div>
            <h1 className="text-3xl font-bold">Selamat Datang Kembali</h1>
            <p className="text-balance text-muted-foreground">
              Masukkan email Anda untuk masuk ke akun Anda
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={onSubmit}>
              <Card>
                <CardContent className="grid gap-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center"
                  >
                    <FaGoogle className="w-4 h-4" /> Masuk dengan Google
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Atau lanjutkan dengan
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <FormField
                      control={control}
                      name="email"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" required {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <FormField
                      control={control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <FormLabel>Password</FormLabel>
                            <Link
                              href="/forgot-password"
                              className="ml-auto inline-block text-sm underline"
                            >
                              Lupa password?
                            </Link>
                          </div>
                          <FormControl>
                            <Input type="password" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Masuk
                  </Button>
                </CardContent>
              </Card>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="underline text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
