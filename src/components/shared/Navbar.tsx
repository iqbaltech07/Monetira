"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
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

export function Navbar() {
  const pathname = usePathname();
  const currentPath = pathname;

  const activeNavItem = NAV_ITEMS.find((item) => item.href === currentPath);

  const pageTitle = activeNavItem
    ? activeNavItem.label
    : "Halaman Tidak Ditemukan";

  return (
    <header className="flex justify-center fixed top-0 left-0 w-full z-50 md:relative items-center gap-4 bg-white p-4 md:flex-row">
      <div className="text-center md:text-start flex items-center">
        <h1 className="text-lg md:text-2xl font-bold text-zinc-600 flex items-center">
          {pageTitle}
        </h1>
      </div>
      <div className="hidden md:block w-full flex-1" />
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto p-0 flex items-center gap-4"
            >
              <Image
                src={"/images/avatar-placeholder.png"}
                alt="profile"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <div className="hidden text-left font-poppins text-slate-800 md:block">
                <h5 className="text-sm font-semibold">Rozan Nouval</h5>
                <p className="text-xs text-muted-foreground">
                  rozannouval@gmail.com
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
