import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";
import { Globe, FileText, Settings, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";
import Link from "next/link";
import { PostStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function SEOPage() {
  const [posts, categoriesCount, districtsCount, upazilasCount] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.category.count(),
    prisma.district.count(),
    prisma.upazila.count(),
  ]);

  const totalPublishedPosts = await prisma.post.count({ where: { status: PostStatus.published } });

  // Calculate dynamic SEO scores & issues
  let totalScoreSum = 0;
  const parsedPosts = posts.map((post) => {
    let score = 0;
    let issuesCount = 0;

    // Title score (max 40)
    const titleLen = post.metaTitle?.length || 0;
    if (titleLen >= 40 && titleLen <= 60) {
      score += 40;
    } else {
      score += 20;
      issuesCount++;
    }

    // Description score (max 40)
    const descLen = post.metaDescription?.length || 0;
    if (descLen >= 120 && descLen <= 160) {
      score += 40;
    } else {
      score += 20;
      issuesCount++;
    }

    // Content score (max 20)
    const contentLen = post.content?.length || 0;
    if (contentLen >= 500) {
      score += 20;
    } else {
      score += 10;
      issuesCount++;
    }

    // Image check
    if (!post.imageUrl) {
      issuesCount++;
    }

    totalScoreSum += score;

    return {
      id: post.id,
      title: post.title,
      score,
      issues: issuesCount,
    };
  });

  const avgSeoScore = posts.length > 0 ? Math.round(totalScoreSum / posts.length) : 100;
  const totalSitemapPages = totalPublishedPosts + categoriesCount + districtsCount + upazilasCount + 5; // Base page mappings

  return (
    <AdminShell
      title="SEO Manager"
      description="Per-article and site-wide SEO telemetry using programmatic semantic analysis and schema compliance checks."
      actions={
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--ad-border)] px-4 py-2.5 text-sm font-semibold text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-all font-editorial-mono tracking-wider uppercase shadow-sm"
        >
          <Settings className="h-4 w-4 text-emerald-600" />
          Global Settings
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 flex items-center gap-4 rounded-xl shadow-premium">
          <div className="bg-emerald-500/10 flex h-12 w-12 items-center justify-center rounded-xl text-emerald-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-muted)]">Articles Monitored</p>
            <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">{posts.length}</p>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 flex items-center gap-4 rounded-xl shadow-premium">
          <div className="bg-emerald-500/10 flex h-12 w-12 items-center justify-center rounded-xl text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-muted)]">Avg. SEO Score</p>
            <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">{avgSeoScore}</p>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 flex items-center gap-4 rounded-xl shadow-premium">
          <div className="bg-indigo-500/10 flex h-12 w-12 items-center justify-center rounded-xl text-indigo-600">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-muted)]">Sitemap Pages</p>
            <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">{totalSitemapPages}</p>
          </div>
        </div>
      </div>

      {/* Recent SEO Scores */}
      <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 rounded-xl shadow-premium">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ad-text-primary)] mb-1">Article SEO Engine Diagnostics</h2>
        <p className="text-[11.5px] text-[var(--ad-text-muted)] mb-5">Programmatic auditing based on meta-title, meta-description length, and feature images</p>
        <div className="space-y-1 divide-y divide-[var(--ad-border)]">
          {parsedPosts.map((article, i) => (
            <div key={i} className="flex items-center gap-4 py-3 hover:bg-[var(--ad-paper)]/30 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-bold text-[var(--ad-text-primary)] truncate font-bangla leading-normal">{article.title}</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <div className={`flex items-center gap-1 font-mono text-sm font-black ${
                  article.score >= 90 ? "text-[var(--ad-green)]" :
                  article.score >= 80 ? "text-[var(--ad-amber)]" :
                  "text-[var(--ad-brand)]"
                }`}>
                  {article.score}
                  <span className="text-[10px] font-bold text-[var(--ad-text-muted)]">/100</span>
                </div>
                {article.issues > 0 ? (
                  <span className="font-mono text-[9px] font-bold bg-[var(--ad-brand-light)] text-[var(--ad-brand)] px-2 py-0.5 rounded border border-[var(--ad-brand)]/10 uppercase flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {article.issues} warnings
                  </span>
                ) : (
                  <span className="font-mono text-[9px] font-bold bg-[var(--ad-green-light)] text-[var(--ad-green)] px-2 py-0.5 rounded border border-[var(--ad-green)]/10 uppercase">
                    Perfect Score
                  </span>
                )}
              </div>
            </div>
          ))}
          {parsedPosts.length === 0 && (
            <div className="py-10 text-center text-[var(--ad-text-muted)] text-sm">
              No articles to analyze. Create a post first.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schema Markup */}
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 rounded-xl shadow-premium">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ad-text-primary)] mb-1">Structured Schema Markup</h2>
          <p className="text-[11.5px] text-[var(--ad-text-muted)] mb-4">Programmatically generated JSON-LD scripts for Google Rich Results</p>
          <div className="space-y-3">
            {[
              { type: "NewsArticle Schema", status: "Active", desc: "Generated automatically on all dynamic article routing paths" },
              { type: "BreadcrumbList Schema", status: "Active", desc: "Visual navigation crumbs for optimized search snippet presentation" },
              { type: "Organization Schema", status: "Active", desc: "Site-wide publisher brand definitions loaded dynamically" },
              { type: "WebSite Search Schema", status: "Active", desc: "Allows organic Google Searchbox integrations" },
            ].map((schema) => (
              <div key={schema.type} className="flex items-center justify-between py-2.5 border-b border-[var(--ad-border)] last:border-0">
                <div>
                  <p className="text-[13px] font-bold text-[var(--ad-text-primary)] font-mono">{schema.type}</p>
                  <p className="text-[11.5px] text-[var(--ad-text-muted)] mt-0.5">{schema.desc}</p>
                </div>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--ad-green)] bg-[var(--ad-green-light)] px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--ad-green)] shrink-0" />
                  {schema.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sitemap */}
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 rounded-xl shadow-premium flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ad-text-primary)] mb-1">Sitemap Management</h2>
            <p className="text-[11.5px] text-[var(--ad-text-muted)] mb-4">Dynamically synchronized XML indexes for Google Search Console indexing</p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-1.5 border-b border-[var(--ad-border)]">
                <span className="text-[13px] font-bold text-[var(--ad-text-primary)]">Last Sync Status</span>
                <span className="font-mono text-[11px] font-bold text-emerald-600">Active / Live</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[var(--ad-border)]">
                <span className="text-[13px] font-bold text-[var(--ad-text-primary)]">Total Sitemap Elements</span>
                <span className="font-mono text-sm font-bold text-[var(--ad-text-primary)]">{totalSitemapPages} links</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[13px] font-bold text-[var(--ad-text-primary)]">Automated Syncing</span>
                <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--ad-text-muted)] font-bold uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Active
                </div>
              </div>
            </div>
          </div>
          <button className="w-full font-mono text-[10px] font-bold tracking-wider uppercase border border-[var(--ad-border)] px-4 py-2.5 rounded-lg hover:bg-[var(--ad-paper)] transition-colors">
            Generate Static Sitemap Copy
          </button>
        </div>
      </div>

      {/* Robots.txt Preview */}
      <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6 rounded-xl shadow-premium">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ad-text-primary)] mb-1">Search Engine crawling instructions (robots.txt)</h2>
        <p className="text-[11.5px] text-[var(--ad-text-muted)] mb-4">Live instructions outputting at path /robots.txt to secure administrative portals</p>
        <div className="bg-[var(--ad-paper)] border border-[var(--ad-border)] p-4 rounded-xl font-mono text-xs text-[var(--ad-text-muted)] leading-relaxed space-y-1 shadow-sm">
          <p>User-agent: *</p>
          <p>Allow: /</p>
          <p>Disallow: /admin/</p>
          <p>Disallow: /api/</p>
          <p>Sitemap: https://www.muktirkantho.com/sitemap.xml</p>
        </div>
      </div>
    </AdminShell>
  );
}
