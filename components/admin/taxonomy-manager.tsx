"use client";

import { useState } from "react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { Plus, Trash2, Loader2, Tag, MapPin, MapPinned } from "lucide-react";
import { useToast } from "@/components/admin/toast-provider";
import { useConfirm } from "@/components/admin/confirm-provider";
import { AddItemModal } from "./add-item-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <Tooltip delayDuration={50}>
      <TooltipTrigger asChild>
        <Button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[var(--ad-text-secondary)] hover:text-[var(--ad-error)] hover:bg-[var(--ad-error)]/10 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-50 cursor-pointer"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin text-[var(--ad-error)]" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        Delete {title}
      </TooltipContent>
    </Tooltip>
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
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--ad-text-primary)]">
              {title} Management
            </h2>
            <p className="text-xs text-[var(--ad-text-secondary)] font-medium mt-1">
              Manage your {title.toLowerCase()}s and their associations
            </p>
          </div>
          {!disableActions && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[var(--ad-green)] shadow-lg shadow-[var(--ad-green)]/20 hover:bg-[var(--ad-green-hover)] text-white w-full sm:w-auto text-xs uppercase tracking-wider font-bold"
            >
              <Plus className="h-4 w-4" />
              Add {title}
            </Button>
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
        <Card className="overflow-hidden">
          <div className="border-b border-[var(--ad-border)] bg-[var(--ad-background)]/50 px-5 py-4 flex items-center justify-between">
            <h3 className="text-[10.5px] font-mono tracking-wider uppercase text-[var(--ad-text-primary)] font-bold">
              All {title}s
            </h3>
            <Badge variant="secondary">
              {items.length} total
            </Badge>
          </div>

          {items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--ad-background)] mb-4">
                {isCategory && <Tag className="h-7 w-7 text-[var(--ad-text-secondary)]" />}
                {isDistrict && <MapPin className="h-7 w-7 text-[var(--ad-text-secondary)]" />}
                {!isCategory && !isDistrict && <MapPinned className="h-7 w-7 text-[var(--ad-text-secondary)]" />}
              </div>
              <p className="text-[var(--ad-text-primary)] font-bold">No {title.toLowerCase()}s yet</p>
              {!disableActions && (
                <p className="text-xs text-[var(--ad-text-secondary)] mt-1 font-medium">
                  Click the button above to add your first {title.toLowerCase()}
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[var(--ad-border)]">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-[var(--ad-background)]/30 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ad-border)]/20 text-[var(--ad-text-secondary)] group-hover:bg-[var(--ad-green-light)] group-hover:text-[var(--ad-green)] group-hover:border-[var(--ad-green)]/20 transition-all border border-[var(--ad-border)] shrink-0">
                      {isCategory && <Tag className="h-5 w-5" />}
                      {isDistrict && <MapPin className="h-5 w-5" />}
                      {!isCategory && !isDistrict && <MapPinned className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--ad-text-primary)] text-[14px] sm:text-[14.5px] truncate font-bangla">{item.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-[11px] text-[var(--ad-text-muted)] font-mono font-medium">/{item.slug}</span>
                        {isUpazila && item.district && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-[var(--ad-text-muted)] opacity-40 shrink-0" />
                            <span className="text-xs font-semibold text-[var(--ad-text-secondary)]">{item.district.name}</span>
                          </>
                        )}
                        {isDistrict && item.division && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-[var(--ad-text-muted)] opacity-40 shrink-0" />
                            <span className="text-xs font-semibold text-[var(--ad-text-secondary)]">{item.division.name}</span>
                          </>
                        )}
                        {item._count && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-[var(--ad-text-muted)] opacity-40 shrink-0" />
                            <Badge variant="success">
                              {item._count.posts} posts
                            </Badge>
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
        </Card>
      </div>
    </TooltipProvider>
  );
}

