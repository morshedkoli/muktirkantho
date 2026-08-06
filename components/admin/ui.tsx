import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/* ---------------------------------------------------------------------------
 * Newsroom Console — shared page furniture.
 *
 * Every admin screen is built from these five pieces so the console reads as
 * one product: a page header, stat tiles, section panels, empty states and a
 * field row. Pages should reach for these before writing bespoke markup.
 * ------------------------------------------------------------------------- */

/* ── Page header ─────────────────────────────────────────────────────────── */

interface PageHeaderProps {
  /** Mono kicker above the title — the section this page belongs to. */
  kicker?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-[var(--ad-border)] pb-5 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {kicker && (
          <p className="adm-label mb-2 flex items-center gap-2">
            <span className="h-[2px] w-5 shrink-0 bg-[var(--ad-accent)]" />
            {kicker}
          </p>
        )}
        <h1 className="adm-display text-[26px] leading-none sm:text-[30px]">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[var(--ad-text-secondary)]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  );
}

/* ── Stat tile ───────────────────────────────────────────────────────────── */

type StatTone = "neutral" | "accent" | "success" | "warning" | "info";

/**
 * Tone rides on the icon chip alone.
 *
 * The previous tile said its tone three times — a full-bleed coloured rule
 * across the top, a coloured figure, and an icon — which turned a row of four
 * KPIs into four competing colours before you had read a single number. Now the
 * figure is always ink, so the numbers line up as one series and colour is a
 * quiet label rather than the loudest thing in the row.
 */
const toneChip: Record<StatTone, string> = {
  neutral: "bg-[var(--ad-inset)] text-[var(--ad-text-muted)]",
  accent: "bg-[var(--ad-primary-tint)] text-[var(--ad-primary)]",
  success: "bg-[var(--ad-success-tint)] text-[var(--ad-success)]",
  warning: "bg-[var(--ad-warning-tint)] text-[var(--ad-warning)]",
  info: "bg-[var(--ad-info-tint)] text-[var(--ad-info)]",
};

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  /** Small line under the figure — context, not decoration. */
  hint?: string;
  tone?: StatTone;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  className?: string;
}

/**
 * KPI tile. The figure is set in the display serif at a size nothing else on
 * the page reaches — the number is the point, the label is the footnote.
 */
export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
  icon: Icon,
  href,
  className,
}: StatTileProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="adm-label pt-1">{label}</p>
        {Icon && (
          <span
            aria-hidden
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--ad-radius-sm)]",
              toneChip[tone]
            )}
          >
            <Icon className="h-[15px] w-[15px]" />
          </span>
        )}
      </div>
      <p className="adm-figure mt-3 text-[32px] text-[var(--ad-text-primary)]">{value}</p>
      {hint && (
        <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--ad-text-muted)]">{hint}</p>
      )}
    </>
  );

  const base = cn(
    "relative block rounded-[var(--ad-radius)] border border-[var(--ad-border)] bg-[var(--ad-card)] p-4 sm:p-5",
    href &&
      "transition-colors hover:border-[var(--ad-border-strong)] hover:bg-[var(--ad-card-alt)]",
    className
  );

  if (href) {
    return (
      <Link href={href} className={base}>
        {body}
      </Link>
    );
  }
  return <div className={base}>{body}</div>;
}

/* ── Section panel ───────────────────────────────────────────────────────── */

interface PanelProps {
  title?: string;
  kicker?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** Drop the inner padding — for panels whose body is a table or list. */
  flush?: boolean;
  className?: string;
  bodyClassName?: string;
}

export function Panel({
  title,
  kicker,
  description,
  actions,
  children,
  flush = false,
  className,
  bodyClassName,
}: PanelProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-[var(--ad-radius)] border border-[var(--ad-border)] bg-[var(--ad-card)]",
        className
      )}
    >
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ad-border)] px-5 py-3.5">
          <div className="min-w-0">
            {kicker && <p className="adm-label mb-1">{kicker}</p>}
            {title && (
              <h2 className="adm-display text-[15px] leading-tight">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-[12px] text-[var(--ad-text-secondary)]">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className={cn(!flush && "p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** "See all →" link used in panel headers. */
export function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="adm-label transition-colors hover:text-[var(--ad-accent)]"
    >
      {children} →
    </Link>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────── */

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--ad-border)] bg-[var(--ad-card-alt)]">
          <Icon className="h-[18px] w-[18px] text-[var(--ad-text-muted)]" />
        </div>
      )}
      <p className="adm-display text-[15px]">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-[var(--ad-text-secondary)]">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ── Form field ──────────────────────────────────────────────────────────── */

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="adm-label block text-[var(--ad-text-secondary)]">
        {label}
        {required && <span className="ml-1 text-[var(--ad-accent)]">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[11.5px] text-[var(--ad-error)]">{error}</p>
      ) : hint ? (
        <p className="text-[11.5px] text-[var(--ad-text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

/* ── Inline alert ────────────────────────────────────────────────────────── */

interface AlertProps {
  tone?: "info" | "warning" | "error" | "success";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const alertTone = {
  info: "border-[var(--ad-info)]/25 bg-[var(--ad-info-tint)] text-[var(--ad-info)]",
  warning: "border-[var(--ad-warning)]/25 bg-[var(--ad-warning-tint)] text-[var(--ad-warning)]",
  error: "border-[var(--ad-error)]/25 bg-[var(--ad-error-tint)] text-[var(--ad-error)]",
  success: "border-[var(--ad-success)]/25 bg-[var(--ad-success-tint)] text-[var(--ad-success)]",
} as const;

export function Alert({ tone = "info", title, children, className }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--ad-radius-sm)] border px-4 py-3 text-[12.5px] leading-relaxed",
        alertTone[tone],
        className
      )}
    >
      {title && <p className="mb-0.5 font-semibold">{title}</p>}
      <div className="text-[var(--ad-text-secondary)]">{children}</div>
    </div>
  );
}
