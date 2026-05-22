"use client";

import { useState, useMemo } from "react";
import { Image as ImageIcon, Search, FileImage, Megaphone, Settings2, LayoutGrid, List } from "lucide-react";

type MediaItem = {
  id: string;
  title: string;
  url: string;
  publicId: string;
  source: "পোস্ট" | "বিজ্ঞাপন";
  createdAt: Date;
};

type Props = {
  items: MediaItem[];
  siteImages: string[];
  totalPosts: number;
  totalAds: number;
};

const SOURCE_COLORS: Record<string, string> = {
  "পোস্ট": "bg-blue-500/10 text-blue-600 border-blue-500/30",
  "বিজ্ঞাপন": "bg-amber-500/10 text-amber-600 border-amber-500/30",
};

export function MediaClient({ items, siteImages, totalPosts, totalAds }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"সব" | "পোস্ট" | "বিজ্ঞাপন">("সব");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() =>
    items.filter((item) => {
      const matchSource = filter === "সব" || item.source === filter;
      const matchQuery = item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.publicId.toLowerCase().includes(query.toLowerCase());
      return matchSource && matchQuery;
    }),
    [items, filter, query]
  );

  const totalImages = items.length + siteImages.length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "মোট ছবি", value: totalImages, icon: ImageIcon, color: "bg-blue-500/10 text-blue-500" },
          { label: "পোস্ট ছবি", value: totalPosts, icon: FileImage, color: "bg-emerald-500/10 text-emerald-500" },
          { label: "বিজ্ঞাপন ছবি", value: totalAds, icon: Megaphone, color: "bg-amber-500/10 text-amber-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] px-4 py-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--ad-text-primary)] leading-none">{value}</p>
              <p className="text-[10px] text-[var(--ad-text-muted)] mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ad-text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="শিরোনাম বা ID দিয়ে খুঁজুন..."
            className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-bg)] pl-9 pr-3 py-2 text-sm text-[var(--ad-text-primary)] placeholder:text-[var(--ad-text-muted)] focus:border-[var(--ad-green)] outline-none transition-colors"
          />
        </div>

        {/* Source filter */}
        <div className="flex rounded-lg border border-[var(--ad-border)] overflow-hidden">
          {(["সব", "পোস্ট", "বিজ্ঞাপন"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-[var(--ad-green)] text-white"
                  : "bg-[var(--ad-card)] text-[var(--ad-text-secondary)] hover:bg-[var(--ad-bg)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border border-[var(--ad-border)] overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={`p-2 transition-colors ${view === "grid" ? "bg-[var(--ad-green)] text-white" : "bg-[var(--ad-card)] text-[var(--ad-text-secondary)] hover:bg-[var(--ad-bg)]"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 transition-colors ${view === "list" ? "bg-[var(--ad-green)] text-white" : "bg-[var(--ad-card)] text-[var(--ad-text-secondary)] hover:bg-[var(--ad-bg)]"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--ad-border)] bg-[var(--ad-card)] py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ad-bg)]">
            <ImageIcon className="h-8 w-8 text-[var(--ad-text-muted)]" />
          </div>
          <p className="font-semibold text-[var(--ad-text-primary)]">কোনো মিডিয়া নেই</p>
          <p className="mt-1 text-sm text-[var(--ad-text-muted)]">পোস্ট বা বিজ্ঞাপন তৈরির সময় ছবি যোগ হবে</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Site images section */}
          {siteImages.length > 0 && filter === "সব" && (
            <>
              {siteImages.map((url, i) => (
                <div key={`site-${i}`} className="group rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden">
                  <div className="aspect-square bg-[var(--ad-bg)] relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="site asset" className="absolute inset-0 w-full h-full object-contain p-2" />
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-[10px] font-medium text-[var(--ad-text-primary)] truncate">সাইট লোগো/আইকন</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[9px] px-1.5 py-0.5 rounded-full border bg-purple-500/10 text-purple-600 border-purple-500/30">
                      <Settings2 className="h-2.5 w-2.5" /> সেটিংস
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}

          {filtered.map((item) => (
            <div key={item.id} className="group rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden hover:shadow-md transition-all">
              <div className="aspect-[4/3] bg-[var(--ad-bg)] relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="px-2.5 py-2">
                <p className="text-[10px] font-medium text-[var(--ad-text-primary)] truncate">{item.title}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full border ${SOURCE_COLORS[item.source]}`}>
                    {item.source}
                  </span>
                  <span className="text-[9px] text-[var(--ad-text-muted)]">
                    {new Date(item.createdAt).toLocaleDateString("bn-BD")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-4 py-2.5 border-b border-[var(--ad-border)] text-[10px] font-semibold uppercase tracking-widest text-[var(--ad-text-muted)]">
            <span>ছবি</span>
            <span>শিরোনাম</span>
            <span>উৎস</span>
            <span>তারিখ</span>
          </div>
          <div className="divide-y divide-[var(--ad-border)]">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-[var(--ad-text-muted)] py-8">কোনো ফলাফল পাওয়া যায়নি</p>
            ) : filtered.map((item) => (
              <div key={item.id} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-4 py-2.5 hover:bg-[var(--ad-bg)] transition-colors">
                <div className="w-12 h-9 rounded-lg overflow-hidden bg-[var(--ad-bg)] shrink-0 border border-[var(--ad-border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm text-[var(--ad-text-primary)] truncate">{item.title}</p>
                <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border ${SOURCE_COLORS[item.source]}`}>
                  {item.source}
                </span>
                <span className="text-xs text-[var(--ad-text-muted)] whitespace-nowrap">
                  {new Date(item.createdAt).toLocaleDateString("bn-BD")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-[var(--ad-text-muted)] text-center">
        ছবি Cloudinary-তে সংরক্ষিত। পোস্ট বা বিজ্ঞাপন তৈরির সময় স্বয়ংক্রিয়ভাবে আপলোড হয়।
      </p>
    </div>
  );
}
