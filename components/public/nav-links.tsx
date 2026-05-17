"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { slug: string; name: string };

export function NavLinks({ categories }: { categories: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="flex items-stretch">
      {categories.slice(0, 11).map((cat) => {
        const href = cat.slug ? `/category/${cat.slug}` : "/";
        const isActive = cat.slug
          ? pathname === href || pathname.startsWith(`/category/${cat.slug}`)
          : pathname === "/";
        return (
          <Link
            key={cat.slug || "home"}
            href={href}
            className={`flex items-center px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap transition-colors border-r border-r-[var(--np-border)] font-medium ${
              isActive
                ? "bg-[var(--np-primary)] text-white"
                : "text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] hover:bg-[var(--np-newsprint)]"
            }`}
          >
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
}
