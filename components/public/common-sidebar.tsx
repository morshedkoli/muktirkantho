import Link from "next/link";
import { Grid3X3, TrendingUp } from "lucide-react";
import { LocationFilter } from "@/components/public/location-filter";
import { AdSlot } from "@/components/public/ad-slot";
import { AD_PLACEMENTS } from "@/lib/ads";
import { getSidebarData } from "@/lib/news";

export async function CommonSidebar() {
  const { categories, divisions } = await getSidebarData();

  return (
    <aside className="space-y-6">
      {/* Categories */}
      <section>
        <div className="border border-[var(--np-border)] bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Grid3X3 className="h-4 w-4 text-[var(--np-primary)]" />
            <h3 className="font-label text-xs uppercase tracking-wider text-[var(--np-muted)]">বিভাগসমূহ</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="rounded-sm border border-[var(--np-border)] bg-[var(--np-newsprint)] px-3 py-1.5 text-xs text-[var(--np-text-soft)] hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] transition-all"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Location Filter */}
      <LocationFilter divisions={divisions} />

      {/* Ad Sidebar */}
      <AdSlot placement={AD_PLACEMENTS.SIDEBAR_PRIMARY} showPlaceholder={false} />
    </aside>
  );
}
