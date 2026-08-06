"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Mono kicker above the title. */
  kicker?: string;
  description?: string;
  children: React.ReactNode;
  /** Sticky action row at the bottom. */
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClass = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
} as const;

/**
 * Console dialog.
 *
 * Portalled to <body> so it can never be clipped by an ancestor's overflow,
 * and it restores focus to whatever opened it on close — these dialogs are
 * opened from table rows, and losing the row on close is disorienting.
 */
export function Modal({
  open,
  onClose,
  title,
  kicker,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the first field so keyboard users land inside the dialog.
    const first = panelRef.current?.querySelector<HTMLElement>(
      "input, select, textarea, button"
    );
    first?.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
    >
      <div
        className="absolute inset-0 bg-[#0a0a0c]/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={cn(
          "relative w-full overflow-hidden rounded-t-[var(--ad-radius-lg)] border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-[var(--ad-shadow-lg)]",
          "animate-fade-in-up sm:rounded-[var(--ad-radius-lg)]",
          sizeClass[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--ad-border)] px-5 py-4">
          <div className="min-w-0">
            {kicker && <p className="adm-label mb-1">{kicker}</p>}
            <h2 className="adm-display text-[16px] leading-tight">{title}</h2>
            {description && (
              <p className="mt-1 text-[12px] text-[var(--ad-text-secondary)]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="-mr-1 -mt-1 rounded-[var(--ad-radius-sm)] p-1.5 text-[var(--ad-text-muted)] transition-colors hover:bg-[var(--ad-inset)] hover:text-[var(--ad-text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto scrollbar-thin px-5 py-5">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-[var(--ad-border)] bg-[var(--ad-card-alt)] px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
