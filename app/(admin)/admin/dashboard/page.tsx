import Link from "next/link";
import { PostStatus } from "@prisma/client";
import { subDays, format } from "date-fns";
import {
  PenSquare,
  Image as ImageIcon,
  FolderOpen,
  ExternalLink,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  MessageSquare,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/cn";
import { bnNumber as bn, bnCount } from "@/lib/bn-number";
import { AdminShell } from "@/components/admin/admin-shell";
import { Panel, PanelLink, StatTile, EmptyState, Alert } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const DAY_LABELS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];

/**
 * The six most recently edited posts, projected down to what the list renders.
 *
 * Deliberately `select` rather than `include`: a bare `include` returns whole
 * Post documents, and each one carries the article's full markdown `content`.
 * For a list showing a title, thumbnail and two names that's megabytes of body
 * text pulled across the wire to be discarded — measured at ~8s against a
 * remote Atlas instance versus ~270ms for this projection.
 */
function findRecentPosts() {
  return prisma.post.findMany({
    take: 6,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      updatedAt: true,
      status: true,
      category: { select: { name: true } },
      district: { select: { name: true } },
    },
  });
}

const quickActions = [
  { href: "/admin/posts/create", label: "নতুন পোস্ট", icon: PenSquare },
  { href: "/admin/media", label: "মিডিয়া", icon: ImageIcon },
  { href: "/admin/categories", label: "ক্যাটাগরি", icon: FolderOpen },
  { href: "/", label: "সাইট দেখুন", icon: ExternalLink, external: true },
];

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = subDays(startOfToday, 6);
  const previousWeekStart = subDays(startOfToday, 13);

  let data: {
    published: number;
    drafts: number;
    todayCount: number;
    weekCount: number;
    previousWeekCount: number;
    pendingComments: number;
    totalViews: number;
    recentPosts: Awaited<ReturnType<typeof findRecentPosts>>;
    topCategories: { name: string; count: number }[];
    topDistricts: { name: string; count: number }[];
    dayBins: { label: string; count: number; isToday: boolean }[];
  };

  try {
    const [
      published,
      drafts,
      todayCount,
      weekCount,
      previousWeekCount,
      pendingComments,
      viewAggregate,
      recentPosts,
      weekPosts,
      categoryGroups,
      districtGroups,
    ] = await Promise.all([
      prisma.post.count({ where: { status: PostStatus.published } }),
      prisma.post.count({ where: { status: PostStatus.draft } }),
      prisma.post.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.post.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.post.count({
        where: { createdAt: { gte: previousWeekStart, lt: weekStart } },
      }),
      prisma.comment.count({ where: { status: "pending" } }).catch(() => 0),
      prisma.post.aggregate({ _sum: { viewCount: true } }),
      findRecentPosts(),
      prisma.post.findMany({
        where: { createdAt: { gte: weekStart } },
        select: { createdAt: true },
      }),
      prisma.post.groupBy({
        by: ["categoryId"],
        _count: true,
        orderBy: { _count: { categoryId: "desc" } },
        take: 5,
      }),
      prisma.post.groupBy({
        by: ["districtId"],
        _count: true,
        orderBy: { _count: { districtId: "desc" } },
        take: 5,
      }),
    ]);

    const [categoryRecords, districtRecords] = await Promise.all([
      prisma.category.findMany({
        where: { id: { in: categoryGroups.map((g) => g.categoryId) } },
      }),
      prisma.district.findMany({
        where: { id: { in: districtGroups.map((g) => g.districtId) } },
      }),
    ]);

    const dayBins = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(startOfToday, 6 - i);
      return {
        label: DAY_LABELS[date.getDay()],
        count: 0,
        isToday: i === 6,
        key: date.toDateString(),
      };
    });
    for (const post of weekPosts) {
      const bin = dayBins.find(
        (b) => b.key === new Date(post.createdAt).toDateString()
      );
      if (bin) bin.count += 1;
    }

    data = {
      published,
      drafts,
      todayCount,
      weekCount,
      previousWeekCount,
      pendingComments,
      totalViews: viewAggregate._sum.viewCount ?? 0,
      recentPosts,
      dayBins,
      topCategories: categoryGroups.map((g) => ({
        name: categoryRecords.find((c) => c.id === g.categoryId)?.name ?? "—",
        count: g._count,
      })),
      topDistricts: districtGroups.map((g) => ({
        name: districtRecords.find((d) => d.id === g.districtId)?.name ?? "—",
        count: g._count,
      })),
    };
  } catch {
    return (
      <AdminShell kicker="সংক্ষিপ্ত" title="ড্যাশবোর্ড">
        <Alert tone="error" title="ডেটা লোড করা যায়নি">
          ডেটাবেস থেকে ড্যাশবোর্ডের তথ্য আনা যায়নি। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।
        </Alert>
      </AdminShell>
    );
  }

  const maxDay = Math.max(...data.dayBins.map((b) => b.count), 1);
  const maxCategory = Math.max(...data.topCategories.map((c) => c.count), 1);
  const maxDistrict = Math.max(...data.topDistricts.map((d) => d.count), 1);
  const weekDelta = data.weekCount - data.previousWeekCount;

  return (
    <AdminShell
      kicker={format(now, "EEEE, d MMMM yyyy")}
      title="নিউজরুম ড্যাশবোর্ড"
      description="আজকের প্রকাশনা, অপেক্ষমাণ কাজ এবং কভারেজের সারসংক্ষেপ।"
      actions={
        <>
          <Button asChild variant="outline" size="default">
            <Link href="/admin/posts">সব পোস্ট</Link>
          </Button>
          <Button asChild size="default">
            <Link href="/admin/posts/create">
              <PenSquare className="h-4 w-4" />
              নতুন পোস্ট
            </Link>
          </Button>
        </>
      }
    >
      {/* ── KPI row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile
          label="আজ প্রকাশিত"
          value={bn(data.todayCount)}
          hint={`গত ৭ দিনে ${bn(data.weekCount)}টি`}
          tone="accent"
          icon={FileText}
        />
        <StatTile
          label="মোট প্রকাশিত"
          value={bn(data.published)}
          hint={
            weekDelta === 0
              ? "গত সপ্তাহের সমান গতি"
              : `গত সপ্তাহের চেয়ে ${bn(Math.abs(weekDelta))}টি ${weekDelta > 0 ? "বেশি" : "কম"}`
          }
          tone="success"
          icon={CheckCircle2}
          href="/admin/posts"
        />
        <StatTile
          label="খসড়া"
          value={bn(data.drafts)}
          hint={data.drafts > 0 ? "প্রকাশের অপেক্ষায়" : "কোনো খসড়া বাকি নেই"}
          tone="warning"
          icon={Clock}
          href="/admin/posts"
        />
        <StatTile
          label="মোট পাঠ"
          value={bnCount(data.totalViews)}
          hint={
            data.pendingComments > 0
              ? `${bn(data.pendingComments)}টি মন্তব্য অপেক্ষমাণ`
              : "সব মন্তব্য মডারেট করা"
          }
          tone="info"
          icon={Eye}
          href="/admin/analytics"
        />
      </div>

      {/* ── Activity + quick actions ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          kicker="প্রকাশনা কার্যক্রম"
          title="গত ৭ দিন"
          actions={
            <span className="adm-mono text-[11px] text-[var(--ad-text-muted)]">
              সর্বোচ্চ {bn(maxDay)}/দিন
            </span>
          }
        >
          {/* Bars share one soft-red family: today is solid, the rest are a wash
              of the same hue. A second colour here would imply a second meaning
              the data does not have. */}
          <div className="flex h-[168px] items-end gap-2 sm:gap-3">
            {data.dayBins.map((bin) => {
              const heightPct = Math.max(3, Math.round((bin.count / maxDay) * 100));
              return (
                <div
                  key={bin.label + bin.isToday}
                  className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span
                    className={cn(
                      "adm-mono text-[11px] font-semibold",
                      bin.isToday
                        ? "text-[var(--ad-primary)]"
                        : bin.count > 0
                          ? "text-[var(--ad-text-secondary)]"
                          : "text-[var(--ad-text-muted)]"
                    )}
                  >
                    {bn(bin.count)}
                  </span>
                  <div
                    title={`${bin.label}: ${bin.count}`}
                    style={{ height: `${heightPct}%` }}
                    className={cn(
                      "w-full rounded-[3px] transition-colors",
                      bin.isToday
                        ? "bg-[var(--ad-primary)]"
                        : "bg-[var(--ad-primary-tint-strong)] group-hover:bg-[var(--ad-primary)]/45"
                    )}
                  />
                  <span
                    className={cn(
                      "adm-label",
                      bin.isToday && "font-semibold text-[var(--ad-primary)]"
                    )}
                  >
                    {bin.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel kicker="শর্টকাট" title="দ্রুত পদক্ষেপ">
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map(({ href, label, icon: Icon, external }) => (
              <Link
                key={href}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group flex flex-col gap-2.5 rounded-[var(--ad-radius-sm)] border border-[var(--ad-border)] p-3.5 transition-colors hover:border-[var(--ad-primary)]/40 hover:bg-[var(--ad-primary-tint)]"
              >
                <Icon className="h-[18px] w-[18px] text-[var(--ad-text-muted)] transition-colors group-hover:text-[var(--ad-primary)]" />
                <span className="text-[12.5px] font-semibold text-[var(--ad-text-primary)]">
                  {label}
                </span>
              </Link>
            ))}
          </div>

          {data.pendingComments > 0 && (
            <Link
              href="/admin/comments"
              className="mt-3 flex items-center gap-2.5 rounded-[var(--ad-radius-sm)] border border-[var(--ad-warning)]/25 bg-[var(--ad-warning-tint)] px-3.5 py-3 transition-opacity hover:opacity-85"
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-[var(--ad-warning)]" />
              <span className="flex-1 text-[12.5px] font-medium text-[var(--ad-text-primary)]">
                {bn(data.pendingComments)}টি মন্তব্য অনুমোদনের অপেক্ষায়
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[var(--ad-warning)]" />
            </Link>
          )}
        </Panel>
      </div>

      {/* ── Recent posts ────────────────────────────────────────────────── */}
      <Panel
        flush
        kicker="সাম্প্রতিক"
        title="সর্বশেষ সম্পাদিত পোস্ট"
        actions={<PanelLink href="/admin/posts">সব দেখুন</PanelLink>}
      >
        {data.recentPosts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="এখনো কোনো পোস্ট নেই"
            description="প্রথম সংবাদ প্রকাশ করে নিউজরুম শুরু করুন।"
            action={
              <Button asChild>
                <Link href="/admin/posts/create">
                  <PenSquare className="h-4 w-4" />
                  নতুন পোস্ট
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-[var(--ad-border)]">
            {data.recentPosts.map((post) => {
              const live = post.status === PostStatus.published;
              return (
                <li key={post.id}>
                  <Link
                    href={`/admin/posts/edit/${post.id}`}
                    className="group/row flex items-center gap-3.5 px-5 py-3 transition-colors hover:bg-[var(--ad-card-alt)]"
                  >
                    <span className="h-11 w-16 shrink-0 overflow-hidden rounded-[4px] border border-[var(--ad-border)] bg-[var(--ad-inset)]">
                      {post.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center">
                          <FileText className="h-4 w-4 text-[var(--ad-text-muted)]" />
                        </span>
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-[var(--ad-text-primary)] transition-colors group-hover/row:text-[var(--ad-primary)]">
                        {post.title}
                      </span>
                      <span className="adm-mono mt-1 block truncate text-[10.5px] text-[var(--ad-text-muted)]">
                        {post.category?.name ?? "—"} · {post.district?.name ?? "—"} ·{" "}
                        {format(post.updatedAt, "d MMM, HH:mm")}
                      </span>
                    </span>

                    <Badge dot variant={live ? "success" : "warning"}>
                      {live ? "প্রকাশিত" : "খসড়া"}
                    </Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {/* ── Coverage ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          kicker="বিশ্লেষণ"
          title="শীর্ষ ক্যাটাগরি"
          actions={<PanelLink href="/admin/categories">সব দেখুন</PanelLink>}
        >
          <CoverageList
            items={data.topCategories}
            max={maxCategory}
            emptyLabel="কোনো ক্যাটাগরি নেই"
          />
        </Panel>

        <Panel
          kicker="কভারেজ"
          title="শীর্ষ জেলা"
          actions={<PanelLink href="/admin/districts">সব দেখুন</PanelLink>}
        >
          <CoverageList
            items={data.topDistricts}
            max={maxDistrict}
            emptyLabel="কোনো জেলা নেই"
            icon={MapPin}
          />
        </Panel>
      </div>
    </AdminShell>
  );
}

/* ── Coverage bar list ───────────────────────────────────────────────────── */

function CoverageList({
  items,
  max,
  emptyLabel,
  icon: Icon,
}: {
  items: { name: string; count: number }[];
  max: number;
  emptyLabel: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-[12.5px] text-[var(--ad-text-muted)]">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item.name} className="flex items-center gap-3">
          <span className="flex w-28 shrink-0 items-center gap-1.5 truncate text-[12.5px] font-medium text-[var(--ad-text-primary)]">
            {Icon && <Icon className="h-3 w-3 shrink-0 text-[var(--ad-text-muted)]" />}
            {item.name}
          </span>
          <span className="h-[6px] flex-1 overflow-hidden rounded-full bg-[var(--ad-inset)]">
            <span
              className="block h-full rounded-full bg-[var(--ad-primary)]"
              style={{ width: `${Math.max(4, Math.round((item.count / max) * 100))}%` }}
            />
          </span>
          <span className="adm-mono w-8 shrink-0 text-right text-[12px] font-semibold text-[var(--ad-text-secondary)]">
            {bn(item.count)}
          </span>
        </li>
      ))}
    </ul>
  );
}
