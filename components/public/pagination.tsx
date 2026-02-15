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
        className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
      >
        Previous
      </Link>
      <span className="text-sm text-slate-600">
        Page {currentPage} / {totalPages}
      </span>
      <Link
        href={makeHref(Math.min(totalPages, currentPage + 1))}
        className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
      >
        Next
      </Link>
    </div>
  );
}
