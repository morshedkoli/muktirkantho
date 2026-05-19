"use client";

import { useState, useMemo } from "react";
import { Hash, Search, TrendingUp, FileText, Tag } from "lucide-react";
import Link from "next/link";

type TagItem = { name: string; count: number };

const SIZE_CLASSES = [
  "text-[11px] px-2 py-0.5",
  "text-xs px-2.5 py-1",
  "text-sm px-3 py-1",
  "text-sm px-3 py-1.5 font-semibold",
  "text-base px-3.5 py-1.5 font-bold",
];

function tagSize(count: number, max: number) {
  if (max === 0) return 0;
  const ratio = count / max;
  if (ratio > 0.8) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  if (ratio > 0.1) return 1;
  return 0;
}

const ACCENT_COLORS = [
  "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20 dark:text-emerald-400",
  "bg-blue-500/10 text-blue-700 border-blue-500/30 hover:bg-blue-500/20 dark:text-blue-400",
  "bg-violet-500/10 text-violet-700 border-violet-500/30 hover:bg-violet-500/20 dark:text-violet-400",
  "bg-rose-500/10 text-rose-700 border-rose-500/30 hover:bg-rose-500/20 dark:text-rose-400",
  "bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/20 dark:text-amber-400",
  "bg-cyan-500/10 text-cyan-700 border-cyan-500/30 hover:bg-cyan-500/20 dark:text-cyan-400",
  "bg-pink-500/10 text-pink-700 border-pink-500/30 hover:bg-pink-500/20 dark:text-pink-400",
  "bg-indigo-500/10 text-indigo-700 border-indigo-500/30 hover:bg-indigo-500/20 dark:text-indigo-400",
  "bg-teal-500/10 text-teal-700 border-teal-500/30 hover:bg-teal-500/20 dark:text-teal-400",
  "bg-orange-500/10 text-orange-700 border-orange-500/30 hover:bg-orange-500/20 dark:text-orange-400",
];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return ACCENT_COLORS[h % ACCENT_COLORS.length];
}

export function TagsClient({ tags, totalPosts }: { tags: TagItem[]; totalPosts: number }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"cloud" | "list">("cloud");

  const filtered = useMemo(() =>
    tags.filter((t) => t.name.toLowerCase().includes(query.toLowerCase())),
    [tags, query]
  );

  const max = tags[0]?.count ?? 0;
  const totalUsage = tags.reduce((s, t) => s + t.count, 0);

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "মোট ট্যাগ", value: tags.length, icon: Hash, color: "text-violet-500 bg-violet-500/10" },
          { label: "মোট ব্যবহার", value: totalUsage, icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "মোট পোস্ট", value: totalPosts, icon: FileText, color: "text-blue-500 bg-blue-500/10" },
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
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ad-text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ট্যাগ খুঁজুন..."
            className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-bg)] pl-9 pr-3 py-2 text-sm text-[var(--ad-text-primary)] placeholder:text-[var(--ad-text-muted)] focus:border-[var(--ad-green)] outline-none transition-colors"
          />
        </div>
        {/* View toggle */}
        <div className="flex rounded-lg border border-[var(--ad-border)] overflow-hidden shrink-0">
          {(["cloud", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                view === v
                  ? "bg-[var(--ad-green)] text-white"
                  : "bg-[var(--ad-card)] text-[var(--ad-text-secondary)] hover:bg-[var(--ad-bg)]"
              }`}
            >
              {v === "cloud" ? "ক্লাউড" : "তালিকা"}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {tags.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--ad-border)] bg-[var(--ad-card)] py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ad-bg)]">
            <Tag className="h-8 w-8 text-[var(--ad-text-muted)]" />
          </div>
          <p className="font-semibold text-[var(--ad-text-primary)]">কোনো ট্যাগ নেই</p>
          <p className="mt-1 text-sm text-[var(--ad-text-muted)]">পোস্ট তৈরির সময় ট্যাগ যোগ করুন</p>
        </div>
      ) : view === "cloud" ? (
        /* Tag cloud */
        <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-[var(--ad-text-muted)] py-8">কোনো ফলাফল পাওয়া যায়নি</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filtered.map((tag) => {
                const sz = tagSize(tag.count, max);
                return (
                  <Link
                    key={tag.name}
                    href={`/tag/${encodeURIComponent(tag.name)}`}
                    target="_blank"
                    className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${SIZE_CLASSES[sz]} ${colorFor(tag.name)}`}
                  >
                    <Hash className="h-3 w-3 shrink-0" />
                    {tag.name}
                    <span className="opacity-60 text-[10px]">{tag.count}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* List view */
        <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] text-[10px] font-semibold uppercase tracking-widest text-[var(--ad-text-muted)] border-b border-[var(--ad-border)] px-4 py-2.5">
            <span>ট্যাগ</span>
            <span className="text-right pr-8">পোস্ট</span>
            <span className="text-right">লিংক</span>
          </div>
          <div className="divide-y divide-[var(--ad-border)]">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-[var(--ad-text-muted)] py-8">কোনো ফলাফল পাওয়া যায়নি</p>
            ) : filtered.map((tag, i) => (
              <div key={tag.name} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--ad-bg)] transition-colors">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${colorFor(tag.name)}`}>
                  <Hash className="h-3 w-3" />
                  {tag.name}
                </span>
                <div className="flex-1 mx-2">
                  <div className="h-1.5 rounded-full bg-[var(--ad-bg)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--ad-green)] transition-all"
                      style={{ width: `${max > 0 ? (tag.count / max) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-[var(--ad-text-primary)] w-8 text-right">{tag.count}</span>
                <Link
                  href={`/tag/${encodeURIComponent(tag.name)}`}
                  target="_blank"
                  className="text-xs text-[var(--ad-text-muted)] hover:text-[var(--ad-green)] transition-colors ml-1"
                >
                  →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-[var(--ad-text-muted)] text-center">
        ট্যাগ পোস্ট তৈরির সময় যোগ হয়। এখানে সমস্ত ট্যাগের সারসংক্ষেপ দেখানো হচ্ছে।
      </p>
    </div>
  );
}
