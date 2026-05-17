import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  makeHref: (page: number) => string;
};

export function Pagination({ currentPage, totalPages, makeHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <Link
        href={makeHref(Math.max(1, currentPage - 1))}
        className="rounded-sm border border-[var(--np-border)] px-4 py-2 text-sm font-label text-[var(--np-text-secondary)] hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] transition-all"
      >
        Previous
      </Link>
      <span className="np-timestamp">
        Page {currentPage} / {totalPages}
      </span>
      <Link
        href={makeHref(Math.min(totalPages, currentPage + 1))}
        className="rounded-sm border border-[var(--np-border)] px-4 py-2 text-sm font-label text-[var(--np-text-secondary)] hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] transition-all"
      >
        Next
      </Link>
    </div>
  );
}
