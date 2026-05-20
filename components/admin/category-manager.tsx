"use client";

import { useState, useMemo, useActionState, useRef, useEffect, useCallback } from "react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { Plus, Trash2, Loader2, Search, Tag, X, FileText } from "lucide-react";
import { useToast } from "@/components/admin/toast-provider";
import { useConfirm } from "@/components/admin/confirm-provider";

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

function isRedirectError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const err = error as { digest?: string; message?: string };
  return (
    err.digest?.startsWith("NEXT_REDIRECT") === true ||
    err.message?.includes("NEXT_REDIRECT") === true
  );
}

function DeleteButton({
  category,
  deleteAction,
}: {
  category: Category;
  deleteAction: (id: string) => Promise<void>;
}) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: "Delete Category",
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });
    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      await deleteAction(category.id);
      showToast("Category deleted successfully", "success");
    } catch (error) {
      if (isRedirectError(error)) {
        showToast("Category deleted successfully", "success");
        return;
      }
      showToast("Failed to delete category", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="absolute top-2 right-2 p-1.5 rounded-lg text-[var(--ad-text-secondary)] hover:text-[var(--ad-error)] hover:bg-[var(--ad-error)]/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete category"
    >
      {isDeleting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function CategoryCard({
  category,
  deleteAction,
}: {
  category: Category;
  deleteAction: (id: string) => Promise<void>;
}) {
  const postCount = category._count?.posts ?? 0;

  return (
    <div className="relative group rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <DeleteButton category={category} deleteAction={deleteAction} />

      {/* Icon */}
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40 mb-3">
        <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      </div>

      {/* Name */}
      <p className="font-semibold text-sm text-[var(--ad-text-primary)] leading-snug pr-6 truncate font-bangla">
        {category.name}
      </p>

      {/* Slug */}
      <p className="mt-0.5 text-[11px] font-mono text-[var(--ad-text-muted)] truncate">
        /{category.slug}
      </p>

      {/* Post count */}
      <div className="mt-3 pt-3 border-t border-[var(--ad-border)]">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
          <FileText className="h-3 w-3" />
          {postCount} {postCount === 1 ? "post" : "posts"}
        </span>
      </div>
    </div>
  );
}

export function CategoryManager({
  categories,
  createAction,
  deleteAction,
  initialState,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ad-text-muted)]">
            Total Categories
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--ad-text-primary)]">
            {categories.length}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ad-text-muted)]">
            Total Posts
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--ad-text-primary)]">
            {categories.reduce((sum, c) => sum + (c._count?.posts ?? 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 sm:max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ad-text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories…"
            className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] pl-9 pr-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-primary-hover)] transition-all shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Add Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        createAction={createAction}
        initialState={initialState}
      />

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/40 mb-4">
            <Tag className="h-7 w-7 text-purple-600 dark:text-purple-400" />
          </div>
          {searchQuery ? (
            <>
              <p className="font-semibold text-[var(--ad-text-primary)]">No results found</p>
              <p className="text-sm text-[var(--ad-text-secondary)] mt-1">
                No categories match &ldquo;{searchQuery}&rdquo;
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-[var(--ad-text-primary)]">No categories yet</p>
              <p className="text-sm text-[var(--ad-text-secondary)] mt-1">
                Click &ldquo;Add Category&rdquo; to get started
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              deleteAction={deleteAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryModal({
  isOpen,
  onClose,
  createAction,
  initialState,
}: {
  isOpen: boolean;
  onClose: () => void;
  createAction: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  initialState: AdminActionState;
}) {
  const [state, formAction, pending] = useActionState(createAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && formRef.current) formRef.current.reset();
  }, [isOpen]);

  const handleSubmit = useCallback(
    async (formData: FormData) => { await formAction(formData); },
    [formAction]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--ad-card)] rounded-2xl shadow-2xl border border-[var(--ad-border)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ad-border)]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
              <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-base font-semibold text-[var(--ad-text-primary)]">Add Category</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--ad-border)]/50 text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} action={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] mb-1.5 font-mono">
              Name <span className="text-[var(--ad-error)] normal-case font-normal tracking-normal">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              placeholder="Enter category name…"
              className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-xs font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] mb-1.5 font-mono">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              placeholder="auto-generated-from-name"
              className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)] font-mono"
            />
          </div>

          {state.status === "error" && (
            <div className="rounded-lg bg-[var(--ad-error)]/10 border border-[var(--ad-error)]/20 p-3 flex items-start gap-2">
              <div className="h-4 w-4 rounded-full bg-[var(--ad-error)]/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-[var(--ad-error)]">!</span>
              </div>
              <p className="text-sm text-[var(--ad-error)]">{state.message}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] bg-transparent hover:bg-[var(--ad-border)]/40 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-primary)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
