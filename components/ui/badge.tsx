import * as React from "react";
import { cn } from "@/lib/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase border transition-colors",
        // Variants
        variant === "default" && "bg-[var(--ad-primary)]/10 text-[var(--ad-primary)] border-[var(--ad-primary)]/20",
        variant === "secondary" && "bg-[var(--ad-border)]/40 text-[var(--ad-text-secondary)] border-[var(--ad-border)]",
        variant === "destructive" && "bg-[var(--ad-error)]/10 text-[var(--ad-error)] border-[var(--ad-error)]/20",
        variant === "outline" && "text-[var(--ad-text-primary)] border-[var(--ad-border-strong)] bg-transparent",
        variant === "success" && "bg-[var(--ad-green-light)] text-[var(--ad-green)] border-[var(--ad-green)]/20",
        variant === "warning" && "bg-[var(--ad-amber-light)] text-[var(--ad-amber)] border-[var(--ad-amber)]/20",
        className
      )}
      {...props}
    />
  );
}
