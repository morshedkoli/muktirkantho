import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/public/mobile-nav";

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

export async function Header() {
  const dbCategories = await prisma.category.findMany({ take: 12, orderBy: { name: "asc" } });
  const mergedCategories = NAV_CATEGORIES.map((nav) => {
    const match = dbCategories.find(
      (c) => c.slug === nav.slug || c.name === nav.name
    );
    return match || nav;
  });

  return (
    <header className="sticky top-0 z-50 bg-[var(--np-card)] border-b border-[var(--np-border)] shadow-sm">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-stretch">
          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-stretch">
            <MobileNav categories={dbCategories} />
          </div>

          {/* Scrollable category strip */}
          <div className="flex flex-1 overflow-x-auto scrollbar-none">
            <div className="flex items-stretch">
              {mergedCategories.slice(0, 11).map((cat, i) => {
                const slug = typeof cat === "string" ? "" : (cat as any).slug;
                const name = typeof cat === "string" ? cat : (cat as any).name;
                const isActive = i === 0;
                return (
                  <Link
                    key={slug || i}
                    href={slug ? `/category/${slug}` : "/"}
                    className={`flex items-center px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap transition-colors border-r border-r-[var(--np-border)] font-medium ${
                      isActive
                        ? "bg-[var(--np-primary)] text-white"
                        : "text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] hover:bg-[var(--np-newsprint)]"
                    }`}
                  >
                    {name}
                  </Link>
                );
              })}
            </div>
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
