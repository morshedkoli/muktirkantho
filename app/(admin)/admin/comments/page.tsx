import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { AdminShell } from "@/components/admin/admin-shell";
import { MessageSquare, CheckCircle, AlertCircle, Trash2, Filter, Search } from "lucide-react";
import { approveCommentAction, deleteCommentAction, approveAllCommentsAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function CommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pending = comments.filter((c) => c.status === "pending").length;
  const approved = comments.filter((c) => c.status === "approved").length;
  const spam = comments.filter((c) => c.status === "spam").length;

  return (
    <AdminShell
      title="Comment Moderation"
      description="AI-assisted moderation with dynamic database integration and engagement analytics"
      actions={
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--ad-border)] px-4 py-2.5 text-sm font-semibold text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-all font-editorial-mono tracking-wider uppercase">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          {pending > 0 && (
            <form action={approveAllCommentsAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-green)] hover:bg-[var(--ad-green)]/90 px-4 py-2.5 text-sm font-semibold text-white transition-all font-editorial-mono tracking-wider uppercase shadow-sm"
              >
                <CheckCircle className="h-4 w-4" />
                Approve All Pending
              </button>
            </form>
          )}
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 rounded-xl shadow-premium">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[var(--ad-warning)]/10 text-[var(--ad-warning)] rounded-lg">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Pending</p>
              <p className="font-editorial-display text-2xl font-black text-[var(--ad-text-primary)]">{pending}</p>
            </div>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 rounded-xl shadow-premium">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[var(--ad-success)]/10 text-[var(--ad-success)] rounded-lg">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Approved</p>
              <p className="font-editorial-display text-2xl font-black text-[var(--ad-text-primary)]">{approved}</p>
            </div>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 rounded-xl shadow-premium">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[var(--ad-error)]/10 text-[var(--ad-error)] rounded-lg">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Spam</p>
              <p className="font-editorial-display text-2xl font-black text-[var(--ad-text-primary)]">{spam}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Table */}
      <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden rounded-xl shadow-premium">
        <div className="border-b border-[var(--ad-border)] px-5 py-3.5 bg-[var(--ad-background)]/30">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ad-text-secondary)]" />
            <input
              type="text"
              placeholder="Search comments..."
              className="w-full border border-[var(--ad-border)] bg-[var(--ad-paper)] py-2 pl-9 pr-4 rounded-lg text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-green)] transition-colors placeholder:text-[var(--ad-text-secondary)]"
            />
          </div>
        </div>
        <div className="divide-y divide-[var(--ad-border)]">
          {comments.map((c) => {
            const approveAction = approveCommentAction.bind(null, c.id);
            const deleteAction = deleteCommentAction.bind(null, c.id);
            const relativeTime = formatDistanceToNow(new Date(c.createdAt), { addSuffix: true });

            return (
              <div key={c.id} className="px-5 py-4 hover:bg-[var(--ad-paper)]/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                    c.sentiment === "positive" ? "bg-[var(--ad-success)]/10 text-[var(--ad-success)]" :
                    c.sentiment === "negative" ? "bg-[var(--ad-error)]/10 text-[var(--ad-error)]" :
                    c.sentiment === "spam" ? "bg-[var(--ad-muted)]/10 text-[var(--ad-muted)]" :
                    "bg-[var(--ad-primary)]/10 text-[var(--ad-primary)]"
                  }`}>
                    {c.author.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-bold text-[var(--ad-text-primary)]">{c.author}</span>
                      <span className="font-mono text-[10px] text-[var(--ad-text-muted)]">on {c.article}</span>
                      <span className="font-mono text-[10px] text-[var(--ad-text-muted)] ml-auto shrink-0">{relativeTime}</span>
                    </div>
                    <p className="text-sm text-[var(--ad-text-secondary)] leading-relaxed">{c.content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      {c.status === "pending" && (
                        <div className="flex items-center gap-3">
                          <form action={approveAction}>
                            <button
                              type="submit"
                              className="font-mono text-[10px] tracking-wider uppercase text-[var(--ad-green)] hover:underline transition-colors flex items-center gap-1 font-bold"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approve
                            </button>
                          </form>
                          <form action={deleteAction}>
                            <button
                              type="submit"
                              className="font-mono text-[10px] tracking-wider uppercase text-[var(--ad-breaking)] hover:underline transition-colors flex items-center gap-1 font-bold"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </form>
                        </div>
                      )}
                      {c.status === "spam" && (
                        <span className="font-mono text-[10px] tracking-wider text-[var(--ad-text-muted)] bg-[var(--ad-border)]/50 px-2 py-0.5 rounded">Flagged as spam</span>
                      )}
                      {c.status === "approved" && (
                        <span className="font-mono text-[10px] tracking-wider text-[var(--ad-green)] bg-[var(--ad-green-light)] px-2 py-0.5 rounded font-bold">Approved</span>
                      )}
                      <span className={`font-mono text-[9px] tracking-wider px-2 py-0.5 rounded-full uppercase shrink-0 font-bold ${
                        c.sentiment === "positive" ? "bg-[var(--ad-success)]/10 text-[var(--ad-success)]" :
                        c.sentiment === "negative" ? "bg-[var(--ad-error)]/10 text-[var(--ad-error)]" :
                        "bg-[var(--ad-muted)]/10 text-[var(--ad-muted)]"
                      }`}>
                        {c.sentiment}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {comments.length === 0 && (
            <div className="px-5 py-12 text-center text-[var(--ad-text-muted)] text-sm">
              No comments to moderate.
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
