import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "icon";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ad-primary)]/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer active:scale-[0.98]",
          // Variants
          variant === "default" && "bg-[var(--ad-primary)] text-white shadow-lg shadow-[var(--ad-primary)]/20 hover:bg-[var(--ad-primary-hover)] border border-[var(--ad-primary)]/10",
          variant === "destructive" && "bg-[var(--ad-error)] text-white shadow-lg shadow-[var(--ad-error)]/20 hover:bg-[var(--ad-error)]/90 border border-[var(--ad-error)]/10",
          variant === "outline" && "border border-[var(--ad-border-strong)] bg-[var(--ad-card)] text-[var(--ad-text-primary)] hover:bg-[var(--ad-border)]/35 hover:border-[var(--ad-border-strong)]",
          variant === "secondary" && "bg-[var(--ad-border)]/50 text-[var(--ad-text-primary)] hover:bg-[var(--ad-border)] border border-[var(--ad-border)]/10",
          variant === "ghost" && "text-[var(--ad-text-secondary)] hover:bg-[var(--ad-border)]/35 hover:text-[var(--ad-text-primary)]",
          variant === "link" && "text-[var(--ad-primary)] underline-offset-4 hover:underline",
          variant === "icon" && "p-2 text-[var(--ad-text-secondary)] hover:bg-[var(--ad-border)]/30 hover:text-[var(--ad-text-primary)] border border-transparent rounded-lg hover:border-[var(--ad-border)]/50",
          // Sizes
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 rounded-lg px-3 text-xs",
          size === "lg" && "h-11 px-8 rounded-xl",
          size === "icon" && "h-9 w-9 p-0 rounded-lg",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
