import { PostStatus } from "@prisma/client";
import { format, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  PenSquare,
  Image as ImageIcon,
  FolderOpen,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const sevenDaysAgo = subDays(startOfToday, 6);
  const thirtyDaysAgo = subDays(startOfToday, 29);

  let publishedPosts: number;
  let draftPosts: number;
  let todayPosts: number;
  let weekPosts: number;
  let recentPosts: Awaited<ReturnType<typeof prisma.post.findMany<{ include: { category: true; district: true } }>>>;
  let postsByCategory: Array<{ categoryId: string; _count: number }>;
  let last7DaysPosts: { createdAt: Date }[];
  let newPublishedCount: number;
  let newDraftsCount: number;
  let topCategories: { name: string; count: number }[];
  let maxCatCount: number;
  let dayBins: { date: Date; count: number; label: string }[];
  let maxDay: number;
  let todayDelta: number;
  let weekDelta: number;

  try {
    [
      publishedPosts,
      draftPosts,
      todayPosts,
      weekPosts,
      recentPosts,
      postsByCategory,
      last7DaysPosts,
      newPublishedCount,
      newDraftsCount,
    ] = await Promise.all([
      prisma.post.count({ where: { status: PostStatus.published } }),
      prisma.post.count({ where: { status: PostStatus.draft } }),
      prisma.post.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.post.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.post.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { category: true, district: true },
      }),
      prisma.post.groupBy({
        by: ["categoryId"],
        _count: true,
        orderBy: { _count: { categoryId: "desc" } },
        take: 5,
      }),
      prisma.post.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
      prisma.post.count({ where: { status: PostStatus.published, createdAt: { gte: sevenDaysAgo } } }),
      prisma.post.count({ where: { status: PostStatus.draft, createdAt: { gte: sevenDaysAgo } } }),
    ]);

    // 7-day bar chart data
    dayBins = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(startOfToday, 6 - i);
      const dayNames = ["রবি", "সোম", "মঙ্গ", "বুধ", "বৃহ", "শুক্র", "শনি"];
      return { date: d, count: 0, label: dayNames[d.getDay()] };
    });
    for (const p of last7DaysPosts) {
      const dayIdx = dayBins.findIndex(
        (b) => b.date.toDateString() === new Date(p.createdAt).toDateString()
      );
      if (dayIdx >= 0) dayBins[dayIdx].count += 1;
    }
    maxDay = Math.max(...dayBins.map((b) => b.count), 1);

    // Top categories
    const catIds = postsByCategory.map((c) => c.categoryId);
    const catRecords = await prisma.category.findMany({ where: { id: { in: catIds } } });
    const catName = (id: string) => catRecords.find((c) => c.id === id)?.name ?? "—";
    topCategories = postsByCategory.map((c) => ({
      name: catName(c.categoryId),
      count: c._count,
    }));
    maxCatCount = Math.max(...topCategories.map((c) => c.count), 1);

    // KPI card deltas (last 7 days)
    todayDelta = todayPosts;
    weekDelta = weekPosts;
  } catch (error: unknown) {
    return (
      <AdminShell title="ড্যাশবোর্ড">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          ড্যাশবোর্ড ডেটা লোড করতে সমস্যা হয়েছে।
        </div>
      </AdminShell>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE TITLE */}
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        ড্যাশবোর্ড
      </h1>

      {/* ROW 1 — KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* আজকের পোস্ট */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            আজকের পোস্ট
          </p>
          <div className="flex items-end justify-between gap-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">
              {todayPosts}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                todayDelta >= 0
                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
              )}
            >
              {todayDelta >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {todayDelta >= 0 ? "+" : ""}{todayDelta}
            </span>
          </div>
        </div>

        {/* এই সপ্তাহে */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            এই সপ্তাহে
          </p>
          <div className="flex items-end justify-between gap-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">
              {weekPosts}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                weekDelta >= 0
                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
              )}
            >
              {weekDelta >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {weekDelta >= 0 ? "+" : ""}{weekDelta}
            </span>
          </div>
        </div>

        {/* প্রকাশিত */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            প্রকাশিত
          </p>
          <div className="flex items-end justify-between gap-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">
              {publishedPosts}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                newPublishedCount >= 0
                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
              )}
            >
              {newPublishedCount >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {newPublishedCount >= 0 ? "+" : ""}{newPublishedCount}
            </span>
          </div>
        </div>

        {/* খসড়া */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            খসড়া
          </p>
          <div className="flex items-end justify-between gap-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">
              {draftPosts}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                newDraftsCount >= 0
                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
              )}
            >
              {newDraftsCount >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {newDraftsCount >= 0 ? "+" : ""}{newDraftsCount}
            </span>
          </div>
        </div>
      </div>

      {/* ROW 2 — Bar Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-day bar chart (2/3) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              প্রকাশনা কার্যক্রম
            </p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
              গত ৭ দিনের পোস্ট
            </p>
          </div>
          <div className="flex items-end gap-3 h-[140px]">
            {dayBins.map((b, i) => {
              const isToday = i === dayBins.length - 1;
              const heightPct = Math.max(8, Math.round((b.count / maxDay) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    {b.count > 0 ? b.count : ""}
                  </span>
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all duration-300",
                      isToday
                        ? "bg-red-500"
                        : "bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                    )}
                    style={{ height: `${heightPct}%` }}
                    title={`${b.count} পোস্ট`}
                  />
                  <span
                    className={cn(
                      "text-[11px] font-semibold",
                      isToday ? "text-red-500 font-bold" : "text-zinc-400 dark:text-zinc-500"
                    )}
                  >
                    {b.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions (1/3) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              দ্রুত পদক্ষেপ
            </p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
              শর্টকাট
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/posts/create"
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
            >
              <PenSquare className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors text-center">
                নতুন পোস্ট
              </span>
            </Link>

            <Link
              href="/admin/media"
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
            >
              <ImageIcon className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors text-center">
                মিডিয়া
              </span>
            </Link>

            <Link
              href="/admin/categories"
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
            >
              <FolderOpen className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors text-center">
                বিভাগ
              </span>
            </Link>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
            >
              <ExternalLink className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors text-center">
                সাইট দেখুন
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ROW 3 — Recent Posts + Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts Table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                সাম্প্রতিক
              </p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
                সাম্প্রতিক পোস্ট
              </p>
            </div>
            <Link
              href="/admin/posts"
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              সব দেখুন →
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">কোনো পোস্ট নেই।</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-6 py-2 bg-zinc-50 dark:bg-zinc-800/50">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">শিরোনাম</span>
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">বিভাগ</span>
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">অবস্থা</span>
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500"></span>
              </div>
              {recentPosts.map((post) => {
                const isPublished = post.status === PostStatus.published;
                return (
                  <div
                    key={post.id}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-6 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <p className="font-bangla text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {post.title}
                    </p>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0 max-w-[80px] truncate">
                      {post.category?.name ?? "—"}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                        isPublished
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                      )}
                    >
                      {isPublished ? "প্রকাশিত" : "খসড়া"}
                    </span>
                    <Link
                      href={`/admin/posts/edit/${post.id}`}
                      className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                বিশ্লেষণ
              </p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
                শীর্ষ বিভাগ
              </p>
            </div>
            <Link
              href="/admin/categories"
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              সব দেখুন →
            </Link>
          </div>

          <div className="px-6 py-5 space-y-4">
            {topCategories.length === 0 ? (
              <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
                কোনো বিভাগ নেই।
              </p>
            ) : (
              topCategories.map((c) => {
                const barWidth = Math.max(4, Math.round((c.count / maxCatCount) * 100));
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="font-bangla text-sm font-medium text-zinc-700 dark:text-zinc-300 w-28 shrink-0 truncate">
                      {c.name}
                    </span>
                    <div className="flex-1 h-[8px] bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-900 dark:bg-zinc-200 rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 w-6 text-right shrink-0">
                      {c.count}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
