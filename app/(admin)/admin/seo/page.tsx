import { AdminShell } from "@/components/admin/admin-shell";
import { Globe, FileText, Settings, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SEOPage() {
  return (
    <AdminShell
      title="SEO Manager"
      description="Per-article and site-wide SEO controls with real-time scoring and schema markup"
      actions={
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--ad-border)] px-4 py-2.5 text-sm font-semibold text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-all font-editorial-mono tracking-wider uppercase"
        >
          <Settings className="h-4 w-4" />
          Global Settings
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 flex items-center gap-4">
          <div className="bg-[var(--ad-ink)] flex h-12 w-12 items-center justify-center rounded-lg text-white">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Articles Optimized</p>
            <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">128</p>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 flex items-center gap-4">
          <div className="bg-[var(--ad-success)]/10 flex h-12 w-12 items-center justify-center rounded-lg text-[var(--ad-success)]">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Avg. SEO Score</p>
            <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">84</p>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 flex items-center gap-4">
          <div className="bg-[var(--ad-primary)]/10 flex h-12 w-12 items-center justify-center rounded-lg text-[var(--ad-primary)]">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Sitemap Pages</p>
            <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">342</p>
          </div>
        </div>
      </div>

      {/* Recent SEO Scores */}
      <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6">
        <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)] mb-5">Recent Article SEO Scores</h2>
        <div className="space-y-1">
          {[
            { title: "Local Election Results: Full Coverage of Dhaka North", score: 92, issues: 1 },
            { title: "Budget Analysis 2026: What It Means for the Middle Class", score: 87, issues: 3 },
            { title: "Cyclone Warning: Coastal Areas on High Alert", score: 78, issues: 5 },
            { title: "Interview: Education Minister on National Curriculum Reform", score: 95, issues: 0 },
            { title: "Economic Growth Projections: Bangladesh GDP 2026 Outlook", score: 82, issues: 2 },
          ].map((article, i) => (
            <div key={i} className="flex items-center gap-4 px-3 py-3 hover:bg-[var(--ad-paper)] transition-colors border-b border-[var(--ad-border)] last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--ad-text-primary)] truncate">{article.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 font-editorial-display text-xl font-black ${
                  article.score >= 90 ? "text-[var(--ad-success)]" :
                  article.score >= 80 ? "text-[var(--ad-gold)]" :
                  "text-[var(--ad-breaking)]"
                }`}>
                  {article.score}
                  <span className="text-xs font-editorial-mono text-[var(--ad-text-secondary)]">/100</span>
                </div>
                {article.issues > 0 && (
                  <span className="font-editorial-mono text-[10px] bg-[var(--ad-warning)]/10 text-[var(--ad-warning)] px-1.5 py-0.5">
                    {article.issues} issues
                  </span>
                )}
                {article.issues === 0 && (
                  <span className="font-editorial-mono text-[10px] bg-[var(--ad-success)]/10 text-[var(--ad-success)] px-1.5 py-0.5">
                    Perfect
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Schema Markup */}
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6">
          <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)] mb-4">Schema Markup</h2>
          <div className="space-y-3">
            {[
              { type: "NewsArticle", status: "Active", desc: "Generated on all article pages" },
              { type: "BreadcrumbList", status: "Active", desc: "Navigation breadcrumbs" },
              { type: "Organization", status: "Active", desc: "Site-wide organization schema" },
              { type: "WebSite", status: "Active", desc: "Search results sitelinks" },
            ].map((schema) => (
              <div key={schema.type} className="flex items-center justify-between py-2 border-b border-[var(--ad-border)] last:border-0">
                <div>
                  <p className="text-sm font-semibold text-[var(--ad-text-primary)] font-mono">{schema.type}</p>
                  <p className="text-xs text-[var(--ad-text-secondary)]">{schema.desc}</p>
                </div>
                <span className="font-editorial-mono text-[10px] tracking-wider text-[var(--ad-success)] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--ad-success)]" />
                  {schema.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sitemap */}
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6">
          <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)] mb-4">Sitemap</h2>
          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--ad-text-primary)]">Last regenerated</span>
              <span className="font-editorial-mono text-xs text-[var(--ad-text-secondary)]">Today at 03:00 AM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--ad-text-primary)]">Total URLs</span>
              <span className="font-editorial-display text-xl font-black text-[var(--ad-text-primary)]">342</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--ad-text-primary)]">Auto-regenerate</span>
              <label className="relative inline-flex h-5 w-9 items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="peer h-5 w-9 rounded-full bg-[var(--ad-border)] peer-checked:bg-[var(--ad-ink)] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-[var(--ad-card)] after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
          </div>
          <button className="w-full font-editorial-mono text-[10px] tracking-widest uppercase border border-[var(--ad-border)] px-4 py-2.5 hover:bg-[var(--ad-paper)] transition-colors">
            Regenerate Sitemap
          </button>
        </div>
      </div>

      {/* Robots.txt Preview */}
      <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6">
        <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)] mb-4">robots.txt</h2>
        <div className="bg-[var(--ad-paper)] border border-[var(--ad-border)] p-4 font-mono text-sm text-[var(--ad-text-secondary)]">
          <p>User-agent: *</p>
          <p>Allow: /</p>
          <p>Disallow: /admin/</p>
          <p>Disallow: /api/</p>
          <p>Sitemap: https://www.muktirkantho.com/sitemap.xml</p>
        </div>
        <button className="mt-4 font-editorial-mono text-[10px] tracking-widest uppercase border border-[var(--ad-border)] px-4 py-2 hover:bg-[var(--ad-paper)] transition-colors">
          Edit robots.txt
        </button>
      </div>
    </AdminShell>
  );
}
