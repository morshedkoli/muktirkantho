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
import { ArrowRight, TrendingUp, Clock } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const { breaking, featured, latest, categories, divisions, trendingTags, categoryWithPosts } =
    await getHomeData();

  const mainStory = featured[0];
  const heroSidebar = featured.slice(1, 4);
  const featuredGrid = featured.slice(4, 6);
  const latestStories = latest.slice(0, 8);
  const sidebarBreaking = breaking.slice(0, 8);

  return (
    <main className="bg-[var(--np-newsprint)] py-2">
      {/* Breaking ticker */}
      <BreakingTicker items={breaking.slice(0, 5)} />

      {/* Leaderboard ad */}
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <AdSlot placement={AD_PLACEMENTS.HOMEPAGE_BANNER} className="w-full" showPlaceholder={false} />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-[200px_minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_280px]">

          {/* ═══════════════════════════════════
              LEFT RAIL — Breaking news ticker
          ═══════════════════════════════════ */}
          <aside className="hidden xl:block">
            <div className="sticky top-4">
              <div className="border border-[var(--np-border)] bg-[var(--np-card)]">
                <div className="border-b-[3px] border-[var(--np-primary)] px-3 py-2">
                  <h3 className="font-label text-[10px] uppercase tracking-[2px] text-[var(--np-text-primary)]">
                    এই মুহূর্তে
                  </h3>
                </div>
                {sidebarBreaking.length > 0 ? (
                  <ul className="divide-y divide-[var(--np-border)]">
                    {sidebarBreaking.map((post) => (
                      <li key={post.id}>
                        <Link
                          href={getPostPath(post)}
                          className="flex flex-col gap-1 px-3 py-2.5 hover:bg-[var(--np-newsprint)] transition-colors"
                        >
                          <span className="font-label text-[10px] text-[var(--np-primary)]">
                            {post.publishedAt ? format(post.publishedAt, "hh:mm a") : ""}
                          </span>
                          <span className="line-clamp-2 text-[12.5px] leading-snug text-[var(--np-text-primary)]">
                            {post.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-6 text-center text-xs text-[var(--np-text-secondary)]">
                    কোনো সংবাদ নেই
                  </p>
                )}
                <Link
                  href="/news"
                  className="flex items-center justify-center gap-1.5 border-t border-[var(--np-border)] bg-[var(--np-newsprint)] py-2.5 font-label text-[10px] uppercase tracking-[1.5px] text-[var(--np-primary)] hover:bg-[var(--np-primary)] hover:text-white transition-colors"
                >
                  আরও দেখুন <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </aside>

          {/* ═══════════════════════════════════
              CENTER — Main feed
          ═══════════════════════════════════ */}
          <div className="min-w-0">

            {/* HERO ZONE: 1 large overlay + 3 stacked */}
            {(mainStory || heroSidebar.length > 0) && (
              <section className="mb-8">
                <div className="np-section-header">
                  <h2>শীর্ষ খবর</h2>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
                  {mainStory ? (
                    <HeroNewsCard post={mainStory} />
                  ) : (
                    <div className="aspect-[16/9] border border-[var(--np-border)] bg-[var(--np-card)] flex items-center justify-center">
                      <p className="text-sm text-[var(--np-text-secondary)]">কোনো সংবাদ নেই</p>
                    </div>
                  )}

                  {heroSidebar.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {heroSidebar.map((post, i) => (
                        <SecondaryStoryCard key={post.id} post={post} rank={i + 1} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* FEATURED 2-COL */}
            {featuredGrid.length > 0 && (
              <section className="mb-8">
                <div className="np-section-header">
                  <h2>বিশেষ সংবাদ</h2>
                  <Link href="/news" className="np-section-more">
                    সবগুলো <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {featuredGrid.map((post) => (
                    <NewsCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* IN-FEED AD */}
            <div className="mb-8">
              <AdSlot placement={AD_PLACEMENTS.INFEED_NATIVE} className="w-full" showPlaceholder={false} />
            </div>

            {/* LATEST — 2-col grid with thumbnail rows */}
            {latestStories.length > 0 && (
              <section className="mb-8">
                <div className="np-section-header">
                  <h2>সর্বশেষ সংবাদ</h2>
                  <Link href="/news" className="np-section-more">
                    সবগুলো <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                  {latestStories.map((post) => (
                    <Link
                      key={post.id}
                      href={getPostPath(post)}
                      className="group flex gap-3 border-b border-[var(--np-border)] pb-4 last:border-0"
                    >
                      {post.imageUrl && (
                        <div className="relative h-[68px] w-[100px] shrink-0 overflow-hidden bg-[var(--np-newsprint)]">
                          <Image
                            src={post.imageUrl}
                            alt=""
                            fill
                            sizes="100px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        {post.category && (
                          <span className="np-category text-[10px]">{post.category.name}</span>
                        )}
                        <h3 className="np-headline-sm mt-0.5 line-clamp-2 text-[14px] leading-snug group-hover:text-[var(--np-primary)] transition-colors">
                          {post.title}
                        </h3>
                        {post.publishedAt && (
                          <p className="np-timestamp mt-1 flex items-center gap-1 text-[10px]">
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

            {/* CATEGORY SECTIONS — asymmetric: 1 large + compact list */}
            {categoryWithPosts.map(({ id, name, slug, posts }) => (
              <section key={id} className="mb-8">
                <div className="np-section-header">
                  <h2>{name}</h2>
                  <Link href={`/category/${slug}`} className="np-section-more">
                    আরও <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {posts.length === 0 ? (
                  <div className="border border-[var(--np-border)] bg-[var(--np-card)] p-6 text-center">
                    <p className="text-sm text-[var(--np-text-secondary)]">এই বিভাগে এখনো কোনো সংবাদ নেই।</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-[3fr_2fr]">
                    {posts[0] && <NewsCard post={posts[0]} />}
                    {posts.slice(1).length > 0 && (
                      <ul className="flex flex-col">
                        {posts.slice(1).map((post) => (
                          <li key={post.id} className="border-b border-[var(--np-border)] last:border-0">
                            <Link
                              href={getPostPath(post)}
                              className="group flex gap-3 py-3 first:pt-0"
                            >
                              {post.imageUrl && (
                                <div className="relative h-[60px] w-[80px] shrink-0 overflow-hidden bg-[var(--np-newsprint)]">
                                  <Image
                                    src={post.imageUrl}
                                    alt=""
                                    fill
                                    sizes="80px"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h3 className="np-headline-sm text-[13px] leading-snug line-clamp-3 group-hover:text-[var(--np-primary)] transition-colors">
                                  {post.title}
                                </h3>
                                {post.publishedAt && (
                                  <p className="np-timestamp mt-1 text-[10px]">
                                    {format(post.publishedAt, "MMM d, yyyy")}
                                  </p>
                                )}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </section>
            ))}

            {/* OPINION */}
            {featured.length > 3 && (
              <section className="mb-8">
                <div className="np-section-header">
                  <h2>মতামত</h2>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {featured.slice(0, 4).map((post) => (
                    <Link
                      key={post.id}
                      href={getPostPath(post)}
                      className="group flex gap-3 border-l-2 border-[var(--np-primary)] bg-[var(--np-card)] p-3 hover:bg-[var(--np-newsprint)] transition-colors"
                    >
                      {post.imageUrl && (
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-[var(--np-newsprint-2)]">
                          <Image src={post.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="np-headline-sm text-[13.5px] leading-snug line-clamp-2 group-hover:text-[var(--np-primary)] transition-colors">
                          {post.title}
                        </h3>
                        {post.author && (
                          <p className="mt-1 font-label text-[10px] uppercase tracking-wider text-[var(--np-text-secondary)]">
                            {post.author}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* ═══════════════════════════════════
              RIGHT SIDEBAR
          ═══════════════════════════════════ */}
          <aside className="flex flex-col gap-6">

            {/* Sidebar ad */}
            <AdSlot placement={AD_PLACEMENTS.SIDEBAR_PRIMARY} showPlaceholder={false} />

            {/* Trending */}
            {trendingTags.length > 0 && (
              <div className="border border-[var(--np-border)] bg-[var(--np-card)]">
                <div className="border-b-[3px] border-[var(--np-primary)] px-4 py-2.5 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-[var(--np-primary)]" />
                  <h3 className="font-label text-[10px] uppercase tracking-[2px] text-[var(--np-text-primary)]">
                    ট্রেন্ডিং
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5 p-4">
                  {trendingTags.slice(0, 10).map((tag) => (
                    <Link
                      key={tag}
                      href={`/tag/${tag}`}
                      className="border border-[var(--np-border)] px-2.5 py-1 text-[11px] text-[var(--np-text-soft)] hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] transition-all"
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
                <div className="border-b-[3px] border-[var(--np-primary)] px-4 py-2.5">
                  <h3 className="font-label text-[10px] uppercase tracking-[2px] text-[var(--np-text-primary)]">
                    বিভাগসমূহ
                  </h3>
                </div>
                <ul className="divide-y divide-[var(--np-border)]">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/category/${category.slug}`}
                        className="group flex items-center justify-between px-4 py-2.5 text-[13px] text-[var(--np-text-primary)] hover:bg-[var(--np-newsprint)] hover:text-[var(--np-primary)] transition-colors"
                      >
                        <span>{category.name}</span>
                        <ArrowRight className="h-3 w-3 text-[var(--np-border)] group-hover:text-[var(--np-primary)] transition-colors" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sticky ad */}
            <div className="sticky top-4">
              <AdSlot placement={AD_PLACEMENTS.SIDEBAR_STICKY} showPlaceholder={false} />
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}
