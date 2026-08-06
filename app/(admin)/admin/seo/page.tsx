import Link from "next/link";
import { PostStatus } from "@prisma/client";
import {
  Globe,
  FileText,
  Settings,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { bnNumber } from "@/lib/bn-number";
import { cn } from "@/lib/cn";
import { AdminShell } from "@/components/admin/admin-shell";
import { Panel, StatTile, EmptyState } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

/** What "good" means for each check, kept in one place so the audit is honest. */
const RULES = {
  metaTitle: { min: 40, max: 60, weight: 30, label: "মেটা শিরোনামের দৈর্ঘ্য" },
  metaDescription: { min: 120, max: 160, weight: 30, label: "মেটা বিবরণের দৈর্ঘ্য" },
  content: { min: 500, weight: 25, label: "কনটেন্টের দৈর্ঘ্য" },
  image: { weight: 15, label: "ফিচার্ড ছবি" },
} as const;

type Audit = {
  id: string;
  title: string;
  score: number;
  issues: string[];
};

function auditPost(post: {
  id: string;
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  content: string | null;
  imageUrl: string | null;
}): Audit {
  let score = 0;
  const issues: string[] = [];

  const titleLength = post.metaTitle?.length ?? 0;
  if (titleLength >= RULES.metaTitle.min && titleLength <= RULES.metaTitle.max) {
    score += RULES.metaTitle.weight;
  } else {
    issues.push(
      titleLength === 0
        ? "মেটা শিরোনাম নেই"
        : `মেটা শিরোনাম ${bnNumber(titleLength)} অক্ষর (আদর্শ ${bnNumber(RULES.metaTitle.min)}–${bnNumber(RULES.metaTitle.max)})`
    );
  }

  const descriptionLength = post.metaDescription?.length ?? 0;
  if (
    descriptionLength >= RULES.metaDescription.min &&
    descriptionLength <= RULES.metaDescription.max
  ) {
    score += RULES.metaDescription.weight;
  } else {
    issues.push(
      descriptionLength === 0
        ? "মেটা বিবরণ নেই"
        : `মেটা বিবরণ ${bnNumber(descriptionLength)} অক্ষর (আদর্শ ${bnNumber(RULES.metaDescription.min)}–${bnNumber(RULES.metaDescription.max)})`
    );
  }

  if ((post.content?.length ?? 0) >= RULES.content.min) {
    score += RULES.content.weight;
  } else {
    issues.push("কনটেন্ট খুব সংক্ষিপ্ত");
  }

  if (post.imageUrl) {
    score += RULES.image.weight;
  } else {
    issues.push("ফিচার্ড ছবি নেই");
  }

  return { id: post.id, title: post.title, score, issues };
}

function scoreTone(score: number) {
  if (score >= 85) return "text-[var(--ad-success)]";
  if (score >= 60) return "text-[var(--ad-warning)]";
  return "text-[var(--ad-error)]";
}

export default async function SEOPage() {
  const [posts, publishedCount, categoriesCount, districtsCount, upazilasCount] =
    await Promise.all([
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          title: true,
          metaTitle: true,
          metaDescription: true,
          content: true,
          imageUrl: true,
        },
      }),
      prisma.post.count({ where: { status: PostStatus.published } }),
      prisma.category.count(),
      prisma.district.count(),
      prisma.upazila.count(),
    ]);

  const audits = posts.map(auditPost);
  const averageScore =
    audits.length > 0
      ? Math.round(audits.reduce((sum, a) => sum + a.score, 0) / audits.length)
      : 0;
  const needsWork = audits.filter((a) => a.issues.length > 0).length;

  // 5 static routes: home, news index, search, English home, sitemap itself.
  const sitemapEntries =
    publishedCount + categoriesCount + districtsCount + upazilasCount + 5;

  return (
    <AdminShell
      kicker="প্রচার"
      title="এসইও পর্যবেক্ষণ"
      description="প্রতিটি সংবাদের মেটা তথ্য যাচাই এবং সাইটম্যাপের অবস্থা।"
      actions={
        <Button asChild variant="outline">
          <Link href="/admin/settings">
            <Settings className="h-4 w-4" />
            সাইট সেটিংস
          </Link>
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile
          label="যাচাই করা পোস্ট"
          value={bnNumber(audits.length)}
          hint="সাম্প্রতিকতম ২০টি"
          icon={FileText}
        />
        <StatTile
          label="গড় স্কোর"
          value={`${bnNumber(averageScore)}`}
          hint="১০০-এর মধ্যে"
          tone={averageScore >= 85 ? "success" : averageScore >= 60 ? "warning" : "accent"}
          icon={Gauge}
        />
        <StatTile
          label="সংশোধন প্রয়োজন"
          value={bnNumber(needsWork)}
          hint={needsWork === 0 ? "সব ঠিক আছে" : "পোস্টে সমস্যা আছে"}
          tone={needsWork > 0 ? "warning" : "success"}
          icon={AlertTriangle}
        />
        <StatTile
          label="সাইটম্যাপ লিংক"
          value={bnNumber(sitemapEntries)}
          hint="প্রকাশিত পোস্ট ও আর্কাইভ পৃষ্ঠা"
          tone="info"
          icon={Globe}
        />
      </div>

      <Panel
        flush
        kicker="ডায়াগনস্টিকস"
        title="পোস্টভিত্তিক এসইও যাচাই"
        description="মেটা শিরোনাম, মেটা বিবরণ, কনটেন্টের দৈর্ঘ্য ও ফিচার্ড ছবির ভিত্তিতে"
      >
        {audits.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="যাচাই করার মতো পোস্ট নেই"
            description="প্রথমে একটি সংবাদ তৈরি করুন, তারপর এখানে এসইও রিপোর্ট দেখা যাবে।"
          />
        ) : (
          <ul className="divide-y divide-[var(--ad-border)]">
            {audits.map((audit) => (
              <li key={audit.id}>
                <Link
                  href={`/admin/posts/edit/${audit.id}`}
                  className="flex items-start gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--ad-card-alt)]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold text-[var(--ad-text-primary)]">
                      {audit.title}
                    </span>
                    {audit.issues.length > 0 ? (
                      <span className="mt-1.5 flex flex-wrap gap-1.5">
                        {audit.issues.map((issue) => (
                          <span
                            key={issue}
                            className="rounded border border-[var(--ad-border)] bg-[var(--ad-card-alt)] px-1.5 py-0.5 text-[10.5px] text-[var(--ad-text-secondary)]"
                          >
                            {issue}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-[var(--ad-success)]">
                        <CheckCircle2 className="h-3 w-3" />
                        সব চেক উত্তীর্ণ
                      </span>
                    )}
                  </span>

                  <span className="flex shrink-0 items-baseline gap-0.5">
                    <span className={cn("adm-figure text-[20px]", scoreTone(audit.score))}>
                      {bnNumber(audit.score)}
                    </span>
                    <span className="adm-mono text-[10px] text-[var(--ad-text-muted)]">
                      /১০০
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel kicker="স্ট্রাকচার্ড ডেটা" title="স্কিমা মার্কআপ">
          <ul className="space-y-0.5">
            {[
              {
                type: "NewsArticle",
                description: "প্রতিটি সংবাদ পৃষ্ঠায় স্বয়ংক্রিয়ভাবে যুক্ত হয়",
              },
              {
                type: "BreadcrumbList",
                description: "সার্চ ফলাফলে নেভিগেশন পথ দেখায়",
              },
              {
                type: "Organization",
                description: "প্রকাশক হিসেবে সাইটের পরিচয় জানায়",
              },
              {
                type: "WebSite",
                description: "গুগল সার্চবক্স ইন্টিগ্রেশন সক্রিয় করে",
              },
            ].map((schema) => (
              <li
                key={schema.type}
                className="flex items-center justify-between gap-3 border-b border-[var(--ad-border)] py-2.5 last:border-0"
              >
                <div className="min-w-0">
                  <p className="adm-mono text-[12px] font-semibold text-[var(--ad-text-primary)]">
                    {schema.type}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-[var(--ad-text-muted)]">
                    {schema.description}
                  </p>
                </div>
                <Badge dot variant="success">
                  সক্রিয়
                </Badge>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel kicker="ক্রলিং" title="সাইটম্যাপ ও রোবটস">
          <dl className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-[var(--ad-border)] pb-2.5">
              <dt className="text-[12.5px] text-[var(--ad-text-secondary)]">সাইটম্যাপ</dt>
              <dd>
                <Link
                  href="/sitemap.xml"
                  target="_blank"
                  className="adm-mono flex items-center gap-1 text-[12px] font-semibold text-[var(--ad-text-primary)] hover:text-[var(--ad-accent)]"
                >
                  /sitemap.xml
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--ad-border)] pb-2.5">
              <dt className="text-[12.5px] text-[var(--ad-text-secondary)]">মোট এন্ট্রি</dt>
              <dd className="adm-mono text-[12px] font-semibold text-[var(--ad-text-primary)]">
                {bnNumber(sitemapEntries)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[12.5px] text-[var(--ad-text-secondary)]">
                অ্যাডমিন পথ ব্লকড
              </dt>
              <dd>
                <Badge dot variant="success">
                  হ্যাঁ
                </Badge>
              </dd>
            </div>
          </dl>

          <pre className="adm-mono mt-4 overflow-x-auto rounded-[var(--ad-radius-sm)] border border-[var(--ad-border)] bg-[var(--ad-card-alt)] p-3.5 text-[11px] leading-relaxed text-[var(--ad-text-secondary)]">
{`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: /sitemap.xml`}
          </pre>
        </Panel>
      </div>
    </AdminShell>
  );
}
