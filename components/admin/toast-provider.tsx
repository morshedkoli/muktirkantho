"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface ToastContextType {
  showToast: (message: string, type: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

const noop = () => {};
const ToastContext = createContext<ToastContextType>({
  showToast: noop,
  removeToast: noop,
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: Toast["type"] = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      // Errors stay long enough to read twice; confirmations get out of the way.
      const ttl = type === "error" ? 6000 : 3500;
      setTimeout(() => removeToast(id), ttl);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-24 z-[110] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

const toastMeta = {
  success: { Icon: CheckCircle2, tone: "text-[var(--ad-success)]" },
  error: { Icon: AlertCircle, tone: "text-[var(--ad-error)]" },
  warning: { Icon: AlertTriangle, tone: "text-[var(--ad-warning)]" },
  info: { Icon: Info, tone: "text-[var(--ad-info)]" },
} as const;

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const { Icon, tone } = toastMeta[toast.type];

  return (
    <div className="adm-pop animate-fade-in-up pointer-events-auto flex w-full items-center gap-3 py-2.5 pl-3.5 pr-2 sm:w-auto sm:max-w-sm">
      <Icon className={cn("h-[18px] w-[18px] shrink-0", tone)} />
      <p className="flex-1 text-[13px] font-medium text-[var(--ad-text-primary)]">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label="বন্ধ করুন"
        className="rounded-[var(--ad-radius-sm)] p-1.5 text-[var(--ad-text-muted)] transition-colors hover:bg-[var(--ad-inset)] hover:text-[var(--ad-text-primary)]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
