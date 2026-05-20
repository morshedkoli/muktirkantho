"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Edit2, Trash2, Link as LinkIcon, ExternalLink, AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveMenuItemAction, deleteMenuItemAction } from "@/app/(admin)/admin/actions";
import type { AdminActionState } from "@/app/(admin)/admin/actions";

type MenuItem = {
  id: string;
  label: string;
  url: string;
  location: string;
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
  icon: string | null;
};

type Category = { id: string; name: string; slug: string };

const LOCATIONS = [
  { key: "header", label: "Header Nav", hint: "Links shown in the site's top navigation bar", usesCategory: true },
  { key: "footer", label: "Footer Links", hint: "Links in the footer categories column", usesCategory: true },
  { key: "footer_bottom", label: "Footer Bottom", hint: "Bottom bar links (Privacy, Terms, etc.)", usesCategory: false },
  { key: "social", label: "Social Links", hint: "Social media icons shown in the footer brand area", usesCategory: false },
];

const SOCIAL_ICONS = ["Facebook", "Twitter", "Instagram", "LinkedIn", "YouTube"];

const initialActionState: AdminActionState = { status: "idle" };

const selectCls =
  "w-full h-9 rounded-xl border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 text-sm text-[var(--ad-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ad-primary)] focus:border-transparent";

// Derive the category slug from a stored URL for edit pre-fill.
function slugFromUrl(url: string): string {
  if (url === "/") return "";
  if (url.startsWith("/category/")) return url.slice("/category/".length);
  return "";
}

// ─── Add/Edit Modal ────────────────────────────────────────────────────────────

