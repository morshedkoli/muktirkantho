import Link from "next/link";
import { AlertCircle, ChevronRight } from "lucide-react";
import { getPostPath } from "@/lib/post-url";

type BreakingTickerProps = {
  items: { id: string; title: string; slug: string }[];
};

export function BreakingTicker({ items }: BreakingTickerProps) {
  if (!items.length) return null;

  const tickerItems = items.length > 1 ? [...items, ...items] : items;

  return (
    <div className="border-y-2 border-[var(--np-breaking)] bg-[var(--np-card)]">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-stretch">
          {/* Breaking label */}
          <div className="flex items-center gap-2 bg-[var(--np-breaking)] px-4 py-3 text-white shrink-0">
            <AlertCircle className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-wider">Breaking</span>
          </div>

          {/* Ticker content */}
          <div className="flex-1 overflow-hidden">
            <div className="breaking-ticker-track flex w-max items-center">
              {tickerItems.map((item, index) => (
                <Link
                  key={`${item.id}-${index}`}
                  href={getPostPath(item)}
                  aria-hidden={index >= items.length}
                  tabIndex={index >= items.length ? -1 : 0}
                  className="group flex items-center gap-2 px-4 py-3 whitespace-nowrap hover:bg-[var(--np-background)] transition-colors border-r border-[var(--np-border)] last:border-r-0"
                >
                  <span className="text-sm font-medium text-[var(--np-text-primary)] group-hover:text-[var(--np-primary)] transition-colors line-clamp-1">
                    {item.title}
                  </span>
                  <ChevronRight className="h-4 w-4 text-[var(--np-text-secondary)] group-hover:text-[var(--np-primary)] shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Time indicator */}
          <div className="hidden md:flex items-center px-4 border-l border-[var(--np-border)] text-xs text-[var(--np-text-secondary)] shrink-0">
            <span>LIVE UPDATES</span>
          </div>
        </div>
      </div>
    </div>
  );
}
