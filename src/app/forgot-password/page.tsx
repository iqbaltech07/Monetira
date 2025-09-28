"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="mx-auto grid w-full max-w-[400px] gap-6">
        <div className="grid gap-4 text-center">
          <div className="flex justify-center">
            <Image
              src="/images/monetira-icon-title.svg"
              alt="Logo"
              width={170}
              height={170}
              priority
              draggable="false"
            />
          </div>
          <h1 className="text-3xl font-bold">Lupa Password?</h1>
          <p className="text-balance text-muted-foreground">
            Masukkan email Anda dan kami akan mengirimkan instruksi untuk
            mereset password.
          </p>
        </div>
        <Card>
          <CardContent className="grid gap-4 pt-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@contoh.com"
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full">
              Kirim Instruksi
            </Button>
          </CardContent>
        </Card>
        <div className="text-center text-sm">
          <Link
            href="/login"
            className="inline-flex items-center text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Kembali ke halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}
