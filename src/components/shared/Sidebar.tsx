import Image from "next/image";
import Link from "next/link";
import { NavLinks } from "./NavLinks";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 md:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-slate-800/60">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src={"/images/monetira-icon-desc.svg"}
              alt="monetira-icon"
              width={160}
              height={40}
              priority
            />
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6">
          <NavLinks />
        </nav>
      </div>
    </aside>
  );
}
