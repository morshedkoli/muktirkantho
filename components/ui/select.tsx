import * as React from "react";
import { cn } from "@/lib/cn";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "flex h-[38px] w-full rounded-xl border border-[var(--ad-border-strong)]/40 bg-[var(--ad-border)]/15 px-3.5 py-1.5 text-[13.5px] text-[var(--ad-text-primary)] transition-all focus:bg-[var(--ad-card)] focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/10 outline-none disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer pr-10 font-medium",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[var(--ad-text-secondary)]">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";
