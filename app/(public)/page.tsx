import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { BreakingTicker } from "@/components/public/breaking-ticker";
import { AdSlot } from "@/components/public/ad-slot";
import { HeroNewsCard, SecondaryStoryCard } from "@/components/public/hero-news-card";
import { LocationFilter } from "@/components/public/location-filter";
import { NewsCard } from "@/components/public/news-card";
import { AD_PLACEMENTS } from "@/lib/ads";
import { getHomeData } from "@/lib/news";
import { getPostPath } from "@/lib/post-url";
import { ArrowRight, TrendingUp, Clock, Flame } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const { breaking, featured, latest, categories, divisions, trendingTags, categoryWithPosts } =
    await getHomeData();

  const mainStory = featured[0];
  const heroSidebar = featured.slice(1, 4);       // 3 stories beside the hero
  const featuredGrid = featured.slice(4, 6);      // 2 more in the secondary grid
  const latestStories = latest.slice(0, 8);       // latest feed
  const sidebarBreaking = breaking.slice(0, 10);  // left rail

  return (
    <main className="bg-[var(--np-newsprint)]">
      {/* ── Breaking ticker ── */}
      <BreakingTicker items={breaking.slice(0, 5)} />

      {/* ── Leaderboard Ad ── */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2">
        <AdSlot placement={AD_PLACEMENTS.HOMEPAGE_BANNER} className="w-full" showPlaceholder={false} />
      </div>

      {/* ══════════════════════════════════════
          THREE-COLUMN MASTER LAYOUT
          Left rail | Center | Right sidebar
      ══════════════════════════════════════ */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 pb-10">
        <div className="flex gap-5 xl:gap-6">

          {/* ─────────────────────────────────
              LEFT: Breaking news rail (xl only)
          ───────────────────────────────── */}
          <aside className="hidden xl:flex w-[200px] shrink-0 flex-col gap-0">
            <div className="sticky top-14">
              <div className="border border-[var(--np-border)] bg-[var(--np-card)]">
                <div className="bg-[var(--np-primary)] px-3 py-2 flex items-center gap-2">
                  <Flame className="h-3 w-3 text-white" />
                  <h3 className="font-label text-[10px] tracking-[2px] text-white uppercase">সর্বশেষ</h3>
                </div>
                <div className="divide-y divide-[var(--np-border)] max-h-[80vh] overflow-y-auto">
                  {sidebarBreaking.length > 0 ? (
                    sidebarBreaking.map((post) => (
                      <Link key={post.id} href={getPostPath(post)} className="np-latest-item">
                        <span className="np-latest-time shrink-0">
                          {post.publishedAt ? format(post.publishedAt, "hh:mm") : ""}
                        </span>
                        <span className="line-clamp-2 text-[12px] leading-snug">{post.title}</span>
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-4 text-xs text-[var(--np-muted)]">কোনো সংবাদ নেই</p>
                  )}
                </div>
                <Link
                  href="/news"
                  className="flex items-center justify-center gap-1 border-t border-[var(--np-border)] py-2 text-[10px] font-label text-[var(--np-primary)] hover:bg-[var(--np-newsprint)] transition-colors uppercase tracking-wider"
                >
                  আরও <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </aside>

          {/* ─────────────────────────────────
              CENTER: Main content column
          ───────────────────────────────── */}
          <div className="min-w-0 flex-1">

            {/* ══ HERO ZONE ══
                Full-width hero image left, 3-story stack right */}
            {(mainStory || heroSidebar.length > 0) && (
              <section className="mb-5">
                <div className="np-section-header">
                  <span className="np-section-label">শীর্ষ খবর</span>
                  <h2 className="np-headline text-base">শীর্ষ খবর</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4">
                  {/* Hero card — overlay-style */}
                  <div>
                    {mainStory ? (
                      <HeroNewsCard post={mainStory} />
                    ) : (
                      <div className="aspect-[16/9] bg-[var(--np-newsprint-2)] border border-[var(--np-border)] flex items-center justify-center">
                        <p className="text-sm text-[var(--np-muted)]">কোনো সংবাদ নেই</p>
                      </div>
                    )}
                  </div>

                  {/* Secondary story stack */}
                  {heroSidebar.length > 0 && (
                    <div className="hidden lg:flex flex-col justify-between gap-0 border border-[var(--np-border)] bg-[var(--np-card)] p-3">
                      <div className="border-b border-[var(--np-border)] pb-1 mb-3">
                        <span className="font-label text-[9px] uppercase tracking-[2px] text-[var(--np-muted)]">আরও খবর</span>
                      </div>
                      <div className="flex flex-col gap-3 flex-1">
                        {heroSidebar.map((post, i) => (
                          <SecondaryStoryCard key={post.id} post={post} rank={i + 1} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ══ FEATURED GRID ══
                2-column: 1 large + 1 small beside */}
            {featuredGrid.length > 0 && (
              <section className="mb-5">
                <div className="np-section-header">
                  <span className="np-section-label">বিশেষ</span>
                  <h2 className="np-headline text-base">বিশেষ সংবাদ</h2>
                  <Link href="/news" className="np-section-more hover:text-[var(--np-primary)] transition-colors">
                    সবগুলো <ArrowRight className="h-3 w-3 inline" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featuredGrid.map((post) => (
                    <NewsCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* ══ IN-FEED AD ══ */}
            <div className="mb-5">
              <AdSlot placement={AD_PLACEMENTS.INFEED_NATIVE} className="w-full" showPlaceholder={false} />
            </div>

            {/* ══ LATEST NEWS ══
                2-column horizontal grid */}
            {latestStories.length > 0 && (
              <section className="mb-5 border-t-[3px] border-[var(--np-primary)]">
                <div className="np-section-header">
                  <span className="np-section-label">সর্বশেষ</span>
                  <h2 className="np-headline text-base">সর্বশেষ সংবাদ</h2>
                  <Link href="/news" className="np-section-more hover:text-[var(--np-primary)] transition-colors">
                    সবগুলো <ArrowRight className="h-3 w-3 inline" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0 border border-[var(--np-border)] bg-[var(--np-card)] divide-y divide-[var(--np-border)] sm:divide-y-0">
                  {latestStories.map((post, i) => (
                    <Link
                      key={post.id}
                      href={getPostPath(post)}
                      className={`group flex gap-3 p-3 hover:bg-[var(--np-newsprint)] transition-colors ${i % 2 === 0 ? "sm:border-r sm:border-[var(--np-border)]" : ""} ${i < latestStories.length - 2 ? "sm:border-b sm:border-[var(--np-border)]" : ""}`}
                    >
                      {post.imageUrl && (
                        <div className="relative h-[60px] w-[80px] shrink-0 overflow-hidden bg-[var(--np-newsprint)]">
                          <Image
                            src={post.imageUrl}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 py-0.5">
                        {post.category && (
                          <span className="np-category text-[10px]">{post.category.name}</span>
                        )}
                        <h3 className="np-headline-sm text-[13px] leading-snug line-clamp-2 mt-0.5 group-hover:text-[var(--np-primary)] transition-colors">
                          {post.title}
                        </h3>
                        {post.publishedAt && (
                          <p className="np-timestamp text-[10px] mt-1 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {format(post.publishedAt, "MMM d · h:mm a")}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ══ CATEGORY SECTIONS ══
                Magazine layout: 1 large card (60%) + list of 2 compact (40%) */}
            {categoryWithPosts.map(({ id, name, slug, posts }) => (
              <section key={id} className="mb-5">
                <div className="np-section-header">
                  <span className="np-section-label">বিভাগ</span>
                  <h2 className="np-headline text-base">{name}</h2>
                  <Link
                    href={`/category/${slug}`}
                    className="np-section-more hover:text-[var(--np-primary)] transition-colors"
                  >
                    আরও <ArrowRight className="h-3 w-3 inline" />
                  </Link>
                </div>

                {posts.length === 0 ? (
                  <div className="border border-[var(--np-border)] bg-[var(--np-card)] p-5 text-center">
                    <p className="text-sm text-[var(--np-muted)]">এই বিভাগে এখনো কোনো সংবাদ নেই।</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-[3fr_2fr] gap-4">
                    {/* Large featured card */}
                    {posts[0] && <NewsCard post={posts[0]} />}

                    {/* Compact story stack */}
                    {posts.slice(1).length > 0 && (
                      <div className="flex flex-col gap-0 border border-[var(--np-border)] bg-[var(--np-card)] divide-y divide-[var(--np-border)]">
                        {posts.slice(1).map((post) => (
                          <Link
                            key={post.id}
                            href={getPostPath(post)}
                            className="group flex gap-3 p-3 hover:bg-[var(--np-newsprint)] transition-colors"
                          >
                            {post.imageUrl && (
                              <div className="relative h-[54px] w-[72px] shrink-0 overflow-hidden bg-[var(--np-newsprint)]">
                                <Image
                                  src={post.imageUrl}
                                  alt=""
                                  fill
                                  sizes="72px"
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h3 className="np-headline-sm text-[12px] leading-snug line-clamp-3 group-hover:text-[var(--np-primary)] transition-colors">
                                {post.title}
                              </h3>
                              {post.publishedAt && (
                                <p className="np-timestamp text-[10px] mt-1">
                                  {format(post.publishedAt, "MMM d, yyyy")}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            ))}

            {/* ══ OPINION / মতামত ══ */}
            {featured.length > 3 && (
              <section className="mb-5 border border-[var(--np-border)] bg-[var(--np-card)]">
                <div className="bg-[var(--np-primary)] px-4 py-2">
                  <h2 className="font-label text-[10px] tracking-[2px] text-white uppercase">মতামত</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-[var(--np-border)] sm:divide-y-0 sm:divide-x">
                  {featured.slice(0, 4).map((post) => (
                    <Link
                      key={post.id}
                      href={getPostPath(post)}
                      className="group flex gap-3 items-start p-4 hover:bg-[var(--np-newsprint)] transition-colors"
                    >
                      {post.imageUrl && (
                        <div className="relative w-14 h-14 shrink-0 overflow-hidden bg-[var(--np-newsprint-2)]">
                          <Image src={post.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="line-clamp-2 text-[13px] font-semibold leading-snug text-[var(--np-text-primary)] group-hover:text-[var(--np-primary)] transition-colors">
                          {post.title}
                        </div>
                        {post.author && (
                          <div className="mt-1 text-[11px] font-label text-[var(--np-muted)] uppercase tracking-wider">
                            {post.author}
                          </div>
                        )}
                        {post.publishedAt && (
                          <div className="mt-0.5 text-[10px] np-timestamp">
                            {format(post.publishedAt, "MMM d, yyyy")}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* ─────────────────────────────────
              RIGHT: Sidebar
          ───────────────────────────────── */}
          <aside className="hidden lg:flex w-[280px] shrink-0 flex-col gap-4">

            {/* Sidebar Ad */}
            <div className="border border-[var(--np-border)] bg-[var(--np-card)] p-3">
              <AdSlot placement={AD_PLACEMENTS.SIDEBAR_PRIMARY} showPlaceholder={false} />
            </div>

            {/* Trending topics */}
            {trendingTags.length > 0 && (
              <div className="border border-[var(--np-border)] bg-[var(--np-card)]">
                <div className="bg-[var(--np-newsprint-2)] border-b border-[var(--np-border)] px-4 py-2 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-[var(--np-primary)]" />
                  <h3 className="font-label text-[10px] uppercase tracking-[2px] text-[var(--np-muted)]">ট্রেন্ডিং</h3>
                </div>
                <div className="p-4 flex flex-wrap gap-2">
                  {trendingTags.slice(0, 10).map((tag) => (
                    <Link
                      key={tag}
                      href={`/tag/${tag}`}
                      className="border border-[var(--np-border)] bg-[var(--np-newsprint)] px-2.5 py-1 text-[11px] text-[var(--np-text-soft)] hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] transition-all"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Location filter */}
            <LocationFilter divisions={divisions} />

            {/* Categories list */}
            {categories.length > 0 && (
              <div className="border border-[var(--np-border)] bg-[var(--np-card)]">
                <div className="bg-[var(--np-newsprint-2)] border-b border-[var(--np-border)] px-4 py-2">
                  <h3 className="font-label text-[10px] uppercase tracking-[2px] text-[var(--np-muted)]">বিভাগসমূহ</h3>
                </div>
                <div className="divide-y divide-[var(--np-border)]">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="flex items-center justify-between px-4 py-2.5 text-[13px] text-[var(--np-text-soft)] hover:text-[var(--np-primary)] hover:bg-[var(--np-newsprint)] transition-colors group"
                    >
                      <span>{category.name}</span>
                      <ArrowRight className="h-3 w-3 text-[var(--np-border)] group-hover:text-[var(--np-primary)] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Sticky sidebar ad */}
            <div className="sticky top-14">
              <AdSlot placement={AD_PLACEMENTS.SIDEBAR_STICKY} showPlaceholder={false} />
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}
