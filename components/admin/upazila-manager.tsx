"use client";

import { useState } from "react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { Plus, Trash2, Loader2, MapPinned, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/components/admin/toast-provider";
import { useConfirm } from "@/components/admin/confirm-provider";
import { AddItemModal } from "./add-item-modal";

type District = {
  id: string;
  name: string;
  slug: string;
};

type Upazila = {
  id: string;
  name: string;
  slug: string;
  districtId: string;
};

type DistrictWithUpazilas = District & {
  upazilas: Upazila[];
};

type Props = {
  districts: District[];
  upazilasByDistrict: DistrictWithUpazilas[];
  createAction: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  deleteAction: (id: string) => Promise<void>;
  initialState: AdminActionState;
};

// Helper to check if error is a Next.js redirect
function isRedirectError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const err = error as { digest?: string; message?: string };
  return err.digest?.startsWith('NEXT_REDIRECT') === true ||
    err.message?.includes('NEXT_REDIRECT') === true;
}

function DeleteUpazilaButton({
  upazila,
  deleteAction
}: {
  upazila: Upazila;
  deleteAction: (id: string) => Promise<void>;
}) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: "Delete Upazila",
      message: `Are you sure you want to delete "${upazila.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      await deleteAction(upazila.id);
      showToast("Upazila deleted successfully", "success");
    } catch (error) {
      if (isRedirectError(error)) {
        showToast("Upazila deleted successfully", "success");
        return;
      }
      showToast("Failed to delete upazila", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
      title="Delete Upazila"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}

function DistrictSection({
  district,
  deleteAction
}: {
  district: DistrictWithUpazilas;
  deleteAction: (id: string) => Promise<void>;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border-b border-[var(--ad-border)] last:border-b-0">
      {/* District Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 bg-[var(--ad-card)] hover:bg-[var(--ad-background)]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ad-primary)]/10 text-[var(--ad-primary)]">
            <span className="text-xs font-bold">{district.name.charAt(0)}</span>
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-[var(--ad-text-primary)]">{district.name}</h4>
            <p className="text-xs text-[var(--ad-text-secondary)]">{district.upazilas.length} upazila{district.upazilas.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">/{district.slug}</span>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Upazilas List */}
      {isExpanded && (
        <div className="divide-y divide-slate-100">
          {district.upazilas.length === 0 ? (
            <div className="px-6 py-4 text-sm text-slate-500 italic">
              No upazilas in this district yet
            </div>
          ) : (
            district.upazilas.map((upazila) => (
              <div
                key={upazila.id}
                className="flex items-center justify-between px-6 py-3 pl-16 hover:bg-[var(--ad-background)]/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ad-background)] text-[var(--ad-text-secondary)] group-hover:bg-[var(--ad-card)] group-hover:text-[var(--ad-primary)] group-hover:shadow-sm transition-all border border-[var(--ad-border)]">
                    <MapPinned className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--ad-text-primary)]">{upazila.name}</p>
                    <p className="text-xs text-[var(--ad-text-secondary)] font-mono">/{upazila.slug}</p>
                  </div>
                </div>

                <DeleteUpazilaButton
                  upazila={upazila}
                  deleteAction={deleteAction}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function UpazilaManager({
  districts,
  upazilasByDistrict,
  createAction,
  deleteAction,
  initialState,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ad-text-primary)]">
            Upazila Management
          </h2>
          <p className="text-sm text-[var(--ad-text-secondary)] mt-1">
            Manage upazilas organized by district
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--ad-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-primary-hover)] transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Add Upazila
        </button>
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Upazila"
        itemName="Upazila"
        createAction={createAction}
        initialState={initialState}
        districts={districts}
        type="upazila"
      />

      {/* Upazilas Grouped by District */}
      <div className="rounded-xl bg-[var(--ad-card)] shadow-[var(--ad-shadow)] border border-[var(--ad-border)] overflow-hidden">
        <div className="border-b border-[var(--ad-border)] bg-[var(--ad-background)] px-6 py-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--ad-text-primary)] uppercase tracking-wider">
            Upazilas by District
          </h3>
          <span className="text-xs text-[var(--ad-text-secondary)] bg-[var(--ad-background)] px-2.5 py-1 rounded-full border border-[var(--ad-border)]">
            {upazilasByDistrict.reduce((acc, d) => acc + d.upazilas.length, 0)} total
          </span>
        </div>

        {upazilasByDistrict.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--ad-background)] mb-4">
              <MapPinned className="h-8 w-8 text-[var(--ad-text-secondary)]" />
            </div>
            <p className="text-[var(--ad-text-primary)] font-medium">No districts available</p>
            <p className="text-sm text-[var(--ad-text-secondary)] mt-1">
              Please add districts first
            </p>
          </div>
        ) : (
          <div>
            {upazilasByDistrict.map((district) => (
              <DistrictSection
                key={district.id}
                district={district}
                deleteAction={deleteAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
