"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, Eye, Pencil, FileText, Plus, Star } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, Panel } from "@/components/admin/ui";
import { DeletePostButton } from "@/components/admin/delete-post-button";
import { cn } from "@/lib/cn";

export type PostRow = {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  status: "published" | "draft";
  featured: boolean;
  category: string;
  categoryId: string;
  district: string;
  upazila: string | null;
  viewCount: number;
  updatedAt: string;
  publicPath: string;
};

type StatusFilter = "all" | "published" | "draft";

const PAGE_SIZE = 20;

interface PostsBrowserProps {
  posts: PostRow[];
  categories: { id: string; name: string }[];
}

/**
 * The posts list is the screen editors live in, so the toolbar is real: the
 * search box filters, the selects filter, and the pager pages. The previous
 * version rendered all three as decoration, which is worse than omitting them.
 */
export function PostsBrowser({ posts, categories }: PostsBrowserProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [categoryId, setCategoryId] = useState("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (status !== "all" && post.status !== status) return false;
      if (categoryId !== "all" && post.categoryId !== categoryId) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.district.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q)
      );
    });
  }, [posts, query, status, categoryId]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(0);
  };

  const isFiltered = query.trim() !== "" || status !== "all" || categoryId !== "all";

  const clearFilters = () => {
    setQuery("");
    setStatus("all");
    setCategoryId("all");
    setPage(0);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ad-text-muted)]" />
          <Input
            type="search"
            value={query}
            onChange={(e) => resetPage(setQuery)(e.target.value)}
            placeholder="শিরোনাম, ক্যাটাগরি বা জেলা দিয়ে খুঁজুন…"
            className="pl-9"
            aria-label="পোস্ট খুঁজুন"
          />
          {query && (
            <button
              type="button"
              onClick={() => resetPage(setQuery)("")}
              aria-label="খোঁজা বাতিল"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--ad-text-muted)] hover:text-[var(--ad-text-primary)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-2.5">
          <Select
            value={status}
            onChange={(e) => resetPage(setStatus)(e.target.value as StatusFilter)}
            aria-label="অবস্থা অনুযায়ী ফিল্টার"
            className="w-full sm:w-36"
          >
            <option value="all">সব অবস্থা</option>
            <option value="published">প্রকাশিত</option>
            <option value="draft">খসড়া</option>
          </Select>

          <Select
            value={categoryId}
            onChange={(e) => resetPage(setCategoryId)(e.target.value)}
            aria-label="ক্যাটাগরি অনুযায়ী ফিল্টার"
            className="w-full sm:w-44"
          >
            <option value="all">সব ক্যাটাগরি</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>

          {isFiltered && (
            <Button variant="ghost" onClick={clearFilters} className="shrink-0">
              রিসেট
            </Button>
          )}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2.5 lg:hidden">
        {visible.length === 0 ? (
          <Panel flush>
            <PostsEmpty isFiltered={isFiltered} onClear={clearFilters} />
          </Panel>
        ) : (
          visible.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-[var(--ad-radius)] border border-[var(--ad-border)] bg-[var(--ad-card)]"
            >
              <div className="flex gap-3 p-3.5">
                <Thumb post={post} className="h-16 w-[84px]" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-[var(--ad-text-primary)]">
                    {post.title}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge dot variant={post.status === "published" ? "success" : "warning"}>
                      {post.status === "published" ? "প্রকাশিত" : "খসড়া"}
                    </Badge>
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                  <p className="adm-mono mt-2 truncate text-[10.5px] text-[var(--ad-text-muted)]">
                    {post.district} · {format(new Date(post.updatedAt), "d MMM yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1 border-t border-[var(--ad-border)] bg-[var(--ad-card-alt)] px-2.5 py-1.5">
                <RowActions post={post} />
              </div>
            </article>
          ))
        )}
      </div>

      {/* Desktop table */}
      <Panel flush className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[42%] pl-5">শিরোনাম</TableHead>
              <TableHead className="w-[13%]">ক্যাটাগরি</TableHead>
              <TableHead className="w-[15%]">অবস্থান</TableHead>
              <TableHead className="w-[10%]">অবস্থা</TableHead>
              <TableHead className="w-[10%]">সম্পাদনা</TableHead>
              <TableHead className="w-[10%] pr-5 text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="p-0">
                  <PostsEmpty isFiltered={isFiltered} onClear={clearFilters} />
                </TableCell>
              </TableRow>
            ) : (
              visible.map((post) => (
                <TableRow key={post.id} className="group">
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <Thumb post={post} className="h-10 w-[60px]" />
                      <div className="min-w-0">
                        <Link
                          href={`/admin/posts/edit/${post.id}`}
                          className="flex items-center gap-1.5 truncate text-[13.5px] font-semibold text-[var(--ad-text-primary)] transition-colors hover:text-[var(--ad-accent)]"
                        >
                          {post.featured && (
                            <Star className="h-3 w-3 shrink-0 fill-[var(--ad-warning)] text-[var(--ad-warning)]" />
                          )}
                          <span className="truncate">{post.title}</span>
                        </Link>
                        <p className="mt-0.5 truncate text-[11.5px] text-[var(--ad-text-muted)]">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{post.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="truncate text-[12.5px] font-medium text-[var(--ad-text-primary)]">
                      {post.district}
                    </p>
                    {post.upazila && (
                      <p className="truncate text-[11px] text-[var(--ad-text-muted)]">
                        {post.upazila}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge dot variant={post.status === "published" ? "success" : "warning"}>
                      {post.status === "published" ? "প্রকাশিত" : "খসড়া"}
                    </Badge>
                  </TableCell>
                  <TableCell className="adm-mono text-[11.5px] text-[var(--ad-text-muted)]">
                    {format(new Date(post.updatedAt), "d MMM yyyy")}
                  </TableCell>
                  <TableCell className="pr-5">
                    <div className="flex items-center justify-end gap-0.5">
                      <RowActions post={post} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Panel>

      {/* Pager */}
      {filtered.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="adm-label">
            {filtered.length}টির মধ্যে {safePage * PAGE_SIZE + 1}–
            {Math.min(filtered.length, (safePage + 1) * PAGE_SIZE)} দেখানো হচ্ছে
          </p>
          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                আগের
              </Button>
              <span className="adm-mono text-[12px] text-[var(--ad-text-secondary)]">
                {safePage + 1} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              >
                পরের
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Pieces ──────────────────────────────────────────────────────────────── */

function Thumb({ post, className }: { post: PostRow; className?: string }) {
  return (
    <span
      className={cn(
        "shrink-0 overflow-hidden rounded-[4px] border border-[var(--ad-border)] bg-[var(--ad-inset)]",
        className
      )}
    >
      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          <FileText className="h-4 w-4 text-[var(--ad-text-muted)]" />
        </span>
      )}
    </span>
  );
}

function RowActions({ post }: { post: PostRow }) {
  return (
    <>
      <Button asChild variant="icon" size="icon" aria-label="সাইটে দেখুন">
        <Link href={post.publicPath} target="_blank" rel="noopener noreferrer">
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button asChild variant="icon" size="icon" aria-label="সম্পাদনা">
        <Link href={`/admin/posts/edit/${post.id}`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <DeletePostButton postId={post.id} postTitle={post.title} />
    </>
  );
}

function PostsEmpty({
  isFiltered,
  onClear,
}: {
  isFiltered: boolean;
  onClear: () => void;
}) {
  if (isFiltered) {
    return (
      <EmptyState
        icon={Search}
        title="কোনো পোস্ট মেলেনি"
        description="ফিল্টার বদলে আবার চেষ্টা করুন।"
        action={
          <Button variant="outline" onClick={onClear}>
            ফিল্টার রিসেট করুন
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      icon={FileText}
      title="এখনো কোনো পোস্ট নেই"
      description="প্রথম সংবাদ লিখে প্রকাশনা শুরু করুন।"
      action={
        <Button asChild>
          <Link href="/admin/posts/create">
            <Plus className="h-4 w-4" />
            নতুন পোস্ট
          </Link>
        </Button>
      }
    />
  );
}
