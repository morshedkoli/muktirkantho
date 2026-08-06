"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deletePostAction } from "@/app/(admin)/admin/actions";
import { useToast } from "@/components/admin/toast-provider";
import { useConfirm } from "@/components/admin/confirm-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface DeletePostButtonProps {
  postId: string;
  postTitle: string;
  className?: string;
}

/** A server-action redirect throws — that is success, not failure. */
function isRedirectError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const err = error as { digest?: string; message?: string };
  return (
    err.digest?.startsWith("NEXT_REDIRECT") === true ||
    err.message?.includes("NEXT_REDIRECT") === true
  );
}

export function DeletePostButton({ postId, postTitle, className }: DeletePostButtonProps) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "পোস্ট মুছে ফেলবেন?",
      message: `“${postTitle}” স্থায়ীভাবে মুছে যাবে। এই কাজটি ফেরানো যাবে না।`,
      confirmText: "মুছে ফেলুন",
      cancelText: "বাতিল",
      type: "danger",
    });
    if (!confirmed) return;

    setPending(true);
    try {
      await deletePostAction(postId);
      showToast("পোস্ট মুছে ফেলা হয়েছে", "success");
    } catch (error) {
      if (isRedirectError(error)) {
        showToast("পোস্ট মুছে ফেলা হয়েছে", "success");
        return;
      }
      showToast("পোস্ট মুছে ফেলা যায়নি", "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      variant="icon"
      size="icon"
      aria-label="মুছে ফেলুন"
      className={cn("hover:bg-[var(--ad-error-tint)] hover:text-[var(--ad-error)]", className)}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
