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
  Calendar
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
    recentPosts
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
      href: "/admin/posts"
    },
    { 
      label: "Published", 
      value: publishedPosts, 
      icon: CheckCircle, 
      color: "bg-emerald-500",
      trend: "+8%",
      href: "/admin/posts"
    },
    { 
      label: "Drafts", 
      value: draftPosts, 
      icon: Clock, 
      color: "bg-amber-500",
      trend: "+3",
      href: "/admin/posts"
    },
    { 
      label: "Categories", 
      value: categories, 
      icon: Tags, 
      color: "bg-purple-500",
      trend: null,
      href: "/admin/categories"
    },
    { 
      label: "Districts", 
      value: districts, 
      icon: MapPin, 
      color: "bg-indigo-500",
      trend: null,
      href: "/admin/districts"
    },
    { 
      label: "Upazilas", 
      value: upazilas, 
      icon: MapPinned, 
      color: "bg-rose-500",
      trend: null,
      href: "/admin/upazilas"
    },
  ];

  const quickActions = [
    { name: "Create Post", href: "/admin/posts/create", icon: Plus, color: "bg-[var(--ad-primary)]" },
    { name: "Add Category", href: "/admin/categories", icon: Tags, color: "bg-purple-500" },
    { name: "Add District", href: "/admin/districts", icon: MapPin, color: "bg-indigo-500" },
    { name: "View Site", href: "/", icon: Eye, color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ad-text-primary)]">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--ad-text-secondary)]">Welcome back! Here&apos;s what&apos;s happening with your news portal.</p>
        </div>
        <Link
          href="/admin/posts/create"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 hover:bg-[var(--ad-primary-hover)] transition-all"
        >
          <Plus className="h-4 w-4" />
          Create New Post
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-xl bg-[var(--ad-card)] p-6 shadow-[var(--ad-shadow)] border border-[var(--ad-border)] hover:shadow-[var(--ad-shadow-lg)] hover:border-[var(--ad-primary)]/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`${stat.color} rounded-lg p-3 text-white shadow-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                {stat.trend && (
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-[var(--ad-text-secondary)]">{stat.label}</p>
                <p className="text-3xl font-bold text-[var(--ad-text-primary)] mt-1 group-hover:text-[var(--ad-primary)] transition-colors">
                  {stat.value}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl bg-[var(--ad-card)] shadow-[var(--ad-shadow)] border border-[var(--ad-border)]">
          <div className="flex items-center justify-between border-b border-[var(--ad-border)] px-6 py-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[var(--ad-primary)]" />
              <h2 className="text-lg font-semibold text-[var(--ad-text-primary)]">Recent Posts</h2>
            </div>
            <Link 
              href="/admin/posts" 
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--ad-primary)] hover:text-[var(--ad-primary-hover)] transition-colors"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="divide-y divide-[var(--ad-border)]">
            {recentPosts.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-[var(--ad-text-secondary)]">No posts yet. Create your first post!</p>
              </div>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between px-6 py-4 hover:bg-[var(--ad-background)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--ad-text-primary)] truncate">
                      <Link href={`/admin/posts/edit/${post.id}`} className="hover:text-[var(--ad-primary)] transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-[var(--ad-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Tags className="h-3 w-3" />
                        {post.category.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {post.district.name}
                      </span>
                      <span>•</span>
                      <span>{format(post.updatedAt, "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      post.status === "published" 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                    <Link
                      href={`/admin/posts/edit/${post.id}`}
                      className="text-sm text-[var(--ad-text-secondary)] hover:text-[var(--ad-primary)] transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-xl bg-[var(--ad-card)] shadow-[var(--ad-shadow)] border border-[var(--ad-border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--ad-text-primary)] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="flex flex-col items-center gap-2 rounded-lg border border-[var(--ad-border)] p-4 hover:border-[var(--ad-primary)]/30 hover:bg-[var(--ad-background)] transition-all group"
                  >
                    <div className={`${action.color} rounded-lg p-2 text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-[var(--ad-text-secondary)]">{action.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Publishing Stats */}
          <div className="rounded-xl bg-gradient-to-br from-[var(--ad-text-primary)] to-slate-800 p-6 text-[var(--ad-card)]">
            <h3 className="text-sm font-medium text-[var(--ad-text-secondary)]">Publishing Overview</h3>
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--ad-text-secondary)]">Published</span>
                  <span className="font-semibold">{publishedPosts}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${totalPosts > 0 ? (publishedPosts / totalPosts) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--ad-text-secondary)]">Drafts</span>
                  <span className="font-semibold">{draftPosts}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${totalPosts > 0 ? (draftPosts / totalPosts) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date Card */}
          <div className="rounded-xl bg-[var(--ad-primary)]/10 border border-[var(--ad-primary)]/20 p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-[var(--ad-primary)]" />
              <div>
                <p className="text-sm text-[var(--ad-text-secondary)]">Today</p>
                <p className="text-lg font-semibold text-[var(--ad-text-primary)]">
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
