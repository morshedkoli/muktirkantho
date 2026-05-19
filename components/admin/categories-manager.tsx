"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Tag, FolderOpen } from "lucide-react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { useToast } from "@/components/admin/toast-provider";
import { useConfirm } from "@/components/admin/confirm-provider";
import { AddItemModal } from "./add-item-modal";

type Category = {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
};

type Props = {
  items: Category[];
  createAction: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  deleteAction: (id: string) => Promise<void>;
  initialState: AdminActionState;
};

const CARD_ACCENTS = [
  "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
  "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  "from-violet-500/20 to-violet-500/5 border-violet-500/30",
  "from-rose-500/20 to-rose-500/5 border-rose-500/30",
  "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
  "from-pink-500/20 to-pink-500/5 border-pink-500/30",
  "from-indigo-500/20 to-indigo-500/5 border-indigo-500/30",
  "from-teal-500/20 to-teal-500/5 border-teal-500/30",
  "from-orange-500/20 to-orange-500/5 border-orange-500/30",
];

const ICON_COLORS = [
  "text-emerald-500", "text-blue-500", "text-violet-500", "text-rose-500",
  "text-amber-500", "text-cyan-500", "text-pink-500", "text-indigo-500",
  "text-teal-500", "text-orange-500",
];

function isRedirectError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const err = error as { digest?: string; message?: string };
  return err.digest?.startsWith("NEXT_REDIRECT") === true ||
    err.message?.includes("NEXT_REDIRECT") === true;
}

function CategoryCard({
  item,
  accent,
  iconColor,
  deleteAction,
}: {
  item: Category;
  accent: string;
  iconColor: string;
  deleteAction: (id: string) => Promise<void>;
}) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const ok = await confirm({
      title: "বিভাগ মুছুন",
      message: `"${item.name}" বিভাগটি মুছে ফেলবেন? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।`,
      confirmText: "মুছুন",
      cancelText: "বাতিল",
      type: "danger",
    });
    if (!ok) return;
    setIsDeleting(true);
    try {
      await deleteAction(item.id);
      showToast("বিভাগ মুছে ফেলা হয়েছে", "success");
    } catch (err) {
      if (isRedirectError(err)) {
        showToast("বিভাগ মুছে ফেলা হয়েছে", "success");
        return;
      }
      showToast("মুছতে সমস্যা হয়েছে", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const postCount = item._count?.posts ?? 0;

  return (
    <div className={`group relative rounded-xl border bg-gradient-to-br ${accent} p-3.5 flex flex-col gap-2 transition-all hover:shadow-md hover:-translate-y-0.5`}>
      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 text-[var(--ad-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
        title="মুছুন"
      >
        {isDeleting
          ? <Loader2 className="h-3 w-3 animate-spin" />
          : <Trash2 className="h-3 w-3" />}
      </button>

      {/* Icon */}
      <div className={`w-7 h-7 rounded-lg bg-[var(--ad-card)] flex items-center justify-center shadow-sm border border-[var(--ad-border)] ${iconColor}`}>
        <Tag className="h-3.5 w-3.5" />
      </div>

      {/* Name */}
      <div className="flex-1">
        <h3 className="text-sm font-bold text-[var(--ad-text-primary)] leading-snug">{item.name}</h3>
        <p className="text-[10px] font-mono text-[var(--ad-text-muted)] mt-0.5">/{item.slug}</p>
      </div>

      {/* Post count badge */}
      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--ad-card)] border border-[var(--ad-border)] w-fit ${iconColor}`}>
        <FolderOpen className="h-2.5 w-2.5" />
        {postCount} পোস্ট
      </span>
    </div>
  );
}

export function CategoriesManager({ items, createAction, deleteAction, initialState }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--ad-text-primary)]">বিভাগসমূহ</h2>
          <p className="text-sm text-[var(--ad-text-secondary)] mt-0.5">
            সংবাদের বিভাগ তৈরি ও পরিচালনা করুন
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--ad-green)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          নতুন বিভাগ
        </button>
      </div>

      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="নতুন বিভাগ যোগ করুন"
        itemName="Category"
        createAction={createAction}
        initialState={initialState}
        type="category"
      />

      {/* Stats bar */}
      <div className="flex items-center gap-3 rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] px-5 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ad-green)]/10 text-[var(--ad-green)]">
          <Tag className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ad-text-primary)]">{items.length}টি বিভাগ</p>
          <p className="text-xs text-[var(--ad-text-muted)]">মোট সক্রিয় বিভাগ</p>
        </div>
      </div>

      {/* Cards grid */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--ad-border)] bg-[var(--ad-card)] py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ad-bg)]">
            <Tag className="h-8 w-8 text-[var(--ad-text-muted)]" />
          </div>
          <p className="font-semibold text-[var(--ad-text-primary)]">কোনো বিভাগ নেই</p>
          <p className="mt-1 text-sm text-[var(--ad-text-muted)]">উপরের বোতামে ক্লিক করে প্রথম বিভাগ যোগ করুন</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {items.map((item, i) => (
            <CategoryCard
              key={item.id}
              item={item}
              accent={CARD_ACCENTS[i % CARD_ACCENTS.length]}
              iconColor={ICON_COLORS[i % ICON_COLORS.length]}
              deleteAction={deleteAction}
            />
          ))}

          {/* Add new card shortcut */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl border-2 border-dashed border-[var(--ad-border)] bg-transparent hover:border-[var(--ad-green)] hover:bg-[var(--ad-green)]/5 transition-all p-3.5 flex flex-col items-center justify-center gap-1.5 text-[var(--ad-text-muted)] hover:text-[var(--ad-green)] min-h-[110px]"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">নতুন বিভাগ</span>
          </button>
        </div>
      )}
    </div>
  );
}
