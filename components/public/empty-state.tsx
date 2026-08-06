import { Newspaper } from "lucide-react";

/**
 * Shared "nothing here" panel. The tag and district archives previously
 * rendered an empty grid with no explanation when a filter matched no posts.
 */
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-[var(--np-border)] bg-[var(--np-card)] px-6 py-14 text-center">
      <Newspaper className="h-7 w-7 text-[var(--np-border)]" aria-hidden />
      <p className="text-sm text-[var(--np-text-secondary)]">{message}</p>
    </div>
  );
}
