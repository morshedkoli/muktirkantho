import { AdminShell } from "@/components/admin/admin-shell";
import { Twitter, Facebook, Zap, RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const queueItems = [
  {
    id: 1,
    title: "Budget Analysis 2026: Key Takeaways",
    platform: "twitter",
    platformName: "X / Twitter",
    platformIcon: Twitter,
    platformColor: "bg-black",
    scheduled: "2026-05-17T14:30:00",
    status: "scheduled",
  },
  {
    id: 2,
    title: "Local Election Results: Full Coverage",
    platform: "facebook",
    platformName: "Facebook",
    platformIcon: Facebook,
    platformColor: "bg-[#1877f2]",
    scheduled: "2026-05-17T16:00:00",
    status: "scheduled",
  },
  {
    id: 3,
    title: "Weather Alert: Cyclone Warning",
    platform: "twitter",
    platformName: "X / Twitter",
    platformIcon: Twitter,
    platformColor: "bg-black",
    scheduled: "2026-05-17T18:00:00",
    status: "scheduled",
  },
  {
    id: 4,
    title: "Interview: Education Minister on Reform",
    platform: "instagram",
    platformName: "Instagram",
    platformIcon: CameraIcon,
    platformColor: "bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888]",
    scheduled: "2026-05-18T10:00:00",
    status: "scheduled",
  },
  {
    id: 5,
    title: "Economic Growth Projections 2026",
    platform: "linkedin",
    platformName: "LinkedIn",
    platformIcon: LinkedinIcon,
    platformColor: "bg-[#0a66c2]",
    scheduled: "2026-05-17T15:00:00",
    status: "failed",
  },
];

function formatSchedule(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function SocialQueuePage() {
  const pending = queueItems.filter((i) => i.status === "scheduled").length;
  const sent = 47;
  const failed = queueItems.filter((i) => i.status === "failed").length;

  return (
    <AdminShell
      title="Social Queue"
      description="Manage all scheduled, sent, and failed social posts across platforms"
      actions={
        <Link
          href="/admin/social/queue"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-ink)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-ink)]/80 transition-all font-editorial-mono tracking-wider uppercase"
        >
          <Zap className="h-4 w-4" />
          New Schedule
        </Link>
      }
    >
      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[var(--ad-warning)]/10 text-[var(--ad-warning)]">
              <Clock className="h-5 w-5" />
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
              <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Sent Today</p>
              <p className="font-editorial-display text-2xl font-black text-[var(--ad-text-primary)]">{sent}</p>
            </div>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[var(--ad-error)]/10 text-[var(--ad-error)]">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Failed</p>
              <p className="font-editorial-display text-2xl font-black text-[var(--ad-text-primary)]">{failed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden">
        <div className="border-b border-[var(--ad-border)] px-5 py-4">
          <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)]">Upcoming Posts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--ad-paper)] border-b border-[var(--ad-border)]">
              <tr>
                <th className="px-5 py-3.5 font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)]">Article</th>
                <th className="px-5 py-3.5 font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)]">Platform</th>
                <th className="px-5 py-3.5 font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)]">Scheduled</th>
                <th className="px-5 py-3.5 font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)]">Status</th>
                <th className="px-5 py-3.5 font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ad-border)]">
              {queueItems.map((item) => {
                const Icon = item.platformIcon;
                return (
                  <tr key={item.id} className="hover:bg-[var(--ad-paper)] transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-medium text-[var(--ad-text-primary)]">{item.title}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`${item.platformColor} flex h-7 w-7 items-center justify-center rounded-md text-white`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-editorial-mono text-[10px] tracking-wider text-[var(--ad-text-secondary)]">{item.platformName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-editorial-mono text-[11px] text-[var(--ad-text-secondary)]">
                      {formatSchedule(item.scheduled)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-editorial-mono text-[10px] tracking-wider uppercase px-2 py-0.5 ${
                        item.status === "scheduled"
                          ? "bg-[var(--ad-warning)]/10 text-[var(--ad-warning)]"
                          : item.status === "failed"
                          ? "bg-[var(--ad-error)]/10 text-[var(--ad-error)]"
                          : "bg-[var(--ad-success)]/10 text-[var(--ad-success)]"
                      }`}>
                        {item.status === "scheduled" ? "Scheduled" : item.status === "failed" ? "Failed" : "Sent"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {item.status === "failed" ? (
                          <button className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-breaking)] hover:text-red-700 transition-colors flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Retry
                          </button>
                        ) : (
                          <button className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { name: "X / Twitter", icon: Twitter, color: "bg-black", total: 23, failed: 0 },
          { name: "Facebook", icon: Facebook, color: "bg-[#1877f2]", total: 18, failed: 1 },
          { name: "Instagram", icon: CameraIcon, color: "bg-gradient-to-br from-[#f09433] to-[#bc1888]", total: 7, failed: 0 },
          { name: "LinkedIn", icon: LinkedinIcon, color: "bg-[#0a66c2]", total: 12, failed: 0 },
        ].map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.name} className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`${p.color} flex h-8 w-8 items-center justify-center rounded-lg text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="font-editorial-mono text-[10px] tracking-wider text-[var(--ad-text-secondary)]">{p.name}</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-editorial-display text-xl font-black text-[var(--ad-text-primary)]">{p.total}</span>
                <span className={`font-editorial-mono text-[10px] ${p.failed > 0 ? "text-[var(--ad-breaking)]" : "text-[var(--ad-success)]"}`}>
                  {p.failed > 0 ? `${p.failed} failed` : "All good"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
