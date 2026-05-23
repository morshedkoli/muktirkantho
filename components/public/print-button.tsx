"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center justify-center w-8 h-8 rounded border border-[var(--np-border)] bg-[var(--np-background)] text-[var(--np-text-secondary)] hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] transition-all"
      aria-label="প্রিন্ট করুন"
      title="প্রিন্ট করুন"
    >
      <Printer className="h-4 w-4" />
    </button>
  );
}
