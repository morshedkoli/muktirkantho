"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";

type NavItem = { label: string; url: string };

const MAX_VISIBLE = 8;

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const visibleItems = items.slice(0, MAX_VISIBLE);
  const overflowItems = items.slice(MAX_VISIBLE);
  const hasOverflow = overflowItems.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function isActive(url: string) {
    return url === "/"
      ? pathname === "/"
      : pathname === url || pathname.startsWith(url + "/");
  }

  return (
    <div className="flex items-center gap-0.5 px-1">
      {visibleItems.map((item, idx) => (
        <Link
          key={item.url + idx}
          href={item.url}
          className={cn(
            "flex items-center px-3 py-1.5 my-auto rounded-full text-xs sm:text-[13px] whitespace-nowrap font-medium transition-all duration-150",
            isActive(item.url)
              ? "bg-[var(--np-primary)] text-white shadow-sm"
              : "text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] hover:bg-[var(--np-newsprint)]"
          )}
        >
          {item.label}
        </Link>
      ))}

      {hasOverflow && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "flex items-center px-3 py-1.5 my-auto rounded-full text-xs sm:text-[13px] whitespace-nowrap font-medium transition-all duration-150",
              open
                ? "bg-[var(--np-primary)] text-white shadow-sm"
                : "text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] hover:bg-[var(--np-newsprint)]"
            )}
            aria-expanded={open}
            aria-haspopup="true"
          >
            আরও ▾
          </button>

          {open && (
            <div className="absolute left-0 top-full mt-1 z-50 min-w-[160px] rounded-lg bg-[var(--np-card)] shadow-lg border border-[var(--np-border)] py-1">
              {overflowItems.map((item, idx) => (
                <Link
                  key={item.url + idx}
                  href={item.url}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-4 py-2 text-sm whitespace-nowrap transition-colors",
                    isActive(item.url)
                      ? "text-[var(--np-primary)] font-semibold bg-[var(--np-newsprint)]"
                      : "text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] hover:bg-[var(--np-newsprint)]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
