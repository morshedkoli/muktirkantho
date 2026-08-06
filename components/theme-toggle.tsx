"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const SIZES = {
  sm: { box: "h-8 w-8", icon: "h-4 w-4" },
  md: { box: "h-9 w-9", icon: "h-[18px] w-[18px]" },
  lg: { box: "h-11 w-11", icon: "h-5 w-5" },
} as const;

type ThemeToggleProps = {
  size?: keyof typeof SIZES;
  className?: string;
};

/**
 * Sun/moon pair swapped by CSS via the `dark:` variant, which is bound to
 * `[data-theme]`. Because the blocking script sets that attribute before first
 * paint, the correct glyph is right from frame one — no mount flag, no flash of
 * the wrong icon, and nothing to reconcile during hydration.
 */
function ThemeIcons({ className }: { className: string }) {
  return (
    <>
      <Moon className={`${className} block dark:hidden`} aria-hidden />
      <Sun className={`${className} hidden dark:block`} aria-hidden />
    </>
  );
}

/** Theme switch for the public site. */
export function ThemeToggle({ size = "md", className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const s = SIZES[size];
  const label = theme === "dark" ? "লাইট মোডে যান" : "ডার্ক মোডে যান";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`${s.box} ${className} inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--np-border)] text-[var(--np-text-secondary)] transition-colors hover:border-[var(--np-primary)] hover:bg-[var(--np-primary)] hover:text-[var(--np-on-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--np-primary)]`}
    >
      <ThemeIcons className={s.icon} />
    </button>
  );
}

/** Same control, styled with the admin dashboard's token set. */
export function AdminThemeToggle({ size = "md", className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const s = SIZES[size];
  const label = theme === "dark" ? "লাইট মোডে যান" : "ডার্ক মোডে যান";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`${s.box} ${className} inline-flex shrink-0 items-center justify-center rounded-[var(--ad-radius-sm)] text-[var(--ad-text-muted)] transition-colors hover:bg-[var(--ad-inset)] hover:text-[var(--ad-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ad-primary)]`}
    >
      <ThemeIcons className={s.icon} />
    </button>
  );
}
