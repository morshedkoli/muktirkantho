import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { BreakingTicker } from "@/components/public/breaking-ticker";
import { AdSlot } from "@/components/public/ad-slot";
import { HeroNewsCard } from "@/components/public/hero-news-card";
import { LocationFilter } from "@/components/public/location-filter";
import { NewsCard } from "@/components/public/news-card";
import { AD_PLACEMENTS } from "@/lib/ads";
import { getHomeData } from "@/lib/news";
import { getPostPath } from "@/lib/post-url";
import { ArrowRight, TrendingUp, Clock, MapPin } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const { breaking, featured, latest, categories, divisions, trendingTags } = await getHomeData();

  const mainStory = featured[0];
  const featuredStories = featured.slice(1, 4);
  const moreFeatured = featured.slice(4, 6);
  const latestStories = latest.slice(0, 12);

  return (
    <main>
      {/* Breaking News Ticker */}
      <BreakingTicker items={breaking.slice(0, 5)} />

      {/* ─── LEADERBOARD AD (Zone 1) ─── */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-4">
        <AdSlot placement={AD_PLACEMENTS.HOMEPAGE_BANNER} className="w-full" showPlaceholder={false} />
      </div>

      {/* ─── MAIN THREE-COLUMN LAYOUT ─── */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 pb-8">
        <div className="flex gap-0 sm:gap-6">
          {/* ── LEFT: Latest News Rail ── */}
          <aside className="hidden xl:block w-[220px] shrink-0">
            <div className="sticky top-14 border border-[var(--np-border)] bg-white">
              <div className="bg-[var(--np-primary)] px-3 py-2">
                <h3 className="font-label text-xs tracking-wider text-white uppercase">সর্বশেষ</h3>
              </div>
              <div className="divide-y divide-[var(--np-border)] max-h-[600px] overflow-y-auto">
                {latestStories.slice(0, 10).map((post) => (
                  <Link key={post.id} href={getPostPath(post)} className="np-latest-item">
                    <span className="np-latest-time">
                      {post.publishedAt ? format(post.publishedAt, "hh:mm a") : ""}
                    </span>
                    <span className="line-clamp-2 text-xs leading-snug">{post.title}</span>
                  </Link>
                ))}
              </div>
              <Link href="/news" className="flex items-center justify-center gap-1 border-t border-[var(--np-border)] py-2 text-xs font-label text-[var(--np-primary)] hover:bg-[var(--np-newsprint)] transition-colors uppercase tracking-wider">
                আরও দেখুন <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>

          {/* ── CENTER: Hero + Grid ── */}
          <div className="flex-1 min-w-0">
            {/* Hero Story */}
            {mainStory && (
              <section className="mb-8">
                <div className="np-section-header">
                  <span className="np-section-label">শীর্ষ খবর</span>
                  <h2 className="np-headline text-xl">শীর্ষ খবর</h2>
                </div>
                <HeroNewsCard post={mainStory} />
              </section>
            )}

            {/* 3-Column Secondary Grid */}
            {featuredStories.length > 0 && (
              <section className="mb-8">
                <div className="np-section-header">
                  <span className="np-section-label">বিশেষ সংবাদ</span>
                  <h2 className="np-headline text-lg">বিশেষ সংবাদ</h2>
                  <Link href="/category/featured" className="np-section-more hover:text-[var(--np-primary)] transition-colors">
                    সবগুলো <ArrowRight className="h-3 w-3 inline" />
                  </Link>
                </div>
                <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredStories.map((post) => (
                    <NewsCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* ── IN-FEED AD (Zone 3) ── */}
            <div className="mb-8 border border-[var(--np-border)] bg-white p-4">
              <AdSlot placement={AD_PLACEMENTS.INFEED_NATIVE} className="w-full" showPlaceholder={false} />
            </div>

            {/* Latest Stories as horizontal list */}
            {latestStories.length > 0 && (
              <section className="mb-8">
                <div className="np-section-header">
                  <span className="np-section-label">সর্বশেষ</span>
                  <h2 className="np-headline text-lg">সর্বশেষ</h2>
                  <Link href="/news" className="np-section-more hover:text-[var(--np-primary)] transition-colors">
                    সবগুলো <ArrowRight className="h-3 w-3 inline" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {latestStories.slice(0, 5).map((post) => (
                    <NewsCard key={post.id} post={post} variant="horizontal" />
                  ))}
                </div>
              </section>
            )}

            {/* Category Sections — show first 3 categories with posts */}
            {categories.slice(0, 3).map((category) => (
              <section key={category.id} className="mb-8">
                <div className="np-section-header">
                  <span className="np-section-label">বিভাগ</span>
                  <h2 className="np-headline text-lg">{category.name}</h2>
                  <Link href={`/category/${category.slug}`} className="np-section-more hover:text-[var(--np-primary)] transition-colors">
                    আরও দেখুন <ArrowRight className="h-3 w-3 inline" />
                  </Link>
                </div>
                <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {featured.slice(0, 3).map((post) => (
                    <NewsCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            ))}

            {/* Opinion / Columnist Row */}
            {featured.length > 3 && (
              <section className="mb-8 border border-[var(--np-border)] bg-white p-5">
                <div className="np-section-header border-t-0 pt-0 mb-4">
                  <span className="np-section-label">মতামত</span>
                  <h2 className="np-headline text-lg">মতামত</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {featured.slice(0, 4).map((post) => (
                    <Link key={post.id} href={getPostPath(post)} className="np-columnist group">
                      <div className="np-columnist-avatar group-hover:opacity-80 transition-opacity">
                        {post.imageUrl && (
                          <Image src={post.imageUrl} alt="" width={48} height={48} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="np-columnist-name group-hover:text-[var(--np-primary)] transition-colors line-clamp-2">
                        {post.title}
                      </div>
                      {post.author && <div className="np-columnist-title mt-1">{post.author}</div>}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* More featured (compact list) */}
            {moreFeatured.length > 0 && (
              <section>
                <div className="np-section-header">
                  <span className="np-section-label">আরও খবর</span>
                  <h2 className="np-headline text-lg">আরও খবর</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {moreFeatured.map((post) => (
                    <NewsCard key={post.id} post={post} variant="horizontal" />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="hidden lg:block w-[300px] shrink-0 space-y-4">
            {/* Ad Zone 2 — 300×250 */}
            <div className="border border-[var(--np-border)] bg-white p-4">
              <AdSlot placement={AD_PLACEMENTS.SIDEBAR_PRIMARY} showPlaceholder={false} />
            </div>

            {/* Trending Topics */}
            {trendingTags.length > 0 && (
              <div className="border border-[var(--np-border)] bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[var(--np-primary)]" />
                  <h3 className="font-label text-xs uppercase tracking-wider text-[var(--np-muted)]">ট্রেন্ডিং</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.slice(0, 8).map((tag) => (
                    <Link
                      key={tag}
                      href={`/tag/${tag}`}
                      className="rounded-sm border border-[var(--np-border)] bg-[var(--np-newsprint)] px-3 py-1.5 text-xs text-[var(--np-text-soft)] hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] transition-all"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Location Filter */}
            <LocationFilter divisions={divisions} />

            {/* Categories */}
            <div className="border border-[var(--np-border)] bg-white p-5">
              <h3 className="font-label text-xs uppercase tracking-wider text-[var(--np-muted)] mb-3">বিভাগসমূহ</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="rounded-sm border border-[var(--np-border)] px-3 py-1.5 text-xs text-[var(--np-text-soft)] hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] transition-all"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Ad Zone 5 — Sticky Sidebar */}
            <div className="sticky top-14">
              <AdSlot placement={AD_PLACEMENTS.SIDEBAR_STICKY} showPlaceholder={false} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
