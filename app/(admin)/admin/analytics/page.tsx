import { AdminShell } from "@/components/admin/admin-shell";
import { TrendingUp, Users, Eye, Clock, ArrowUp, ArrowDown, Download } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <AdminShell
      title="Analytics Hub"
      description="Track readership patterns, social performance, and editorial effectiveness"
      actions={
        <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--ad-border)] px-4 py-2.5 text-sm font-semibold text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-all font-editorial-mono tracking-wider uppercase">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      }
    >
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Page Views", value: "284.5K", change: "+12.3%", icon: Eye, up: true },
          { label: "Active Readers", value: "1,284", change: "+8.1%", icon: Users, up: true },
          { label: "Avg. Session", value: "4m 32s", change: "-2.1%", icon: Clock, up: false },
          { label: "Bounce Rate", value: "38.2%", change: "-5.4%", icon: TrendingUp, up: true },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">{kpi.label}</span>
                <Icon className="h-4 w-4 text-[var(--ad-text-secondary)]" />
              </div>
              <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">{kpi.value}</p>
              <div className={`flex items-center gap-1 mt-1 font-editorial-mono text-[10px] tracking-wider ${kpi.up ? "text-[var(--ad-success)]" : "text-[var(--ad-error)]"}`}>
                {kpi.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {kpi.change} vs last period
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Page Views Chart */}
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)]">Page Views</h2>
            <div className="flex gap-2">
              {["7D", "30D", "90D"].map((period) => (
                <button key={period} className={`font-editorial-mono text-[10px] tracking-wider uppercase px-2.5 py-1 ${period === "7D" ? "bg-[var(--ad-ink)] text-white" : "text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)]"} transition-colors`}>
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2 h-48">
            {[35, 45, 30, 55, 70, 60, 80, 65, 50, 75, 85, 90, 60, 75].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[var(--ad-ink)] transition-all hover:bg-[var(--ad-breaking)] cursor-pointer"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 font-editorial-mono text-[9px] tracking-wider text-[var(--ad-text-secondary)]">
            <span>May 3</span>
            <span>May 10</span>
            <span>May 17</span>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6">
          <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)] mb-5">Traffic Sources</h2>
          <div className="space-y-4">
            {[
              { name: "Direct", pct: 38, color: "bg-[var(--ad-ink)]" },
              { name: "Search", pct: 32, color: "bg-[var(--ad-blue)]" },
              { name: "Social", pct: 18, color: "bg-[var(--ad-facebook)]" },
              { name: "Referral", pct: 12, color: "bg-[var(--ad-gold)]" },
            ].map((source) => (
              <div key={source.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[var(--ad-text-primary)]">{source.name}</span>
                  <span className="font-editorial-mono text-[10px] text-[var(--ad-text-secondary)]">{source.pct}%</span>
                </div>
                <div className="h-2 bg-[var(--ad-border)]">
                  <div className={`h-full ${source.color} transition-all`} style={{ width: `${source.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Articles */}
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)]">Top Performing Articles</h2>
            <span className="font-editorial-mono text-[10px] tracking-wider text-[var(--ad-text-secondary)]">Last 24 hours</span>
          </div>
          <div className="space-y-1">
            {[
              { rank: 1, title: "Local Election Results: Full Coverage of Dhaka North", views: "12,847", shares: 342 },
              { rank: 2, title: "Budget Analysis 2026: What It Means for the Middle Class", views: "9,234", shares: 287 },
              { rank: 3, title: "Cyclone Warning: Coastal Areas on High Alert", views: "8,612", shares: 523 },
              { rank: 4, title: "Interview: Education Minister on National Curriculum Reform", views: "7,445", shares: 198 },
              { rank: 5, title: "Economic Growth Projections: Bangladesh GDP 2026 Outlook", views: "6,123", shares: 156 },
            ].map((article) => (
              <div key={article.rank} className="flex items-center gap-4 px-3 py-2.5 hover:bg-[var(--ad-paper)] transition-colors">
                <span className="font-editorial-display text-xl font-black text-[var(--ad-text-secondary)] w-6 text-right">{article.rank}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--ad-text-primary)] truncate">{article.title}</p>
                </div>
                <div className="text-right">
                  <p className="font-editorial-mono text-xs font-medium text-[var(--ad-text-primary)]">{article.views}</p>
                  <p className="font-editorial-mono text-[10px] text-[var(--ad-text-secondary)]">{article.shares} shares</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
