"use client";

import { useMemo, useState } from "react";
import {
  Image as ImageIcon,
  Search,
  LayoutGrid,
  List,
  ExternalLink,
  Copy,
  Check,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, Panel } from "@/components/admin/ui";
import { useToast } from "@/components/admin/toast-provider";
import { cn } from "@/lib/cn";

export type MediaSource = "post" | "ad" | "branding";

export type MediaItem = {
  id: string;
  title: string;
  url: string;
  publicId: string;
  source: MediaSource;
  createdAt: string;
};

const sourceLabel: Record<MediaSource, string> = {
  post: "পোস্ট",
  ad: "বিজ্ঞাপন",
  branding: "ব্র্যান্ডিং",
};

const sourceVariant: Record<MediaSource, "info" | "warning" | "secondary"> = {
  post: "info",
  ad: "warning",
  branding: "secondary",
};

const filters: { key: MediaSource | "all"; label: string }[] = [
  { key: "all", label: "সব" },
  { key: "post", label: "পোস্ট" },
  { key: "ad", label: "বিজ্ঞাপন" },
  { key: "branding", label: "ব্র্যান্ডিং" },
];

interface MediaClientProps {
  items: MediaItem[];
}

export function MediaClient({ items }: MediaClientProps) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<MediaSource | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [preview, setPreview] = useState<MediaItem | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (source !== "all" && item.source !== source) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.publicId.toLowerCase().includes(q)
      );
    });
  }, [items, query, source]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ad-text-muted)]" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="শিরোনাম বা আইডি দিয়ে খুঁজুন…"
            className="pl-9"
            aria-label="মিডিয়া খুঁজুন"
          />
        </div>

        <div className="flex gap-2.5">
          <div className="flex overflow-hidden rounded-[var(--ad-radius-sm)] border border-[var(--ad-border-strong)]">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setSource(f.key)}
                aria-pressed={source === f.key}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-medium transition-colors",
                  source === f.key
                    ? "bg-[var(--ad-primary)] text-[var(--ad-on-primary)]"
                    : "bg-[var(--ad-card)] text-[var(--ad-text-secondary)] hover:bg-[var(--ad-inset)]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex overflow-hidden rounded-[var(--ad-radius-sm)] border border-[var(--ad-border-strong)]">
            {(
              [
                { key: "grid", Icon: LayoutGrid, label: "গ্রিড ভিউ" },
                { key: "list", Icon: List, label: "তালিকা ভিউ" },
              ] as const
            ).map(({ key, Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                aria-label={label}
                aria-pressed={view === key}
                className={cn(
                  "px-2.5 py-1.5 transition-colors",
                  view === key
                    ? "bg-[var(--ad-primary)] text-[var(--ad-on-primary)]"
                    : "bg-[var(--ad-card)] text-[var(--ad-text-secondary)] hover:bg-[var(--ad-inset)]"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Panel flush>
          <EmptyState
            icon={ImageIcon}
            title={items.length === 0 ? "কোনো মিডিয়া নেই" : "কোনো ফলাফল মেলেনি"}
            description={
              items.length === 0
                ? "পোস্ট বা বিজ্ঞাপনে ছবি যোগ করলে সেগুলো এখানে জমা হবে।"
                : "খোঁজার শব্দ বা ফিল্টার বদলে দেখুন।"
            }
          />
        </Panel>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPreview(item)}
              className="group overflow-hidden rounded-[var(--ad-radius)] border border-[var(--ad-border)] bg-[var(--ad-card)] text-left transition-colors hover:border-[var(--ad-border-strong)]"
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-[var(--ad-inset)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.title}
                  loading="lazy"
                  className={cn(
                    "h-full w-full transition-transform duration-300 group-hover:scale-[1.03]",
                    item.source === "branding" ? "object-contain p-3" : "object-cover"
                  )}
                />
              </span>
              <span className="block space-y-1.5 p-3">
                <span className="block truncate text-[12px] font-semibold text-[var(--ad-text-primary)]">
                  {item.title}
                </span>
                <span className="flex items-center justify-between gap-2">
                  <Badge variant={sourceVariant[item.source]}>
                    {sourceLabel[item.source]}
                  </Badge>
                  <span className="adm-mono text-[10px] text-[var(--ad-text-muted)]">
                    {format(new Date(item.createdAt), "d MMM")}
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <Panel flush>
          <ul className="divide-y divide-[var(--ad-border)]">
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setPreview(item)}
                  className="flex w-full items-center gap-3.5 px-4 py-2.5 text-left transition-colors hover:bg-[var(--ad-card-alt)]"
                >
                  <span className="h-10 w-14 shrink-0 overflow-hidden rounded-[4px] border border-[var(--ad-border)] bg-[var(--ad-inset)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-[var(--ad-text-primary)]">
                      {item.title}
                    </span>
                    <span className="adm-mono block truncate text-[10.5px] text-[var(--ad-text-muted)]">
                      {item.publicId}
                    </span>
                  </span>
                  <Badge variant={sourceVariant[item.source]}>
                    {sourceLabel[item.source]}
                  </Badge>
                  <span className="adm-mono hidden w-20 shrink-0 text-right text-[11px] text-[var(--ad-text-muted)] sm:block">
                    {format(new Date(item.createdAt), "d MMM yyyy")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <p className="adm-label text-center">
        ছবি Cloudinary-তে সংরক্ষিত — পোস্ট বা বিজ্ঞাপন তৈরির সময় স্বয়ংক্রিয়ভাবে আপলোড হয়
      </p>

      {preview && <MediaPreview item={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

/* ── Preview ─────────────────────────────────────────────────────────────── */

function MediaPreview({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      showToast("লিংক কপি করা যায়নি", "error");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-[#0a0a0c]/75" onClick={onClose} />

      <div className="animate-fade-in-up relative w-full max-w-3xl overflow-hidden rounded-[var(--ad-radius-lg)] border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-[var(--ad-shadow-lg)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--ad-border)] px-5 py-3.5">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-[var(--ad-text-primary)]">
              {item.title}
            </p>
            <p className="adm-mono mt-0.5 truncate text-[10.5px] text-[var(--ad-text-muted)]">
              {item.publicId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="rounded-[var(--ad-radius-sm)] p-1.5 text-[var(--ad-text-muted)] transition-colors hover:bg-[var(--ad-inset)] hover:text-[var(--ad-text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex max-h-[60vh] items-center justify-center bg-[var(--ad-inset)] p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt={item.title}
            className="max-h-[55vh] w-auto max-w-full object-contain"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ad-border)] bg-[var(--ad-card-alt)] px-5 py-3">
          <Badge variant={sourceVariant[item.source]}>{sourceLabel[item.source]}</Badge>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyUrl}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "কপি হয়েছে" : "লিংক কপি"}
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                খুলুন
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
