"use client";

import { Sun, Moon } from "lucide-react";
import React from "react";
import { useTheme } from "@/components/theme-provider";

interface ThemeToggleProps {
  variant?: "default" | "minimal";
  size?: "sm" | "md" | "lg";
}

export function ThemeToggle({ variant = "minimal", size = "md" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Prevent hydration mismatch by not rendering anything until mounted
  if (!mounted) {
    // Render a placeholder that matches the dimensions to avoid layout shift
    return <div className={variant === "minimal" ? sizeClasses[size] : "h-10 w-28"} />;
  }

  if (variant === "minimal") {
    return (
      <button
        onClick={toggleTheme}
        className={`${sizeClasses[size]} inline-flex items-center justify-center rounded-lg border border-[var(--np-border)] bg-[var(--np-card)] text-[var(--np-text-secondary)] shadow-sm transition-all hover:bg-[var(--np-background)] hover:text-[var(--np-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--np-primary)] focus-visible:ring-offset-2`}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? (
          <Sun className={iconSizes[size]} />
        ) : (
          <Moon className={iconSizes[size]} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--np-card)] border border-[var(--np-border)] text-[var(--np-text-primary)] hover:bg-[var(--np-background)] transition-colors"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4" />
          <span className="text-sm font-medium">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span className="text-sm font-medium">Dark Mode</span>
        </>
      )}
    </button>
  );
}

// Admin theme toggle with admin colors
export function AdminThemeToggle({ size = "md" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  if (!mounted) {
    return <div className={`${sizeClasses[size]} opacity-0`} aria-hidden="true" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className={`${sizeClasses[size]} inline-flex items-center justify-center rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] text-[var(--ad-text-secondary)] shadow-sm transition-all hover:bg-[var(--ad-background)] hover:text-[var(--ad-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ad-primary)] focus-visible:ring-offset-2`}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className={iconSizes[size]} />
      ) : (
        <Moon className={iconSizes[size]} />
      )}
    </button>
  );
}
