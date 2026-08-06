import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  makeHref: (page: number) => string;
};

const CONTROL_BASE =
  "np-category inline-flex items-center gap-1.5 border border-[var(--np-border)] px-4 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--np-primary)]";

/**
 * Disabled ends render as inert spans rather than links. Previously the first
 * page still linked to page 1 and the last to itself, so the controls always
 * looked available and a click at either end just reloaded the same page.
 */
function Control({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span aria-disabled className={`${CONTROL_BASE} cursor-not-allowed opacity-40`}>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={`${CONTROL_BASE} text-[var(--np-text-secondary)] hover:border-[var(--np-primary)] hover:bg-[var(--np-primary-tint)] hover:text-[var(--np-primary)]`}
    >
      {children}
    </Link>
  );
}

export function Pagination({ currentPage, totalPages, makeHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="পৃষ্ঠা নেভিগেশন" className="mt-10 flex items-center justify-center gap-3 sm:gap-4">
      <Control href={makeHref(currentPage - 1)} disabled={currentPage <= 1}>
        <ChevronLeft className="h-3.5 w-3.5" />
        আগের
      </Control>

      <span className="np-timestamp tabular-nums">
        পৃষ্ঠা {currentPage} / {totalPages}
      </span>

      <Control href={makeHref(currentPage + 1)} disabled={currentPage >= totalPages}>
        পরের
        <ChevronRight className="h-3.5 w-3.5" />
      </Control>
    </nav>
  );
}
