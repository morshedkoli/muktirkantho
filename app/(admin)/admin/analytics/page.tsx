import Link from "next/link";
import { PostStatus } from "@prisma/client";
import { subDays, format, startOfDay } from "date-fns";
import { Eye, BookOpen, TrendingUp, FileText, MapPin, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { bnNumber, bnCount } from "@/lib/bn-number";
import { getPostPath } from "@/lib/post-url";
import { cn } from "@/lib/cn";
import { AdminShell } from "@/components/admin/admin-shell";
import { Panel, StatTile, EmptyState } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const RANGE_DAYS = 14;

export default async function AnalyticsPage() {
  const today = new Date();
  const rangeStart = startOfDay(subDays(today, RANGE_DAYS - 1));

  const [
    postsCount,
    publishedCount,
    viewAggregate,
    topArticles,
    rangePosts,
    categories,
    districts,
    categoryViews,
    districtViews,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: PostStatus.published } }),
    prisma.post.aggregate({ _sum: { viewCount: true }, _max: { viewCount: true } }),
    prisma.post.findMany({
      where: { status: PostStatus.published },
      orderBy: { viewCount: "desc" },
      take: 8,
      // Projected: the leaderboard shows a title, category and view count, so
      // pulling whole documents would ship 8 full article bodies to render it.
      select: {
        id: true,
        slug: true,
        title: true,
        viewCount: true,
        publishedAt: true,
        category: { select: { name: true } },
      },
    }),
    prisma.post.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true, viewCount: true },
    }),
    prisma.category.findMany(),
    prisma.district.findMany(),
    prisma.post.groupBy({
      by: ["categoryId"],
      _sum: { viewCount: true },
      _count: true,
    }),
    prisma.post.groupBy({
      by: ["districtId"],
      _sum: { viewCount: true },
      _count: true,
    }),
  ]);

  const totalViews = viewAggregate._sum.viewCount ?? 0;
  const maxPostViews = viewAggregate._max.viewCount ?? 0;
  const avgViews = postsCount > 0 ? Math.round(totalViews / postsCount) : 0;

  /* Daily bins — publishing volume and the views those posts have since earned.
     Not a visits-per-day timeline: the schema stores a lifetime counter per
     post, so anything labelled "views on this day" would be a fabrication. */
  const dayBins = Array.from({ length: RANGE_DAYS }, (_, i) => {
    const date = startOfDay(subDays(today, RANGE_DAYS - 1 - i));
    return { date, posts: 0, views: 0 };
  });

  for (const post of rangePosts) {
    const day = startOfDay(new Date(post.createdAt)).getTime();
    const bin = dayBins.find((b) => b.date.getTime() === day);
    if (bin) {
      bin.posts += 1;
      bin.views += post.viewCount ?? 0;
    }
  }

  const maxDayPosts = Math.max(...dayBins.map((b) => b.posts), 1);
  const rangeTotalPosts = dayBins.reduce((sum, b) => sum + b.posts, 0);

  const categoryRows = categoryViews
    .map((row) => ({
      name: categories.find((c) => c.id === row.categoryId)?.name ?? "—",
      views: row._sum.viewCount ?? 0,
      posts: row._count,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  const districtRows = districtViews
    .map((row) => ({
      name: districts.find((d) => d.id === row.districtId)?.name ?? "—",
      views: row._sum.viewCount ?? 0,
      posts: row._count,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  const maxCategoryViews = Math.max(...categoryRows.map((r) => r.views), 1);
  const maxDistrictViews = Math.max(...districtRows.map((r) => r.views), 1);

  return (
    <AdminShell
      kicker="প্রচার"
      title="পাঠ বিশ্লেষণ"
      description="কোন সংবাদ কতটা পড়া হয়েছে, কোন বিভাগ ও জেলা এগিয়ে — সবই ডেটাবেসের প্রকৃত পাঠসংখ্যা থেকে।"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile
          label="মোট পাঠ"
          value={bnCount(totalViews)}
          hint="সব পোস্টের সম্মিলিত পাঠসংখ্যা"
          tone="info"
          icon={Eye}
        />
        <StatTile
          label="গড় পাঠ"
          value={bnCount(avgViews)}
          hint="প্রতি পোস্টে"
          icon={BookOpen}
        />
        <StatTile
          label="সর্বোচ্চ পাঠ"
          value={bnCount(maxPostViews)}
          hint="একটি পোস্টে"
          tone="accent"
          icon={Trophy}
        />
        <StatTile
          label="প্রকাশিত পোস্ট"
          value={bnNumber(publishedCount)}
          hint={`মোট ${bnNumber(postsCount)}টির মধ্যে`}
          tone="success"
          icon={FileText}
        />
      </div>

      {/* Publishing cadence */}
      <Panel
        kicker={`গত ${bnNumber(RANGE_DAYS)} দিন`}
        title="প্রকাশনার ছন্দ"
        description={`এই সময়ে ${bnNumber(rangeTotalPosts)}টি পোস্ট প্রকাশিত হয়েছে`}
      >
        <div className="flex h-40 items-end gap-1.5">
          {dayBins.map((bin) => (
            <div
              key={bin.date.toISOString()}
              className="group flex h-full flex-1 flex-col justify-end"
              title={`${format(bin.date, "d MMM")} — ${bin.posts}টি পোস্ট, ${bin.views} পাঠ`}
            >
              <div
                style={{ height: `${Math.max(3, (bin.posts / maxDayPosts) * 100)}%` }}
                className={cn(
                  "w-full rounded-t-[3px] transition-colors",
                  bin.posts > 0
                    ? "bg-[var(--ad-text-primary)] group-hover:bg-[var(--ad-accent)]"
                    : "bg-[var(--ad-inset)]"
                )}
              />
            </div>
          ))}
        </div>
        <div className="adm-label mt-3 flex justify-between border-t border-[var(--ad-border)] pt-2.5">
          <span>{format(rangeStart, "d MMM")}</span>
          <span>{format(subDays(today, 6), "d MMM")}</span>
          <span>{format(today, "d MMM")}</span>
        </div>
      </Panel>

      {/* Coverage performance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel kicker="বিভাগ অনুযায়ী" title="সর্বাধিক পঠিত ক্যাটাগরি">
          <ViewsBars rows={categoryRows} max={maxCategoryViews} />
        </Panel>
        <Panel kicker="জেলা অনুযায়ী" title="সর্বাধিক পঠিত অঞ্চল">
          <ViewsBars rows={districtRows} max={maxDistrictViews} icon={MapPin} />
        </Panel>
      </div>

      {/* Top articles */}
      <Panel
        flush
        kicker="লিডারবোর্ড"
        title="সর্বাধিক পঠিত সংবাদ"
        actions={<span className="adm-label">সর্বকালীন পাঠ</span>}
      >
        {topArticles.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="এখনো পাঠের তথ্য নেই"
            description="সংবাদ প্রকাশিত হলে পাঠসংখ্যা এখানে জমা হতে শুরু করবে।"
          />
        ) : (
          <ol className="divide-y divide-[var(--ad-border)]">
            {topArticles.map((article, index) => (
              <li key={article.id}>
                <Link
                  href={getPostPath(article)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[var(--ad-card-alt)]"
                >
                  <span
                    className={cn(
                      "adm-figure w-7 shrink-0 text-right text-[18px]",
                      index === 0
                        ? "text-[var(--ad-accent)]"
                        : "text-[var(--ad-text-muted)]"
                    )}
                  >
                    {bnNumber(index + 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold text-[var(--ad-text-primary)]">
                      {article.title}
                    </span>
                    <span className="adm-mono mt-0.5 block truncate text-[10.5px] text-[var(--ad-text-muted)]">
                      {article.category?.name ?? "—"} ·{" "}
                      {article.publishedAt
                        ? format(article.publishedAt, "d MMM yyyy")
                        : "অপ্রকাশিত"}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-[var(--ad-text-muted)]" />
                    <span className="adm-mono text-[13px] font-semibold text-[var(--ad-text-primary)]">
                      {bnCount(article.viewCount)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </AdminShell>
  );
}

/* ── Bars ────────────────────────────────────────────────────────────────── */

function ViewsBars({
  rows,
  max,
  icon: Icon,
}: {
  rows: { name: string; views: number; posts: number }[];
  max: number;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-[12.5px] text-[var(--ad-text-muted)]">
        এখনো কোনো তথ্য নেই
      </p>
    );
  }

  return (
    <ul className="space-y-3.5">
      {rows.map((row) => (
        <li key={row.name}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-center gap-1.5 truncate text-[12.5px] font-medium text-[var(--ad-text-primary)]">
              {Icon && <Icon className="h-3 w-3 shrink-0 text-[var(--ad-text-muted)]" />}
              {row.name}
            </span>
            <span className="adm-mono shrink-0 text-[11.5px] text-[var(--ad-text-secondary)]">
              {bnCount(row.views)} পাঠ · {bnNumber(row.posts)} পোস্ট
            </span>
          </div>
          <span className="block h-[6px] overflow-hidden rounded-full bg-[var(--ad-inset)]">
            <span
              className="block h-full rounded-full bg-[var(--ad-info)]"
              style={{ width: `${Math.max(3, Math.round((row.views / max) * 100))}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}
