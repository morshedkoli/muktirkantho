import Link from "next/link";
import { PostStatus, ShareStatus, SocialPlatform } from "@prisma/client";
import { format } from "date-fns";
import {
  Facebook,
  CheckCircle2,
  Clock,
  Link2Off,
  Settings,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { bnNumber } from "@/lib/bn-number";
import { AdminShell } from "@/components/admin/admin-shell";
import { Panel, StatTile, EmptyState, Alert } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShareButton } from "./share-button";

export const dynamic = "force-dynamic";

/**
 * What actually happened, not what could happen.
 *
 * The previous version derived every row's state from `post.status`, so a post
 * that failed to reach Facebook and a post that sailed through looked
 * identical — both "শেয়ারযোগ্য". Rows now come from the SocialShare record, and
 * a published post with no record is shown as genuinely unshared with a button
 * to do something about it.
 */
export default async function SocialQueuePage() {
  const [posts, settings, counts] = await Promise.all([
    prisma.post.findMany({
      where: { status: PostStatus.published },
      orderBy: { publishedAt: "desc" },
      take: 25,
      select: {
        id: true,
        title: true,
        publishedAt: true,
        createdAt: true,
        socialShares: {
          where: { platform: SocialPlatform.facebook },
          select: {
            id: true,
            status: true,
            error: true,
            externalUrl: true,
            attempts: true,
            trigger: true,
            sharedAt: true,
            lastAttemptAt: true,
          },
        },
      },
    }),
    prisma.siteSetting.findFirst(),
    prisma.socialShare.groupBy({
      by: ["status"],
      where: { platform: SocialPlatform.facebook },
      _count: true,
    }),
  ]);

  const countOf = (status: ShareStatus) =>
    counts.find((c) => c.status === status)?._count ?? 0;

  const sharedCount = countOf(ShareStatus.shared);
  const failedCount = countOf(ShareStatus.failed);
  const unshared = posts.filter((p) => p.socialShares.length === 0).length;

  const connected = settings?.facebookConnected ?? false;
  const autoPost = settings?.facebookAutoPost ?? false;

  return (
    <AdminShell
      kicker="প্রচার"
      title="সোশ্যাল কিউ"
      description="ফেসবুকে স্বয়ংক্রিয় শেয়ারের ফলাফল ও সংযোগের অবস্থা।"
      actions={
        <Button asChild variant="outline">
          <Link href="/admin/facebook">
            <Settings className="h-4 w-4" />
            ফেসবুক সেটিংস
          </Link>
        </Button>
      }
    >
      {!connected ? (
        <Alert tone="warning" title="ফেসবুক সংযুক্ত নয়">
          কোনো ফেসবুক পেজ যুক্ত করা নেই, তাই স্বয়ংক্রিয় শেয়ার বন্ধ আছে।{" "}
          <Link href="/admin/facebook" className="font-semibold underline underline-offset-2">
            এখনই সংযুক্ত করুন
          </Link>
          ।
        </Alert>
      ) : !autoPost ? (
        <Alert tone="info" title="অটো-পোস্ট বন্ধ">
          পেজ যুক্ত আছে, কিন্তু স্বয়ংক্রিয় শেয়ার বন্ধ। এখন শুধু ম্যানুয়ালি শেয়ার করা যাবে।{" "}
          <Link href="/admin/facebook" className="font-semibold underline underline-offset-2">
            চালু করুন
          </Link>
          ।
        </Alert>
      ) : null}

      {failedCount > 0 && (
        <Alert tone="error" title={`${bnNumber(failedCount)}টি শেয়ার ব্যর্থ হয়েছে`}>
          নিচের তালিকা থেকে কারণ দেখে আবার চেষ্টা করুন।
        </Alert>
      )}

      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        <StatTile
          label="শেয়ার হয়েছে"
          value={bnNumber(sharedCount)}
          hint="ফেসবুকে সফলভাবে গেছে"
          tone="success"
          icon={CheckCircle2}
        />
        <StatTile
          label="ব্যর্থ"
          value={bnNumber(failedCount)}
          hint={failedCount > 0 ? "আবার চেষ্টা করা যাবে" : "কোনো ব্যর্থতা নেই"}
          tone={failedCount > 0 ? "warning" : "neutral"}
          icon={AlertTriangle}
        />
        <StatTile
          label="অটো-পোস্ট"
          value={connected && autoPost ? "চালু" : "বন্ধ"}
          hint={connected ? (settings?.facebookPageName ?? "পেজ যুক্ত") : "পেজ যুক্ত নয়"}
          tone={connected && autoPost ? "success" : "accent"}
          icon={connected ? Facebook : Link2Off}
        />
      </div>

      <Panel
        flush
        kicker="সারি"
        title="প্রকাশিত পোস্টের শেয়ার অবস্থা"
        actions={
          <span className="adm-label">
            {unshared > 0 ? `${bnNumber(unshared)}টি এখনো শেয়ার হয়নি` : "সব শেয়ার হয়েছে"}
          </span>
        }
      >
        {posts.length === 0 ? (
          <EmptyState
            icon={Facebook}
            title="সারিতে কিছু নেই"
            description="পোস্ট প্রকাশ করলে সেগুলো এখানে শেয়ারের জন্য দেখা যাবে।"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[42%] pl-5">শিরোনাম</TableHead>
                <TableHead className="w-[18%]">সময়</TableHead>
                <TableHead className="w-[18%]">অবস্থা</TableHead>
                <TableHead className="w-[22%] pr-5 text-right">পদক্ষেপ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => {
                const share = post.socialShares[0];
                const status = share?.status;

                return (
                  <TableRow key={post.id}>
                    <TableCell className="pl-5">
                      <Link
                        href={`/admin/posts/edit/${post.id}`}
                        className="block truncate text-[13px] font-semibold text-[var(--ad-text-primary)] transition-colors hover:text-[var(--ad-primary)]"
                      >
                        {post.title}
                      </Link>
                      {status === ShareStatus.failed && share?.error && (
                        <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-[var(--ad-error)]">
                          {share.error}
                        </p>
                      )}
                      {status === ShareStatus.shared && share?.externalUrl && (
                        <a
                          href={share.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="adm-mono mt-1 inline-flex items-center gap-1 text-[10.5px] text-[var(--ad-text-muted)] transition-colors hover:text-[var(--ad-primary)]"
                        >
                          ফেসবুকে দেখুন
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </TableCell>

                    <TableCell className="adm-mono text-[11.5px] text-[var(--ad-text-muted)]">
                      {format(
                        new Date(share?.sharedAt ?? post.publishedAt ?? post.createdAt),
                        "d MMM yyyy, HH:mm",
                      )}
                      {share && share.attempts > 1 && (
                        <span className="mt-0.5 block text-[10px]">
                          {bnNumber(share.attempts)} বার চেষ্টা
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {status === ShareStatus.shared ? (
                        <Badge dot variant="success">
                          শেয়ার হয়েছে
                        </Badge>
                      ) : status === ShareStatus.failed ? (
                        <Badge dot variant="destructive">
                          ব্যর্থ
                        </Badge>
                      ) : status === ShareStatus.pending ? (
                        <Badge dot variant="info">
                          চলছে
                        </Badge>
                      ) : (
                        <Badge dot variant="warning">
                          শেয়ার হয়নি
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="pr-5 text-right">
                      {status === ShareStatus.shared ? (
                        <span className="adm-mono text-[10.5px] text-[var(--ad-text-muted)]">
                          {share?.trigger === "auto" ? "স্বয়ংক্রিয়" : "ম্যানুয়াল"}
                        </span>
                      ) : status === ShareStatus.failed && share ? (
                        <ShareButton mode="retry" shareId={share.id} disabled={!connected} />
                      ) : status === ShareStatus.pending ? (
                        <span className="adm-mono text-[10.5px] text-[var(--ad-text-muted)]">
                          <Clock className="mr-1 inline h-3 w-3" />
                          চলছে
                        </span>
                      ) : (
                        <ShareButton mode="share" postId={post.id} disabled={!connected} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Panel>

      <Panel>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--ad-radius-sm)] bg-[#1877f2] text-white">
              <Facebook className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold text-[var(--ad-text-primary)]">
                {settings?.facebookPageName || "কোনো পেজ যুক্ত নেই"}
              </p>
              <p className="adm-mono mt-0.5 truncate text-[11px] text-[var(--ad-text-muted)]">
                {connected
                  ? `পেজ আইডি: ${settings?.facebookPageId ?? "—"}`
                  : "স্বয়ংক্রিয় শেয়ার নিষ্ক্রিয়"}
              </p>
            </div>
          </div>
          <Badge dot variant={connected ? "success" : "destructive"}>
            {connected ? "সংযুক্ত" : "বিচ্ছিন্ন"}
          </Badge>
        </div>
      </Panel>
    </AdminShell>
  );
}
