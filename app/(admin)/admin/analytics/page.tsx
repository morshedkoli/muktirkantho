import Link from "next/link";
import {
  Eye,
  Users,
  BookOpen,
  FileText,
  MapPin,
  TrendingUp,
  Flame,
  Compass,
  Layers,
} from "lucide-react";
import { bnNumber, bnCount, bnDecimal } from "@/lib/bn-number";
import { cn } from "@/lib/cn";
import {
  getAnalyticsReport,
  parseRange,
  percentChange,
  type AnalyticsRange,
  type TrendingArticle,
} from "@/lib/analytics-report";
import { AdminShell } from "@/components/admin/admin-shell";
import { Panel, StatTile, EmptyState, Alert } from "@/components/admin/ui";
import {
  BarList,
  DeviceSplit,
  PublishingBars,
  RangeTabs,
  TrafficChart,
} from "@/components/admin/analytics-charts";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ range?: string }> };

/**
 * Change against the window immediately before this one.
 *
 * Compared like for like — fourteen days against the fourteen before them —
 * so the figure is not just "traffic grows when you look at more days".
 */
function deltaHint(current: number, previous: number, range: AnalyticsRange): string {
  const change = percentChange(current, previous);
  if (change === null) {
    return previous === 0 && current > 0
      ? "তুলনা করার মতো আগের তথ্য নেই"
      : `আগের ${bnNumber(range)} দিনে কোনো তথ্য ছিল না`;
  }
  if (change === 0) return `আগের ${bnNumber(range)} দিনের সমান`;
  return `আগের ${bnNumber(range)} দিনের চেয়ে ${change > 0 ? "+" : "−"}${bnNumber(Math.abs(change))}%`;
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const { range: rangeParam } = await searchParams;
  const range = parseRange(rangeParam);

  let report: Awaited<ReturnType<typeof getAnalyticsReport>>;
  try {
    report = await getAnalyticsReport(range);
  } catch (error) {
    console.error("[analytics] Failed to build report:", error);
    return (
      <AdminShell kicker="প্রচার" title="পাঠ বিশ্লেষণ">
        <Alert tone="error" title="তথ্য লোড করা যায়নি">
          ডেটাবেস থেকে বিশ্লেষণের তথ্য আনা যায়নি। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।
        </Alert>
      </AdminShell>
    );
  }

  const { totals, previousTotals, library } = report;
  const rangeLabel = `গত ${bnNumber(range)} দিন`;

  /* Reads per visitor — the one derived figure worth a tile. It says whether
     readers open a second story, which no raw counter on this page answers. */
  const readsPerVisitor = totals.visitors > 0 ? totals.postReads / totals.visitors : 0;
  const returningVisitors = Math.max(0, totals.visitors - totals.newVisitors);

  return (
    <AdminShell
      kicker="প্রচার"
      title="পাঠ বিশ্লেষণ"
      description="কে পড়ছে, কোথা থেকে আসছে, কোন সংবাদ এগিয়ে — সবই সাইটের নিজস্ব ট্র্যাকিং থেকে, কোনো তৃতীয় পক্ষের স্ক্রিপ্ট ছাড়া।"
      actions={<RangeTabs current={range} />}
    >
      {!report.hasTraffic && (
        <Alert tone="info" title="এই সময়ে কোনো ট্র্যাফিক রেকর্ড হয়নি">
          সাইটে ভিজিট হলে পাঠ ও পাঠকের হিসাব এখানে জমা হতে শুরু করবে। সর্বকালীন পাঠসংখ্যা
          নিচের তালিকাগুলোতে আগের মতোই দেখা যাবে।
        </Alert>
      )}

      {/* ── KPI row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile
          label={`পেজ ভিউ · ${rangeLabel}`}
          value={bnCount(totals.pageViews)}
          hint={deltaHint(totals.pageViews, previousTotals.pageViews, range)}
          tone="info"
          icon={Eye}
        />
        <StatTile
          label={`পাঠক · ${rangeLabel}`}
          value={bnCount(totals.visitors)}
          hint={`${bnCount(totals.newVisitors)} জন নতুন · ${bnCount(returningVisitors)} জন ফিরে এসেছেন`}
          tone="accent"
          icon={Users}
        />
        <StatTile
          label={`সংবাদ পাঠ · ${rangeLabel}`}
          value={bnCount(totals.postReads)}
          hint={`পাঠকপ্রতি ${bnDecimal(readsPerVisitor)}টি সংবাদ`}
          tone="success"
          icon={BookOpen}
        />
        <StatTile
          label={`প্রকাশিত · ${rangeLabel}`}
          value={bnNumber(library.publishedInRange)}
          hint={`মোট ${bnNumber(library.published)}টি প্রকাশিত, ${bnCount(library.lifetimeViews)} সর্বকালীন পাঠ`}
          tone="neutral"
          icon={FileText}
          href="/admin/posts"
        />
      </div>

      {/* ── Traffic ─────────────────────────────────────────────────────── */}
      <Panel
        kicker={rangeLabel}
        title="দৈনিক ট্র্যাফিক"
        description={
          report.hasTraffic
            ? `${bnCount(totals.pageViews)} পেজ ভিউ, ${bnCount(totals.visitors)} জন পাঠক`
            : "ভিজিট শুরু হলে এখানে দিনভিত্তিক রেখাচিত্র দেখা যাবে"
        }
      >
        <TrafficChart series={report.series} />
      </Panel>

      {/* ── Acquisition ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          kicker="অধিগ্রহণ"
          title="পাঠক কোথা থেকে আসছেন"
          description="একই সাইটের ভেতরের ক্লিক এখানে গোনা হয় না — শুধু বাইরের উৎস।"
        >
          <BarList
            rows={report.sources}
            unit="ভিউ"
            showShare
            icon={Compass}
            emptyLabel="এখনো কোনো রেফারার রেকর্ড হয়নি"
            barClassName="bg-[var(--ad-primary-tint)]"
          />
        </Panel>

        <Panel kicker="ডিভাইস" title="কোন যন্ত্র থেকে পড়া হচ্ছে">
          <DeviceSplit devices={report.devices} />
        </Panel>
      </div>

      {/* ── Pages + publishing cadence ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel kicker="পেজ" title="সর্বাধিক দেখা পাতা" description={rangeLabel}>
          <BarList
            rows={report.pages}
            unit="ভিউ"
            icon={Layers}
            emptyLabel="এখনো কোনো পেজ ভিউ রেকর্ড হয়নি"
          />
        </Panel>

        <Panel
          kicker="নিউজরুম"
          title="প্রকাশনার ছন্দ"
          description={`এই সময়ে ${bnNumber(report.series.reduce((sum, day) => sum + day.posts, 0))}টি পোস্ট তৈরি হয়েছে`}
        >
          <PublishingBars series={report.series} />
        </Panel>
      </div>

      {/* ── Article leaderboards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          flush
          kicker={rangeLabel}
          title="এখন যা পড়া হচ্ছে"
          actions={<span className="adm-label">এই সময়ের পাঠ</span>}
        >
          <ArticleLeaderboard
            articles={report.trending}
            emptyTitle="এই সময়ে কোনো সংবাদ পড়া হয়নি"
            emptyDescription="পাঠক আসা শুরু করলে সবচেয়ে আলোচিত সংবাদ এখানে উঠে আসবে।"
            emptyIcon={Flame}
          />
        </Panel>

        <Panel
          flush
          kicker="লিডারবোর্ড"
          title="সর্বাধিক পঠিত সংবাদ"
          actions={<span className="adm-label">সর্বকালীন পাঠ</span>}
        >
          <ArticleLeaderboard
            articles={report.topArticles}
            emptyTitle="এখনো পাঠের তথ্য নেই"
            emptyDescription="সংবাদ প্রকাশিত হলে পাঠসংখ্যা এখানে জমা হতে শুরু করবে।"
            emptyIcon={TrendingUp}
          />
        </Panel>
      </div>

      {/* ── Coverage performance ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          kicker="বিভাগ অনুযায়ী"
          title="সর্বাধিক পঠিত ক্যাটাগরি"
          description="সর্বকালীন পাঠসংখ্যা"
        >
          <BarList rows={report.categories} unit="পাঠ" />
        </Panel>
        <Panel
          kicker="জেলা অনুযায়ী"
          title="সর্বাধিক পঠিত অঞ্চল"
          description="সর্বকালীন পাঠসংখ্যা"
        >
          <BarList rows={report.districts} unit="পাঠ" icon={MapPin} />
        </Panel>
      </div>
    </AdminShell>
  );
}

/* ── Leaderboard ─────────────────────────────────────────────────────────── */

interface ArticleLeaderboardProps {
  articles: TrendingArticle[];
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: React.ComponentType<{ className?: string }>;
}

function ArticleLeaderboard({
  articles,
  emptyTitle,
  emptyDescription,
  emptyIcon,
}: ArticleLeaderboardProps) {
  if (articles.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ol className="divide-y divide-[var(--ad-border)]">
      {articles.map((article, index) => (
        <li key={article.id}>
          <Link
            href={article.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[var(--ad-card-alt)]"
          >
            <span
              className={cn(
                "adm-figure w-7 shrink-0 text-right text-[18px]",
                index === 0 ? "text-[var(--ad-accent)]" : "text-[var(--ad-text-muted)]",
              )}
            >
              {bnNumber(index + 1)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-semibold text-[var(--ad-text-primary)]">
                {article.title}
              </span>
              <span className="adm-mono mt-0.5 block truncate text-[10.5px] text-[var(--ad-text-muted)]">
                {article.categoryName} · সর্বকালীন {bnCount(article.lifetimeViews)}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-[var(--ad-text-muted)]" />
              <span className="adm-mono text-[13px] font-semibold text-[var(--ad-text-primary)]">
                {bnCount(article.reads)}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
