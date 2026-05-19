"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavMenuItem = { label: string; href: string; openNewTab?: boolean };

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function NavLinks({ items }: { items: NavMenuItem[] }) {
  const pathname = usePathname();

  return (
    <div className="flex items-stretch">
      {items.map((item, i) => {
        const active = isActive(item.href, pathname);
        return (
          <Link
            key={`${item.href}-${i}`}
            href={item.href}
            target={item.openNewTab ? "_blank" : undefined}
            rel={item.openNewTab ? "noreferrer" : undefined}
            className={`flex items-center px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap transition-colors border-r border-r-[var(--np-border)] font-medium ${
              active
                ? "bg-[var(--np-primary)] text-white"
                : "text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] hover:bg-[var(--np-newsprint)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
