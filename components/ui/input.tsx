import * as React from "react";
import { cn } from "@/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** Shared field chrome — inputs, selects and textareas must not drift apart. */
export const fieldClass =
  "w-full rounded-[var(--ad-radius-sm)] border border-[var(--ad-border-strong)] bg-[var(--ad-card)] text-[13px] text-[var(--ad-text-primary)] " +
  "placeholder:text-[var(--ad-text-muted)] transition-[border-color,box-shadow] duration-150 outline-none " +
  "focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/12 " +
  "disabled:cursor-not-allowed disabled:bg-[var(--ad-inset)] disabled:opacity-60 " +
  "aria-[invalid=true]:border-[var(--ad-error)] aria-[invalid=true]:focus:ring-[var(--ad-error)]/15";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(fieldClass, "h-9 px-3", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
