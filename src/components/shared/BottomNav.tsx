"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "~/lib/constants";

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 grid w-full grid-cols-5 items-center justify-between border-t border-slate-200/80 bg-white/95 px-1 py-1.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
      {NAV_ITEMS.map((nav) => {
        const isActive = pathname === nav.href;
        return (
          <Link
            key={nav.label}
            href={nav.href}
            className={`flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl py-1 transition-all ${
              isActive
                ? "text-primary font-semibold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <nav.icon size={20} className={isActive ? "scale-105" : ""} />
            <span className="text-xs">{nav.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
