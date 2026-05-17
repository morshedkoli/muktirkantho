import Link from "next/link";
import { format } from "date-fns";
import { getHomeData, getLatestNews } from "@/lib/news";
import { NewsCard } from "@/components/public/news-card";
import { AdSlot } from "@/components/public/ad-slot";
import { AD_PLACEMENTS } from "@/lib/ads";

export const revalidate = 60;

export default async function EnglishHomePage() {
  const { featured, trendingTags } = await getHomeData();
  const { items: latest } = await getLatestNews(1, 12);

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-4 py-8">
      <div className="mb-6 border-b border-[var(--np-border)] pb-4">
        <h1 className="np-headline-lg text-[var(--np-text-primary)]">Muktir Kantho — English Edition</h1>
        <p className="np-timestamp mt-1">Voice of Freedom · {format(new Date(), "MMMM d, yyyy")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          {featured.length > 0 && (
            <section className="mb-8">
              <div className="np-section-header">
                <span className="np-section-label">Top Stories</span>
                <h2 className="np-headline text-xl">Top Stories</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {featured.slice(0, 4).map((post) => (
                  <NewsCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="np-section-header">
              <span className="np-section-label">Latest</span>
              <h2 className="np-headline text-lg">Latest News</h2>
              <Link href="/news" className="np-section-more hover:text-[var(--np-primary)] transition-colors">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {latest.map((post) => (
                <NewsCard key={post.id} post={post} variant="horizontal" />
              ))}
            </div>
          </section>
        </div>

        <aside className="hidden lg:block space-y-6">
          <AdSlot placement={AD_PLACEMENTS.SIDEBAR_PRIMARY} showPlaceholder={false} />
          {trendingTags.length > 0 && (
            <div className="border border-[var(--np-border)] bg-[var(--np-card)] p-5">
              <h3 className="font-label text-xs uppercase tracking-wider text-[var(--np-muted)] mb-3">Trending</h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.slice(0, 8).map((tag) => (
                  <Link key={tag} href={`/tag/${tag}`}
                    className="rounded-sm border border-[var(--np-border)] bg-[var(--np-newsprint)] px-3 py-1.5 text-xs text-[var(--np-text-soft)] hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] transition-all">
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="sticky top-14">
            <AdSlot placement={AD_PLACEMENTS.SIDEBAR_STICKY} showPlaceholder={false} />
          </div>
        </aside>
      </div>
    </main>
  );
}
