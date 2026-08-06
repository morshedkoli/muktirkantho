import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  CheckCircle2,
  ShieldAlert,
  Trash2,
  Check,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { bnNumber } from "@/lib/bn-number";
import { cn } from "@/lib/cn";
import { AdminShell } from "@/components/admin/admin-shell";
import { Panel, StatTile, EmptyState } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  approveCommentAction,
  deleteCommentAction,
  approveAllCommentsAction,
} from "../actions";

export const dynamic = "force-dynamic";

const sentimentLabel: Record<string, string> = {
  positive: "ইতিবাচক",
  negative: "নেতিবাচক",
  neutral: "নিরপেক্ষ",
  spam: "স্প্যাম",
};

const sentimentVariant: Record<string, "success" | "destructive" | "secondary"> = {
  positive: "success",
  negative: "destructive",
  neutral: "secondary",
  spam: "destructive",
};

export default async function CommentsPage() {
  const comments = await prisma.comment.findMany({ orderBy: { createdAt: "desc" } });

  const pending = comments.filter((c) => c.status === "pending");
  const approved = comments.filter((c) => c.status === "approved");
  const spam = comments.filter((c) => c.status === "spam");

  return (
    <AdminShell
      kicker="নিউজরুম"
      title="মন্তব্য মডারেশন"
      description="পাঠকের মন্তব্য অনুমোদন করুন বা সরিয়ে ফেলুন। অপেক্ষমাণগুলো সবার উপরে।"
      actions={
        pending.length > 0 ? (
          <form action={approveAllCommentsAction}>
            <Button type="submit">
              <CheckCircle2 className="h-4 w-4" />
              সব অনুমোদন করুন ({bnNumber(pending.length)})
            </Button>
          </form>
        ) : null
      }
    >
      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        <StatTile
          label="অপেক্ষমাণ"
          value={bnNumber(pending.length)}
          tone="warning"
          icon={MessageSquare}
        />
        <StatTile
          label="অনুমোদিত"
          value={bnNumber(approved.length)}
          tone="success"
          icon={CheckCircle2}
        />
        <StatTile
          label="স্প্যাম"
          value={bnNumber(spam.length)}
          tone="accent"
          icon={ShieldAlert}
        />
      </div>

      <Panel
        flush
        kicker="সব মন্তব্য"
        title={`${bnNumber(comments.length)}টি মন্তব্য`}
      >
        {comments.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="কোনো মন্তব্য নেই"
            description="পাঠকরা মন্তব্য করলে সেগুলো এখানে মডারেশনের জন্য আসবে।"
          />
        ) : (
          <ul className="divide-y divide-[var(--ad-border)]">
            {[...pending, ...approved, ...spam].map((comment) => {
              const approve = approveCommentAction.bind(null, comment.id);
              const remove = deleteCommentAction.bind(null, comment.id);
              const isPending = comment.status === "pending";

              return (
                <li
                  key={comment.id}
                  className={cn(
                    "px-5 py-4 transition-colors hover:bg-[var(--ad-card-alt)]",
                    isPending && "border-l-2 border-[var(--ad-warning)]"
                  )}
                >
                  <div className="flex gap-3.5">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--ad-border)] bg-[var(--ad-inset)] text-[12px] font-semibold text-[var(--ad-text-secondary)]">
                      {comment.author.charAt(0)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-[13px] font-semibold text-[var(--ad-text-primary)]">
                          {comment.author}
                        </span>
                        <span className="adm-mono truncate text-[10.5px] text-[var(--ad-text-muted)]">
                          {comment.article}
                        </span>
                        <span className="adm-mono ml-auto shrink-0 text-[10.5px] text-[var(--ad-text-muted)]">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ad-text-secondary)]">
                        {comment.content}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {comment.status === "approved" && (
                          <Badge dot variant="success">
                            অনুমোদিত
                          </Badge>
                        )}
                        {comment.status === "spam" && (
                          <Badge dot variant="destructive">
                            স্প্যাম
                          </Badge>
                        )}
                        {isPending && (
                          <Badge dot variant="warning">
                            অপেক্ষমাণ
                          </Badge>
                        )}
                        <Badge
                          variant={sentimentVariant[comment.sentiment] ?? "secondary"}
                        >
                          {sentimentLabel[comment.sentiment] ?? comment.sentiment}
                        </Badge>

                        <span className="ml-auto flex items-center gap-1.5">
                          {isPending && (
                            <form action={approve}>
                              <Button type="submit" variant="outline" size="sm">
                                <Check className="h-3.5 w-3.5" />
                                অনুমোদন
                              </Button>
                            </form>
                          )}
                          <form action={remove}>
                            <Button type="submit" variant="destructive" size="sm">
                              <Trash2 className="h-3.5 w-3.5" />
                              মুছুন
                            </Button>
                          </form>
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </AdminShell>
  );
}
