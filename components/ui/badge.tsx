import * as React from "react";
import { cn } from "@/lib/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info"
    | "accent";
  /** Show the leading status dot. Off by default; status badges turn it on. */
  dot?: boolean;
}

const dotColor: Record<string, string> = {
  default: "bg-[var(--ad-text-muted)]",
  secondary: "bg-[var(--ad-text-muted)]",
  destructive: "bg-[var(--ad-error)]",
  outline: "bg-[var(--ad-text-muted)]",
  success: "bg-[var(--ad-success)]",
  warning: "bg-[var(--ad-warning)]",
  info: "bg-[var(--ad-info)]",
  accent: "bg-[var(--ad-accent)]",
};

/**
 * Status chip. Square-ish rather than pill — it sits next to tabular data, and
 * a hard 4px corner reads as a label rather than a button someone can press.
 */
export function Badge({ className, variant = "default", dot = false, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.08em]",
        "adm-mono whitespace-nowrap",

        variant === "default" &&
          "border-[var(--ad-border)] bg-[var(--ad-inset)] text-[var(--ad-text-secondary)]",
        variant === "secondary" &&
          "border-transparent bg-[var(--ad-inset)] text-[var(--ad-text-muted)]",
        variant === "destructive" &&
          "border-[var(--ad-error)]/25 bg-[var(--ad-error-tint)] text-[var(--ad-error)]",
        variant === "accent" &&
          "border-[var(--ad-accent)]/25 bg-[var(--ad-accent-tint)] text-[var(--ad-accent)]",
        variant === "outline" &&
          "border-[var(--ad-border-strong)] bg-transparent text-[var(--ad-text-secondary)]",
        variant === "success" &&
          "border-[var(--ad-success)]/25 bg-[var(--ad-success-tint)] text-[var(--ad-success)]",
        variant === "warning" &&
          "border-[var(--ad-warning)]/25 bg-[var(--ad-warning-tint)] text-[var(--ad-warning)]",
        variant === "info" &&
          "border-[var(--ad-info)]/25 bg-[var(--ad-info-tint)] text-[var(--ad-info)]",
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("h-[5px] w-[5px] shrink-0 rounded-full", dotColor[variant])} />
      )}
      {children}
    </span>
  );
}
