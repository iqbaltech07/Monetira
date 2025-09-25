"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { NAV_LINKS } from "~/lib/constants";

export const Header = () => {


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="container mx-auto flex h-17 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-2" href="/">
          <Image
            src={"/images/monetira-icon.svg"}
            alt="monetira-icon"
            height={35}
            width={35}
          />
          <span className="text-xl font-bold text-primary dark:text-white">
            Monetira
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              className="text-base font-medium text-gray-600 transition-colors hover:text-primary dark:text-gray-400"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Masuk</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Daftar Gratis</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Drawer direction="right">
            <DrawerTrigger asChild>
              <button type="button">
                <Menu />
                <span className="sr-only">Buka Menu</span>
              </button>
            </DrawerTrigger>
            <DrawerContent className="h-full w-[80vw] max-w-sm p-6 flex flex-col">
              <DrawerHeader className="p-0 text-left">
                <DrawerTitle className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Menu</span>
                  <DrawerClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </DrawerClose>
                </DrawerTitle>
              </DrawerHeader>
              <nav className="mt-8 flex flex-col gap-6 text-lg font-medium">
                {NAV_LINKS.map((link) => (
                  <DrawerClose asChild key={link.href}>
                    <Link
                      className="text-gray-700 transition-colors hover:text-primary dark:text-gray-300"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </DrawerClose>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-4">
                <DrawerClose asChild>
                  <Button variant="outline" asChild>
                    <Link href="/login">Masuk</Link>
                  </Button>
                </DrawerClose>
                <DrawerClose asChild>
                  <Button asChild>
                    <Link href="/register">Daftar Gratis</Link>
                  </Button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
};
