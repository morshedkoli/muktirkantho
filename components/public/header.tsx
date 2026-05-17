import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Search, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/public/mobile-nav";
import { NavLinks } from "@/components/public/nav-links";

const NAV_CATEGORIES = [
  { slug: "", name: "সর্বশেষ" },
  { slug: "bangladesh", name: "বাংলাদেশ" },
  { slug: "politics", name: "রাজনীতি" },
  { slug: "world", name: "বিশ্ব" },
  { slug: "business", name: "বাণিজ্য" },
  { slug: "opinion", name: "মতামত" },
  { slug: "sports", name: "খেলা" },
  { slug: "entertainment", name: "বিনোদন" },
  { slug: "jobs", name: "চাকরি" },
  { slug: "lifestyle", name: "জীবনযাপন" },
  { slug: "video", name: "ভিডিও" },
];

// Cache categories for 5 minutes to avoid a DB hit on every page render
const getCachedCategories = unstable_cache(
  () => prisma.category.findMany({ take: 12, orderBy: { name: "asc" } }),
  ["nav-categories"],
  { revalidate: 300 }
);

export async function Header() {
  const dbCategories = await getCachedCategories();

  // Merge static nav list with live DB categories — DB takes precedence on slug/name match
  const mergedCategories: { slug: string; name: string }[] = NAV_CATEGORIES.map((nav) => {
    const match = dbCategories.find((c) => c.slug === nav.slug || c.name === nav.name);
    return match ? { slug: match.slug, name: match.name } : nav;
  });

  return (
    <header className="sticky top-0 z-50 bg-[var(--np-card)] border-b border-[var(--np-border)] shadow-sm">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-stretch">
          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-stretch">
            <MobileNav categories={dbCategories} />
          </div>

          {/* Scrollable category strip — client component owns active-state logic */}
          <div className="flex flex-1 overflow-x-auto scrollbar-none">
            <NavLinks categories={mergedCategories} />
          </div>

          {/* Right-side utilities */}
          <div className="flex items-stretch border-l border-l-[var(--np-border)]">
            <div className="flex items-center px-1.5">
              <ThemeToggle variant="minimal" size="sm" />
            </div>
            <Link
              href="/search"
              className="flex items-center gap-1 px-2.5 sm:px-3 text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] hover:bg-[var(--np-newsprint)] transition-colors"
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link
              href="/e-paper"
              className="hidden sm:flex items-center px-3 text-xs font-label text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] hover:bg-[var(--np-newsprint)] transition-colors tracking-wider uppercase"
            >
              ই-পেপার
            </Link>
            <Link
              href="/en"
              className="flex items-center px-2.5 sm:px-3 text-xs font-label text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] hover:bg-[var(--np-newsprint)] transition-colors uppercase tracking-wider"
            >
              Eng
            </Link>
            <Link
              href="/admin/login"
              className="hidden sm:flex items-center gap-1 px-3 text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] hover:bg-[var(--np-newsprint)] transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="text-xs">লগইন</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
