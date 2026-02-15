import Link from "next/link";
import { Grid3X3 } from "lucide-react";
import { LocationFilter } from "@/components/public/location-filter";
import { AdSlot } from "@/components/public/ad-slot";
import { AD_PLACEMENTS } from "@/lib/ads";
import { getSidebarData } from "@/lib/news";

export async function CommonSidebar() {
  const { categories, divisions } = await getSidebarData();

  return (
    <aside className="space-y-8">
      <LocationFilter divisions={divisions} />

      <section>
        <div className="rounded-xl border border-[var(--np-border)] bg-[var(--np-card)] p-6 shadow-[var(--np-shadow)]">
          <div className="mb-4 flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-[var(--np-primary)]" />
            <h3 className="font-display text-lg font-bold text-[var(--np-text-primary)]">Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="rounded-full border border-[var(--np-border)] bg-[var(--np-background)] px-4 py-2 text-sm font-medium text-[var(--np-text-secondary)] hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] transition-all"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <AdSlot placement={AD_PLACEMENTS.SIDEBAR_PRIMARY} />
    </aside>
  );
}
