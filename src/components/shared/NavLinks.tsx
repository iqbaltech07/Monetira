"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SheetClose } from "~/components/ui/sheet";
import { NAV_ITEMS } from "~/lib/constants";
import { cn } from "~/lib/utils";

export function NavLinks({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);
  const [sliderStyle, setSliderStyle] = useState({
    top: 0,
    height: 0,
    opacity: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const activeItem = listRef.current?.querySelector<HTMLElement>(
        `a[href="${pathname}"]`,
      );
      if (activeItem) {
        const parentElement = activeItem.parentElement;
        if (parentElement) {
          const { offsetTop, clientHeight } = parentElement;
          setSliderStyle({
            top: offsetTop,
            height: clientHeight,
            opacity: 1,
          });
        }
      } else {
        setSliderStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <ul ref={listRef} className="relative space-y-4">
      <div
        className="absolute left-0 w-full rounded-full bg-primary shadow-lg shadow-primary-light-active transition-all duration-300 ease-in-out"
        style={{
          top: `${sliderStyle.top}px`,
          height: `${sliderStyle.height}px`,
          opacity: sliderStyle.opacity,
        }}
      />

      {NAV_ITEMS.map((item) => {
        const linkElement = (
          <Link
            href={item.href}
            className={cn(
              "relative z-10 flex items-center gap-3 rounded-full px-6 py-3 transition-colors duration-200",
              pathname === item.href
                ? "text-white"
                : "text-gray-600 hover:text-primary",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );

        return (
          <li key={item.label}>
            {isMobile ? (
              <SheetClose asChild>{linkElement}</SheetClose>
            ) : (
              linkElement
            )}
          </li>
        );
      })}
    </ul>
  );
}
