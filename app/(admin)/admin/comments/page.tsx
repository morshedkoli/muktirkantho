import { AdminShell } from "@/components/admin/admin-shell";
import { MessageSquare, CheckCircle, AlertCircle, Trash2, Filter, Search } from "lucide-react";

const comments = [
  { id: 1, author: "Rahman Khan", content: "Great article! Very informative and well-researched. Keep up the good work.", status: "pending", article: "Local Election Results", time: "5m ago", sentiment: "positive" },
  { id: 2, author: "Fatima Begum", content: "I disagree with some points. The data seems outdated.", status: "pending", article: "Budget Analysis 2026", time: "12m ago", sentiment: "negative" },
  { id: 3, author: "John Doe", content: "Check out my website for more news...", status: "spam", article: "Cyclone Warning", time: "1h ago", sentiment: "spam" },
  { id: 4, author: "Aisha Parvin", content: "This is exactly what I needed. Thanks for sharing!", status: "approved", article: "Education Reform", time: "2h ago", sentiment: "positive" },
  { id: 5, author: "Mohammad Ali", content: "When will the next update be published?", status: "pending", article: "Election Results", time: "3h ago", sentiment: "neutral" },
];

export default function CommentsPage() {
  const pending = comments.filter((c) => c.status === "pending").length;
  const approved = comments.filter((c) => c.status === "approved").length;
  const spam = comments.filter((c) => c.status === "spam").length;

  return (
    <AdminShell
      title="Comment Moderation"
      description="AI-assisted moderation with bulk actions and engagement analytics"
      actions={
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--ad-border)] px-4 py-2.5 text-sm font-semibold text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-all font-editorial-mono tracking-wider uppercase">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-ink)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-ink)]/80 transition-all font-editorial-mono tracking-wider uppercase">
            <CheckCircle className="h-4 w-4" />
            Approve All
          </button>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[var(--ad-warning)]/10 text-[var(--ad-warning)]">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Pending</p>
              <p className="font-editorial-display text-2xl font-black text-[var(--ad-text-primary)]">{pending}</p>
            </div>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[var(--ad-success)]/10 text-[var(--ad-success)]">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Approved</p>
              <p className="font-editorial-display text-2xl font-black text-[var(--ad-text-primary)]">{approved}</p>
            </div>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[var(--ad-error)]/10 text-[var(--ad-error)]">
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
      <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden">
        <div className="border-b border-[var(--ad-border)] px-5 py-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ad-text-secondary)]" />
            <input type="text" placeholder="Search comments..." className="w-full border border-[var(--ad-border)] bg-[var(--ad-paper)] py-2 pl-9 pr-4 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-text-primary)] transition-colors placeholder:text-[var(--ad-text-secondary)]" />
          </div>
        </div>
        <div className="divide-y divide-[var(--ad-border)]">
          {comments.map((c) => (
            <div key={c.id} className="px-5 py-4 hover:bg-[var(--ad-paper)] transition-colors">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  c.sentiment === "positive" ? "bg-[var(--ad-success)]/10 text-[var(--ad-success)]" :
                  c.sentiment === "negative" ? "bg-[var(--ad-error)]/10 text-[var(--ad-error)]" :
                  c.sentiment === "spam" ? "bg-[var(--ad-muted)]/10 text-[var(--ad-muted)]" :
                  "bg-[var(--ad-primary)]/10 text-[var(--ad-primary)]"
                }`}>
                  {c.author.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-[var(--ad-text-primary)]">{c.author}</span>
                    <span className="font-editorial-mono text-[10px] text-[var(--ad-text-secondary)]">on {c.article}</span>
                    <span className="font-editorial-mono text-[10px] text-[var(--ad-text-secondary)] ml-auto">{c.time}</span>
                  </div>
                  <p className="text-sm text-[var(--ad-text-secondary)]">{c.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {c.status === "pending" && (
                      <>
                        <button className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-success)] hover:text-[var(--ad-success)] transition-colors flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </button>
                        <button className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-breaking)] hover:text-[var(--ad-error)] transition-colors flex items-center gap-1">
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </>
                    )}
                    {c.status === "spam" && (
                      <span className="font-editorial-mono text-[10px] tracking-wider text-[var(--ad-text-secondary)]">Flagged as spam</span>
                    )}
                    {c.status === "approved" && (
                      <span className="font-editorial-mono text-[10px] tracking-wider text-[var(--ad-success)]">Approved</span>
                    )}
                    <span className={`font-editorial-mono text-[9px] tracking-wider px-1.5 py-0.5 ${
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
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
