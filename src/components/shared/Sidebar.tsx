import Image from "next/image";
import Link from "next/link";
import { NavLinks } from "./NavLinks";

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-shrink-0 bg-white dark:bg-gray-800 md:block">
      <div className="flex h-full flex-col">
        <div className="flex h-20 items-center p-4">
          <Link
            href="/dashboard"
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            <Image
              src={"/images/monetira-icon-desc.svg"}
              alt="monetira-icon"
              width={200}
              height={50}
            />
          </Link>
        </div>
        <nav className="mt-4 flex-1 p-4">
          <NavLinks />
        </nav>
      </div>
    </aside>
  );
}
