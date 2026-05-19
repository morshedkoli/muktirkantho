import { PostStatus } from "@prisma/client";
import { format, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const sevenDaysAgo = subDays(startOfToday, 6);
  const thirtyDaysAgo = subDays(startOfToday, 29);

  const [
    totalPosts, publishedPosts, draftPosts, categoriesCount,
    districtsCount, upazilasCount, todayPosts, weekPosts, monthPosts,
    recentPosts, postsByCategory, last7DaysPosts,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: PostStatus.published } }),
    prisma.post.count({ where: { status: PostStatus.draft } }),
    prisma.category.count(),
    prisma.district.count(),
    prisma.upazila.count(),
    prisma.post.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.post.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.post.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.post.findMany({
      take: 5, orderBy: { updatedAt: "desc" },
      include: { category: true, district: true },
    }),
    prisma.post.groupBy({
      by: ["categoryId"], _count: true,
      orderBy: { _count: { categoryId: "desc" } }, take: 5,
    }),
    prisma.post.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  const dayBins = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(startOfToday, 6 - i);
    return { date: d, count: 0, label: format(d, "EEE")[0] };
  });
  for (const p of last7DaysPosts) {
    const dayIdx = dayBins.findIndex(
      (b) => b.date.toDateString() === new Date(p.createdAt).toDateString()
    );
    if (dayIdx >= 0) dayBins[dayIdx].count += 1;
  }
  const maxDay = Math.max(...dayBins.map((b) => b.count), 1);

  const catIds = postsByCategory.map((c) => c.categoryId);
  const catRecords = await prisma.category.findMany({ where: { id: { in: catIds } } });
  const catName = (id: string) => catRecords.find((c) => c.id === id)?.name ?? "—";
  const topCategories = postsByCategory.map((c, i) => ({
    name: catName(c.categoryId),
    count: c._count,
    color: ["var(--ad-brand)", "var(--ad-green)", "var(--ad-blue)", "var(--ad-amber)", "var(--ad-purple)"][i] ?? "var(--ad-text-muted)",
  }));
  const maxCatCount = Math.max(...topCategories.map((c) => c.count), 1);

  const dateRange = `${format(sevenDaysAgo, "MMM d")} – ${format(today, "MMM d, yyyy")}`;

  return (
    <DashboardClient
      totalPosts={totalPosts}
      publishedPosts={publishedPosts}
      draftPosts={draftPosts}
      categoriesCount={categoriesCount}
      districtsCount={districtsCount}
      upazilasCount={upazilasCount}
      todayPosts={todayPosts}
      weekPosts={weekPosts}
      monthPosts={monthPosts}
      recentPosts={recentPosts}
      topCategories={topCategories}
      maxCatCount={maxCatCount}
      dayBins={dayBins}
      maxDay={maxDay}
      dateRange={dateRange}
      today={today}
    />
  );
}
