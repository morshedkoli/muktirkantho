import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";
import { getPostPath } from "@/lib/post-url";

type BreakingTickerProps = {
  items: { id: string; title: string; slug: string }[];
};

/** Self-contained async server component — fetches its own breaking news data. */
export async function BreakingTickerServer() {
  let items: { id: string; title: string; slug: string }[] = [];
  try {
    items = await prisma.post.findMany({
      where: { status: PostStatus.published },
      select: { id: true, title: true, slug: true },
      take: 5,
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    // fall through — render nothing if DB is unavailable
  }
  return <BreakingTicker items={items} />;
}

export function BreakingTicker({ items }: BreakingTickerProps) {
  if (!items.length) return null;

  // Duplicate items so the scroll loop is seamless (even a single item needs duplication)
  const tickerItems = [...items, ...items];

  return (
    <div className="bg-[#b91c1c] overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-stretch min-h-[40px]">

          {/* "ব্রেকিং" badge */}
          <div className="flex items-center gap-2 bg-[#7f1d1d] px-3 sm:px-5 shrink-0 border-r border-[#991b1b]">
            {/* Pulsing dot */}
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <span className="text-white text-xs sm:text-sm font-bold tracking-wider uppercase select-none">
              ব্রেকিং
            </span>
          </div>

          {/* Scrolling ticker */}
          <div className="flex-1 overflow-hidden relative">
            {/* Fade-out gradient on the right */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#b91c1c] to-transparent z-10" />
            <div className="breaking-ticker-track flex items-center w-max h-full">
              {tickerItems.map((item, index) => (
                <Link
                  key={`${item.id}-${index}`}
                  href={getPostPath(item)}
                  aria-hidden={index >= items.length}
                  tabIndex={index >= items.length ? -1 : 0}
                  className="flex items-center gap-2 px-5 py-2 whitespace-nowrap text-white hover:text-yellow-200 transition-colors"
                >
                  <span className="text-yellow-300 select-none font-bold" aria-hidden="true">
                    ▸
                  </span>
                  <span className="text-sm font-medium leading-snug">
                    {item.title}
                  </span>
                  <span className="text-white/30 mx-1 select-none" aria-hidden="true">
                    ●
                  </span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
