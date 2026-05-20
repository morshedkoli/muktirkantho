import * as React from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-[var(--ad-border-strong)]/40 bg-[var(--ad-border)]/15 px-3.5 py-2.5 text-[13.5px] text-[var(--ad-text-primary)] transition-all placeholder:text-[var(--ad-text-muted)] focus:bg-[var(--ad-card)] focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/10 outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
