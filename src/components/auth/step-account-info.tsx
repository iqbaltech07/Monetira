"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import type { z } from "zod";
import { Input } from "~/components/ui/input";
import { registerFormSchema } from "~/schema/formSchemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type RegisterFormSchema = z.infer<typeof registerFormSchema>;

export const StepAccountInfo = ({
  onValid,
}: {
  onValid: (data: RegisterFormSchema) => void;
}) => {
  const form = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { control, handleSubmit } = form;

  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          id="account-info-form"
          onSubmit={handleSubmit(onValid)}
          className="grid gap-4"
        >
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">Buat Akun Baru</h1>
            <p className="text-balance text-muted-foreground text-sm">
              Langkah pertama untuk mengelola keuangan Anda.
            </p>
          </div>

          <div className="grid gap-2">
            <FormField
              control={control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Nama lengkap Anda"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-2">
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex flex-col lg:min-h-[90px]">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="flex flex-col lg:min-h-[90px]">
                  <FormLabel>Konfirmasi Password</FormLabel>
                  <FormControl>
                    <Input type="password" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};
