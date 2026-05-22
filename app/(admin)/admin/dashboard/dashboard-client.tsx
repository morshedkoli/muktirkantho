"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  FileText, CheckCircle2, Clock3, Tags, MapPin, Users2,
  Calendar, ArrowRight, ArrowUpRight, Image as ImageIcon,
  Globe, Pencil, TrendingUp,
} from "lucide-react";
import { useLang } from "@/lib/admin-i18n";

type DayBin = { date: Date; count: number; label: string };
type CategoryItem = { name: string; count: number; color: string };
type RecentPost = {
  id: string; title: string; status: string;
  category: { name: string };
  district: { name: string };
  updatedAt: Date;
};

type Props = {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  categoriesCount: number;
  districtsCount: number;
  upazilasCount: number;
  todayPosts: number;
  weekPosts: number;
  monthPosts: number;
  recentPosts: RecentPost[];
  topCategories: CategoryItem[];
  maxCatCount: number;
  dayBins: DayBin[];
  maxDay: number;
  dateRange: string;
  today: Date;
};

export function DashboardClient({
  totalPosts, publishedPosts, draftPosts, categoriesCount, districtsCount,
  upazilasCount, todayPosts, weekPosts, monthPosts, recentPosts, topCategories,
  maxCatCount, dayBins, maxDay, dateRange, today,
}: Props) {
  const { t } = useLang();

  const cards = [
    { labelKey: "totalPosts" as const,  value: totalPosts,      Icon: FileText,    accent: "var(--ad-brand)",      bg: "var(--ad-brand-light)",  delta: "+12" },
    { labelKey: "published" as const,   value: publishedPosts,  Icon: CheckCircle2, accent: "var(--ad-green)",      bg: "var(--ad-green-light)",  delta: `+${publishedPosts}` },
    { labelKey: "drafts" as const,      value: draftPosts,      Icon: Clock3,      accent: "var(--ad-text-muted)", bg: "var(--ad-paper-2)",      delta: "+0", neutral: true },
    { labelKey: "categories" as const,  value: categoriesCount, Icon: Tags,        accent: "var(--ad-blue)",       bg: "var(--ad-blue-light)",   delta: "+3" },
    { labelKey: "districts" as const,   value: districtsCount,  Icon: MapPin,      accent: "var(--ad-amber)",      bg: "var(--ad-amber-light)",  delta: "+2" },
    { labelKey: "upazilas" as const,    value: upazilasCount,   Icon: Users2,      accent: "var(--ad-purple)",     bg: "var(--ad-purple-light)", delta: "+0", neutral: true },
  ];

  const overviewItems = [
    {
      labelKey: "today" as const,
      value: todayPosts,
      sub: `${publishedPosts} ${t("totalPublished")}`,
      hint: `${draftPosts} ${t("draftsPending")}`,
      pill: "var(--ad-green-light)", pillText: "var(--ad-green)", trend: "+2",
    },
    {
      labelKey: "thisWeek" as const,
      value: weekPosts,
      sub: `${weekPosts} ${t("liveArticles")}`,
      hint: `${t("across")} ${categoriesCount} ${t("categoriesLabel")}`,
      pill: "var(--ad-amber-light)", pillText: "#92400E", trend: `+${weekPosts}`,
    },
    {
      labelKey: "last30Days" as const,
      value: monthPosts,
      sub: `${districtsCount} ${t("districtsCovered")}`,
      hint: `${upazilasCount} ${t("upazilasActive")}`,
      pill: "var(--ad-blue-light)", pillText: "var(--ad-blue)", trend: `+${monthPosts}`,
    },
  ];

  const quickActions = [
    { labelKey: "newPost" as const,    icon: Pencil,    href: "/admin/posts/create", bg: "var(--ad-brand-light)",  fg: "var(--ad-brand)" },
    { labelKey: "media" as const,      icon: ImageIcon, href: "/admin/media",        bg: "var(--ad-blue-light)",   fg: "var(--ad-blue)" },
    { labelKey: "categories" as const, icon: Tags,      href: "/admin/categories",   bg: "var(--ad-green-light)",  fg: "var(--ad-green)" },
    { labelKey: "viewSite" as const,   icon: Globe,     href: "/",                   bg: "var(--ad-purple-light)", fg: "var(--ad-purple)" },
  ];

  const filterTabs = [
    t("filterAll"), t("filterLive"), t("filterDraft"), t("filterScheduled"),
  ];

  const reports = [
    { titleKey: "systemReport" as const, date: format(today, "dd.MM.yyyy"),                    statusKey: "completed" as const,   bg: "bg-emerald-100", fg: "text-emerald-700" },
    { titleKey: "weeklyDigest" as const, date: format(new Date(today.getTime() - 7*86400000), "dd.MM.yyyy"),  statusKey: "inProgress" as const,  bg: "bg-amber-100",   fg: "text-amber-700" },
    { titleKey: "monthlyRecap" as const, date: format(new Date(today.getTime() - 14*86400000), "dd.MM.yyyy"), statusKey: "pending" as const,     bg: "bg-red-100",     fg: "text-red-700" },
  ];

  return (
    <div className="space-y-5">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-[22px] font-bold text-[var(--ad-text-primary)]">{t("dashboard")}</h1>
        <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--ad-text-muted)]">
          <Calendar className="h-3.5 w-3.5" />
          <span>{dateRange}</span>
        </div>
      </div>

      {/* PUBLISHING OVERVIEW */}
      <section className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl p-5 sm:p-6 shadow-[var(--ad-shadow-lg)]">
        <h2 className="text-[15px] font-bold text-[var(--ad-text-primary)] mb-4">{t("publishingOverview")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-[var(--ad-border)]">
          {overviewItems.map((p, i) => (
            <div key={p.labelKey} className={`${i === 0 ? "sm:pr-6" : i === 2 ? "sm:pl-6" : "sm:px-6"} py-4 sm:py-0 first:pt-0 last:pb-0`}>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-[3px] rounded-full mb-2.5"
                style={{ background: p.pill, color: p.pillText }}>
                {t(p.labelKey)}
              </span>
              <div className="text-[32px] font-extrabold text-[var(--ad-text-primary)] leading-none mb-1">{p.value}</div>
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
        {cards.map(({ labelKey, value, Icon, accent, bg, delta, neutral }) => (
          <div key={labelKey} className="relative bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl p-4 shadow-[var(--ad-shadow-lg)] hover:-translate-y-px transition-transform">
            <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl" style={{ background: accent }} />
            <div className="flex items-start justify-between mb-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon className="h-[18px] w-[18px]" style={{ color: accent }} />
              </div>
              <span className={`text-[10.5px] font-semibold px-1.5 py-[2px] rounded-full ${neutral ? "bg-[var(--ad-paper-2)] text-[var(--ad-text-muted)]" : "bg-emerald-100 text-emerald-700"}`}>
                {delta}
              </span>
            </div>
            <div className="text-[28px] font-extrabold text-[var(--ad-text-primary)] leading-none mb-1">{value}</div>
            <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[var(--ad-text-muted)]">{t(labelKey)}</div>
          </div>
        ))}
      </section>

      {/* MAIN ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

        {/* Recent Articles */}
        <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-[var(--ad-shadow-lg)] overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--ad-border)]">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--ad-green)]" />
              <h3 className="text-[15px] font-bold text-[var(--ad-text-primary)]">{t("recentArticles")}</h3>
              <span className="text-[11px] font-semibold px-2 py-[2px] rounded-full bg-[var(--ad-background)] border border-[var(--ad-border)] text-[var(--ad-text-secondary)]">
                {totalPosts} {t("total")}
              </span>
            </div>
            <Link href="/admin/posts" className="flex items-center gap-1 text-[12.5px] font-semibold text-[var(--ad-green)] hover:text-[var(--ad-green-hover)]">
              {t("viewAll")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 px-5 py-2.5 border-b border-[var(--ad-border)] bg-[var(--ad-background)]">
            {filterTabs.map((label, i) => (
              <button key={label} className={`text-[12px] font-semibold px-3 py-[5px] rounded-full transition-all ${
                i === 0 ? "bg-[var(--ad-green)] text-white" : "text-[var(--ad-text-secondary)] hover:bg-[var(--ad-card)] hover:border-[var(--ad-border)] border border-transparent"
              }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Article rows */}
          <div>
            {recentPosts.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-[var(--ad-text-muted)]">{t("noArticlesYet")}</p>
                <Link href="/admin/posts/create" className="inline-flex items-center gap-1 mt-2 text-[13px] font-semibold text-[var(--ad-green)]">
                  {t("createOne")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              recentPosts.map((post, idx) => {
                const live = post.status === "published";
                return (
                  <div key={post.id} className={`flex items-center gap-3.5 px-5 py-3.5 hover:bg-[var(--ad-paper)] transition-colors ${idx < recentPosts.length - 1 ? "border-b border-[var(--ad-border)]" : ""}`}>
                    <span className={`shrink-0 inline-flex items-center gap-1 text-[9.5px] font-bold tracking-[0.06em] uppercase px-2 py-[3px] rounded text-white ${live ? "bg-[var(--ad-green)]" : "bg-[var(--ad-amber)]"}`}>
                      <span className={`w-[5px] h-[5px] rounded-full bg-white ${live ? "animate-pulse" : ""}`} />
                      {live ? t("liveBadge") : t("draftBadge")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bangla text-[14px] font-semibold text-[var(--ad-text-primary)] truncate">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10.5px] font-semibold px-2 py-[2px] rounded bg-[var(--ad-green-light)] text-[var(--ad-green)]">{post.category.name}</span>
                        <span className="text-[10px] text-[var(--ad-border-strong)]">·</span>
                        <span className="font-mono text-[11px] text-[var(--ad-text-muted)]">{post.district.name}</span>
                        <span className="text-[10px] text-[var(--ad-border-strong)]">·</span>
                        <span className="font-mono text-[11px] text-[var(--ad-text-muted)]">{format(post.updatedAt, "MMM d · HH:mm")}</span>
                      </div>
                    </div>
                    <Link href={`/admin/posts/edit/${post.id}`}
                      className="shrink-0 text-[11.5px] font-semibold text-[var(--ad-text-secondary)] hover:text-[var(--ad-green)] bg-[var(--ad-background)] hover:bg-[var(--ad-green-light)] border border-[var(--ad-border)] hover:border-[var(--ad-green)] px-3 py-[5px] rounded-md transition-all flex items-center gap-1">
                      {t("editBtn")} <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Quick Actions */}
          <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-[var(--ad-shadow-lg)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--ad-border)]">
              <h3 className="text-[15px] font-bold text-[var(--ad-text-primary)]">{t("quickActions")}</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5 p-4">
              {quickActions.map(({ labelKey, icon: Icon, href, bg, fg }) => (
                <Link key={labelKey} href={href}
                  className="flex flex-col items-center justify-center gap-2 min-h-[90px] bg-[var(--ad-background)] border border-[var(--ad-border)] rounded-lg p-3 text-center hover:bg-[var(--ad-card)] hover:border-[var(--ad-green)] hover:-translate-y-px hover:shadow-md transition-all">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                    <Icon className="h-[18px] w-[18px]" style={{ color: fg }} />
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-[var(--ad-text-secondary)]">{t(labelKey)}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Social Distribution */}
          <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-[var(--ad-shadow-lg)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--ad-border)]">
              <h3 className="text-[15px] font-bold text-[var(--ad-text-primary)]">{t("socialDistribution")}</h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-[3px] rounded-full">
                <span className="w-[6px] h-[6px] rounded-full bg-emerald-500" />
                {t("allActive")}
              </span>
            </div>
            <ul>
              {[
                { name: "X / Twitter", count: 23, bg: "#000",    letter: "𝕏", textColor: "white", fontWeight: 800, fontSize: "11px" },
                { name: "Facebook",    count: 18, bg: "#1877F2", letter: "f", textColor: "white", fontWeight: 700, fontSize: "14px" },
                { name: "YouTube",     count: 5,  bg: "#FF0000", letter: "▶", textColor: "white", fontWeight: 600, fontSize: "12px" },
                { name: "WhatsApp",    count: 41, bg: "#25D366", letter: "W", textColor: "white", fontWeight: 700, fontSize: "12px" },
              ].map((s, i, arr) => (
                <li key={s.name} className={`flex items-center gap-2.5 px-5 py-2.5 hover:bg-[var(--ad-background)] transition-colors ${i < arr.length - 1 ? "border-b border-[var(--ad-border)]" : ""}`}>
                  <div className="h-7 w-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: s.bg, color: s.textColor, fontWeight: s.fontWeight, fontSize: s.fontSize }}>
                    {s.letter}
                  </div>
                  <div className="flex-1 text-[13px] font-semibold text-[var(--ad-text-primary)]">{s.name}</div>
                  <div className="font-mono text-[12px] text-[var(--ad-text-muted)]">{s.count} {t("todayCount")}</div>
                  <div className="w-[7px] h-[7px] rounded-full bg-emerald-500 shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Publishing Activity */}
        <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-[var(--ad-shadow-lg)] overflow-hidden">
          <div className="flex items-start justify-between px-5 py-4 border-b border-[var(--ad-border)]">
            <div>
              <h3 className="text-[15px] font-bold text-[var(--ad-text-primary)]">{t("publishingActivity")}</h3>
              <p className="text-[11px] text-[var(--ad-text-muted)] mt-0.5">{t("last7Days")}</p>
            </div>
            <div className="text-right">
              <div className="text-[24px] font-extrabold leading-none text-[var(--ad-text-primary)]">{weekPosts}</div>
              <div className="font-mono text-[10px] text-[var(--ad-text-muted)] mt-1">{t("totalPostsUpper")}</div>
            </div>
          </div>
          <div className="px-5 pt-4 pb-5">
            <p className="text-[11px] text-[var(--ad-text-muted)] mb-3">{t("postsPerDay")}</p>
            <div className="flex items-end gap-1.5 h-20">
              {dayBins.map((b, i) => {
                const isToday = i === dayBins.length - 1;
                const h = `${Math.max(8, (b.count / maxDay) * 100)}%`;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full rounded-t transition-colors ${isToday ? "bg-[var(--ad-green)]" : "bg-[var(--ad-green-light)] hover:bg-[var(--ad-green)]"}`}
                      style={{ height: h }} title={`${b.count} ${t("postsPerDay")} - ${format(b.date, "MMM d")}`} />
                    <span className={`font-mono text-[9px] ${isToday ? "text-[var(--ad-green)] font-bold" : "text-[var(--ad-text-muted)]"}`}>
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
            <h3 className="text-[15px] font-bold text-[var(--ad-text-primary)]">{t("topCategories")}</h3>
            <Link href="/admin/categories" className="flex items-center gap-1 text-[12.5px] font-semibold text-[var(--ad-green)] hover:text-[var(--ad-green-hover)]">
              {t("filterAll")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="px-5 py-4 space-y-2.5">
            {topCategories.length === 0 ? (
              <p className="text-sm text-[var(--ad-text-muted)] text-center py-4">{t("noCategoriesYet")}</p>
            ) : (
              topCategories.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="font-bangla text-[12.5px] font-medium text-[var(--ad-text-primary)] flex-1 truncate">{c.name}</div>
                  <div className="w-20 h-1.5 bg-[var(--ad-border)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(c.count / maxCatCount) * 100}%`, background: c.color }} />
                  </div>
                  <div className="font-mono text-[11px] text-[var(--ad-text-muted)] w-5 text-right">{c.count}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Last Reports */}
        <div className="bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-xl shadow-[var(--ad-shadow-lg)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ad-border)]">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-[var(--ad-text-primary)]">{t("lastReports")}</h3>
              <span className="text-[11px] font-semibold px-2 py-[2px] rounded-full bg-[var(--ad-background)] border border-[var(--ad-border)] text-[var(--ad-text-secondary)]">
                {totalPosts} {t("total")}
              </span>
            </div>
            <button type="button" className="bg-[var(--ad-green)] hover:bg-[var(--ad-green-hover)] text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1 transition-colors">
              <TrendingUp className="h-3 w-3" /> {t("exportBtn")}
            </button>
          </div>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-[var(--ad-background)]">
                {(["colTitle", "colDate", "colStatus"] as const).map((k) => (
                  <th key={k} className="text-left px-5 py-2 font-bold text-[10px] tracking-[0.07em] uppercase text-[var(--ad-text-muted)] border-b border-[var(--ad-border)]">
                    {t(k)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i, arr) => (
                <tr key={r.titleKey} className={`hover:bg-[var(--ad-paper)] transition-colors ${i < arr.length - 1 ? "border-b border-[var(--ad-border)]" : ""}`}>
                  <td className="px-5 py-2.5 font-medium text-[var(--ad-text-primary)]">{t(r.titleKey)}</td>
                  <td className="px-2 py-2.5 font-mono text-[11px] text-[var(--ad-text-muted)]">{r.date}</td>
                  <td className="px-2 py-2.5">
                    <span className={`text-[10px] font-bold px-2 py-[3px] rounded ${r.bg} ${r.fg}`}>{t(r.statusKey)}</span>
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
