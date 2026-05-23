"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface MobileAnchorAdProps {
  children?: React.ReactNode;
}

export function MobileAnchorAd({ children }: MobileAnchorAdProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)] lg:hidden">
      <div className="relative flex items-center px-3 py-1.5">
        {/* Label */}
        <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-zinc-400 mr-2">
          বিজ্ঞাপন
        </span>

        {/* Ad content */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {children}
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="বিজ্ঞাপন বন্ধ করুন"
          className="shrink-0 ml-2 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
