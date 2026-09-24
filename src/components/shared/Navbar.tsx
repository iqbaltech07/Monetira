"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { NAV_ITEMS } from "~/lib/constants";

const TITLE_MAP: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transaksi",
  "/reports": "Laporan Keuangan",
  "/savings": "Tabungan",
  "/budget": "Anggaran",
  "/debts": "Hutang & Piutang",
  "/split-bill": "Split Bill",
  "/market": "Market",
  "/assistant": "AI Chat",
  "/profile": "Akun Saya",
};

export function Navbar() {
  const pathname = usePathname();
  const currentPath = pathname;
  const { data: session } = useSession();

  const activeNavItem = NAV_ITEMS.find((item) => item.href === currentPath);

  const pageTitle =
    TITLE_MAP[currentPath] || activeNavItem?.label || "Monetira";

  const userName = session?.user?.name || "Pengguna";
  const userEmail = session?.user?.email || "user@monetira.com";
  const userImage = session?.user?.image || "/images/avatar-placeholder.png";

  return (
    <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 md:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
          {pageTitle}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto p-1.5 flex items-center gap-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Image
                src={userImage}
                alt={userName}
                width={36}
                height={36}
                className="rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="hidden text-left font-poppins text-slate-800 dark:text-slate-200 md:block">
                <h5 className="text-sm font-semibold leading-tight">
                  {userName}
                </h5>
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {userEmail}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="w-full cursor-pointer">
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="w-full cursor-pointer">
                Pengaturan
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
