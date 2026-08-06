"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({ isOpen: false, options: null, resolve: null });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({ isOpen: true, options, resolve });
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    setDialogState((prev) => {
      prev.resolve?.(result);
      return { isOpen: false, options: null, resolve: null };
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialogState.isOpen && dialogState.options && (
        <ConfirmDialog
          options={dialogState.options}
          onConfirm={() => handleClose(true)}
          onCancel={() => handleClose(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

const dialogTone = {
  danger: {
    Icon: ShieldAlert,
    ring: "border-[var(--ad-error)]/25 bg-[var(--ad-error-tint)] text-[var(--ad-error)]",
    variant: "destructive" as const,
  },
  warning: {
    Icon: AlertTriangle,
    ring: "border-[var(--ad-warning)]/25 bg-[var(--ad-warning-tint)] text-[var(--ad-warning)]",
    variant: "default" as const,
  },
  info: {
    Icon: Info,
    ring: "border-[var(--ad-info)]/25 bg-[var(--ad-info-tint)] text-[var(--ad-info)]",
    variant: "default" as const,
  },
};

interface ConfirmDialogProps {
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ options, onConfirm, onCancel }: ConfirmDialogProps) {
  const {
    title,
    message,
    confirmText = "নিশ্চিত করুন",
    cancelText = "বাতিল",
    type = "warning",
  } = options;

  const { Icon, ring, variant } = dialogTone[type];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-[#0a0a0c]/60 backdrop-blur-[2px]"
        onClick={onCancel}
      />

      <div className="animate-fade-in-up relative w-full max-w-md overflow-hidden rounded-[var(--ad-radius-lg)] border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-[var(--ad-shadow-lg)]">
        <div className="flex gap-4 p-5">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
              ring
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="adm-display text-[16px] leading-tight">{title}</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--ad-text-secondary)]">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--ad-border)] bg-[var(--ad-card-alt)] px-5 py-3.5">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} autoFocus>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
