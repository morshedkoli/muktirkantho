"use client";

import { useActionState, useEffect, useRef, useCallback } from "react";
import { X, Plus, Loader2, AlertCircle } from "lucide-react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemName: string;
  createAction: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  initialState: AdminActionState;
  districts?: { id: string; name: string }[];
  divisions?: { id: string; name: string }[];
  type?: "category" | "division" | "district" | "upazila";
}

export function AddItemModal({
  isOpen,
  onClose,
  title,
  itemName,
  createAction,
  initialState,
  districts = [],
  divisions = [],
  type = "category",
}: AddItemModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createAction, initialState);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && formRef.current) {
      formRef.current.reset();
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async (formData: FormData) => {
    await formAction(formData);
    // After form action completes, check if there was an error
    // If no error, the server action will redirect and close the modal
  }, [formAction]);

  if (!isOpen) return null;

  const isUpazila = type === "upazila";
  const isDistrict = type === "district";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[var(--ad-card)] rounded-xl shadow-2xl border border-[var(--ad-border)] animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--ad-border)] bg-[var(--ad-background)] rounded-t-xl">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ad-text-primary)]">
              {title}
            </h2>
            <p className="text-sm text-[var(--ad-text-secondary)] mt-0.5">
              Add a new {itemName.toLowerCase()} to your system
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--ad-card)] text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} action={handleSubmit} className="p-6 space-y-5">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[var(--ad-text-primary)] mb-2"
            >
              {itemName} Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder={`Enter ${itemName.toLowerCase()} name...`}
              className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
              required
              autoFocus
            />
          </div>

          {/* Slug Field */}
          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-[var(--ad-text-primary)] mb-2"
            >
              Slug <span className="text-[var(--ad-text-secondary)] font-normal">(optional)</span>
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              placeholder="auto-generated-from-name"
              className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
            />
            <p className="mt-1.5 text-xs text-[var(--ad-text-secondary)]">
              Used in URLs. Leave blank to auto-generate from name.
            </p>
          </div>

          {/* District Select (for Upazila) */}
          {isUpazila && (
            <div>
              <label
                htmlFor="districtId"
                className="block text-sm font-medium text-[var(--ad-text-primary)] mb-2"
              >
                District <span className="text-rose-500">*</span>
              </label>
              <select
                id="districtId"
                name="districtId"
                required
                className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all"
              >
                <option value="">Select a district...</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Division Select (for District) */}
          {isDistrict && (
            <div>
              <label
                htmlFor="divisionId"
                className="block text-sm font-medium text-[var(--ad-text-primary)] mb-2"
              >
                Division <span className="text-[var(--ad-text-secondary)] font-normal">(optional)</span>
              </label>
              <select
                id="divisionId"
                name="divisionId"
                className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all"
              >
                <option value="">Select a division...</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Error Message */}
          {state.status === "error" && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-800">{state.message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] bg-transparent hover:bg-[var(--ad-background)] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={pending}
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--ad-primary)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create {itemName}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