function MenuModal({
  item,
  location,
  maxOrder,
  categories,
  onClose,
}: {
  item: MenuItem | null;
  location: string;
  maxOrder: number;
  categories: Category[];
  onClose: () => void;
}) {
  const usesCategory = LOCATIONS.find((l) => l.key === location)?.usesCategory ?? false;

  // Controlled label — auto-fills when a category is picked.
  const [label, setLabel] = useState(item?.label ?? "");
  const [selectedSlug, setSelectedSlug] = useState(
    item ? slugFromUrl(item.url) : ""
  );

  const [state, formAction, pending] = useActionState(saveMenuItemAction, initialActionState);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      onClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    setSelectedSlug(slug);
    // Auto-fill label from the chosen category name (only when label is still empty or was auto-filled).
    const cat = categories.find((c) => c.slug === slug);
    if (cat) setLabel(cat.name);
    else if (slug === "") setLabel("সর্বশেষ");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-[var(--ad-card)] border border-[var(--ad-border)] shadow-2xl z-10 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--ad-border)]">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--ad-text-primary)] font-mono">
            {item ? "Edit Menu Item" : "Add Menu Item"}
          </h3>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-[var(--ad-text-secondary)] hover:bg-[var(--ad-border)]/50 transition-colors text-sm leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form action={formAction} className="p-6 space-y-4">
          <input type="hidden" name="_itemId" value={item?.id ?? ""} />
          <input type="hidden" name="location" value={location} />

          {state.status === "error" && state.message && (
            <div className="flex items-center gap-2 text-sm text-[var(--ad-error)] bg-[var(--ad-error)]/10 border border-[var(--ad-error)]/20 px-3 py-2.5 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          {/* Category selector (header / footer) OR URL input (footer_bottom / social) */}
          {usesCategory ? (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--ad-text-secondary)] mb-1.5 font-mono">
                Category
              </label>
              <select
                name="categorySlug"
                value={selectedSlug}
                onChange={handleCategoryChange}
                className={selectCls}
              >
                <option value="">সর্বশেষ (Home — /)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {/* Show the resolved URL as a hint */}
              <p className="mt-1 text-[11px] text-[var(--ad-text-muted)] font-mono">
                → {selectedSlug ? `/category/${selectedSlug}` : "/"}
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--ad-text-secondary)] mb-1.5 font-mono">
                URL
              </label>
              <Input
                name="url"
                defaultValue={item?.url ?? ""}
                placeholder={location === "social" ? "https://facebook.com/yourpage" : "/privacy-policy"}
              />
            </div>
          )}

          {/* Label — auto-filled for category, free text for others */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--ad-text-secondary)] mb-1.5 font-mono">
              Label
            </label>
            <Input
              name="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={location === "social" ? "Facebook" : "বাংলাদেশ"}
              autoFocus={!usesCategory}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--ad-text-secondary)] mb-1.5 font-mono">
                Order
              </label>
              <Input
                name="order"
                type="number"
                defaultValue={item?.order ?? maxOrder + 1}
                min={0}
              />
            </div>
            {location === "social" && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--ad-text-secondary)] mb-1.5 font-mono">
                  Platform
                </label>
                <select
                  name="icon"
                  defaultValue={item?.icon ?? "Facebook"}
                  className={selectCls}
                >
                  {SOCIAL_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-5 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isActive"
                value="true"
                defaultChecked={item?.isActive ?? true}
                className="h-4 w-4 rounded accent-[var(--ad-primary)]"
              />
              <span className="text-sm text-[var(--ad-text-secondary)]">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="openInNewTab"
                value="true"
                defaultChecked={item?.openInNewTab ?? (location === "social")}
                className="h-4 w-4 rounded accent-[var(--ad-primary)]"
              />
              <span className="text-sm text-[var(--ad-text-secondary)]">Open in new tab</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2 border-t border-[var(--ad-border)]">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-xs font-bold uppercase tracking-wider"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="flex-1 bg-[var(--ad-primary)] hover:bg-[var(--ad-primary-hover)] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[var(--ad-primary)]/20"
            >
              {pending ? "Saving…" : item ? "Update" : "Add Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function MenuManager({
  initialItems,
  categories,
}: {
  initialItems: MenuItem[];
  categories: Category[];
}) {
  const [activeTab, setActiveTab] = useState("header");
  const [modal, setModal] = useState<{ open: boolean; item: MenuItem | null }>({
    open: false,
    item: null,
  });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const tabItems = initialItems
    .filter((i) => i.location === activeTab)
    .sort((a, b) => a.order - b.order);

  const maxOrder = tabItems.length > 0 ? Math.max(...tabItems.map((i) => i.order)) : 0;

  const openAdd = () => setModal({ open: true, item: null });
  const openEdit = (item: MenuItem) => setModal({ open: true, item });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const handleDelete = (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    startTransition(async () => {
      await deleteMenuItemAction(id);
      router.refresh();
    });
  };

  const activeLocation = LOCATIONS.find((l) => l.key === activeTab);

  return (
    <div className="space-y-5">
      {/* Location tabs */}
      <div className="flex flex-wrap gap-2">
        {LOCATIONS.map((loc) => {
          const count = initialItems.filter((i) => i.location === loc.key).length;
          const isActive = activeTab === loc.key;
          return (
            <button
              key={loc.key}
              onClick={() => setActiveTab(loc.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-[var(--ad-primary)] text-white shadow-lg shadow-[var(--ad-primary)]/20"
                  : "bg-[var(--ad-card)] border border-[var(--ad-border)] text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] hover:border-[var(--ad-primary)]/40"
              }`}
            >
              {loc.label}
              <span
                className={`text-[10px] rounded-full px-1.5 py-0.5 font-mono font-bold ${
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-[var(--ad-border)]/60 text-[var(--ad-text-muted)]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items card */}
      <Card>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--ad-border)]">
          <div>
            <p className="text-sm font-bold text-[var(--ad-text-primary)]">
              {activeLocation?.label}
            </p>
            <p className="text-xs text-[var(--ad-text-secondary)] mt-0.5">
              {activeLocation?.hint}
            </p>
          </div>
          <Button
            onClick={openAdd}
            className="bg-[var(--ad-primary)] hover:bg-[var(--ad-primary-hover)] text-white text-xs font-bold uppercase tracking-wider px-4 h-8 shadow-lg shadow-[var(--ad-primary)]/20"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Item
          </Button>
        </div>

        <CardContent className="p-0">
          {tabItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="h-12 w-12 rounded-2xl bg-[var(--ad-border)]/30 flex items-center justify-center mb-3">
                <LinkIcon className="h-5 w-5 text-[var(--ad-text-muted)]" />
              </div>
              <p className="text-sm font-semibold text-[var(--ad-text-secondary)]">No items yet</p>
              <p className="text-xs text-[var(--ad-text-muted)] mt-1 max-w-xs">
                Add items here and they&apos;ll replace the default hardcoded links on the site.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--ad-border)]">
              {tabItems.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-center gap-3 px-5 py-3 hover:bg-[var(--ad-background)]/40 transition-colors group ${
                    isPending ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {/* Order badge */}
                  <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--ad-border)]/40 text-[11px] font-mono text-[var(--ad-text-muted)] font-bold">
                    {item.order}
                  </span>

                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[var(--ad-text-primary)] truncate">
                        {item.label}
                      </span>
                      {item.icon && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[var(--ad-border)]/40 text-[var(--ad-text-muted)]">
                          {item.icon}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.isActive
                            ? "bg-[var(--ad-success)]/15 text-[var(--ad-success)]"
                            : "bg-[var(--ad-error)]/15 text-[var(--ad-error)]"
                        }`}
                      >
                        {item.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-[var(--ad-text-muted)] font-mono truncate">
                        {item.url}
                      </span>
                      {item.openInNewTab && (
                        <ExternalLink className="h-3 w-3 text-[var(--ad-text-muted)] shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(item)}
                      title="Edit"
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-[var(--ad-text-secondary)] hover:bg-[var(--ad-border)]/50 hover:text-[var(--ad-text-primary)] transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-[var(--ad-text-secondary)] hover:bg-[var(--ad-error)]/10 hover:text-[var(--ad-error)] transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {modal.open && (
        <MenuModal
          key={modal.item?.id ?? `new-${activeTab}-${Date.now()}`}
          item={modal.item}
          location={modal.item?.location ?? activeTab}
          maxOrder={maxOrder}
          categories={categories}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
