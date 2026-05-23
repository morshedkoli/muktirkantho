import Link from "next/link";
import Image from "next/image";
import { formatBanglaTime, formatBanglaShortDate } from "@/lib/bangla-date";
import { AdSlot } from "@/components/public/ad-slot";
import { HeroNewsCard, SecondaryStoryCard } from "@/components/public/hero-news-card";
import { LocationFilter } from "@/components/public/location-filter";
import { NewsCard } from "@/components/public/news-card";
import { AD_PLACEMENTS } from "@/lib/ads";
import { getHomeData } from "@/lib/news";
import { getPostPath } from "@/lib/post-url";
import { ArrowRight, TrendingUp, Clock } from "lucide-react";

export const revalidate = 60;

// ─────────────────────────────────────────────────────────────
// Shared section-header used throughout the page
// ─────────────────────────────────────────────────────────────
function SectionHeader({
  title,
  href,
  linkLabel = "আরও দেখুন",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between border-l-4 border-red-600 pl-3">
      <h2 className="text-base font-bold leading-tight text-[var(--np-text-primary)] sm:text-lg">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-red-600 hover:underline"
        >
          {linkLabel} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const { breaking, featured, latest, categories, divisions, trendingTags, categoryWithPosts } =
    await getHomeData();

  const featuredOrLatest = featured.length > 0 ? featured : latest;
  const mainStory = featuredOrLatest[0];
  const secondStory = featuredOrLatest[1];
  const heroSidebar = featuredOrLatest.slice(2, 5);
  const latestStories = latest.slice(0, 9);
  const sidebarBreaking = breaking.slice(0, 8);

  return (
    <main className="bg-[var(--np-newsprint)] py-2">

      {/* ══════════════════════════════════════
          HOMEPAGE BANNER AD  (728×90, full width)
      ══════════════════════════════════════ */}
      <div className="mx-auto max-w-7xl px-4 pt-4 pb-2">
        <AdSlot placement={AD_PLACEMENTS.HOMEPAGE_BANNER} className="w-full" showPlaceholder={false} />
      </div>

      {/* ══════════════════════════════════════
          HERO SECTION + RIGHT SIDEBAR
      ══════════════════════════════════════ */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_300px]">

          {/* Hero content: 2 featured posts side by side */}
          <div>
            {(mainStory || secondStory) ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {mainStory && (
                  <HeroNewsCard post={mainStory} size="large" />
                )}
                {secondStory && (
                  <HeroNewsCard post={secondStory} size="medium" />
                )}
              </div>
            ) : null}
          </div>

          {/* RIGHT SIDEBAR — trending + ad */}
          <aside className="hidden md:flex flex-col gap-5">

            {/* Trending posts list */}
            {sidebarBreaking.length > 0 && (
              <div className="border border-[var(--np-border)] bg-[var(--np-card)]">
                <div className="border-b-[3px] border-red-600 px-4 py-2.5 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-red-600" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--np-text-primary)]">
                    আলোচিত সংবাদ
                  </h3>
                </div>
                <ul className="divide-y divide-[var(--np-border)]">
                  {sidebarBreaking.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={getPostPath(post)}
                        className="flex gap-3 px-3 py-2.5 hover:bg-[var(--np-newsprint)] transition-colors group"
                      >
                        {post.imageUrl && (
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden bg-[var(--np-newsprint-2)]">
                            <Image
                              src={post.imageUrl}
                              alt=""
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          {post.publishedAt && (
                            <span className="block text-[10px] text-red-600 mb-0.5">
                              {formatBanglaTime(post.publishedAt)}
                            </span>
                          )}
                          <span className="line-clamp-2 text-[12.5px] leading-snug text-[var(--np-text-primary)] group-hover:text-red-600 transition-colors">
                            {post.title}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/news"
                  className="flex items-center justify-center gap-1.5 border-t border-[var(--np-border)] py-2.5 text-[10px] font-bold uppercase tracking-[1.5px] text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                >
                  আরও দেখুন <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Sidebar primary ad */}
            <AdSlot placement={AD_PLACEMENTS.SIDEBAR_PRIMARY} showPlaceholder={false} />

            {/* Trending tags */}
            {trendingTags.length > 0 && (
              <div className="border border-[var(--np-border)] bg-[var(--np-card)]">
                <div className="border-b-[3px] border-red-600 px-4 py-2.5 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-red-600" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--np-text-primary)]">
                    ট্রেন্ডিং
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5 p-4">
                  {trendingTags.slice(0, 10).map((tag) => (
                    <Link
                      key={tag}
                      href={`/tag/${tag}`}
                      className="border border-[var(--np-border)] px-2.5 py-1 text-[11px] text-[var(--np-text-soft)] hover:border-red-600 hover:text-red-600 transition-all"
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
                <div className="border-b-[3px] border-red-600 px-4 py-2.5">
                  <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--np-text-primary)]">
                    বিভাগসমূহ
                  </h3>
                </div>
                <ul className="divide-y divide-[var(--np-border)]">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/category/${category.slug}`}
                        className="group flex items-center justify-between px-4 py-2.5 text-[13px] text-[var(--np-text-primary)] hover:bg-[var(--np-newsprint)] hover:text-red-600 transition-colors"
                      >
                        <span>{category.name}</span>
                        <ArrowRight className="h-3 w-3 text-[var(--np-border)] group-hover:text-red-600 transition-colors" />
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

      {/* ══════════════════════════════════════
          LATEST NEWS — 3-column card grid (6–9 posts)
      ══════════════════════════════════════ */}
      {latestStories.length > 0 && (
        <section className="mx-auto max-w-7xl px-3 sm:px-4 py-5">
          <SectionHeader title="সর্বশেষ সংবাদ" href="/news" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestStories.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          BILLBOARD AD  (970×250, full width)
      ══════════════════════════════════════ */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4">
        <AdSlot placement={AD_PLACEMENTS.BILLBOARD} className="w-full" showPlaceholder={false} />
      </div>

      {/* ══════════════════════════════════════
          CATEGORY SECTIONS — title + row of 4 cards each
      ══════════════════════════════════════ */}
      {categoryWithPosts.map(({ id, name, slug, posts }) => (
        <section key={id} className="mx-auto max-w-7xl px-3 sm:px-4 py-5">
          <SectionHeader title={name} href={`/category/${slug}`} />
          {posts.length === 0 ? (
            <div className="border border-[var(--np-border)] bg-[var(--np-card)] p-6 text-center">
              <p className="text-sm text-[var(--np-text-secondary)]">এই বিভাগে এখনো কোনো সংবাদ নেই।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {posts.slice(0, 4).map((post) => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      ))}

      {/* ══════════════════════════════════════
          SECONDARY FEATURED (hero sidebar on mobile)
      ══════════════════════════════════════ */}
      {heroSidebar.length > 0 && (
        <section className="mx-auto max-w-7xl px-3 sm:px-4 py-5 md:hidden">
          <SectionHeader title="শীর্ষ খবর" />
          <div className="flex flex-col gap-4">
            {heroSidebar.map((post, i) => (
              <SecondaryStoryCard key={post.id} post={post} rank={i + 1} />
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          FOOTER STRIP AD
      ══════════════════════════════════════ */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4">
        <AdSlot placement={AD_PLACEMENTS.FOOTER_STRIP} className="w-full" showPlaceholder={false} />
      </div>

    </main>
  );
}
