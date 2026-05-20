"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Search, FileText, Globe, User } from "lucide-react";

type MenuItem = {
  id: string;
  label: string;
  url: string;
  openInNewTab: boolean;
};

type MobileNavProps = {
  menuItems: MenuItem[];
};

export function MobileNav({ menuItems }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button
        className="flex items-center px-3 text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] hover:bg-[var(--np-newsprint)] transition-colors"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/50"
            onClick={close}
          />
          <div className="fixed left-0 top-[48px] z-50 w-full max-h-[calc(100vh-3rem)] overflow-y-auto bg-[var(--np-background)] shadow-xl border-b border-[var(--np-border)]">
            {/* Search bar */}
            <div className="border-b border-[var(--np-border)] p-4">
              <Link
                href="/search"
                onClick={close}
                className="flex items-center gap-3 border border-[var(--np-border)] bg-[var(--np-card)] px-4 py-2.5 text-sm text-[var(--np-text-secondary)] hover:border-[var(--np-primary)] transition-colors"
              >
                <Search className="h-4 w-4" />
                খুঁজুন
              </Link>
            </div>

            {/* Menu items */}
            <div className="space-y-0.5 px-3 py-4">
              {menuItems.length === 0 ? (
                <p className="px-3 py-2 text-sm text-[var(--np-text-secondary)]">
                  No menu items configured.
                </p>
              ) : (
                menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url}
                    onClick={close}
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    className="block rounded-md px-3 py-2.5 text-sm text-[var(--np-text-soft)] hover:bg-[var(--np-newsprint-2)]"
                  >
                    {item.label}
                  </Link>
                ))
              )}
            </div>

            {/* Utility links */}
            <div className="border-t border-[var(--np-border)] px-3 py-4">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/e-paper"
                  onClick={close}
                  className="flex items-center gap-2 rounded-md border border-[var(--np-border)] bg-[var(--np-card)] px-3 py-2.5 text-sm text-[var(--np-text-soft)] hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] transition-colors"
                >
                  <FileText className="h-4 w-4" /> ই-পেপার
                </Link>
                <Link
                  href="/en"
                  onClick={close}
                  className="flex items-center gap-2 rounded-md border border-[var(--np-border)] bg-[var(--np-card)] px-3 py-2.5 text-sm text-[var(--np-text-soft)] hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] transition-colors"
                >
                  <Globe className="h-4 w-4" /> English
                </Link>
              </div>
              <Link
                href="/admin/login"
                onClick={close}
                className="mt-2 flex items-center gap-2 rounded-md bg-[var(--np-primary)] px-3 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                <User className="h-4 w-4" /> লগইন
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
