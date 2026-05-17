import { AdminShell } from "@/components/admin/admin-shell";
import { Heart, Users } from "lucide-react";

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" />
    </svg>
  );
}

export default function InstagramPage() {
  return (
    <AdminShell
      title="Instagram"
      description="Auto-generate story cards, manage Reels scripts, and track engagement"
      actions={
        <span className="font-editorial-mono text-[10px] tracking-wider text-[var(--ad-success)] flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[var(--ad-success)]" />
          Connected
        </span>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 flex items-center gap-4">
          <div className="bg-gradient-to-br from-[#f09433] to-[#bc1888] flex h-12 w-12 items-center justify-center rounded-lg text-white">
            <CameraIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Stories Posted</p>
            <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">7</p>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 flex items-center gap-4">
          <div className="bg-[var(--ad-accent)]/10 flex h-12 w-12 items-center justify-center rounded-lg text-[var(--ad-accent)]">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Engagements</p>
            <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">3,215</p>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5 flex items-center gap-4">
          <div className="bg-[var(--ad-primary)]/10 flex h-12 w-12 items-center justify-center rounded-lg text-[var(--ad-primary)]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Followers</p>
            <p className="font-editorial-display text-3xl font-black text-[var(--ad-text-primary)]">8.2K</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6">
          <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)] mb-4">Story Card Template</h2>
          <div className="aspect-[9/16] bg-gradient-to-br from-[#f09433] to-[#bc1888] rounded-lg mb-4 flex items-center justify-center">
            <div className="text-center text-white p-4">
              <p className="font-editorial-display text-xl font-black mb-2">Breaking News</p>
              <p className="text-sm text-white/80">Article title appears here</p>
              <div className="mt-4 border-t border-white/20 pt-3 flex items-center justify-center gap-2">
                <span className="text-[10px] font-editorial-mono tracking-wider">MUKTIR KANTHO</span>
              </div>
            </div>
          </div>
          <button className="w-full font-editorial-mono text-[10px] tracking-widest uppercase text-white bg-[var(--ad-ink)] px-4 py-2.5 hover:bg-[var(--ad-ink)]/80 transition-colors">
            Edit Template
          </button>
        </div>

        <div className="space-y-4">
          <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6">
            <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)] mb-4">Auto-Posting Settings</h2>
            <div className="space-y-4">
              {[
                { label: "Auto-generate story cards", enabled: true },
                { label: "Link in bio auto-update", enabled: true },
                { label: "AI hashtag suggestions", enabled: true },
                { label: "Reels script generation", enabled: false },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--ad-text-primary)]">{s.label}</span>
                  <label className="relative inline-flex h-5 w-9 items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={s.enabled} className="sr-only peer" />
                    <div className="peer h-5 w-9 rounded-full bg-[var(--ad-border)] peer-checked:bg-[var(--ad-ink)] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-[var(--ad-card)] after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-6">
            <h2 className="font-editorial-display text-lg font-bold text-[var(--ad-text-primary)] mb-4">Hashtag Suggestions</h2>
            <div className="flex flex-wrap gap-2">
              {["#News", "#Bangladesh", "#BreakingNews", "#Politics", "#CurrentAffairs", "#Election2026", "#Dhaka", "#WeatherUpdate"].map((tag) => (
                <span key={tag} className="font-editorial-mono text-[10px] tracking-wider text-[var(--ad-blue)] bg-[var(--ad-primary)]/10 px-2.5 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
