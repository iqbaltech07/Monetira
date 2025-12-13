"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "~/lib/constants";

export const BottomNav = () => {
  const pathname = usePathname();
  return (
    <div className="grid grid-cols-5 justify-between gap-2 md:hidden fixed z-50 bottom-0 left-0 w-full bg-white px-2 py-2">
      {NAV_ITEMS.map((nav) => (
        <Link
          key={nav.label}
          href={nav.href}
          className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
            pathname === nav.href
              ? "text-blue-600 font-semibold"
              : "text-zinc-700"
          } hover:text-blue-500`}
        >
          <nav.icon size={18} />
          <span className="text-[11px]">{nav.label}</span>
        </Link>
      ))}
    </div>
  );
};
