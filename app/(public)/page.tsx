import Link from "next/link";
import { BreakingTicker } from "@/components/public/breaking-ticker";
import { AdSlot } from "@/components/public/ad-slot";
import { HeroNewsCard } from "@/components/public/hero-news-card";
import { LocationFilter } from "@/components/public/location-filter";
import { NewsCard } from "@/components/public/news-card";
import { AD_PLACEMENTS } from "@/lib/ads";
import { getHomeData } from "@/lib/news";
import { ArrowRight, Grid3X3 } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const { breaking, featured, latest, categories, divisions } = await getHomeData();

  const mainStory = featured[0];
  const featuredStories = featured.slice(1, 4);
  const moreFeatured = featured.slice(4, 6);
  const latestStories = latest.slice(0, 6);

  return (
    <main>
      {/* Breaking News Ticker */}
      <BreakingTicker items={breaking.slice(0, 3)} />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Hero Section */}
        {mainStory && (
          <section className="mb-12">
            <div className="border-b-2 border-[var(--primary)] pb-2 mb-6">
              <h2 className="inline-flex items-center gap-2 font-display text-xl font-bold text-[var(--primary)]">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[var(--primary)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--primary)]"></span>
                </span>
                Top Story
              </h2>
            </div>
            <HeroNewsCard post={mainStory} />
          </section>
        )}

        <AdSlot placement={AD_PLACEMENTS.HOMEPAGE_BANNER} className="mb-10" showPlaceholder={false} />

        {/* Main Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
          {/* Left Column - Main Content */}
          <div className="space-y-12">
            {/* Featured Stories Section */}
            {featuredStories.length > 0 && (
              <section>
                <div className="mb-6 flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <h2 className="font-display text-2xl font-bold text-[var(--foreground)]">Featured Stories</h2>
                  <Link 
                    href="/category/featured" 
                    className="flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                  >
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredStories.map((post) => (
                    <NewsCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* Latest Updates Section */}
            {latestStories.length > 0 && (
              <section>
                <div className="mb-6 flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <h2 className="font-display text-2xl font-bold text-[var(--foreground)]">Latest Updates</h2>
                  <Link 
                    href="/news" 
                    className="flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                  >
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid gap-6">
                  {latestStories.slice(0, 3).map((post) => (
                    <NewsCard key={post.id} post={post} variant="horizontal" />
                  ))}
                </div>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {latestStories.slice(3, 6).map((post) => (
                    <NewsCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Right Sidebar */}
          <aside className="space-y-8">
            {/* More Featured - Compact List */}
            {moreFeatured.length > 0 && (
              <div className="rounded-xl bg-[var(--surface)] p-5 shadow-sm border border-[var(--border)]">
                <h3 className="mb-4 font-display text-lg font-bold border-b border-[var(--border)] pb-3">Also in News</h3>
                <div className="space-y-4">
                  {moreFeatured.map((post) => (
                    <NewsCard key={post.id} post={post} variant="compact" />
                  ))}
                </div>
              </div>
            )}

            <LocationFilter divisions={divisions} />

            {/* Categories */}
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

            <AdSlot />

          </aside>
        </div>
      </div>
    </main>
  );
}
