import { AdminShell } from "@/components/admin/admin-shell";
import { MessageSquare } from "lucide-react";

export default function CommentsPage() {
  return (
    <AdminShell
      title="মন্তব্য"
      description="পাঠকদের মন্তব্য পরিচালনা করুন।"
    >
      <div className="rounded-2xl border border-dashed border-[var(--ad-border)] bg-[var(--ad-card)] py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ad-bg)]">
          <MessageSquare className="h-8 w-8 text-[var(--ad-text-muted)]" />
        </div>
        <p className="font-semibold text-[var(--ad-text-primary)]">মন্তব্য সিস্টেম এখনো সক্রিয় নেই</p>
        <p className="mt-1 text-sm text-[var(--ad-text-muted)]">মন্তব্য ফিচার শীঘ্রই যোগ করা হবে।</p>
      </div>
    </AdminShell>
  );
}
