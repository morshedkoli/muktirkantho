"use client";

import { useState } from "react";
import { X } from "lucide-react";

/**
 * Client half of the mobile anchor ad: the dismiss interaction plus the spacer
 * that keeps the fixed bar from covering the end of the page. Both disappear
 * together when the reader dismisses it.
 */
export function MobileAnchorAdShell({ children }: { children?: React.ReactNode }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <>
      {/* Reserves the bar's height so the footer stays reachable. */}
      <div aria-hidden className="h-[60px] lg:hidden" />

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--np-border)] bg-[var(--np-card)] shadow-[0_-2px_8px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="relative flex items-center px-3 py-1.5">
          <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-[var(--np-text-secondary)] mr-2">
            বিজ্ঞাপন
          </span>

          <div className="flex-1 flex items-center justify-center overflow-hidden">{children}</div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="বিজ্ঞাপন বন্ধ করুন"
            className="shrink-0 ml-2 rounded-full p-1 text-[var(--np-text-secondary)] hover:bg-[var(--np-newsprint)] hover:text-[var(--np-text-primary)] transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
