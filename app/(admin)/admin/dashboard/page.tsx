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
    { label: "Total Posts",  value: totalPosts,      Icon: FileText,    accent: "var(--ad-brand)",      bg: "var(--ad-brand-light)",  delta: "+12" },
    { label: "Published",    value: publishedPosts,  Icon: CheckCircle2, accent: "var(--ad-green)",      bg: "var(--ad-green-light)",  delta: `+${publishedPosts}` },
    { label: "Drafts",       value: draftPosts,      Icon: Clock3,      accent: "var(--ad-text-muted)", bg: "var(--ad-paper-2)",      delta: "+0", neutral: true },
    { label: "Categories",   value: categoriesCount, Icon: Tags,        accent: "var(--ad-blue)",       bg: "var(--ad-blue-light)",   delta: "+3" },
    { label: "Districts",    value: districtsCount,  Icon: MapPin,      accent: "var(--ad-amber)",      bg: "var(--ad-amber-light)",  delta: "+2" },
    { label: "Upazilas",     value: upazilasCount,   Icon: Users2,      accent: "var(--ad-purple)",     bg: "var(--ad-purple-light)", delta: "+0", neutral: true },
  ];

  const dateRange = `${format(sevenDaysAgo, "MMM d")} – ${format(today, "MMM d, yyyy")}`;

  return (
    <div className="space-y-5">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-[22px] font-bold text-[var(--ad-text-primary)]">Dashboard</h1>
        <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--ad-text-muted)]">
          <Calendar className="h-3.5 w-3.5" />
          <span>{dateRange}</span>
        </div>
      </div>

      {/* PUBLISHING OVERVIEW STRIP */}
      <section className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl p-5 sm:p-6 shadow-[var(--ad-shadow-lg)]">
        <h2 className="text-[15px] font-bold text-[var(--ad-text-primary)] mb-4">Publishing Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-[var(--ad-border)]">
          {[
            { label: "Today",       value: todayPosts, sub: `${publishedPosts} Total Published`, hint: `${draftPosts} Drafts pending`, pill: "var(--ad-green-light)", pillText: "var(--ad-green)", trend: "+2" },
            { label: "This Week",   value: weekPosts,  sub: `${weekPosts} Live articles`,        hint: `Across ${categoriesCount} categories`, pill: "var(--ad-amber-light)", pillText: "#92400E", trend: `+${weekPosts}` },
            { label: "Last 30 Days",value: monthPosts, sub: `${districtsCount} Districts covered`, hint: `${upazilasCount} upazilas active`, pill: "var(--ad-blue-light)", pillText: "var(--ad-blue)", trend: `+${monthPosts}` },
          ].map((p, i) => (
            <div key={p.label} className={`${i === 0 ? "sm:pr-6" : i === 2 ? "sm:pl-6" : "sm:px-6"} py-4 sm:py-0 first:pt-0 last:pb-0`}>
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-[3px] rounded-full mb-2.5"
                style={{ background: p.pill, color: p.pillText }}
              >
                {p.label}
              </span>
              <div className="text-[32px] font-extrabold text-[var(--ad-text-primary)] leading-none mb-1">
                {p.value}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[14px] font-semibold text-[var(--ad-text-primary)]">{p.sub}</div>
                  <div className="text-[11.5px] text-[var(--ad-text-muted)]">{p.hint}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-[2px] rounded-full">
                  {p.trend} <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6-COL STAT CARDS */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {cards.map(({ label, value, Icon, accent, bg, delta, neutral }) => (
          <div
            key={label}
            className="relative bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl p-4 shadow-[var(--ad-shadow-lg)] hover:-translate-y-px transition-transform"
          >
            <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl" style={{ background: accent }} />
            <div className="flex items-start justify-between mb-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon className="h-[18px] w-[18px]" style={{ color: accent }} />
              </div>
              <span
                className={`text-[10.5px] font-semibold px-1.5 py-[2px] rounded-full ${
                  neutral
                    ? "bg-[var(--ad-paper-2)] text-[var(--ad-text-muted)]"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {delta}
              </span>
            </div>
            <div className="text-[28px] font-extrabold text-[var(--ad-text-primary)] leading-none mb-1">{value}</div>
            <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[var(--ad-text-muted)]">{label}</div>
          </div>
        ))}
      </section>

      {/* MAIN ROW: Articles + (Quick Actions / Social) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

        {/* Recent articles panel */}
        <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-[var(--ad-shadow-lg)] overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--ad-border)]">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--ad-green)]" />
              <h3 className="text-[15px] font-bold text-[var(--ad-text-primary)]">Recent Articles</h3>
              <span className="text-[11px] font-semibold px-2 py-[2px] rounded-full bg-[var(--ad-background)] border border-[var(--ad-border)] text-[var(--ad-text-secondary)]">
                {totalPosts} total
              </span>
            </div>
            <Link
              href="/admin/posts"
              className="flex items-center gap-1 text-[12.5px] font-semibold text-[var(--ad-green)] hover:text-[var(--ad-green-hover)]"
            >
              VIEW ALL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 px-5 py-2.5 border-b border-[var(--ad-border)] bg-[var(--ad-background)]">
            {["All", "Live", "Draft", "Scheduled"].map((t, i) => (
              <button
                key={t}
                className={`text-[12px] font-semibold px-3 py-[5px] rounded-full transition-all ${
                  i === 0
                    ? "bg-[var(--ad-green)] text-white"
                    : "text-[var(--ad-text-secondary)] hover:bg-[var(--ad-card)] hover:border-[var(--ad-border)] border border-transparent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Article rows */}
          <div>
            {recentPosts.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-[var(--ad-text-muted)]">No articles yet.</p>
                <Link
                  href="/admin/posts/create"
                  className="inline-flex items-center gap-1 mt-2 text-[13px] font-semibold text-[var(--ad-green)]"
                >
                  Create one <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              recentPosts.map((post, idx) => {
                const live = post.status === PostStatus.published;
                return (
                  <div
                    key={post.id}
                    className={`flex items-center gap-3.5 px-5 py-3.5 hover:bg-[var(--ad-paper)] transition-colors ${
                      idx < recentPosts.length - 1 ? "border-b border-[var(--ad-border)]" : ""
                    }`}
                  >
                    {/* Live badge */}
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 text-[9.5px] font-bold tracking-[0.06em] uppercase px-2 py-[3px] rounded text-white ${
                        live ? "bg-[var(--ad-green)]" : "bg-[var(--ad-amber)]"
                      }`}
                    >
                      <span className={`w-[5px] h-[5px] rounded-full bg-white ${live ? "animate-pulse" : ""}`} />
                      {live ? "Live" : "Draft"}
                    </span>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="font-bangla text-[14px] font-semibold text-[var(--ad-text-primary)] truncate">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10.5px] font-semibold px-2 py-[2px] rounded bg-[var(--ad-green-light)] text-[var(--ad-green)]">
                          {post.category.name}
                        </span>
                        <span className="text-[10px] text-[var(--ad-border-strong)]">·</span>
                        <span className="font-mono text-[11px] text-[var(--ad-text-muted)]">{post.district.name}</span>
                        <span className="text-[10px] text-[var(--ad-border-strong)]">·</span>
                        <span className="font-mono text-[11px] text-[var(--ad-text-muted)]">
                          {format(post.updatedAt, "MMM d · HH:mm")}
                        </span>
                      </div>
                    </div>

                    {/* Edit */}
                    <Link
                      href={`/admin/posts/edit/${post.id}`}
                      className="shrink-0 text-[11.5px] font-semibold text-[var(--ad-text-secondary)] hover:text-[var(--ad-green)] bg-[var(--ad-background)] hover:bg-[var(--ad-green-light)] border border-[var(--ad-border)] hover:border-[var(--ad-green)] px-3 py-[5px] rounded-md transition-all flex items-center gap-1"
                    >
                      Edit <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Quick Actions + Social Distribution */}
        <div className="flex flex-col gap-4">

          {/* Quick Actions */}
          <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-[var(--ad-shadow-lg)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--ad-border)]">
              <h3 className="text-[15px] font-bold text-[var(--ad-text-primary)]">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5 p-4">
              {[
                { label: "New Post",   icon: Pencil,    href: "/admin/posts/create", bg: "var(--ad-brand-light)",  fg: "var(--ad-brand)" },
                { label: "Media",      icon: ImageIcon, href: "/admin/media",        bg: "var(--ad-blue-light)",   fg: "var(--ad-blue)" },
                { label: "Categories", icon: Tags,      href: "/admin/categories",   bg: "var(--ad-green-light)",  fg: "var(--ad-green)" },
                { label: "View Site",  icon: Globe,     href: "/",                   bg: "var(--ad-purple-light)", fg: "var(--ad-purple)" },
              ].map(({ label, icon: Icon, href, bg, fg }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex flex-col items-center justify-center gap-2 min-h-[90px] bg-[var(--ad-background)] border border-[var(--ad-border)] rounded-lg p-3 text-center hover:bg-[var(--ad-card)] hover:border-[var(--ad-green)] hover:-translate-y-px hover:shadow-md transition-all"
                >
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                    <Icon className="h-[18px] w-[18px]" style={{ color: fg }} />
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-[var(--ad-text-secondary)]">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Social Distribution */}
          <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-[var(--ad-shadow-lg)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--ad-border)]">
              <h3 className="text-[15px] font-bold text-[var(--ad-text-primary)]">Social Distribution</h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-[3px] rounded-full">
                <span className="w-[6px] h-[6px] rounded-full bg-emerald-500" />
                All Active
              </span>
            </div>
            <ul>
              {[
                { name: "X / Twitter", count: 23, bg: "#000",     letter: "𝕏", textColor: "white", fontWeight: 800, fontSize: "11px" },
                { name: "Facebook",    count: 18, bg: "#1877F2",  letter: "f", textColor: "white", fontWeight: 700, fontSize: "14px" },
                { name: "YouTube",     count: 5,  bg: "#FF0000",  letter: "▶", textColor: "white", fontWeight: 600, fontSize: "12px" },
                { name: "WhatsApp",    count: 41, bg: "#25D366",  letter: "W", textColor: "white", fontWeight: 700, fontSize: "12px" },
              ].map((s, i, arr) => (
                <li
                  key={s.name}
                  className={`flex items-center gap-2.5 px-5 py-2.5 hover:bg-[var(--ad-background)] transition-colors ${
                    i < arr.length - 1 ? "border-b border-[var(--ad-border)]" : ""
                  }`}
                >
                  <div
                    className="h-7 w-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: s.bg, color: s.textColor, fontWeight: s.fontWeight, fontSize: s.fontSize }}
                  >
                    {s.letter}
                  </div>
                  <div className="flex-1 text-[13px] font-semibold text-[var(--ad-text-primary)]">{s.name}</div>
                  <div className="font-mono text-[12px] text-[var(--ad-text-muted)]">{s.count} today</div>
                  <div className="w-[7px] h-[7px] rounded-full bg-emerald-500 shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Chart + Top Categories + Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Publishing Activity (7-day bars) */}
        <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-[var(--ad-shadow-lg)] overflow-hidden">
          <div className="flex items-start justify-between px-5 py-4 border-b border-[var(--ad-border)]">
            <div>
              <h3 className="text-[15px] font-bold text-[var(--ad-text-primary)]">Publishing Activity</h3>
              <p className="text-[11px] text-[var(--ad-text-muted)] mt-0.5">Last 7 days</p>
            </div>
            <div className="text-right">
              <div className="text-[24px] font-extrabold leading-none text-[var(--ad-text-primary)]">{weekPosts}</div>
              <div className="font-mono text-[10px] text-[var(--ad-text-muted)] mt-1">TOTAL POSTS</div>
            </div>
          </div>
          <div className="px-5 pt-4 pb-5">
            <p className="text-[11px] text-[var(--ad-text-muted)] mb-3">Posts per day</p>
            <div className="flex items-end gap-1.5 h-20">
              {dayBins.map((b, i) => {
                const isToday = i === dayBins.length - 1;
                const h = `${Math.max(8, (b.count / maxDay) * 100)}%`;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t transition-colors ${
                        isToday ? "bg-[var(--ad-green)]" : "bg-[var(--ad-green-light)] hover:bg-[var(--ad-green)]"
                      }`}
                      style={{ height: h }}
                      title={`${b.count} posts on ${format(b.date, "MMM d")}`}
                    />
                    <span
                      className={`font-mono text-[9px] ${
                        isToday ? "text-[var(--ad-green)] font-bold" : "text-[var(--ad-text-muted)]"
                      }`}
                    >
                      {format(b.date, "EEEEE")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-[var(--ad-shadow-lg)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ad-border)]">
            <h3 className="text-[15px] font-bold text-[var(--ad-text-primary)]">Top Categories</h3>
            <Link
              href="/admin/categories"
              className="flex items-center gap-1 text-[12.5px] font-semibold text-[var(--ad-green)] hover:text-[var(--ad-green-hover)]"
            >
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="px-5 py-4 space-y-2.5">
            {topCategories.length === 0 ? (
              <p className="text-sm text-[var(--ad-text-muted)] text-center py-4">No categories yet</p>
            ) : (
              topCategories.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="font-bangla text-[12.5px] font-medium text-[var(--ad-text-primary)] flex-1 truncate">
                    {c.name}
                  </div>
                  <div className="w-20 h-1.5 bg-[var(--ad-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(c.count / maxCatCount) * 100}%`, background: c.color }}
                    />
                  </div>
                  <div className="font-mono text-[11px] text-[var(--ad-text-muted)] w-5 text-right">{c.count}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Last Reports / Status Table */}
        <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-[var(--ad-shadow-lg)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ad-border)]">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-[var(--ad-text-primary)]">Last Reports</h3>
              <span className="text-[11px] font-semibold px-2 py-[2px] rounded-full bg-[var(--ad-background)] border border-[var(--ad-border)] text-[var(--ad-text-secondary)]">
                {totalPosts} total
              </span>
            </div>
            <button
              type="button"
              className="bg-[var(--ad-green)] hover:bg-[var(--ad-green-hover)] text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1 transition-colors"
            >
              <TrendingUp className="h-3 w-3" /> Export
            </button>
          </div>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-[var(--ad-background)]">
                <th className="text-left px-5 py-2 font-bold text-[10px] tracking-[0.07em] uppercase text-[var(--ad-text-muted)] border-b border-[var(--ad-border)]">
                  Title
                </th>
                <th className="text-left px-2 py-2 font-bold text-[10px] tracking-[0.07em] uppercase text-[var(--ad-text-muted)] border-b border-[var(--ad-border)]">
                  Date
                </th>
                <th className="text-left px-2 py-2 font-bold text-[10px] tracking-[0.07em] uppercase text-[var(--ad-text-muted)] border-b border-[var(--ad-border)]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { title: "System Report",  date: format(today, "dd.MM.yyyy"), status: "Completed",  bg: "bg-emerald-100", fg: "text-emerald-700" },
                { title: "Weekly Digest",  date: format(subDays(today, 7), "dd.MM.yyyy"), status: "In Progress", bg: "bg-amber-100",   fg: "text-amber-700" },
                { title: "Monthly Recap",  date: format(subDays(today, 14), "dd.MM.yyyy"), status: "Pending",    bg: "bg-red-100",     fg: "text-red-700" },
              ].map((r, i, arr) => (
                <tr
                  key={r.title}
                  className={`hover:bg-[var(--ad-paper)] transition-colors ${
                    i < arr.length - 1 ? "border-b border-[var(--ad-border)]" : ""
                  }`}
                >
                  <td className="px-5 py-2.5 font-medium text-[var(--ad-text-primary)]">{r.title}</td>
                  <td className="px-2 py-2.5 font-mono text-[11px] text-[var(--ad-text-muted)]">{r.date}</td>
                  <td className="px-2 py-2.5">
                    <span className={`text-[10px] font-bold px-2 py-[3px] rounded ${r.bg} ${r.fg}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
