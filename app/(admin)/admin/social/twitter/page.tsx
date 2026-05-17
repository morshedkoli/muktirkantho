import { AdminShell } from "@/components/admin/admin-shell";
import { Twitter, Users, Heart } from "lucide-react";

export default function TwitterPage() {
  return (
    <AdminShell
      title="X / Twitter"
      description="Manage auto-posting, scheduling, and engagement tracking for Twitter"
      actions={
        <div className="flex items-center gap-2">
          <span className="font-editorial-mono text-[10px] tracking-wider text-[var(--ad-success)] flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[var(--ad-success)]" />
            Connected
          </span>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stats */}
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 flex items-center gap-4">
          <div className="bg-black flex h-12 w-12 items-center justify-center rounded-lg text-white">
            <Twitter className="h-6 w-6" />
          </div>
          <div>
            <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Posts Today</p>
            <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">23</p>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 flex items-center gap-4">
          <div className="bg-[var(--ad-accent)]/10 flex h-12 w-12 items-center justify-center rounded-lg text-[var(--ad-accent)]">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Engagements</p>
            <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">1,847</p>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 flex items-center gap-4">
          <div className="bg-[var(--ad-primary)]/10 flex h-12 w-12 items-center justify-center rounded-lg text-[var(--ad-primary)]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Followers</p>
            <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">12.4K</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6">
        <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)] mb-5">Auto-Posting Settings</h2>
        <div className="space-y-5">
          {[
            { label: "Auto-post on publish", desc: "Automatically tweet when an article is published", enabled: true },
            { label: "Thread mode", desc: "Split long articles into threads by heading", enabled: true },
            { label: "AI-suggested timing", desc: "Optimize posting time based on audience activity", enabled: false },
            { label: "Retry failed posts", desc: "Automatically retry failed posts after 5 minutes", enabled: true },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between py-2 border-b border-[var(--ad-border)] last:border-0">
              <div>
                <p className="text-sm font-medium text-[var(--ad-text-primary)]">{setting.label}</p>
                <p className="text-xs text-[var(--ad-text-secondary)] mt-0.5">{setting.desc}</p>
              </div>
              <label className="relative inline-flex h-5 w-9 items-center cursor-pointer">
                <input type="checkbox" defaultChecked={setting.enabled} className="sr-only peer" />
                <div className="peer h-5 w-9 rounded-full bg-[var(--ad-border)] peer-checked:bg-[var(--ad-ink)] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-[var(--ad-card)] after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Template */}
      <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6">
        <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)] mb-5">Post Template</h2>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-paper)] p-4 mb-4">
          <p className="font-editorial-mono text-xs text-[var(--ad-text-secondary)] mb-2">Default tweet format:</p>
          <p className="text-sm text-[var(--ad-text-primary)] font-medium font-mono">
            {'📰 {{title}} — {{excerpt|truncate:120}} {{url}} {{category_hashtags}}'}
          </p>
        </div>
        <button className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-primary)] border border-[var(--ad-border)] px-4 py-2 hover:bg-[var(--ad-paper)] transition-colors">
          Edit Template
        </button>
      </div>
    </AdminShell>
  );
}
