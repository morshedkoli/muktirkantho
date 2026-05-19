import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Search, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/public/mobile-nav";
import { NavLinks, type NavMenuItem } from "@/components/public/nav-links";

const FALLBACK_MENU: NavMenuItem[] = [
  { label: "সর্বশেষ", href: "/" },
  { label: "বাংলাদেশ", href: "/category/bangladesh" },
  { label: "রাজনীতি", href: "/category/politics" },
  { label: "বিশ্ব", href: "/category/world" },
  { label: "বাণিজ্য", href: "/category/business" },
  { label: "মতামত", href: "/category/opinion" },
  { label: "খেলা", href: "/category/sports" },
  { label: "বিনোদন", href: "/category/entertainment" },
  { label: "চাকরি", href: "/category/jobs" },
  { label: "ভিডিও", href: "/category/video" },
];

const getMenuItems = unstable_cache(
  async (): Promise<NavMenuItem[]> => {
    const items = await prisma.menuItem.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    if (items.length === 0) return FALLBACK_MENU;
    return items.map((i) => ({ label: i.label, href: i.href, openNewTab: i.openNewTab }));
  },
  ["public-menu-items"],
  { revalidate: 60 }
);

export async function Header() {
  const menuItems = await getMenuItems();

  return (
    <header className="sticky top-0 z-50 bg-[var(--np-card)] border-b border-[var(--np-border)] shadow-sm">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-stretch min-h-[48px]">

          {/* Mobile hamburger — visible only on mobile */}
          <div className="flex lg:hidden items-stretch">
            <MobileNav items={menuItems} />
          </div>

          {/* Desktop nav strip — hidden on mobile */}
          <div className="hidden lg:flex flex-1 overflow-x-auto scrollbar-none">
            <NavLinks items={menuItems} />
          </div>

          {/* Right-side utilities */}
          <div className="flex items-stretch border-l border-l-[var(--np-border)] ml-auto lg:ml-0">
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
