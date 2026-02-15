"use client";

import { useState } from "react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { Plus, Trash2, Loader2, Tag, MapPin, MapPinned } from "lucide-react";
import { useToast } from "@/components/admin/toast-provider";
import { useConfirm } from "@/components/admin/confirm-provider";
import { AddItemModal } from "./add-item-modal";

type Item = {
  id: string;
  name: string;
  slug: string;
  districtId?: string;
  district?: { name: string };
  divisionId?: string | null;
  division?: { name: string } | null;
  _count?: { posts: number };
};

type Props = {
  title: string;
  items: Item[];
  districts?: { id: string; name: string }[];
  divisions?: { id: string; name: string }[];
  createAction: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  deleteAction: (id: string) => Promise<void>;
  initialState: AdminActionState;
  disableActions?: boolean;
};

// Helper to check if error is a Next.js redirect
function isRedirectError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const err = error as { digest?: string; message?: string };
  return err.digest?.startsWith('NEXT_REDIRECT') === true ||
    err.message?.includes('NEXT_REDIRECT') === true;
}

function DeleteItemButton({
  item,
  title,
  deleteAction,
  disabled = false
}: {
  item: Item;
  title: string;
  deleteAction: (id: string) => Promise<void>;
  disabled?: boolean;
}) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [isDeleting, setIsDeleting] = useState(false);

  if (disabled) return null;

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: `Delete ${title}`,
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      await deleteAction(item.id);
      showToast(`${title} deleted successfully`, "success");
    } catch (error) {
      // Don't show error for redirects - the action succeeded
      if (isRedirectError(error)) {
        showToast(`${title} deleted successfully`, "success");
        return;
      }
      showToast(`Failed to delete ${title.toLowerCase()}`, "error");
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
      title={`Delete ${title}`}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}

export function TaxonomyManager({
  title,
  items,
  districts = [],
  divisions = [],
  createAction,
  deleteAction,
  initialState,
  disableActions = false,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isUpazila = title.toLowerCase().includes("upazila");
  const isDistrict = title.toLowerCase().includes("district");
  const isCategory = title.toLowerCase().includes("category");
  const isDivision = title.toLowerCase().includes("division");

  // Determine the type for the modal
  let modalType: "category" | "division" | "district" | "upazila" = "category";
  if (isDivision) modalType = "division";
  else if (isDistrict) modalType = "district";
  else if (isUpazila) modalType = "upazila";

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ad-text-primary)]">
            {title} Management
          </h2>
          <p className="text-sm text-[var(--ad-text-secondary)] mt-1">
            Manage your {title.toLowerCase()}s and their associations
          </p>
        </div>
        {!disableActions && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--ad-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-primary-hover)] transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add {title}
          </button>
        )}
      </div>

      {/* Add Item Modal */}
      {!disableActions && (
        <AddItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Add New ${title}`}
          itemName={title}
          createAction={createAction}
          initialState={initialState}
          districts={districts}
          divisions={divisions}
          type={modalType}
        />
      )}

      {/* Items List */}
      <div className="rounded-xl bg-[var(--ad-card)] shadow-[var(--ad-shadow)] border border-[var(--ad-border)] overflow-hidden">
        <div className="border-b border-[var(--ad-border)] bg-[var(--ad-background)] px-6 py-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--ad-text-primary)] uppercase tracking-wider">
            All {title}s
          </h3>
          <span className="text-xs text-[var(--ad-text-secondary)] bg-[var(--ad-background)] px-2.5 py-1 rounded-full border border-[var(--ad-border)]">
            {items.length} total
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--ad-background)] mb-4">
              {isCategory && <Tag className="h-8 w-8 text-[var(--ad-text-secondary)]" />}
              {isDistrict && <MapPin className="h-8 w-8 text-[var(--ad-text-secondary)]" />}
              {!isCategory && !isDistrict && <MapPinned className="h-8 w-8 text-[var(--ad-text-secondary)]" />}
            </div>
            <p className="text-[var(--ad-text-primary)] font-medium">No {title.toLowerCase()}s yet</p>
            {!disableActions && (
              <p className="text-sm text-[var(--ad-text-secondary)] mt-1">
                Click the button above to add your first {title.toLowerCase()}
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--ad-border)]">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-[var(--ad-background)] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ad-background)] text-[var(--ad-text-secondary)] group-hover:bg-[var(--ad-card)] group-hover:text-[var(--ad-primary)] group-hover:shadow-sm transition-all border border-[var(--ad-border)]">
                    {isCategory && <Tag className="h-5 w-5" />}
                    {isDistrict && <MapPin className="h-5 w-5" />}
                    {!isCategory && !isDistrict && <MapPinned className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--ad-text-primary)]">{item.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[var(--ad-text-secondary)] font-mono">/{item.slug}</span>
                      {isUpazila && item.district && (
                        <>
                          <span className="text-[var(--ad-border)]">•</span>
                          <span className="text-xs text-[var(--ad-text-secondary)]">{item.district.name}</span>
                        </>
                      )}
                      {isDistrict && item.division && (
                        <>
                          <span className="text-[var(--ad-border)]">•</span>
                          <span className="text-xs text-[var(--ad-text-secondary)]">{item.division.name}</span>
                        </>
                      )}
                      {item._count && (
                        <>
                          <span className="text-[var(--ad-border)]">•</span>
                          <span className="text-xs text-[var(--ad-text-secondary)]">{item._count.posts} posts</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <DeleteItemButton
                  item={item}
                  title={title}
                  deleteAction={deleteAction}
                  disabled={disableActions}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
