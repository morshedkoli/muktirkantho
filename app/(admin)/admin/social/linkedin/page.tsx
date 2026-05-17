import { AdminShell } from "@/components/admin/admin-shell";
import { Users, TrendingUp } from "lucide-react";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function LinkedInPage() {
  return (
    <AdminShell
      title="LinkedIn"
      description="Auto-post to Company Page, manage long-form captions, and track professional engagement"
      actions={
        <span className="font-editorial-mono text-[10px] tracking-wider text-[var(--ad-success)] flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[var(--ad-success)]" />
          Connected
        </span>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 flex items-center gap-4">
          <div className="bg-[#0a66c2] flex h-12 w-12 items-center justify-center rounded-lg text-white">
            <LinkedinIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Posts Today</p>
            <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">12</p>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 flex items-center gap-4">
          <div className="bg-[var(--ad-primary)]/10 flex h-12 w-12 items-center justify-center rounded-lg text-[var(--ad-primary)]">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Impressions</p>
            <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">45.2K</p>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 flex items-center gap-4">
          <div className="bg-[var(--ad-success)]/10 flex h-12 w-12 items-center justify-center rounded-lg text-[var(--ad-success)]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Followers</p>
            <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">5.1K</p>
          </div>
        </div>
      </div>

      <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6">
        <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)] mb-5">Auto-Posting Settings</h2>
        <div className="space-y-4">
          {[
            { label: "Auto-post on publish", desc: "Share article to Company Page automatically", enabled: true },
            { label: "Long-form caption", desc: "Use article excerpt (up to 3,000 chars) as caption", enabled: true },
            { label: "Tag relevant entities", desc: "Automatically tag people and organisations mentioned", enabled: false },
            { label: "Optimal time scheduling", desc: "AI-suggested best time for professional audience", enabled: true },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between py-2 border-b border-[var(--ad-border)] last:border-0">
              <div>
                <p className="text-sm font-medium text-[var(--ad-text-primary)]">{s.label}</p>
                <p className="text-xs text-[var(--ad-text-secondary)] mt-0.5">{s.desc}</p>
              </div>
              <label className="relative inline-flex h-5 w-9 items-center cursor-pointer">
                <input type="checkbox" defaultChecked={s.enabled} className="sr-only peer" />
                <div className="peer h-5 w-9 rounded-full bg-[var(--ad-border)] peer-checked:bg-[var(--ad-ink)] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-[var(--ad-card)] after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6">
        <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)] mb-4">Caption Template</h2>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-paper)] p-4">
          <p className="text-sm text-[var(--ad-text-primary)] font-medium leading-relaxed font-mono whitespace-pre-line">
            {'📰 {{title}}\n\n{{excerpt|truncate:250}}\n\nRead more: {{url}}\n{{category_hashtags}}'}
          </p>
        </div>
        <button className="mt-4 font-editorial-mono text-[10px] tracking-widest uppercase border border-[var(--ad-border)] px-4 py-2 hover:bg-[var(--ad-paper)] transition-colors">
          Edit Template
        </button>
      </div>
    </AdminShell>
  );
}
