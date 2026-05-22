import Link from "next/link";
import { Search, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/public/mobile-nav";
import { NavLinks } from "@/components/public/nav-links";
import { getHeaderMenuItems } from "@/lib/menus";

export async function Header() {
  const menuItems = await getHeaderMenuItems();

  return (
    <header className="sticky top-0 z-50 bg-[var(--np-card)] border-b border-[var(--np-border)] shadow-sm">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-stretch min-h-[48px]">

          {/* Mobile hamburger — visible only on mobile */}
          <div className="flex lg:hidden items-stretch">
            <MobileNav menuItems={menuItems} />
          </div>

          {/* Scrollable nav strip */}
          <div className="flex flex-1 overflow-x-auto scrollbar-none">
            <NavLinks items={menuItems.map((m) => ({ label: m.label, url: m.url }))} />
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
