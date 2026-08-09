import { PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { dayKey, dayStart } from "@/lib/analytics";
import { DIRECT_SOURCE } from "@/lib/analytics-dimensions";
import { getPostPath } from "@/lib/post-url";

/**
 * Everything the analytics screen shows, assembled in one place.
 *
 * The page component's job is layout; deciding what a number *means* — which
 * window it covers, what it is being compared against, whether a comparison is
 * even honest — belongs here, next to the queries that produce it.
 *
 * All bucketing is by UTC day, because that is how the beacon writes it. The
 * report never re-buckets into local time: a day would then be stitched from
 * two half-days and every figure would be quietly wrong.
 */

export const ANALYTICS_RANGES = [7, 14, 30, 90] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export const DEFAULT_RANGE: AnalyticsRange = 14;

/** How many rows each breakdown panel shows. */
const BREAKDOWN_LIMIT = 8;

const MS_PER_DAY = 86_400_000;

export function parseRange(value: string | undefined): AnalyticsRange {
  const parsed = Number(value);
  return (ANALYTICS_RANGES as readonly number[]).includes(parsed)
    ? (parsed as AnalyticsRange)
    : DEFAULT_RANGE;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/* ── Shapes ──────────────────────────────────────────────────────────────── */

export interface TrafficTotals {
  pageViews: number;
  postReads: number;
  visitors: number;
  newVisitors: number;
}

export interface DayPoint {
  /** UTC midnight of the day. */
  date: Date;
  /** `d MMM` rendered in UTC — see the note on re-bucketing above. */
  label: string;
  pageViews: number;
  postReads: number;
  visitors: number;
  /** Articles published that day. Editorial output, not traffic. */
  posts: number;
}

export interface BreakdownRow {
  key: string;
  label: string;
  value: number;
  /** Filled in for rows that link somewhere — a page, an article. */
  href?: string;
}

export interface TrendingArticle {
  id: string;
  title: string;
  href: string;
  categoryName: string;
  reads: number;
  lifetimeViews: number;
}

export interface AnalyticsReport {
  range: AnalyticsRange;
  rangeStart: Date;
  rangeEnd: Date;
  /** True once any traffic at all has been recorded in the window. */
  hasTraffic: boolean;
  totals: TrafficTotals;
  /** The same window immediately before this one, for like-for-like deltas. */
  previousTotals: TrafficTotals;
  series: DayPoint[];
  devices: { mobile: number; tablet: number; desktop: number };
  sources: BreakdownRow[];
  pages: BreakdownRow[];
  trending: TrendingArticle[];
  topArticles: TrendingArticle[];
  categories: BreakdownRow[];
  districts: BreakdownRow[];
  library: {
    posts: number;
    published: number;
    lifetimeViews: number;
    publishedInRange: number;
  };
}

/* ── Labels ──────────────────────────────────────────────────────────────── */

const STATIC_PAGE_LABELS: Record<string, string> = {
  "/": "প্রচ্ছদ",
  "/news": "সর্বশেষ সংবাদ",
  "/search": "অনুসন্ধান",
  "/en": "English",
  "/privacy-policy": "গোপনীয়তা নীতি",
  "/terms-of-use": "ব্যবহারের শর্তাবলি",
  "/cookie-policy": "কুকি নীতি",
};

/**
 * A path as an editor should read it.
 *
 * Paths are stored decoded, so this is mostly a lookup. The decode stays as a
 * fallback for rows written before that was true — a column of `%E0%A6…` is
 * unreadable, and a malformed sequence is not worth failing the page over.
 */
export function labelForPath(path: string): string {
  const known = STATIC_PAGE_LABELS[path];
  if (known) return known;
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

export function labelForSource(source: string): string {
  return source === DIRECT_SOURCE ? "সরাসরি" : source;
}

/**
 * Percentage change against the previous window.
 *
 * `null` when there is nothing to compare against — growth from zero is not
 * "+100%", it is a first data point, and dressing it up as a percentage is the
 * kind of number that gets quoted in a meeting.
 */
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/* ── Aggregation helpers ─────────────────────────────────────────────────── */

interface DailyStatRow {
  day: Date;
  pageViews: number;
  postReads: number;
  visitors: number;
  newVisitors: number;
  mobileViews: number;
  tabletViews: number;
  desktopViews: number;
}

function sumTotals(rows: DailyStatRow[]): TrafficTotals {
  return rows.reduce<TrafficTotals>(
    (totals, row) => ({
      pageViews: totals.pageViews + row.pageViews,
      postReads: totals.postReads + row.postReads,
      visitors: totals.visitors + row.visitors,
      newVisitors: totals.newVisitors + row.newVisitors,
    }),
    { pageViews: 0, postReads: 0, visitors: 0, newVisitors: 0 },
  );
}

/** `d MMM` in UTC. date-fns formats in the server's zone, which would drift. */
const dayLabelFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
});

export function formatUtcDay(date: Date): string {
  return dayLabelFormatter.format(date);
}

function takeTop(rows: BreakdownRow[], limit = BREAKDOWN_LIMIT): BreakdownRow[] {
  return [...rows].sort((a, b) => b.value - a.value).slice(0, limit);
}

/* ── The report ──────────────────────────────────────────────────────────── */

export async function getAnalyticsReport(range: AnalyticsRange): Promise<AnalyticsReport> {
  const today = dayStart(dayKey());
  const rangeStart = addDays(today, -(range - 1));
  // Exclusive: a row dated tomorrow (clock skew on a write) must not land in
  // today's window and make the last bar jump.
  const rangeEndExclusive = addDays(today, 1);
  const previousStart = addDays(rangeStart, -range);

  const window = { gte: rangeStart, lt: rangeEndExclusive };

  const [
    dailyRows,
    previousRows,
    pathGroups,
    sourceGroups,
    postDayGroups,
    postsCount,
    publishedCount,
    publishedInRange,
    viewAggregate,
    topByLifetime,
    rangePosts,
    categories,
    districts,
    categoryViews,
    districtViews,
  ] = await Promise.all([
    prisma.dailyStat.findMany({ where: { day: window }, orderBy: { day: "asc" } }),
    prisma.dailyStat.findMany({ where: { day: { gte: previousStart, lt: rangeStart } } }),
    prisma.dailyPathStat.groupBy({ by: ["path"], where: { day: window }, _sum: { views: true } }),
    prisma.dailyReferrerStat.groupBy({
      by: ["source"],
      where: { day: window },
      _sum: { views: true },
    }),
    prisma.dailyPostStat.groupBy({ by: ["postId"], where: { day: window }, _sum: { reads: true } }),
    prisma.post.count(),
    prisma.post.count({ where: { status: PostStatus.published } }),
    prisma.post.count({ where: { status: PostStatus.published, publishedAt: window } }),
    prisma.post.aggregate({ _sum: { viewCount: true } }),
    prisma.post.findMany({
      where: { status: PostStatus.published },
      orderBy: { viewCount: "desc" },
      take: BREAKDOWN_LIMIT,
      // Projected: the leaderboard shows a title, category and view count, so
      // pulling whole documents would ship eight full article bodies to render it.
      select: {
        id: true,
        slug: true,
        title: true,
        viewCount: true,
        category: { select: { name: true } },
      },
    }),
    prisma.post.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
    prisma.category.findMany({ select: { id: true, name: true } }),
    prisma.district.findMany({ select: { id: true, name: true } }),
    prisma.post.groupBy({ by: ["categoryId"], _sum: { viewCount: true } }),
    prisma.post.groupBy({ by: ["districtId"], _sum: { viewCount: true } }),
  ]);

  /* Trending needs the articles behind the ids, and only the top few — a
     second round trip for eight documents, rather than joining every article
     read in ninety days. */
  const trendingGroups = [...postDayGroups]
    .sort((a, b) => (b._sum.reads ?? 0) - (a._sum.reads ?? 0))
    .slice(0, BREAKDOWN_LIMIT);

  const trendingPosts = trendingGroups.length
    ? await prisma.post.findMany({
        where: { id: { in: trendingGroups.map((group) => group.postId) } },
        select: {
          id: true,
          slug: true,
          title: true,
          viewCount: true,
          category: { select: { name: true } },
        },
      })
    : [];

  const trendingById = new Map(trendingPosts.map((post) => [post.id, post]));
  const trending: TrendingArticle[] = trendingGroups.flatMap((group) => {
    const post = trendingById.get(group.postId);
    if (!post) return [];
    return [
      {
        id: post.id,
        title: post.title,
        href: getPostPath(post),
        categoryName: post.category?.name ?? "—",
        reads: group._sum.reads ?? 0,
        lifetimeViews: post.viewCount,
      },
    ];
  });

  /* Daily bins. Every day in the window gets a row whether or not it was
     recorded — a gap in the chart should read as a quiet day, not as missing
     bars that shift the ones around them. */
  const statByDay = new Map(dailyRows.map((row) => [new Date(row.day).getTime(), row]));
  const postsByDay = new Map<number, number>();
  for (const post of rangePosts) {
    const key = dayStart(dayKey(new Date(post.createdAt))).getTime();
    postsByDay.set(key, (postsByDay.get(key) ?? 0) + 1);
  }

  const series: DayPoint[] = Array.from({ length: range }, (_, index) => {
    const date = addDays(rangeStart, index);
    const stat = statByDay.get(date.getTime());
    return {
      date,
      label: formatUtcDay(date),
      pageViews: stat?.pageViews ?? 0,
      postReads: stat?.postReads ?? 0,
      visitors: stat?.visitors ?? 0,
      posts: postsByDay.get(date.getTime()) ?? 0,
    };
  });

  const totals = sumTotals(dailyRows);
  const devices = dailyRows.reduce(
    (acc, row) => ({
      mobile: acc.mobile + row.mobileViews,
      tablet: acc.tablet + row.tabletViews,
      desktop: acc.desktop + row.desktopViews,
    }),
    { mobile: 0, tablet: 0, desktop: 0 },
  );

  const categoryName = new Map(categories.map((row) => [row.id, row.name]));
  const districtName = new Map(districts.map((row) => [row.id, row.name]));

  return {
    range,
    rangeStart,
    rangeEnd: today,
    hasTraffic: totals.pageViews > 0,
    totals,
    previousTotals: sumTotals(previousRows),
    series,
    devices,
    sources: takeTop(
      sourceGroups.map((row) => ({
        key: row.source,
        label: labelForSource(row.source),
        value: row._sum.views ?? 0,
      })),
    ),
    pages: takeTop(
      pathGroups.map((row) => ({
        key: row.path,
        label: labelForPath(row.path),
        value: row._sum.views ?? 0,
        href: row.path,
      })),
    ),
    trending,
    topArticles: topByLifetime.map((post) => ({
      id: post.id,
      title: post.title,
      href: getPostPath(post),
      categoryName: post.category?.name ?? "—",
      reads: post.viewCount,
      lifetimeViews: post.viewCount,
    })),
    categories: takeTop(
      categoryViews.map((row) => ({
        key: row.categoryId,
        label: categoryName.get(row.categoryId) ?? "—",
        value: row._sum.viewCount ?? 0,
      })),
      6,
    ),
    districts: takeTop(
      districtViews.map((row) => ({
        key: row.districtId,
        label: districtName.get(row.districtId) ?? "—",
        value: row._sum.viewCount ?? 0,
      })),
      6,
    ),
    library: {
      posts: postsCount,
      published: publishedCount,
      lifetimeViews: viewAggregate._sum.viewCount ?? 0,
      publishedInRange,
    },
  };
}
