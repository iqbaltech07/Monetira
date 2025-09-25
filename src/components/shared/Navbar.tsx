"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { NavLinks } from "./NavLinks";

export function Navbar() {
  return (
    <header className="flex h-16 items-center gap-4 bg-white p-4 lg:h-[70px] flex-row-reverse md:flex-row">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[250px] p-4">
          <SheetHeader>
            <SheetTitle>
              <div className="mb-4">
                <Link href="/dashboard">
                  <Image
                    src={"/images/monetira-icon-desc.svg"}
                    alt="monetira-icon"
                    width={180}
                    height={45}
                  />
                </Link>
              </div>
            </SheetTitle>
          </SheetHeader>
          <NavLinks isMobile />
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1" />

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
            <div className="hidden text-left font-poppins text-slate-800 sm:block">
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
    </header>

  );
}
