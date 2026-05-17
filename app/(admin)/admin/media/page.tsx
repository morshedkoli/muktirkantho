import { AdminShell } from "@/components/admin/admin-shell";
import { Image, Upload, Search, Grid3X3, List, Download, Trash2 } from "lucide-react";

export default function MediaPage() {
  return (
    <AdminShell
      title="Media Library"
      description="Centralised digital asset management for images, videos, and documents"
      actions={
        <label className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-ink)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-ink)]/80 transition-all font-editorial-mono tracking-wider uppercase cursor-pointer">
          <Upload className="h-4 w-4" />
          Upload Media
          <input type="file" multiple className="hidden" accept="image/*,video/*" />
        </label>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--ad-blue)] flex h-10 w-10 items-center justify-center rounded-lg text-white">
              <Image className="h-5 w-5" />
            </div>
            <div>
              <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Images</p>
              <p className="font-editorial-display text-2xl font-black text-[var(--ad-text-primary)]">1,247</p>
            </div>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--ad-accent)]/10 flex h-10 w-10 items-center justify-center rounded-lg text-[var(--ad-accent)]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
            </div>
            <div>
              <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Videos</p>
              <p className="font-editorial-display text-2xl font-black text-[var(--ad-text-primary)]">38</p>
            </div>
          </div>
        </div>
        <div className="border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--ad-warning)]/10 flex h-10 w-10 items-center justify-center rounded-lg text-[var(--ad-warning)]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            </div>
            <div>
              <p className="font-editorial-mono text-[10px] tracking-wider uppercase text-[var(--ad-text-secondary)]">Documents</p>
              <p className="font-editorial-display text-2xl font-black text-[var(--ad-text-primary)]">15</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ad-text-secondary)]" />
          <input type="text" placeholder="Search media by name, tag, caption..." className="w-full border border-[var(--ad-border)] bg-[var(--ad-card)] py-2.5 pl-10 pr-4 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-text-primary)] transition-colors placeholder:text-[var(--ad-text-secondary)]" />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-[var(--ad-border)] bg-[var(--ad-card)] text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-colors">
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button className="p-2 border border-[var(--ad-border)] text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-colors">
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="group border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden">
            <div className="aspect-[4/3] bg-[var(--ad-paper-2)] relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Image className="h-8 w-8 text-[var(--ad-text-secondary)]" />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button className="p-1.5 bg-[var(--ad-card)] rounded text-[var(--ad-text-primary)] hover:bg-[var(--ad-paper)] transition-colors">
                  <Download className="h-4 w-4" />
                </button>
                <button className="p-1.5 bg-[var(--ad-card)] rounded text-[var(--ad-error)] hover:bg-[var(--ad-error)]/10 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-[var(--ad-text-primary)] truncate">photo-2026-{String(i + 1).padStart(3, "0")}.jpg</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-editorial-mono text-[9px] text-[var(--ad-text-secondary)]">2.4 MB</span>
                <span className="font-editorial-mono text-[9px] text-[var(--ad-text-secondary)]">·</span>
                <span className="font-editorial-mono text-[9px] text-[var(--ad-text-secondary)]">1200×800</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="font-editorial-mono text-[8px] tracking-wider bg-[var(--ad-paper)] px-1.5 py-0.5 text-[var(--ad-text-secondary)]">news</span>
                <span className="font-editorial-mono text-[8px] tracking-wider bg-[var(--ad-paper)] px-1.5 py-0.5 text-[var(--ad-text-secondary)]">politics</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
