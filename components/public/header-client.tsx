"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MobileNav } from "@/components/public/mobile-nav";
import { NavLinks } from "@/components/public/nav-links";
import { cn } from "@/lib/cn";

type MenuItem = {
  id: string;
  label: string;
  url: string;
  openInNewTab: boolean;
};

type HeaderClientProps = {
  menuItems: MenuItem[];
};

export function HeaderClient({ menuItems }: HeaderClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 8);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-[var(--np-card)] transition-shadow duration-200",
        scrolled
          ? "shadow-[0_2px_12px_rgba(0,0,0,0.12)] border-b border-[var(--np-border)]"
          : "border-b border-[var(--np-border)]"
      )}
    >
      <div className="mx-auto max-w-7xl">
        <nav
          className="flex items-stretch min-h-[48px]"
          aria-label="প্রধান নেভিগেশন"
        >
          {/* Mobile hamburger — visible only below lg */}
          <div className="flex lg:hidden items-stretch shrink-0">
            <MobileNav menuItems={menuItems} />
          </div>

          {/* Scrollable category nav strip */}
          <div className="flex flex-1 overflow-x-auto scrollbar-none">
            <NavLinks
              items={menuItems.map((m) => ({ label: m.label, url: m.url }))}
            />
          </div>

          {/* Right utilities */}
          <div className="flex items-stretch shrink-0 border-l border-[var(--np-border)]">
            <Link
              href="/search"
              aria-label="অনুসন্ধান"
              className="flex items-center gap-1.5 px-3 sm:px-4 text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] hover:bg-[var(--np-newsprint)] transition-colors"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium">
                খুঁজুন
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
