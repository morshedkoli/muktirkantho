"use client";

import { useActionState, useEffect, useRef, useCallback } from "react";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

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

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && formRef.current) {
      formRef.current.reset();
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async (formData: FormData) => {
    await formAction(formData);
  }, [formAction]);

  const isUpazila = type === "upazila";
  const isDistrict = type === "district";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-[var(--ad-border)] bg-[var(--ad-background)]/50">
          <DialogTitle className="text-base font-bold text-[var(--ad-text-primary)]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[10px] text-[var(--ad-text-muted)] font-mono tracking-wider uppercase font-semibold mt-1">
            Add a new {itemName.toLowerCase()} to your database
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <form ref={formRef} action={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2"
            >
              {itemName} Name <span className="text-[var(--ad-error)]">*</span>
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder={`Enter ${itemName.toLowerCase()} name...`}
              className="h-10"
              required
              autoFocus
            />
          </div>

          {/* Slug Field */}
          <div>
            <label
              htmlFor="slug"
              className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2"
            >
              Slug <span className="text-[var(--ad-text-muted)]/70 font-bold">(Optional)</span>
            </label>
            <Input
              id="slug"
              name="slug"
              type="text"
              placeholder="auto-generated-from-name"
              className="h-10"
            />
            <p className="mt-1.5 text-[9.5px] text-[var(--ad-text-muted)] font-mono tracking-wider uppercase font-semibold">
              Used in URLs. Leave blank to auto-generate.
            </p>
          </div>

          {/* District Select (for Upazila) */}
          {isUpazila && (
            <div>
              <label
                htmlFor="districtId"
                className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2"
              >
                District <span className="text-[var(--ad-error)]">*</span>
              </label>
              <Select
                id="districtId"
                name="districtId"
                required
              >
                <option value="">Select a district...</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Division Select (for District) */}
          {isDistrict && (
            <div>
              <label
                htmlFor="divisionId"
                className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-secondary)] font-bold mb-2"
              >
                Division <span className="text-[var(--ad-text-muted)]/70 font-bold">(Optional)</span>
              </label>
              <Select
                id="divisionId"
                name="divisionId"
              >
                <option value="">Select a division...</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Error Message */}
          {state.status === "error" && (
            <div className="rounded-xl bg-[var(--ad-error)]/5 border border-[var(--ad-error)]/20 p-3.5 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 text-[var(--ad-error)] shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--ad-error)] font-medium leading-normal">{state.message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--ad-border)]">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs font-mono font-bold uppercase tracking-wider h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              disabled={pending}
              type="submit"
              variant="default"
              className="text-xs font-mono font-bold uppercase tracking-wider h-10 px-5 shadow-lg shadow-[var(--ad-primary)]/20"
            >
              {pending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Create {itemName}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

