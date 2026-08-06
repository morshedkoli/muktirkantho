import Link from "next/link";
import { ArrowRight } from "lucide-react";

type SectionHeadingProps = {
  title: string;
  /** Optional small kicker above the title, e.g. a section descriptor. */
  kicker?: string;
  href?: string;
  linkLabel?: string;
  /** `lead` gets the heavy rule reserved for the page's primary sections. */
  weight?: "lead" | "standard";
};

/**
 * The single section header used across every public page.
 *
 * Two weights rather than one so a page reads as a hierarchy: `lead` marks the
 * handful of primary sections, `standard` the supporting ones. Previously each
 * page inlined its own variant, which made every section look equally important.
 */
export function SectionHeading({
  title,
  kicker,
  href,
  linkLabel = "আরও দেখুন",
  weight = "standard",
}: SectionHeadingProps) {
  const isLead = weight === "lead";

  return (
    <div
      className={`mb-5 flex items-end justify-between gap-4 border-t-[var(--np-primary)] ${
        isLead ? "border-t-4 pt-3" : "border-t-2 pt-2.5"
      }`}
    >
      <div className="min-w-0">
        {kicker && (
          <span className="np-category mb-1 block text-[var(--np-text-secondary)]">{kicker}</span>
        )}
        <h2
          className={`font-display font-bold leading-none tracking-tight text-[var(--np-text-primary)] ${
            isLead ? "text-xl sm:text-[26px]" : "text-lg sm:text-xl"
          }`}
        >
          {title}
        </h2>
      </div>

      {href && (
        <Link
          href={href}
          className="np-category group inline-flex shrink-0 items-center gap-1 pb-0.5 text-[var(--np-text-secondary)] transition-colors hover:text-[var(--np-primary)] focus-visible:text-[var(--np-primary)]"
        >
          {linkLabel}
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/**
 * `h1` for archive pages (category, tag, district, search, latest).
 *
 * These five pages each had their own header markup — some with a count, some
 * with an accent rule, some with neither — so the same kind of page looked
 * different depending on how the reader arrived.
 */
export function PageHeading({
  title,
  count,
  countLabel = "টি সংবাদ",
  description,
}: {
  title: string;
  count?: number;
  countLabel?: string;
  description?: string;
}) {
  return (
    <header className="mb-6 border-b border-[var(--np-border)] pb-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="np-headline-lg text-[var(--np-text-primary)]">{title}</h1>
        {typeof count === "number" && (
          <span className="np-timestamp">
            {count}
            {countLabel}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-2 text-sm text-[var(--np-text-secondary)]">{description}</p>
      )}
      <div className="mt-3 h-1 w-12 bg-[var(--np-primary)]" />
    </header>
  );
}
