"use client";

import { useState, useMemo, useActionState, useRef, useEffect } from "react";
import { Plus, Trash2, Loader2, Search, FolderOpen, X, FileText } from "lucide-react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { bnNumber } from "@/lib/bn-number";
import { useToast } from "@/components/admin/toast-provider";
import { useConfirm } from "@/components/admin/confirm-provider";
import { Modal } from "@/components/admin/modal";
import { Panel, StatTile, EmptyState, Field, Alert } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
};

type Props = {
  categories: Category[];
  createAction: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  deleteAction: (id: string) => Promise<void>;
  initialState: AdminActionState;
};

/** A server-action redirect throws — that is success, not failure. */
function isRedirectError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const err = error as { digest?: string; message?: string };
  return (
    err.digest?.startsWith("NEXT_REDIRECT") === true ||
    err.message?.includes("NEXT_REDIRECT") === true
  );
}

export function CategoryManager({
  categories,
  createAction,
  deleteAction,
  initialState,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, query]);

  const totalPosts = categories.reduce((sum, c) => sum + (c._count?.posts ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
        <StatTile
          label="মোট ক্যাটাগরি"
          value={bnNumber(categories.length)}
          icon={FolderOpen}
        />
        <StatTile
          label="শ্রেণিবদ্ধ পোস্ট"
          value={bnNumber(totalPosts)}
          tone="info"
          icon={FileText}
        />
        <StatTile
          label="গড় পোস্ট"
          value={bnNumber(
            categories.length > 0 ? Math.round(totalPosts / categories.length) : 0
          )}
          hint="প্রতি ক্যাটাগরিতে"
          className="hidden sm:block"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ad-text-muted)]" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ক্যাটাগরি খুঁজুন…"
            className="pl-9"
            aria-label="ক্যাটাগরি খুঁজুন"
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
        <Button onClick={() => setModalOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          নতুন ক্যাটাগরি
        </Button>
      </div>

      <Panel flush>
        {filtered.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title={query ? "কোনো ক্যাটাগরি মেলেনি" : "এখনো কোনো ক্যাটাগরি নেই"}
            description={
              query
                ? `“${query}” দিয়ে কিছু পাওয়া যায়নি।`
                : "সংবাদ সাজাতে প্রথম ক্যাটাগরি তৈরি করুন।"
            }
            action={
              query ? (
                <Button variant="outline" onClick={() => setQuery("")}>
                  খোঁজা বাতিল
                </Button>
              ) : (
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  নতুন ক্যাটাগরি
                </Button>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-[var(--ad-border)]">
            {filtered.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                deleteAction={deleteAction}
              />
            ))}
          </ul>
        )}
      </Panel>

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        createAction={createAction}
        initialState={initialState}
      />
    </div>
  );
}

/* ── Row ─────────────────────────────────────────────────────────────────── */

function CategoryRow({
  category,
  deleteAction,
}: {
  category: Category;
  deleteAction: (id: string) => Promise<void>;
}) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [deleting, setDeleting] = useState(false);
  const postCount = category._count?.posts ?? 0;

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "ক্যাটাগরি মুছবেন?",
      message:
        postCount > 0
          ? `“${category.name}” মুছলে এর ${postCount}টি পোস্ট ক্যাটাগরিহীন হয়ে যাবে।`
          : `“${category.name}” স্থায়ীভাবে মুছে যাবে।`,
      confirmText: "মুছে ফেলুন",
      cancelText: "বাতিল",
      type: "danger",
    });
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteAction(category.id);
      showToast("ক্যাটাগরি মুছে ফেলা হয়েছে", "success");
    } catch (error) {
      if (isRedirectError(error)) {
        showToast("ক্যাটাগরি মুছে ফেলা হয়েছে", "success");
        return;
      }
      showToast("ক্যাটাগরি মুছে ফেলা যায়নি", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <li className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--ad-card-alt)]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--ad-radius-sm)] border border-[var(--ad-border)] bg-[var(--ad-card-alt)]">
        <FolderOpen className="h-4 w-4 text-[var(--ad-text-muted)]" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold text-[var(--ad-text-primary)]">
          {category.name}
        </span>
        <span className="adm-mono block truncate text-[11px] text-[var(--ad-text-muted)]">
          /{category.slug}
        </span>
      </span>

      <span className="adm-mono shrink-0 text-[12px] text-[var(--ad-text-secondary)]">
        {bnNumber(postCount)} পোস্ট
      </span>

      <Button
        type="button"
        variant="icon"
        size="icon"
        onClick={handleDelete}
        disabled={deleting}
        aria-label={`${category.name} মুছুন`}
        className="shrink-0 hover:bg-[var(--ad-error-tint)] hover:text-[var(--ad-error)]"
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </li>
  );
}

/* ── Create dialog ───────────────────────────────────────────────────────── */

function CategoryModal({
  open,
  onClose,
  createAction,
  initialState,
}: {
  open: boolean;
  onClose: () => void;
  createAction: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  initialState: AdminActionState;
}) {
  const [state, formAction, pending] = useActionState(createAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  /* Close once the submit settles without an error. The server action redirects
     on success rather than returning a success state, so keying off `pending`
     falling is the only signal that covers both outcomes. */
  useEffect(() => {
    if (wasPending.current && !pending && state.status !== "error") {
      formRef.current?.reset();
      onClose();
    }
    wasPending.current = pending;
  }, [pending, state.status, onClose]);

  useEffect(() => {
    if (open) formRef.current?.reset();
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      kicker="নিউজরুম"
      title="নতুন ক্যাটাগরি"
      description="সংবাদ সাজানোর জন্য একটি নতুন বিভাগ যোগ করুন।"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            বাতিল
          </Button>
          <Button type="submit" form="category-form" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                তৈরি হচ্ছে…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                তৈরি করুন
              </>
            )}
          </Button>
        </>
      }
    >
      <form id="category-form" ref={formRef} action={formAction} className="space-y-4">
        <Field label="নাম" htmlFor="category-name" required>
          <Input
            id="category-name"
            name="name"
            type="text"
            required
            autoFocus
            placeholder="যেমন: জাতীয়"
          />
        </Field>

        <Field
          label="স্লাগ"
          htmlFor="category-slug"
          hint="খালি রাখলে নাম থেকে স্বয়ংক্রিয়ভাবে তৈরি হবে"
        >
          <Input
            id="category-slug"
            name="slug"
            type="text"
            placeholder="auto-generated"
            className="adm-mono"
          />
        </Field>

        {state.status === "error" && <Alert tone="error">{state.message}</Alert>}
      </form>
    </Modal>
  );
}
