import { PostStatus } from "@prisma/client";
import Link from "next/link";
import { format, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  FileText,
  CheckCircle2,
  Clock3,
  Tags,
  MapPin,
  Users2,
  Calendar,
  ArrowRight,
  ArrowUpRight,
  Image as ImageIcon,
  Globe,
  Pencil,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Aggregate data — single Promise.all
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const sevenDaysAgo = subDays(startOfToday, 6);
  const thirtyDaysAgo = subDays(startOfToday, 29);

  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    categoriesCount,
    districtsCount,
    upazilasCount,
    todayPosts,
    weekPosts,
    monthPosts,
    recentPosts,
    postsByCategory,
    last7DaysPosts,
    newPostsCount,
    newPublishedCount,
    newDraftsCount,
    newCategoriesCount,
    newDistrictsCount,
    newUpazilasCount,
    siteSettings,
    youtubePostsCount,
    divisionsCount,
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
    prisma.post.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.post.count({ where: { status: PostStatus.published, createdAt: { gte: sevenDaysAgo } } }),
    prisma.post.count({ where: { status: PostStatus.draft, createdAt: { gte: sevenDaysAgo } } }),
    prisma.category.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.district.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.upazila.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.siteSetting.findFirst(),
    prisma.post.count({ where: { AND: [ { youtubeUrl: { not: null } }, { youtubeUrl: { not: "" } } ] } }),
    prisma.division.count(),
  ]);

  // Build 7-day chart bins
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

  // Resolve category names for the grouped result
  const catIds = postsByCategory.map((c) => c.categoryId);
  const catRecords = await prisma.category.findMany({ where: { id: { in: catIds } } });
  const catName = (id: string) => catRecords.find((c) => c.id === id)?.name ?? "—";
  const topCategories = postsByCategory.map((c, i) => ({
    name: catName(c.categoryId),
    count: c._count,
    color: ["var(--ad-brand)", "var(--ad-green)", "var(--ad-blue)", "var(--ad-amber)", "var(--ad-purple)"][i] ?? "var(--ad-text-muted)",
  }));
  const maxCatCount = Math.max(...topCategories.map((c) => c.count), 1);

  type CardSpec = {
    label: string;
    value: number;
    Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    accent: string;
    bg: string;
    delta: string;
    neutral?: boolean;
  };
  const cards: CardSpec[] = [
    { label: "Total Posts",  value: totalPosts,      Icon: FileText,    accent: "var(--ad-brand)",      bg: "var(--ad-brand-light)",  delta: `+${newPostsCount}` },
    { label: "Published",    value: publishedPosts,  Icon: CheckCircle2, accent: "var(--ad-green)",      bg: "var(--ad-green-light)",  delta: `+${newPublishedCount}` },
    { label: "Drafts",       value: draftPosts,      Icon: Clock3,      accent: "var(--ad-text-muted)", bg: "var(--ad-paper-2)",      delta: `+${newDraftsCount}`, neutral: true },
    { label: "Categories",   value: categoriesCount, Icon: Tags,        accent: "var(--ad-blue)",       bg: "var(--ad-blue-light)",   delta: `+${newCategoriesCount}` },
    { label: "Districts",    value: districtsCount,  Icon: MapPin,      accent: "var(--ad-amber)",      bg: "var(--ad-amber-light)",  delta: `+${newDistrictsCount}` },
    { label: "Upazilas",     value: upazilasCount,   Icon: Users2,      accent: "var(--ad-purple)",     bg: "var(--ad-purple-light)", delta: `+${newUpazilasCount}`, neutral: true },
  ];

  const dateRange = `${format(sevenDaysAgo, "MMM d")} – ${format(today, "MMM d, yyyy")}`;

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ad-text-primary)]">Overview</h1>
          <p className="text-xs text-[var(--ad-text-secondary)]">Real-time publishing activity and database telemetry.</p>
        </div>
        <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--ad-text-secondary)] bg-[var(--ad-card)] border border-[var(--ad-border)] px-3 py-1.5 rounded-lg shadow-sm">
          <Calendar className="h-3.5 w-3.5 text-[var(--ad-text-muted)]" />
          <span>{dateRange}</span>
        </div>
      </div>

      {/* PUBLISHING OVERVIEW STRIP */}
      <section className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl p-4 sm:p-5 shadow-premium">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-3.5 bg-[var(--ad-green)] rounded-full" />
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--ad-text-muted)]">Publishing Performance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 md:divide-x divide-[var(--ad-border)]">
          {[
            { label: "Today",       value: todayPosts, sub: `${publishedPosts} Total Published`, hint: `${draftPosts} Drafts pending`, pill: "var(--ad-green-light)", pillText: "var(--ad-green)", trend: `+${todayPosts}` },
            { label: "This Week",   value: weekPosts,  sub: `${weekPosts} Live articles`,        hint: `Across ${categoriesCount} categories`, pill: "var(--ad-amber-light)", pillText: "var(--ad-amber)", trend: `+${newPublishedCount}` },
            { label: "Last 30 Days",value: monthPosts, sub: `${districtsCount} Districts covered`, hint: `${upazilasCount} upazilas active`, pill: "var(--ad-blue-light)", pillText: "var(--ad-blue)", trend: `+${monthPosts}` },
          ].map((p, i) => (
            <div key={p.label} className={`${i === 0 ? "md:pr-5" : i === 2 ? "md:pl-5" : "md:px-5"} transition-all`}>
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full mb-3 border border-transparent"
                style={{ background: p.pill, color: p.pillText, borderColor: `${p.pillText}20` }}
              >
                {p.label}
              </span>
              <div className="text-4xl font-extrabold text-[var(--ad-text-primary)] tracking-tight leading-none mb-2">
                {p.value}
              </div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-[13px] font-bold text-[var(--ad-text-primary)]">{p.sub}</div>
                  <div className="text-[11.5px] text-[var(--ad-text-secondary)] mt-0.5">{p.hint}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[var(--ad-green-light)] text-[var(--ad-green)] px-2 py-0.5 rounded-full border border-[var(--ad-green)]/15 shrink-0">
                  {p.trend} <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6-COL STAT CARDS */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(({ label, value, Icon, accent, bg, delta, neutral }) => (
          <div
            key={label}
            className="relative bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl p-4 shadow-premium group"
          >
            <span className="absolute inset-x-0 top-0 h-[2px] rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: accent }} />
            <div className="flex items-center justify-between mb-4">
              <div className="h-9 w-9 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: bg }}>
                <Icon className="h-4.5 w-4.5" style={{ color: accent }} />
               </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  neutral
                    ? "bg-[var(--ad-border)]/40 text-[var(--ad-text-muted)] border-transparent"
                    : "bg-[var(--ad-green-light)] text-[var(--ad-green)] border-[var(--ad-green)]/10"
                }`}
              >
                {delta}
              </span>
            </div>
            <div className="text-2xl font-bold text-[var(--ad-text-primary)] tracking-tight leading-none mb-1.5">{value}</div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-[var(--ad-text-muted)]">{label}</div>
          </div>
        ))}
      </section>

      {/* MAIN ROW: Articles + (Quick Actions / Social) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

        {/* Recent articles panel */}
        <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-premium overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-[var(--ad-border)]">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded bg-[var(--ad-green-light)] text-[var(--ad-green)]">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="text-[14px] font-bold uppercase tracking-wider text-[var(--ad-text-primary)]">Recent Articles</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--ad-border)]/50 text-[var(--ad-text-secondary)] border border-[var(--ad-border)]">
                {totalPosts} total
              </span>
            </div>
            <Link
              href="/admin/posts"
              className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider text-[var(--ad-green)] hover:text-[var(--ad-green-hover)] transition-colors uppercase"
            >
              VIEW ALL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 px-5 py-3 border-b border-[var(--ad-border)] bg-[var(--ad-background)]/50">
            {["All", "Live", "Draft", "Scheduled"].map((t, i) => (
              <button
                key={t}
                className={`text-[12px] font-semibold px-3.5 py-1 rounded-full transition-all ${
                  i === 0
                    ? "bg-[var(--ad-green)] text-white shadow-sm"
                    : "text-[var(--ad-text-secondary)] hover:bg-[var(--ad-border)]/60 hover:text-[var(--ad-text-primary)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Article rows */}
          <div className="divide-y divide-[var(--ad-border)]">
            {recentPosts.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-[var(--ad-text-muted)]">No articles found.</p>
                <Link
                  href="/admin/posts/create"
                  className="inline-flex items-center gap-1 mt-2 text-[13px] font-semibold text-[var(--ad-green)]"
                >
                  Create one <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              recentPosts.map((post) => {
                const live = post.status === PostStatus.published;
                return (
                  <div
                    key={post.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[var(--ad-background)]/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-3">
                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                        live 
                          ? "bg-[var(--ad-green-light)] text-[var(--ad-green)] border-[var(--ad-green)]/10" 
                          : "bg-[var(--ad-amber-light)] text-[var(--ad-amber)] border-[var(--ad-amber)]/10"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-[var(--ad-green)] animate-pulse" : "bg-[var(--ad-amber)]"}`} />
                        {live ? "Live" : "Draft"}
                      </span>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-bangla text-[13.5px] font-bold text-[var(--ad-text-primary)] truncate leading-normal">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-[var(--ad-text-muted)] font-medium">
                          <span className="font-bold text-[var(--ad-green)] bg-[var(--ad-green-light)] px-1.5 py-0.5 rounded text-[10px] uppercase">
                            {post.category.name}
                          </span>
                          <span>·</span>
                          <span className="font-semibold text-[var(--ad-text-secondary)]">{post.district.name}</span>
                          <span>·</span>
                          <span className="font-mono text-[10.5px]">
                            {format(post.updatedAt, "MMM d, HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Edit Button */}
                    <Link
                      href={`/admin/posts/edit/${post.id}`}
                      className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] hover:text-[var(--ad-green)] bg-[var(--ad-background)] hover:bg-[var(--ad-green-light)] border border-[var(--ad-border)] hover:border-[var(--ad-green)]/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                    >
                      Edit <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Quick Actions + Channel Activity */}
        <div className="flex flex-col gap-5">

          {/* Quick Actions */}
          <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-premium overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--ad-border)]">
              <h3 className="text-[14px] font-bold uppercase tracking-wider text-[var(--ad-text-primary)]">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 bg-[var(--ad-background)]/20">
              {[
                { label: "New Post",   icon: Pencil,    href: "/admin/posts/create", bg: "var(--ad-brand-light)",  fg: "var(--ad-brand)" },
                { label: "Media",      icon: ImageIcon, href: "/admin/media",        bg: "var(--ad-blue-light)",   fg: "var(--ad-blue)" },
                { label: "Categories", icon: Tags,      href: "/admin/categories",   bg: "var(--ad-green-light)",  fg: "var(--ad-green)" },
                { label: "View Site",  icon: Globe,     href: "/",                   bg: "var(--ad-purple-light)", fg: "var(--ad-purple)" },
              ].map(({ label, icon: Icon, href, bg, fg }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex flex-col items-center justify-center gap-2 min-h-[96px] bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl p-3 text-center hover:border-[var(--ad-green)] hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="h-9 w-9 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: bg }}>
                    <Icon className="h-4.5 w-4.5" style={{ color: fg }} />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--ad-text-secondary)] group-hover:text-[var(--ad-text-primary)]">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Social / Channel Activity */}
          <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-premium overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border(--ad-border)]">
              <h3 className="text-[14px] font-bold uppercase tracking-wider text-[var(--ad-text-primary)]">Channel Telemetry</h3>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <ul className="divide-y divide-[var(--ad-border)]">
              {[
                { name: "Facebook Autopost", count: siteSettings?.facebookConnected ? "Connected" : "Disconnected", sub: siteSettings?.facebookAutoPost ? "Auto-sharing is active" : "Manual sharing only", bg: "#1877F2", letter: "f", textColor: "white", fontWeight: 700, fontSize: "14px" },
                { name: "YouTube Integration", count: `${youtubePostsCount} posts`, sub: "Articles with video embed", bg: "#FF0000", letter: "▶", textColor: "white", fontWeight: 600, fontSize: "10px" },
                { name: "Divisions Configured", count: `${divisionsCount} divisions`, sub: "Total regions covered", bg: "#10B981", letter: "D", textColor: "white", fontWeight: 700, fontSize: "12px" },
                { name: "Active Categories", count: `${categoriesCount} topics`, sub: "Distinct publishing queues", bg: "#8B5CF6", letter: "C", textColor: "white", fontWeight: 700, fontSize: "12px" },
              ].map((s) => (
                <li
                  key={s.name}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--ad-background)]/40 transition-colors"
                >
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: s.bg, color: s.textColor, fontWeight: s.fontWeight, fontSize: s.fontSize }}
                  >
                    {s.letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-[var(--ad-text-primary)] truncate">{s.name}</div>
                    <div className="text-[10px] text-[var(--ad-text-muted)] truncate">{s.sub}</div>
                  </div>
                  <div className="font-mono text-[11px] font-bold text-[var(--ad-text-muted)] bg-[var(--ad-background)] px-2 py-0.5 rounded border border-[var(--ad-border)] shrink-0">{s.count}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Chart + Top Categories + Recent Publishing Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Publishing Activity (7-day bars) */}
        <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-premium overflow-hidden">
          <div className="flex items-start justify-between px-5 py-4 border-b border-[var(--ad-border)]">
            <div>
              <h3 className="text-[14px] font-bold uppercase tracking-wider text-[var(--ad-text-primary)]">Publishing Activity</h3>
              <p className="text-[11px] text-[var(--ad-text-muted)] mt-0.5">Last 7 days posts count</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold leading-none text-[var(--ad-text-primary)]">{weekPosts}</div>
              <div className="font-mono text-[9px] font-bold tracking-wider text-[var(--ad-text-muted)] mt-1 uppercase">TOTAL</div>
            </div>
          </div>
          <div className="px-5 pt-5 pb-5">
            <div className="flex items-end gap-2.5 h-24">
              {dayBins.map((b, i) => {
                const isToday = i === dayBins.length - 1;
                const h = `${Math.max(10, (b.count / maxDay) * 100)}%`;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isToday 
                          ? "bg-gradient-to-t from-[var(--ad-green)]/70 to-[var(--ad-green)] shadow-[0_0_12px_rgba(16,185,129,0.2)]" 
                          : "bg-gradient-to-t from-[var(--ad-green-light)] to-[var(--ad-green)]/55 hover:to-[var(--ad-green)]"
                      }`}
                      style={{ height: h }}
                      title={`${b.count} posts`}
                    />
                    <span
                      className={`font-mono text-[10px] font-bold ${
                        isToday ? "text-[var(--ad-green)] font-extrabold" : "text-[var(--ad-text-muted)]"
                      }`}
                    >
                      {b.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-premium overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ad-border)]">
            <h3 className="text-[14px] font-bold uppercase tracking-wider text-[var(--ad-text-primary)]">Top Categories</h3>
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider text-[var(--ad-green)] hover:text-[var(--ad-green-hover)]"
            >
              ALL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="px-5 py-4.5 space-y-4">
            {topCategories.length === 0 ? (
              <p className="text-sm text-[var(--ad-text-muted)] text-center py-4">No categories yet</p>
            ) : (
              topCategories.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="font-bangla text-[13px] font-bold text-[var(--ad-text-primary)] flex-1 truncate">
                    {c.name}
                  </div>
                  <div className="w-24 h-1.5 bg-[var(--ad-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(c.count / maxCatCount) * 100}%`, background: c.color }}
                    />
                  </div>
                  <div className="font-mono text-[11px] font-bold text-[var(--ad-text-secondary)] w-6 text-right">{c.count}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Publishing Log */}
        <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-premium overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--ad-border)] bg-[var(--ad-card)]">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--ad-text-primary)]">Recent Publishing Log</h3>
            </div>
            <Link
              href="/admin/posts"
              className="text-[10px] font-bold uppercase tracking-wider h-7 px-3 bg-[var(--ad-background)] border border-[var(--ad-border)] rounded hover:bg-[var(--ad-green-light)] hover:text-[var(--ad-green)] flex items-center gap-1.5 transition-colors"
            >
              <TrendingUp className="h-3.5 w-3.5" /> View Log
            </Link>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Article Title</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="pr-5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPosts.slice(0, 3).map((post) => {
                  const isPublished = post.status === PostStatus.published;
                  return (
                    <TableRow key={post.id}>
                      <TableCell className="pl-5 font-bangla font-bold text-[13px] text-[var(--ad-text-primary)] max-w-[160px] truncate">
                        {post.title}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-[var(--ad-text-secondary)]">
                        {format(new Date(post.createdAt), "dd.MM.yyyy")}
                      </TableCell>
                      <TableCell className="pr-5">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isPublished
                            ? "bg-[var(--ad-green-light)] text-[var(--ad-green)] border-[var(--ad-green)]/10"
                            : "bg-[var(--ad-amber-light)] text-[var(--ad-amber)] border-[var(--ad-amber)]/10"
                        }`}>
                          {isPublished ? "Live" : "Draft"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {recentPosts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-[12px] text-[var(--ad-text-muted)] py-6">
                      No publishing activity found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

