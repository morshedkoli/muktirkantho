"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type MobileNavProps = {
  categories: Array<{ id: string; name: string; slug: string }>;
};

export function MobileNav({ categories }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        className="lg:hidden rounded-md p-2 text-[var(--np-text-primary)] transition-colors hover:bg-[var(--np-background)]"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/30"
            onClick={close}
          />

          <div className="fixed left-0 right-0 top-14 z-50 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b border-[var(--np-border)] bg-[var(--np-card)] px-4 pb-6 pt-4 shadow-[var(--np-shadow-lg)]">
            <div className="space-y-1">
              <Link href="/" onClick={close} className="block rounded-md px-3 py-2 font-semibold text-[var(--np-text-primary)] hover:bg-[var(--np-background)]">
                Home
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-[var(--np-text-secondary)] hover:bg-[var(--np-background)] hover:text-[var(--np-primary)]"
                >
                  {category.name}
                </Link>
              ))}
            </div>

            <div className="mt-4 border-t border-[var(--np-border)] pt-4">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[var(--np-primary)]">Quick links</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href="/district/dhaka" onClick={close} className="rounded-md px-3 py-2 text-sm text-[var(--np-text-secondary)] hover:bg-[var(--np-background)]">
                  Dhaka
                </Link>
                <Link href="/district/chattogram" onClick={close} className="rounded-md px-3 py-2 text-sm text-[var(--np-text-secondary)] hover:bg-[var(--np-background)]">
                  Chattogram
                </Link>
                <Link href="/district/rajshahi" onClick={close} className="rounded-md px-3 py-2 text-sm text-[var(--np-text-secondary)] hover:bg-[var(--np-background)]">
                  Rajshahi
                </Link>
                <Link href="/tag/politics" onClick={close} className="rounded-md px-3 py-2 text-sm text-[var(--np-text-secondary)] hover:bg-[var(--np-background)]">
                  Politics
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
