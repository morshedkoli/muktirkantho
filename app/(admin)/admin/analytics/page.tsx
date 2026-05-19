import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { FileText, Send, FolderOpen, Megaphone, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    thisMonthPosts,
    lastMonthPosts,
    totalCategories,
    totalAds,
    activeAds,
    categoryCounts,
    recentPosts,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "published" } }),
    prisma.post.count({ where: { status: "draft" } }),
    prisma.post.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.post.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.category.count(),
    prisma.ad.count(),
    prisma.ad.count({ where: { isActive: true } }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    }),
    prisma.post.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, title: true, slug: true, createdAt: true, category: { select: { name: true } } },
    }),
  ]);

  const monthDiff = lastMonthPosts > 0
    ? Math.round(((thisMonthPosts - lastMonthPosts) / lastMonthPosts) * 100)
    : thisMonthPosts > 0 ? 100 : 0;

  const topCategories = [...categoryCounts]
    .sort((a, b) => b._count.posts - a._count.posts)
    .slice(0, 8);

  const maxCatCount = topCategories[0]?._count.posts ?? 0;

  return (
    <AdminShell
      title="বিশ্লেষণ"
      description="কন্টেন্ট কার্যক্রমের সারসংক্ষেপ।"
    >
      <div className="space-y-5">
        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "মোট পোস্ট", value: totalPosts, icon: FileText, color: "bg-blue-500/10 text-blue-500" },
            { label: "প্রকাশিত", value: publishedPosts, icon: Send, color: "bg-emerald-500/10 text-emerald-500" },
            { label: "ড্রাফট", value: draftPosts, icon: Clock, color: "bg-amber-500/10 text-amber-500" },
            { label: "বিভাগ", value: totalCategories, icon: FolderOpen, color: "bg-violet-500/10 text-violet-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] px-4 py-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--ad-text-primary)] leading-none">{value}</p>
                <p className="text-[11px] text-[var(--ad-text-muted)] mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* This month vs last month */}
          <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-[var(--ad-green)]" />
              <h2 className="text-sm font-semibold text-[var(--ad-text-primary)]">এই মাসের কার্যক্রম</h2>
            </div>
            <div className="flex items-end gap-6">
              <div>
                <p className="text-4xl font-bold text-[var(--ad-text-primary)]">{thisMonthPosts}</p>
                <p className="text-xs text-[var(--ad-text-muted)] mt-1">এই মাসে পোস্ট</p>
              </div>
              <div className="pb-1">
                <p className={`text-sm font-semibold ${monthDiff >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {monthDiff >= 0 ? "+" : ""}{monthDiff}%
                </p>
                <p className="text-xs text-[var(--ad-text-muted)]">গত মাসের তুলনায়</p>
              </div>
              <div className="pb-1 ml-auto text-right">
                <p className="text-2xl font-bold text-[var(--ad-text-muted)]">{lastMonthPosts}</p>
                <p className="text-xs text-[var(--ad-text-muted)]">গত মাসে</p>
              </div>
            </div>
          </div>

          {/* Ads */}
          <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-[var(--ad-text-primary)]">বিজ্ঞাপন</h2>
            </div>
            <div className="flex items-end gap-6">
              <div>
                <p className="text-4xl font-bold text-[var(--ad-text-primary)]">{activeAds}</p>
                <p className="text-xs text-[var(--ad-text-muted)] mt-1">সক্রিয় বিজ্ঞাপন</p>
              </div>
              <div className="pb-1 ml-auto text-right">
                <p className="text-2xl font-bold text-[var(--ad-text-muted)]">{totalAds}</p>
                <p className="text-xs text-[var(--ad-text-muted)]">মোট বিজ্ঞাপন</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category breakdown */}
          <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
            <h2 className="text-sm font-semibold text-[var(--ad-text-primary)] mb-4">বিভাগ অনুযায়ী পোস্ট</h2>
            {topCategories.length === 0 ? (
              <p className="text-sm text-[var(--ad-text-muted)] py-6 text-center">কোনো বিভাগ নেই</p>
            ) : (
              <div className="space-y-2.5">
                {topCategories.map((cat) => (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[var(--ad-text-primary)]">{cat.name}</span>
                      <span className="text-xs text-[var(--ad-text-muted)]">{cat._count.posts}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--ad-bg)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--ad-green)] transition-all"
                        style={{ width: maxCatCount > 0 ? `${(cat._count.posts / maxCatCount) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent published posts */}
          <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
            <h2 className="text-sm font-semibold text-[var(--ad-text-primary)] mb-4">সাম্প্রতিক প্রকাশিত পোস্ট</h2>
            {recentPosts.length === 0 ? (
              <p className="text-sm text-[var(--ad-text-muted)] py-6 text-center">কোনো প্রকাশিত পোস্ট নেই</p>
            ) : (
              <div className="space-y-1">
                {recentPosts.map((post, i) => (
                  <Link
                    key={post.id}
                    href={`/admin/posts/${post.id}/edit`}
                    className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-[var(--ad-bg)] transition-colors group"
                  >
                    <span className="text-xs font-bold text-[var(--ad-text-muted)] w-4 shrink-0 mt-0.5">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[var(--ad-text-primary)] truncate group-hover:text-[var(--ad-green)]">{post.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-[var(--ad-text-muted)]">{post.category.name}</span>
                        <span className="text-[var(--ad-border)]">·</span>
                        <span className="text-[10px] text-[var(--ad-text-muted)]">
                          {new Date(post.createdAt).toLocaleDateString("bn-BD")}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-[var(--ad-text-muted)] text-center">
          পেজভিউ ট্র্যাকিংয়ের জন্য Google Analytics বা Plausible সংযুক্ত করুন।
        </p>
      </div>
    </AdminShell>
  );
}
