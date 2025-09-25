"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Logo } from "~/components/logo";
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
    alert(`username: ${value.email} | Password: ${value.password}`);
  });

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-primary/5 lg:block dark:bg-gray-950">
        <div className="flex flex-col justify-center items-center h-full p-12 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Kelola Keuangan, Raih Kebebasan Finansial Anda
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-md">
            Monetira adalah partner terbaik Anda untuk mencatat, merencanakan,
            dan mencapai tujuan finansial.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 h-screen">
        <div className="mx-auto grid w-full max-w-[400px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold">Selamat Datang Kembali</h1>
            <p className="text-balance text-muted-foreground">
              Masukkan email Anda untuk masuk ke akun Anda
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={onSubmit}>
              <Card>
                <CardContent className="grid gap-4 pt-6">
                  <Button variant="outline" className="w-full">
                    Masuk dengan Google
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
                              <Input type="email" {...field} />
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
                              href="#"
                              className="ml-auto inline-block text-sm underline"
                            >
                              Lupa password?
                            </Link>
                          </div>
                          <FormControl>
                            <Input type="password" {...field} />
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
            <Link href="/register" className="underline">
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
