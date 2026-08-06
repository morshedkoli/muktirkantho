import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?:
    | "default"
    | "accent"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "icon";
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * Console button.
 *
 * `default` is press-ink — near-black in light mode, paper-white in dark. The
 * masthead red lives in a separate `accent` variant so it stays reserved for
 * things that genuinely need to shout; `destructive` is outlined rather than
 * filled, because a red slab next to every row reads as an alarm, not a menu.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--ad-radius-sm)] text-[13px] font-semibold cursor-pointer",
          "transition-[background-color,border-color,color,opacity] duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ad-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ad-background)]",
          "disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",

          variant === "default" &&
            "bg-[var(--ad-primary)] text-[var(--ad-on-primary)] hover:bg-[var(--ad-primary-hover)]",
          variant === "accent" &&
            "bg-[var(--ad-accent)] text-[var(--ad-on-primary)] hover:bg-[var(--ad-accent-hover)]",
          variant === "destructive" &&
            "border border-[var(--ad-error)]/35 bg-transparent text-[var(--ad-error)] hover:border-[var(--ad-error)]/70 hover:bg-[var(--ad-error-tint)]",
          variant === "outline" &&
            "border border-[var(--ad-border-strong)] bg-[var(--ad-card)] text-[var(--ad-text-primary)] hover:bg-[var(--ad-inset)]",
          variant === "secondary" &&
            "bg-[var(--ad-inset)] text-[var(--ad-text-primary)] hover:bg-[var(--ad-border)]",
          variant === "ghost" &&
            "text-[var(--ad-text-secondary)] hover:bg-[var(--ad-inset)] hover:text-[var(--ad-text-primary)]",
          variant === "link" &&
            "text-[var(--ad-text-primary)] underline decoration-[var(--ad-border-strong)] underline-offset-4 hover:text-[var(--ad-accent)] hover:decoration-[var(--ad-accent)]",
          variant === "icon" &&
            "text-[var(--ad-text-muted)] hover:bg-[var(--ad-inset)] hover:text-[var(--ad-text-primary)]",

          size === "default" && "h-9 px-4",
          size === "sm" && "h-8 px-3 text-xs",
          size === "lg" && "h-11 px-6 text-sm",
          size === "icon" && "h-8 w-8 p-0",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
