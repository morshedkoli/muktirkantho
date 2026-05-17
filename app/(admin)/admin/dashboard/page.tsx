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
  Twitter,
  Facebook,
  Zap,
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
      take: 8,
      orderBy: { updatedAt: "desc" },
      include: { category: true, district: true },
    }),
  ]);

  const primaryStats = [
    {
      label: "Total Posts",
      value: totalPosts,
      icon: FileText,
      color: "bg-[var(--ad-ink)]",
      trend: "+12%",
      href: "/admin/posts",
    },
    {
      label: "Published",
      value: publishedPosts,
      icon: CheckCircle,
      color: "bg-[var(--ad-success)]",
      trend: "+8%",
      href: "/admin/posts",
    },
    {
      label: "Drafts",
      value: draftPosts,
      icon: Clock,
      color: "bg-[var(--ad-alert)]",
      trend: "+3",
      href: "/admin/posts",
    },
    {
      label: "Categories",
      value: categories,
      icon: Tags,
      color: "bg-[var(--ad-blue)]",
      trend: null,
      href: "/admin/categories",
    },
    {
      label: "Districts",
      value: districts,
      icon: MapPin,
      color: "bg-[var(--ad-primary)]",
      trend: null,
      href: "/admin/districts",
    },
    {
      label: "Upazilas",
      value: upazilas,
      icon: MapPinned,
      color: "bg-[var(--ad-accent)]",
      trend: null,
      href: "/admin/upazilas",
    },
  ];

  const socialStatus = [
    { platform: "X / Twitter", status: "Connected", posts: 23, icon: Twitter, color: "bg-black" },
    { platform: "Facebook", status: "Connected", posts: 18, icon: Facebook, color: "bg-[#1877f2]" },
    { platform: "Instagram", status: "Connected", posts: 7, icon: CameraIcon, color: "bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888]" },
    { platform: "LinkedIn", status: "Connected", posts: 12, icon: LinkedinIcon, color: "bg-[#0a66c2]" },
  ];

  return (
    <div className="w-full min-w-0 space-y-6">

      {/* Hero — Editorial Dashboard Header */}
      <div className="relative overflow-hidden rounded-xl bg-[var(--ad-sidebar)] text-white p-6 sm:p-8">
        <div className="absolute right-0 top-0 text-[140px] sm:text-[200px] font-black font-editorial-display leading-none text-white/[0.03] pointer-events-none select-none">
          MK
        </div>
        <div className="relative z-10">
          <div className="font-editorial-mono text-[11px] tracking-[3px] uppercase text-[var(--ad-breaking)] mb-3">
            Dashboard · {format(new Date(), "MMMM d, yyyy")}
          </div>
          <h1 className="font-editorial-display text-3xl sm:text-4xl font-black leading-tight max-w-xl">
            Welcome to the Newsroom
          </h1>
          <p className="mt-3 text-sm text-white/60 max-w-lg leading-relaxed">
            Your editorial command centre. Monitor content, manage social distribution, and track performance — all from one place.
          </p>
          <div className="flex flex-wrap gap-6 mt-6 pt-5 border-t border-white/10">
            <div className="flex flex-col gap-0.5">
              <span className="font-editorial-mono text-[10px] tracking-[2px] uppercase text-white/40">Today&apos;s Publishes</span>
              <span className="font-editorial-display text-2xl font-black text-white">{publishedPosts}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-editorial-mono text-[10px] tracking-[2px] uppercase text-white/40">Pending</span>
              <span className="font-editorial-display text-2xl font-black text-white">{draftPosts}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-editorial-mono text-[10px] tracking-[2px] uppercase text-white/40">Social Queue</span>
              <span className="font-editorial-display text-2xl font-black text-white">47</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-editorial-mono text-[10px] tracking-[2px] uppercase text-white/40">Active Readers</span>
              <span className="font-editorial-display text-2xl font-black text-[var(--ad-success)]">1,284</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid — 3 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {primaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group border border-[var(--ad-border)] bg-[var(--ad-card)] p-4 sm:p-5 transition-all hover:border-[var(--ad-text-primary)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`${stat.color} shrink-0 rounded-lg p-2.5 text-white`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                {stat.trend && (
                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--ad-success)]/10 px-2 py-0.5 font-editorial-mono text-[10px] font-medium text-[var(--ad-success)] tracking-wider">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">
                  {stat.label}
                </p>
                <p className="mt-1 font-editorial-display text-3xl sm:text-4xl font-black text-[var(--ad-text-primary)] transition-colors group-hover:text-[var(--ad-breaking)]">
                  {stat.value}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Grid — Recent Posts + Right Panel */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-5 md:grid-cols-5">

        {/* Recent Posts — wider column (3/5) */}
        <div className="min-w-0 overflow-hidden border border-[var(--ad-border)] bg-[var(--ad-card)] md:col-span-3">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-[var(--ad-border)] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="h-4 w-4 text-[var(--ad-ink)]" />
              <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)]">
                Recent Articles
              </h2>
            </div>
            <Link
              href="/admin/posts"
              className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Post rows */}
          <div className="divide-y divide-[var(--ad-border)]">
            {recentPosts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-editorial-mono text-xs tracking-wider text-[var(--ad-text-secondary)]">
                  No posts yet. Create your first post to get started.
                </p>
              </div>
            ) : (
              recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex min-w-0 flex-col gap-2.5 px-5 py-3.5 transition-colors hover:bg-[var(--ad-paper)]"
                >
                  {/* Title + status row */}
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 shrink-0 font-editorial-mono text-[9px] tracking-wider uppercase px-1.5 py-0.5 ${
                        post.status === "published"
                          ? "bg-[var(--ad-success)] text-white"
                          : "bg-[var(--ad-paper-2)] text-[var(--ad-muted)]"
                      }`}
                    >
                      {post.status === "published" ? "Live" : "Draft"}
                    </span>
                    <h3 className="min-w-0 flex-1 text-sm font-semibold text-[var(--ad-text-primary)] leading-snug">
                      <Link
                        href={`/admin/posts/edit/${post.id}`}
                        className="hover:text-[var(--ad-breaking)] transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h3>
                  </div>

                  {/* Meta row */}
                  <div className="flex min-w-0 flex-wrap items-center gap-3 pl-8">
                    <span className="font-editorial-mono text-[10px] text-[var(--ad-text-secondary)] tracking-wider">
                      {post.category.name}
                    </span>
                    <span className="text-[var(--ad-border)]">|</span>
                    <span className="font-editorial-mono text-[10px] text-[var(--ad-text-secondary)] tracking-wider">
                      {post.district.name}
                    </span>
                    <span className="text-[var(--ad-border)]">|</span>
                    <span className="font-editorial-mono text-[10px] text-[var(--ad-text-secondary)] tracking-wider">
                      {format(post.updatedAt, "MMM d, yyyy · HH:mm")}
                    </span>
                    <Link
                      href={`/admin/posts/edit/${post.id}`}
                      className="ml-auto font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)] hover:text-[var(--ad-breaking)] transition-colors"
                    >
                      Edit →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right sidebar — 2/5 */}
        <div className="flex min-w-0 flex-col gap-4 md:col-span-2">

          {/* Quick Actions */}
          <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
            <h3 className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)] mb-3">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { name: "New Post", href: "/admin/posts/create", icon: Plus, color: "bg-[var(--ad-ink)]" },
                { name: "Media", href: "/admin/media", icon: ImageIcon, color: "bg-[var(--ad-blue)]" },
                { name: "Categories", href: "/admin/categories", icon: Tags,       color: "bg-[var(--ad-accent)]" },
                { name: "View Site", href: "/", icon: Eye, color: "bg-[var(--ad-success)]" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="group flex flex-col items-center gap-2 border border-[var(--ad-border)] p-3.5 transition-all hover:border-[var(--ad-text-primary)]"
                  >
                    <div
                      className={`${action.color} rounded-lg p-2.5 text-white transition-transform group-hover:scale-110`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">
                      {action.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Social Automation Status */}
          <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)]">
                Social Distribution
              </h3>
              <span className="font-editorial-mono text-[10px] text-[var(--ad-success)] tracking-wider">● All Active</span>
            </div>
            <div className="space-y-3">
              {socialStatus.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.platform} className="flex items-center gap-3">
                    <div className={`${s.color} flex h-8 w-8 items-center justify-center rounded-lg text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--ad-text-primary)]">{s.platform}</p>
                      <p className="font-editorial-mono text-[10px] text-[var(--ad-text-secondary)] tracking-wider">
                        {s.posts} posts today
                      </p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-[var(--ad-success)]" />
                  </div>
                );
              })}
            </div>
            <Link
              href="/admin/social/queue"
              className="mt-3 flex items-center justify-center gap-2 border border-[var(--ad-border)] py-2.5 text-xs font-medium text-[var(--ad-text-secondary)] hover:bg-[var(--ad-paper)] transition-colors font-editorial-mono tracking-wider uppercase"
            >
              <Zap className="h-3.5 w-3.5" />
              Manage Social Queue
            </Link>
          </div>

          {/* Publishing Overview */}
          <div className="border border-[var(--ad-border)] bg-[var(--ad-sidebar)] p-5 text-white">
            <h3 className="font-editorial-mono text-[10px] tracking-widest uppercase text-white/40 mb-4">
              Publishing Overview
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-editorial-mono text-[10px] tracking-wider uppercase text-white/50">Published</span>
                  <span className="font-editorial-display font-black text-white text-lg">{publishedPosts}</span>
                </div>
                <div className="h-1.5 bg-[var(--ad-card)]/10">
                  <div
                    className="h-full bg-[var(--ad-success)] transition-all"
                    style={{
                      width: `${totalPosts > 0 ? (publishedPosts / totalPosts) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-editorial-mono text-[10px] tracking-wider uppercase text-white/50">Drafts</span>
                  <span className="font-editorial-display font-black text-white text-lg">{draftPosts}</span>
                </div>
                <div className="h-1.5 bg-[var(--ad-card)]/10">
                  <div
                    className="h-full bg-[var(--ad-alert)] transition-all"
                    style={{
                      width: `${totalPosts > 0 ? (draftPosts / totalPosts) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Today's date */}
          <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-[var(--ad-border)] bg-[var(--ad-paper)]">
                <Calendar className="h-5 w-5 text-[var(--ad-text-secondary)]" />
              </div>
              <div>
                <p className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)]">Today</p>
                <p className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)]">
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

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
