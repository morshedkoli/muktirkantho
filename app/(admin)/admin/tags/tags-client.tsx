"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Hash, Search, X } from "lucide-react";
import { bnNumber } from "@/lib/bn-number";
import { Input } from "@/components/ui/input";
import { Panel, EmptyState } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

export type TagItem = {
  /** The tag exactly as stored on posts — the public route matches on this. */
  name: string;
  count: number;
};

interface TagsClientProps {
  tags: TagItem[];
}

export function TagsClient({ tags }: TagsClientProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(q));
  }, [tags, query]);

  const max = Math.max(...tags.map((t) => t.count), 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ad-text-muted)]" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ট্যাগ খুঁজুন…"
            className="pl-9"
            aria-label="ট্যাগ খুঁজুন"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="খোঁজা বাতিল"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--ad-text-muted)] hover:text-[var(--ad-text-primary)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className="adm-label shrink-0">
          {bnNumber(tags.length)}টির মধ্যে {bnNumber(filtered.length)}টি
        </span>
      </div>

      <Panel flush>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Hash}
            title={query ? "কোনো ট্যাগ মেলেনি" : "এখনো কোনো ট্যাগ নেই"}
            description={
              query
                ? `“${query}” দিয়ে কিছু পাওয়া যায়নি।`
                : "পোস্ট লেখার সময় ট্যাগ যোগ করলে সেগুলো এখানে জমা হবে।"
            }
            action={
              query ? (
                <Button variant="outline" onClick={() => setQuery("")}>
                  খোঁজা বাতিল
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-[var(--ad-border)]">
            {filtered.map((tag) => (
              <li key={tag.name}>
                <Link
                  href={`/tag/${encodeURIComponent(tag.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-[var(--ad-card-alt)]"
                >
                  <Hash className="h-3.5 w-3.5 shrink-0 text-[var(--ad-text-muted)]" />
                  <span className="w-40 shrink-0 truncate text-[13px] font-semibold text-[var(--ad-text-primary)]">
                    {tag.name}
                  </span>
                  <span className="hidden h-[5px] flex-1 overflow-hidden rounded-full bg-[var(--ad-inset)] sm:block">
                    <span
                      className="block h-full rounded-full bg-[var(--ad-border-strong)]"
                      style={{ width: `${Math.max(4, (tag.count / max) * 100)}%` }}
                    />
                  </span>
                  <span className="adm-mono ml-auto shrink-0 text-[12px] text-[var(--ad-text-secondary)] sm:ml-0">
                    {bnNumber(tag.count)} পোস্ট
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
