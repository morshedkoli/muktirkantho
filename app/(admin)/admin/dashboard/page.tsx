import { PostStatus } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  FileText,
  CheckCircle,
  Clock,
  Tags,
  MapPin,
  MapPinned,
  TrendingUp,
  Plus,
  ArrowRight,
  Eye,
  BarChart3,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

export default async function AdminDashboardPage() {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    categories,
    districts,
    upazilas,
    recentPosts,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: PostStatus.published } }),
    prisma.post.count({ where: { status: PostStatus.draft } }),
    prisma.category.count(),
    prisma.district.count(),
    prisma.upazila.count(),
    prisma.post.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { category: true, district: true },
    }),
  ]);

  const stats = [
    {
      label: "Total Posts",
      value: totalPosts,
      icon: FileText,
      color: "bg-[var(--ad-primary)]",
      trend: "+12%",
      href: "/admin/posts",
    },
    {
      label: "Published",
      value: publishedPosts,
      icon: CheckCircle,
      color: "bg-emerald-500",
      trend: "+8%",
      href: "/admin/posts",
    },
    {
      label: "Drafts",
      value: draftPosts,
      icon: Clock,
      color: "bg-amber-500",
      trend: "+3",
      href: "/admin/posts",
    },
    {
      label: "Categories",
      value: categories,
      icon: Tags,
      color: "bg-purple-500",
      trend: null,
      href: "/admin/categories",
    },
    {
      label: "Districts",
      value: districts,
      icon: MapPin,
      color: "bg-indigo-500",
      trend: null,
      href: "/admin/districts",
    },
    {
      label: "Upazilas",
      value: upazilas,
      icon: MapPinned,
      color: "bg-rose-500",
      trend: null,
      href: "/admin/upazilas",
    },
  ];

  const quickActions = [
    {
      name: "Create Post",
      href: "/admin/posts/create",
      icon: Plus,
      color: "bg-[var(--ad-primary)]",
    },
    {
      name: "Add Category",
      href: "/admin/categories",
      icon: Tags,
      color: "bg-purple-500",
    },
    {
      name: "Add District",
      href: "/admin/districts",
      icon: MapPin,
      color: "bg-indigo-500",
    },
    { name: "View Site", href: "/", icon: Eye, color: "bg-emerald-500" },
  ];

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[var(--ad-text-primary)] sm:text-2xl">
            Dashboard
          </h1>
          <p className="mt-1 text-xs text-[var(--ad-text-secondary)] sm:text-sm">
            Welcome back! Here&apos;s what&apos;s happening with your news
            portal.
          </p>
        </div>
        <Link
          href="/admin/posts/create"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--ad-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[var(--ad-primary-hover)]"
        >
          <Plus className="h-4 w-4" />
          Create New Post
        </Link>
      </div>

      {/* Stats Grid — 2 cols on xs, 3 cols on sm+ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group overflow-hidden rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-4 shadow-[var(--ad-shadow)] transition-all hover:border-[var(--ad-primary)]/20 hover:shadow-[var(--ad-shadow-lg)] sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`${stat.color} shrink-0 rounded-lg p-2 text-white shadow-md sm:p-2.5`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                {stat.trend && (
                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-600">
                    <TrendingUp className="h-3 w-3" />
                    <span className="hidden xs:inline">{stat.trend}</span>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-[var(--ad-text-secondary)] sm:text-sm">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-2xl font-bold text-[var(--ad-text-primary)] transition-colors group-hover:text-[var(--ad-primary)] sm:text-3xl">
                  {stat.value}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom section — stacked on mobile, 2-col on md, 3-col on lg */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-5 sm:gap-5">
        {/* Recent Posts — takes 3/5 on md, 2/3 on lg */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-[var(--ad-shadow)] md:col-span-3">
          {/* Card header */}
          <div className="flex items-center justify-between gap-2 border-b border-[var(--ad-border)] px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 shrink-0 text-[var(--ad-primary)]" />
              <h2 className="text-base font-semibold text-[var(--ad-text-primary)] sm:text-lg">
                Recent Posts
              </h2>
            </div>
            <Link
              href="/admin/posts"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--ad-primary)] transition-colors hover:text-[var(--ad-primary-hover)]"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Post rows */}
          <div className="divide-y divide-[var(--ad-border)]">
            {recentPosts.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-[var(--ad-text-secondary)]">
                  No posts yet. Create your first post!
                </p>
              </div>
            ) : (
              recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="group flex min-w-0 flex-col gap-2.5 px-4 py-3 transition-colors hover:bg-[var(--ad-background)] sm:px-5 sm:py-3.5"
                >
                  {/* Title */}
                  <h3 className="min-w-0 truncate text-sm font-semibold text-[var(--ad-text-primary)]">
                    <Link
                      href={`/admin/posts/edit/${post.id}`}
                      className="hover:text-[var(--ad-primary)] transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>

                  {/* Meta row — status badge + tags + actions */}
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {/* Status badge */}
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${post.status === "published"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                        }`}
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>

                    {/* Category */}
                    <span className="inline-flex min-w-0 max-w-[120px] items-center gap-1 text-xs text-[var(--ad-text-secondary)]">
                      <Tags className="h-3 w-3 shrink-0" />
                      <span className="truncate">{post.category.name}</span>
                    </span>

                    {/* District */}
                    <span className="inline-flex min-w-0 max-w-[120px] items-center gap-1 text-xs text-[var(--ad-text-secondary)]">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{post.district.name}</span>
                    </span>

                    {/* Date */}
                    <span className="ml-auto shrink-0 text-xs text-[var(--ad-text-secondary)]">
                      {format(post.updatedAt, "MMM d, yyyy")}
                    </span>

                    {/* Edit link */}
                    <Link
                      href={`/admin/posts/edit/${post.id}`}
                      className="shrink-0 text-xs font-medium text-[var(--ad-primary)] transition-colors hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right sidebar — 2/5 on md */}
        <div className="flex min-w-0 flex-col gap-4 md:col-span-2 sm:gap-5">
          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-4 shadow-[var(--ad-shadow)] sm:p-5">
            <h2 className="mb-3 text-base font-semibold text-[var(--ad-text-primary)] sm:mb-4 sm:text-lg">
              Quick Actions
            </h2>
            {/* 4 actions: 2×2 on all sizes */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="group flex flex-col items-center gap-2 rounded-lg border border-[var(--ad-border)] p-3 text-center transition-all hover:border-[var(--ad-primary)]/30 hover:bg-[var(--ad-background)] sm:p-3.5"
                  >
                    <div
                      className={`${action.color} rounded-lg p-2 text-white shadow-md transition-transform group-hover:scale-110`}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="line-clamp-2 text-xs font-medium leading-tight text-[var(--ad-text-secondary)]">
                      {action.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Publishing Overview */}
          <div className="rounded-xl bg-gradient-to-br from-[var(--ad-text-primary)] to-slate-800 p-4 text-white shadow-[var(--ad-shadow)] sm:p-5">
            <h3 className="text-sm font-semibold text-slate-300">
              Publishing Overview
            </h3>
            <div className="mt-4 space-y-4">
              {/* Published bar */}
              <div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-slate-300">Published</span>
                  <span className="tabular-nums font-semibold text-white">
                    {publishedPosts}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${totalPosts > 0
                          ? (publishedPosts / totalPosts) * 100
                          : 0
                        }%`,
                    }}
                  />
                </div>
              </div>
              {/* Draft bar */}
              <div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-slate-300">Drafts</span>
                  <span className="tabular-nums font-semibold text-white">
                    {draftPosts}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{
                      width: `${totalPosts > 0 ? (draftPosts / totalPosts) * 100 : 0
                        }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date Card */}
          <div className="rounded-xl border border-[var(--ad-primary)]/20 bg-[var(--ad-primary)]/10 p-4 sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <Calendar className="h-7 w-7 shrink-0 text-[var(--ad-primary)] sm:h-8 sm:w-8" />
              <div className="min-w-0">
                <p className="text-xs text-[var(--ad-text-secondary)] sm:text-sm">
                  Today
                </p>
                <p className="truncate text-base font-semibold text-[var(--ad-text-primary)] sm:text-lg">
                  {format(new Date(), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
