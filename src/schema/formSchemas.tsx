import { z } from "zod";

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const registerFormSchema = z
  .object({
    fullName: z.string().min(1, "Nama lengkap wajib diisi"),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Password harus mengandung huruf kapital")
      .regex(/[a-z]/, "Password harus mengandung huruf kecil")
      .regex(/[0-9]/, "Password harus mengandung angka")
      .regex(/[^A-Za-z0-9]/, "Password harus mengandung simbol"),
    confirmPassword: z
      .string()
      .min(8, "Konfirmasi password minimal 8 karakter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });
