import Link from "next/link";
import { formatBanglaTime } from "@/lib/bangla-date";
import { AdSlot } from "@/components/public/ad-slot";
import { HeroNewsCard } from "@/components/public/hero-news-card";
import { PostImage } from "@/components/public/post-image";
import { LocationFilter } from "@/components/public/location-filter";
import { NewsCard } from "@/components/public/news-card";
import { SectionHeading } from "@/components/public/section-heading";
import { AD_PLACEMENTS } from "@/lib/ads";
import { getHomeData } from "@/lib/news";
import { getPostPath } from "@/lib/post-url";
import { ArrowRight, TrendingUp } from "lucide-react";

export const revalidate = 60;

/** Shared chrome for the right-rail panels. */
function RailPanel({
  title,
  icon,
  children,
  footer,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="border border-[var(--np-border)] bg-[var(--np-card)]">
      <div className="flex items-center gap-2 border-b-2 border-[var(--np-primary)] px-4 py-2.5">
        {icon}
        <h3 className="np-category text-[var(--np-text-primary)]">{title}</h3>
      </div>
      {children}
      {footer}
    </section>
  );
}

export default async function HomePage() {
  const { breaking, featured, latest, categories, divisions, trendingTags, categoryWithPosts } =
    await getHomeData();

  // Featured posts lead the page; fall back to plain recency when nothing is
  // flagged so the layout never collapses on a fresh install.
  const lineup = featured.length > 0 ? featured : latest;
  const leadStory = lineup[0];
  // Three supporting stories under the lead. These used to sit in a `md:hidden`
  // block, so desktop readers never saw featured posts 2–4 at all.
  const supportingStories = lineup.slice(1, 4);
  const latestStories = latest.slice(0, 6);
  const railStories = breaking.slice(0, 6);

  return (
    <main className="bg-[var(--np-newsprint)] pb-8">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        {/* Leaderboard ad — collapses entirely when none is booked */}
        <div className="pt-4 empty:hidden">
          <AdSlot placement={AD_PLACEMENTS.HOMEPAGE_BANNER} className="w-full" showPlaceholder={false} />
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 pt-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* ─────────── PRIMARY COLUMN ─────────── */}
          <div className="min-w-0">
            {/* Lead story — the page's single dominant element */}
            {leadStory && (
              <section aria-labelledby="lead-story">
                <h2 id="lead-story" className="sr-only">
                  প্রধান সংবাদ
                </h2>
                <HeroNewsCard post={leadStory} size="large" />
              </section>
            )}

            {/* Supporting featured stories — deliberately a different shape from
                the lead so the two tiers don't read as equals */}
            {supportingStories.length > 0 && (
              <section className="mt-8">
                <SectionHeading title="শীর্ষ খবর" weight="lead" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {supportingStories.map((post) => (
                    <NewsCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* Latest news */}
            {latestStories.length > 0 && (
              <section className="mt-10">
                <SectionHeading title="সর্বশেষ সংবাদ" href="/news" weight="lead" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {latestStories.map((post) => (
                    <NewsCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            <div className="mt-8 empty:hidden">
              <AdSlot placement={AD_PLACEMENTS.BILLBOARD} className="w-full" showPlaceholder={false} />
            </div>

            {/* Category strips — one feature plus a compact list, so each section
                carries internal hierarchy instead of four identical tiles */}
            {categoryWithPosts.map(({ id, name, slug, posts }) => {
              if (posts.length === 0) return null;
              const [featureStory, ...rest] = posts;

              return (
                <section key={id} className="mt-10">
                  <SectionHeading title={name} href={`/category/${slug}`} />
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <NewsCard post={featureStory} />
                    {rest.length > 0 && (
                      <ul className="flex flex-col gap-4 divide-y divide-[var(--np-rule)]">
                        {rest.map((post) => (
                          <li key={post.id} className="pt-4 first:pt-0">
                            <NewsCard post={post} variant="compact" />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          {/* ─────────── RIGHT RAIL ─────────── */}
          <aside className="hidden min-w-0 flex-col gap-6 lg:flex">
            {railStories.length > 0 && (
              <RailPanel
                title="আলোচিত সংবাদ"
                icon={<TrendingUp className="h-3.5 w-3.5 text-[var(--np-primary)]" />}
                footer={
                  <Link
                    href="/news"
                    className="np-category flex items-center justify-center gap-1.5 border-t border-[var(--np-border)] py-2.5 text-[var(--np-primary)] transition-colors hover:bg-[var(--np-primary)] hover:text-[var(--np-on-primary)]"
                  >
                    আরও দেখুন <ArrowRight className="h-3 w-3" />
                  </Link>
                }
              >
                <ol className="divide-y divide-[var(--np-border)]">
                  {railStories.map((post, index) => (
                    <li key={post.id}>
                      <Link
                        href={getPostPath(post)}
                        className="group flex gap-3 px-3 py-2.5 transition-colors hover:bg-[var(--np-newsprint)]"
                      >
                        {/* Rank numeral carries the ordering; the thumbnail is
                            supporting detail rather than the entry point. */}
                        <span
                          aria-hidden
                          className="font-display w-5 shrink-0 pt-0.5 text-right text-lg font-bold leading-none text-[var(--np-border)] transition-colors group-hover:text-[var(--np-primary)]"
                        >
                          {index + 1}
                        </span>

                        <div className="relative h-12 w-16 shrink-0 overflow-hidden bg-[var(--np-newsprint-2)]">
                          <PostImage src={post.imageUrl} alt="" sizes="64px" />
                        </div>

                        <div className="min-w-0 flex-1">
                          {post.publishedAt && (
                            <span className="np-timestamp mb-0.5 block text-[10px] text-[var(--np-primary)]">
                              {formatBanglaTime(post.publishedAt)}
                            </span>
                          )}
                          <span className="line-clamp-2 text-[12.5px] leading-snug text-[var(--np-text-primary)] transition-colors group-hover:text-[var(--np-primary)]">
                            {post.title}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
              </RailPanel>
            )}

            <div className="empty:hidden">
              <AdSlot placement={AD_PLACEMENTS.SIDEBAR_PRIMARY} showPlaceholder={false} />
            </div>

            {trendingTags.length > 0 && (
              <RailPanel
                title="ট্রেন্ডিং"
                icon={<TrendingUp className="h-3.5 w-3.5 text-[var(--np-primary)]" />}
              >
                <div className="flex flex-wrap gap-1.5 p-4">
                  {trendingTags.slice(0, 10).map((tag) => (
                    <Link
                      key={tag}
                      href={`/tag/${encodeURIComponent(tag)}`}
                      className="border border-[var(--np-border)] px-2.5 py-1 text-[11px] text-[var(--np-text-soft)] transition-all hover:border-[var(--np-primary)] hover:bg-[var(--np-primary-tint)] hover:text-[var(--np-primary)]"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </RailPanel>
            )}

            <LocationFilter divisions={divisions} />

            {categories.length > 0 && (
              <RailPanel title="বিভাগসমূহ">
                <ul className="divide-y divide-[var(--np-border)]">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/category/${category.slug}`}
                        className="group flex items-center justify-between px-4 py-2.5 text-[13px] text-[var(--np-text-primary)] transition-colors hover:bg-[var(--np-newsprint)] hover:text-[var(--np-primary)]"
                      >
                        <span>{category.name}</span>
                        <ArrowRight className="h-3 w-3 text-[var(--np-border)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--np-primary)]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </RailPanel>
            )}

            <div className="sticky top-16 empty:hidden">
              <AdSlot placement={AD_PLACEMENTS.SIDEBAR_STICKY} showPlaceholder={false} />
            </div>
          </aside>
        </div>

        <div className="mt-10 empty:hidden">
          <AdSlot placement={AD_PLACEMENTS.FOOTER_STRIP} className="w-full" showPlaceholder={false} />
        </div>
      </div>
    </main>
  );
}
