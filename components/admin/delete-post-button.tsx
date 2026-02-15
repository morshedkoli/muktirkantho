"use client";

import { Trash2 } from "lucide-react";
import { deletePostAction } from "@/app/(admin)/admin/actions";
import { useToast } from "@/components/admin/toast-provider";
import { useConfirm } from "@/components/admin/confirm-provider";

interface DeletePostButtonProps {
  postId: string;
  postTitle: string;
}

// Helper to check if error is a Next.js redirect
function isRedirectError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const err = error as { digest?: string; message?: string };
  return err.digest?.startsWith('NEXT_REDIRECT') === true ||
    err.message?.includes('NEXT_REDIRECT') === true;
}

export function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: "Delete Post",
      message: `Are you sure you want to delete "${postTitle}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!isConfirmed) return;

    try {
      await deletePostAction(postId);
      showToast("Post deleted successfully", "success");
    } catch (error) {
      // Don't show error for redirects - the action succeeded
      if (isRedirectError(error)) {
        showToast("Post deleted successfully", "success");
        return;
      }
      showToast("Failed to delete post", "error");
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="p-2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-error)] hover:bg-[var(--ad-error)]/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
