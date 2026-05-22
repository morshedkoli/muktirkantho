"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { label: string; url: string };

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="flex items-stretch">
      {items.slice(0, 11).map((item, idx) => {
        const isActive =
          item.url === "/"
            ? pathname === "/"
            : pathname === item.url || pathname.startsWith(item.url + "/");
        return (
          <Link
            key={item.url + idx}
            href={item.url}
            className={`flex items-center px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap transition-colors border-r border-r-[var(--np-border)] font-medium ${
              isActive
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
