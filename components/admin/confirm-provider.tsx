"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";

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
  }>({
    isOpen: false,
    options: null,
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    setDialogState((prev) => {
      if (prev.resolve) {
        prev.resolve(result);
      }
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

interface ConfirmDialogProps {
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ options, onConfirm, onCancel }: ConfirmDialogProps) {
  const {
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "warning",
  } = options;

  const buttonStyles = {
    danger: "bg-[var(--ad-error)] hover:bg-[var(--ad-error)]/80 text-white",
    warning: "bg-[var(--ad-warning)] hover:bg-[var(--ad-warning)]/80 text-white",
    info: "bg-[var(--ad-primary)] hover:bg-[var(--ad-primary-hover)] text-white",
  };

  const iconColors = {
    danger: "text-[var(--ad-error)]",
    warning: "text-[var(--ad-warning)]",
    info: "text-[var(--ad-primary)]",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-[var(--ad-card)] rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full bg-[var(--ad-paper-2)] ${iconColors[type]}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--ad-text-primary)]">{title}</h3>
              <p className="mt-2 text-sm text-[var(--ad-text-secondary)]">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="p-1 rounded-lg hover:bg-[var(--ad-paper-2)] transition-colors"
            >
              <X className="h-5 w-5 text-[var(--ad-muted)]" />
            </button>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-[var(--ad-text-secondary)] bg-[var(--ad-card)] border border-[var(--ad-border)] rounded-lg hover:bg-[var(--ad-background)] transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${buttonStyles[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
