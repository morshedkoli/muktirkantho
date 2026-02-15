import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/public/mobile-nav";

export async function Header() {
  const categories = await prisma.category.findMany({ take: 8, orderBy: { name: "asc" } });

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--np-border)] bg-[var(--np-card)]/95 backdrop-blur-md shadow-[var(--np-shadow)]">
      <div className="mx-auto max-w-7xl px-4">
        {/* Main navigation */}
        <nav className="flex h-14 items-center justify-between gap-4">
          <MobileNav categories={categories} />

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-1 flex-1">
            <Link 
              href="/" 
              className="px-3 py-2 text-sm font-semibold text-[var(--np-text-primary)] hover:text-[var(--np-primary)] hover:bg-[var(--np-background)] rounded-md transition-all"
            >
              Home
            </Link>
            
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="px-3 py-2 text-sm font-medium text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] hover:bg-[var(--np-background)] rounded-md transition-all"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <Link 
              href="/search"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] hover:bg-[var(--np-background)] rounded-md transition-all border border-[var(--np-border)]"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </Link>
            
            {/* Theme Toggle */}
            <ThemeToggle variant="minimal" size="md" />
          </div>
        </nav>

      </div>
    </header>
  );
}
