"use client";

import Link from "next/link";
import {
  FileText,
  CheckCircle,
  Clock,
  Tags,
  MapPin,
  MapPinned,
  TrendingUp,
  ArrowRight,
  Eye,
  BarChart3,
  Calendar,
  PenLine,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Stat = {
  labelKey: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconText: string;
  trend: string | null;
  cardColor: string;
  href: string;
};

type RecentPost = {
  id: string;
  title: string;
  status: string;
  category: { name: string };
  district: { name: string };
  updatedAt: Date;
};

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const BAR_HEIGHTS = [35, 55, 70, 45, 80, 60, 90];

type DashboardClientProps = {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  categories: number;
  districts: number;
  upazilas: number;
  recentPosts: RecentPost[];
};

export function DashboardClient({
  totalPosts,
  publishedPosts,
  draftPosts,
  categories,
  districts,
  upazilas,
  recentPosts,
}: DashboardClientProps) {
  const { t } = useLanguage();

  const primaryStats: Stat[] = [
    { labelKey: "dashboard_total_posts", value: totalPosts, icon: FileText, iconBg: "bg-[var(--ad-breaking)]/10", iconText: "text-[var(--ad-breaking)]", trend: "+124", cardColor: "bg-[var(--ad-breaking)]", href: "/admin/posts" },
    { labelKey: "dashboard_published", value: publishedPosts, icon: CheckCircle, iconBg: "bg-[var(--ad-success)]/10", iconText: "text-[var(--ad-success)]", trend: "+59", cardColor: "bg-[var(--ad-success)]", href: "/admin/posts" },
    { labelKey: "dashboard_drafts", value: draftPosts, icon: Clock, iconBg: "bg-[var(--ad-border)]/45", iconText: "text-[var(--ad-text-secondary)]", trend: null, cardColor: "bg-[var(--ad-text-muted)]", href: "/admin/posts" },
    { labelKey: "dashboard_categories", value: categories, icon: Tags, iconBg: "bg-[var(--ad-blue)]/10", iconText: "text-[var(--ad-blue)]", trend: "+3", cardColor: "bg-[var(--ad-blue)]", href: "/admin/categories" },
    { labelKey: "dashboard_districts", value: districts, icon: MapPin, iconBg: "bg-[var(--ad-warning)]/10", iconText: "text-[var(--ad-warning)]", trend: "+2", cardColor: "bg-[var(--ad-warning)]", href: "/admin/districts" },
    { labelKey: "dashboard_upazilas", value: upazilas, icon: MapPinned, iconBg: "bg-[var(--ad-purple)]/10", iconText: "text-[var(--ad-purple)]", trend: null, cardColor: "bg-[var(--ad-purple)]", href: "/admin/upazilas" },
  ];

  return (
    <div className="w-full min-w-0 space-y-5 pb-8 font-sans">
      
      {/* Tooltip Provider for low text UX */}
      <TooltipProvider>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-extrabold text-[var(--ad-text-primary)] tracking-tight">{t("breadcrumb_dashboard")}</h1>
          <div className="flex items-center gap-1.5 text-xs text-[var(--ad-text-muted)] font-mono font-bold">
            <Calendar className="h-3.5 w-3.5 text-[var(--ad-text-secondary)]" />
            {format(new Date(), "MMM dd, yyyy")}
          </div>
        </div>

        {/* Publishing Overview Strip */}
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-xs uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono font-bold">
              {t("dashboard_publishing_overview")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--ad-border)]">
              {[
                { period: t("dashboard_today"), label: "dashboard_todays_publishes", published: publishedPosts, total: totalPosts, trend: "+2" },
                { period: t("dashboard_this_week"), label: "dashboard_this_week", published: publishedPosts, total: totalPosts, trend: "+59" },
                { period: t("dashboard_last_30_days"), label: "dashboard_last_30_days", published: publishedPosts, total: totalPosts, trend: "+124" },
              ].map((item, i) => (
                <div key={i} className="py-4 px-4 first:pt-0 last:pb-0 sm:py-0 sm:first:pt-0 sm:last:pb-0">
                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-3 border ${i === 0 ? "bg-[var(--ad-success)]/10 text-[var(--ad-success)] border-[var(--ad-green)]/10" : i === 1 ? "bg-[var(--ad-warning)]/10 text-[var(--ad-warning)] border-[var(--ad-amber)]/10" : "bg-[var(--ad-blue)]/10 text-[var(--ad-blue)] border-[var(--ad-blue)]/10"}`}>
                    {item.period}
                  </div>
                  <div className="text-3xl font-black text-[var(--ad-text-primary)] tracking-tight">{item.published}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[var(--ad-text-secondary)] font-medium">{item.total} total</span>
                    {item.trend && (
                      <Tooltip delayDuration={50}>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[var(--ad-success)] bg-[var(--ad-success)]/10 px-1.5 py-0.5 rounded-full border border-[var(--ad-green)]/10 cursor-help">
                            <TrendingUp className="h-3 w-3" />{item.trend}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="shadow-premium py-1 px-2.5">
                          Growth factor
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {primaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Tooltip key={stat.labelKey} delayDuration={50}>
                <TooltipTrigger asChild>
                  <Link
                    href={stat.href}
                    className="group bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-2xl p-4 shadow-premium hover:shadow-lg transition-all hover:-translate-y-0.5 relative overflow-hidden flex flex-col justify-between min-h-[110px]"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-[3px] ${stat.cardColor || "bg-[var(--ad-primary)]"}`} />
                    <div className="flex items-start justify-between">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.iconBg} ${stat.iconText} border border-transparent group-hover:border-current/10 transition-colors`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      {stat.trend && (
                        <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${stat.trend === "+0" ? "bg-[var(--ad-border)]/40 text-[var(--ad-text-secondary)] border-[var(--ad-border)]" : "bg-[var(--ad-success)]/10 text-[var(--ad-success)] border-[var(--ad-green)]/10"}`}>
                          {stat.trend}
                        </span>
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-black text-[var(--ad-text-primary)] leading-none tracking-tight">{stat.value}</div>
                      <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[var(--ad-text-muted)] mt-1.5 truncate">
                        {t(stat.labelKey as Parameters<typeof t>[0])}
                      </div>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="shadow-premium py-1 px-2.5">
                  Manage {t(stat.labelKey as Parameters<typeof t>[0])}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Two-col: Articles + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* Articles Panel */}
          <Card className="overflow-hidden">
            <CardHeader className="py-4 border-b border-[var(--ad-border)] bg-[var(--ad-background)]/20 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[var(--ad-primary)]" />
                <CardTitle className="text-xs uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono font-bold">{t("dashboard_recent_articles")}</CardTitle>
                <span className="bg-[var(--ad-border)]/30 border border-[var(--ad-border)] text-[var(--ad-text-primary)] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">{recentPosts.length} total</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--ad-border)]">
                {recentPosts.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-xs text-[var(--ad-text-muted)] font-medium">{t("dashboard_no_posts")}</p>
                  </div>
                ) : (
                  recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between gap-3.5 px-5 py-3.5 hover:bg-[var(--ad-background)]/20 transition-colors group">
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <span className={`flex-shrink-0 flex h-2 w-2 rounded-full ${post.status === "published" ? "bg-[var(--ad-green)] animate-pulse" : "bg-[var(--ad-text-muted)]"}`} />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[13.5px] font-bold text-[var(--ad-text-primary)] truncate group-hover:text-[var(--ad-primary)] transition-colors font-bangla">
                            <Link href={`/admin/posts/edit/${post.id}`}>{post.title}</Link>
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                            <span className="text-[10px] font-bold text-[var(--ad-green)] bg-[var(--ad-green-light)] px-1.5 py-0.5 rounded border border-[var(--ad-green)]/10 font-bangla">{post.category.name}</span>
                            <span className="text-[var(--ad-text-muted)] text-[10px] opacity-50">·</span>
                            <span className="text-[10.5px] text-[var(--ad-text-secondary)] font-semibold font-bangla">{post.district.name}</span>
                            <span className="text-[var(--ad-text-muted)] text-[10px] opacity-50">·</span>
                            <span className="text-[10px] text-[var(--ad-text-muted)] font-mono">{format(post.updatedAt, "MMM dd · HH:mm")}</span>
                          </div>
                        </div>
                      </div>

                      <Tooltip delayDuration={50}>
                        <TooltipTrigger asChild>
                          <Button asChild variant="outline" size="sm" className="h-8 px-2.5 rounded-lg shrink-0">
                            <Link href={`/admin/posts/edit/${post.id}`}>
                              <PenLine className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="shadow-premium py-1 px-2.5">
                          Edit Post
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="py-3.5">
                <CardTitle className="text-xs uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: t("dashboard_new_post"), href: "/admin/posts/create", icon: PenLine, color: "bg-[var(--ad-breaking)]/10 text-[var(--ad-breaking)]" },
                    { label: t("dashboard_media"), href: "/admin/media", icon: ImageIcon, color: "bg-[var(--ad-blue)]/10 text-[var(--ad-blue)]" },
                    { label: t("nav_categories"), href: "/admin/categories", icon: Tags, color: "bg-[var(--ad-success)]/10 text-[var(--ad-success)]" },
                    { label: t("dashboard_view_site"), href: "/", icon: Eye, color: "bg-[var(--ad-purple)]/10 text-[var(--ad-purple)]" },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link key={action.label} href={action.href} className="flex flex-col items-center gap-2 bg-[var(--ad-background)]/40 border border-[var(--ad-border)] rounded-xl p-3 hover:bg-[var(--ad-card)] hover:border-[var(--ad-primary)] hover:shadow-premium transition-all group">
                        <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center ${action.color} border border-current/5`}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] truncate w-full text-center">{action.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Social Distribution */}
            <Card className="overflow-hidden">
              <CardHeader className="py-3.5 border-b border-[var(--ad-border)] bg-[var(--ad-background)]/20 flex flex-row items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono font-bold">{t("dashboard_social_distribution")}</CardTitle>
                <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[var(--ad-green)] bg-[var(--ad-green-light)] px-2 py-0.5 rounded-full border border-[var(--ad-green)]/10">{t("dashboard_all_active")}</span>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-[var(--ad-border)]">
                  {[
                    { name: "X / Twitter", posts: 23, color: "bg-black" },
                    { name: "Facebook", posts: 18, color: "bg-[#1877F2]" },
                    { name: "Instagram", posts: 7, color: "bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888]" },
                    { name: "LinkedIn", posts: 12, color: "bg-[#0a66c2]" },
                  ].map((s) => (
                    <div key={s.name} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[var(--ad-background)]/20 transition-colors">
                      <div className={`h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-white text-[10px] font-bold ${s.color} shadow-sm`}>
                        {s.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[var(--ad-text-primary)]">{s.name}</p>
                        <p className="text-[10px] text-[var(--ad-text-muted)] font-mono mt-0.5">{s.posts} shared</p>
                      </div>
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--ad-green)] flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Publishing Activity */}
          <Card>
            <CardHeader className="py-4 border-b border-[var(--ad-border)] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono font-bold">{t("dashboard_publishing_activity")}</CardTitle>
                <p className="text-[10px] text-[var(--ad-text-muted)] font-mono font-semibold mt-0.5">{t("dashboard_last_7_days")}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-[var(--ad-text-primary)] leading-none">{totalPosts}</div>
                <div className="text-[8px] text-[var(--ad-text-muted)] font-mono font-bold tracking-widest mt-1">TOTAL</div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-end gap-2 h-20">
                {BAR_HEIGHTS.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
                    <div className={`w-full rounded-t-md transition-all ${i === 6 ? "bg-[var(--ad-primary)] shadow-[0_-2px_8px_var(--ad-primary)]" : "bg-[var(--ad-success)]/20 group-hover:bg-[var(--ad-primary)]"}`} style={{ height: `${h}%` }} />
                    <span className={`text-[9px] font-mono font-bold ${i === 6 ? "text-[var(--ad-primary)]" : "text-[var(--ad-text-muted)]"}`}>{DAYS[i]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card>
            <CardHeader className="py-4 border-b border-[var(--ad-border)] flex flex-row items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono font-bold">Top Categories</CardTitle>
              <Link href="/admin/categories" className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-[var(--ad-primary)] hover:underline">All →</Link>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              {[
                { name: "Politics", value: 5, total: 12, color: "bg-[var(--ad-brand)]" },
                { name: "Economy", value: 3, total: 12, color: "bg-[var(--ad-success)]" },
                { name: "International", value: 2, total: 12, color: "bg-[var(--ad-blue)]" },
                { name: "Sports", value: 1, total: 12, color: "bg-[var(--ad-warning)]" },
                { name: "Entertainment", value: 1, total: 12, color: "bg-[var(--ad-purple)]" },
              ].map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-[13px] text-[var(--ad-text-primary)] font-bold flex-1 font-bangla">{cat.name}</span>
                  <div className="w-20 h-1.5 bg-[var(--ad-border)]/35 rounded-full overflow-hidden shrink-0">
                    <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${(cat.value / cat.total) * 100}%` }} />
                  </div>
                  <span className="text-[10.5px] text-[var(--ad-text-secondary)] font-mono font-bold w-5 text-right shrink-0">{cat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Last Reports */}
          <Card className="overflow-hidden">
            <CardHeader className="py-4 border-b border-[var(--ad-border)] flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs uppercase tracking-wider text-[var(--ad-text-secondary)] font-mono font-bold">Reports</CardTitle>
                <span className="bg-[var(--ad-border)]/30 border border-[var(--ad-border)] text-[var(--ad-text-primary)] text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full">12 total</span>
              </div>
              <Button size="sm" variant="outline" className="h-7.5 px-3 rounded-lg text-[10.5px] font-mono font-bold uppercase tracking-wider">
                <ArrowRight className="h-3 w-3 -rotate-90 shrink-0" /> Export
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-2 text-[9.5px]">Title</TableHead>
                    <TableHead className="px-3 py-2 text-[9.5px]">Date</TableHead>
                    <TableHead className="px-3 py-2 text-[9.5px] text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { title: "System Report", date: "23.02.2026", status: "Completed", color: "bg-[var(--ad-success)]/10 text-[var(--ad-success)] border-[var(--ad-green)]/10" },
                    { title: "ACA Report", date: "15.02.2026", status: "In Progress", color: "bg-[var(--ad-warning)]/10 text-[var(--ad-warning)] border-[var(--ad-amber)]/10" },
                    { title: "Weekly Digest", date: "12.02.2026", status: "Poor", color: "bg-[var(--ad-breaking)]/10 text-[var(--ad-breaking)] border-[var(--ad-brand)]/10" },
                  ].map((row) => (
                    <TableRow key={row.title}>
                      <TableCell className="px-4 py-2.5 font-bold text-[12.5px]">{row.title}</TableCell>
                      <TableCell className="px-3 py-2.5 text-[10px] text-[var(--ad-text-muted)] font-mono">{row.date}</TableCell>
                      <TableCell className="px-3 py-2.5 text-right">
                        <span className={`text-[9.5px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${row.color}`}>{row.status}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    </div>
  );
}
