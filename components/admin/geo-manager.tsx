"use client";

import { useState, useMemo, useActionState, useRef, useEffect, useCallback } from "react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { Plus, Trash2, Loader2, Search, MapPin, Globe, MapPinned, ChevronDown, ChevronRight, Building2, Layers, X } from "lucide-react";
import { useToast } from "@/components/admin/toast-provider";
import { useConfirm } from "@/components/admin/confirm-provider";

type GeoItem = {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  parentName?: string;
  count?: number;
  countLabel?: string;
  children?: { id: string; name: string; slug: string }[];
};

type ParentOption = {
  id: string;
  name: string;
  count?: number;
};

type Stat = {
  label: string;
  value: number;
};

type Props = {
  type: "division" | "district" | "upazila";
  items: GeoItem[];
  parents?: ParentOption[];
  parentLabel?: string;
  createAction: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  deleteAction: (id: string) => Promise<void>;
  initialState: AdminActionState;
  stats?: Stat[];
};

const TYPE_CONFIG = {
  division: { icon: Globe, label: "Division", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", iconColor: "text-blue-600" },
  district: { icon: MapPin, label: "District", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", iconColor: "text-emerald-600" },
  upazila: { icon: MapPinned, label: "Upazila", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", iconColor: "text-purple-600" },
} as const;

function isRedirectError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const err = error as { digest?: string; message?: string };
  return err.digest?.startsWith('NEXT_REDIRECT') === true ||
    err.message?.includes('NEXT_REDIRECT') === true;
}

function DeleteButton({
  item,
  type,
  deleteAction,
}: {
  item: GeoItem;
  type: string;
  deleteAction: (id: string) => Promise<void>;
}) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: `Delete ${type}`,
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });
    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      await deleteAction(item.id);
      showToast(`${type} deleted successfully`, "success");
    } catch (error) {
      if (isRedirectError(error)) {
        showToast(`${type} deleted successfully`, "success");
        return;
      }
      showToast(`Failed to delete ${type.toLowerCase()}`, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-error)] hover:bg-[var(--ad-error)]/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
      title={`Delete ${type}`}
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}

export function GeoManager({
  type,
  items,
  parents = [],
  parentLabel,
  createAction,
  deleteAction,
  initialState,
  stats = [],
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [parentFilter, setParentFilter] = useState<string>("all");
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set(items.map(i => i.id)));
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  const filtered = useMemo(() => {
    let result = items;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(q) || i.slug.toLowerCase().includes(q)
      );
    }
    if (parentFilter !== "all" && type !== "division") {
      result = result.filter(i => i.parentId === parentFilter);
    }
    return result;
  }, [items, searchQuery, parentFilter, type]);

  const groupedByParent = useMemo(() => {
    if (type === "division") return null;
    const grouped = new Map<string, { parent: ParentOption; items: GeoItem[] }>();
    for (const item of filtered) {
      const pid = item.parentId || "none";
      if (!grouped.has(pid)) {
        const parent = parents.find(p => p.id === pid);
        grouped.set(pid, {
          parent: { id: pid, name: parent?.name || "Unassigned", count: parent?.count },
          items: [],
        });
      }
      grouped.get(pid)!.items.push(item);
    }
    return Array.from(grouped.values()).sort((a, b) => a.parent.name.localeCompare(b.parent.name));
  }, [filtered, parents, type]);

  const toggleParent = (id: string) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-4">
              <p className="text-xs text-[var(--ad-text-secondary)] font-medium uppercase tracking-wider">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-[var(--ad-text-primary)]">{stat.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ad-text-secondary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${type.toLowerCase()}s...`}
              className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] pl-9 pr-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)]">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {type !== "division" && parents.length > 0 && (
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value)}
              className="rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] px-3 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] transition-all"
            >
              <option value="all">All {parentLabel}s</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>{p.name} {p.count !== undefined ? `(${p.count})` : ""}</option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-primary-hover)] transition-all shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          Add {config.label}
        </button>
      </div>

      {/* Add Modal */}
      <GeoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
        parents={parents}
        parentLabel={parentLabel}
        createAction={createAction}
        initialState={initialState}
      />

      {/* List */}
      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-sm overflow-hidden">
        {type === "division" ? (
          <>
            <ListHeader total={items.length} label={config.label} />
            {filtered.length === 0 ? (
              <EmptyState type={type} searchQuery={searchQuery} />
            ) : (
              <div className="divide-y divide-[var(--ad-border)]">
                {filtered.map((item) => (
                  <GeoRow key={item.id} item={item} type={type} config={config} deleteAction={deleteAction} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <ListHeader total={items.length} label={config.label} parentLabel={parentLabel} />
            {filtered.length === 0 ? (
              <EmptyState type={type} searchQuery={searchQuery} />
            ) : (
              <div className="divide-y divide-[var(--ad-border)]">
                {groupedByParent?.map(({ parent, items: groupItems }) => (
                  <div key={parent.id}>
                    <button
                      onClick={() => toggleParent(parent.id)}
                      className="w-full flex items-center justify-between px-5 py-3.5 bg-[var(--ad-paper)] hover:bg-[var(--ad-paper-2)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-[var(--ad-text-secondary)]" />
                        <span className="font-semibold text-sm text-[var(--ad-text-primary)]">{parent.name}</span>
                        <span className="text-xs text-[var(--ad-text-secondary)] bg-[var(--ad-card)] px-2 py-0.5 rounded-full border border-[var(--ad-border)]">
                          {groupItems.length}
                        </span>
                      </div>
                      {expandedParents.has(parent.id) ? (
                        <ChevronDown className="h-4 w-4 text-[var(--ad-text-secondary)]" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[var(--ad-text-secondary)]" />
                      )}
                    </button>
                    {expandedParents.has(parent.id) && (
                      <div className="divide-y divide-[var(--ad-border)]">
                        {groupItems.map((item) => (
                          <GeoRow key={item.id} item={item} type={type} config={config} deleteAction={deleteAction} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ListHeader({ total, label, parentLabel }: { total: number; label: string; parentLabel?: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--ad-border)]">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-[var(--ad-text-secondary)]" />
        <h3 className="text-sm font-semibold text-[var(--ad-text-primary)]">
          All {label}s
        </h3>
        {parentLabel && (
          <span className="hidden sm:inline text-xs text-[var(--ad-text-secondary)] ml-1">
            grouped by {parentLabel}
          </span>
        )}
      </div>
      <span className="text-xs text-[var(--ad-text-secondary)] bg-[var(--ad-paper)] px-2.5 py-1 rounded-full border border-[var(--ad-border)]">
        {total} total
      </span>
    </div>
  );
}

function EmptyState({ type, searchQuery }: { type: string; searchQuery: string }) {
  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
  const Icon = config.icon;
  return (
    <div className="p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--ad-paper)] mb-4">
        <Icon className="h-8 w-8 text-[var(--ad-text-secondary)]" />
      </div>
      {searchQuery ? (
        <>
          <p className="text-[var(--ad-text-primary)] font-medium">No results found</p>
          <p className="text-sm text-[var(--ad-text-secondary)] mt-1">
            No {type.toLowerCase()}s match &ldquo;{searchQuery}&rdquo;
          </p>
        </>
      ) : (
        <>
          <p className="text-[var(--ad-text-primary)] font-medium">No {type.toLowerCase()}s yet</p>
          <p className="text-sm text-[var(--ad-text-secondary)] mt-1">
            Click &ldquo;Add {config.label}&rdquo; to create your first {type.toLowerCase()}
          </p>
        </>
      )}
    </div>
  );
}

function GeoRow({
  item,
  type,
  config,
  deleteAction,
}: {
  item: GeoItem;
  type: string;
  config: typeof TYPE_CONFIG[keyof typeof TYPE_CONFIG];
  deleteAction: (id: string) => Promise<void>;
}) {
  const Icon = config.icon;
  return (
    <div className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--ad-paper)] transition-colors group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.color} shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm text-[var(--ad-text-primary)] truncate">{item.name}</p>
            {item.parentName && type !== "division" && (
              <span className="hidden sm:inline text-xs text-[var(--ad-text-secondary)] truncate">
                — {item.parentName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-[var(--ad-text-secondary)] font-mono">/{item.slug}</span>
            {item.count !== undefined && (
              <>
                <span className="text-[var(--ad-border)]">·</span>
                <span className="text-xs text-[var(--ad-text-secondary)]">{item.count} {item.countLabel || "items"}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {item.children && item.children.length > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[var(--ad-text-secondary)] bg-[var(--ad-paper)] px-2 py-1 rounded-md border border-[var(--ad-border)]">
            <Building2 className="h-3 w-3" />
            {item.children.length}
          </span>
        )}
        <DeleteButton item={item} type={type} deleteAction={deleteAction} />
      </div>
    </div>
  );
}

// ─── MODAL ──────────────────────────────────────────────

function GeoModal({
  isOpen,
  onClose,
  type,
  parents,
  parentLabel,
  createAction,
  initialState,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: "division" | "district" | "upazila";
  parents: ParentOption[];
  parentLabel?: string;
  createAction: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  initialState: AdminActionState;
}) {
  const [state, formAction, pending] = useActionState(createAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const config = TYPE_CONFIG[type];

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && formRef.current) formRef.current.reset();
  }, [isOpen]);

  const handleSubmit = useCallback(async (formData: FormData) => {
    await formAction(formData);
  }, [formAction]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--ad-card)] rounded-xl shadow-2xl border border-[var(--ad-border)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ad-border)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ad-text-primary)]">Add {config.label}</h2>
            <p className="text-sm text-[var(--ad-text-secondary)] mt-0.5">Create a new {type.toLowerCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--ad-paper)] text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form ref={formRef} action={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--ad-text-primary)] mb-1.5">
              Name <span className="text-[var(--ad-error)]">*</span>
            </label>
            <input
              id="name" name="name" type="text" required autoFocus
              placeholder={`Enter ${type.toLowerCase()} name...`}
              className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-[var(--ad-text-primary)] mb-1.5">
              Slug <span className="text-[var(--ad-text-secondary)] font-normal">(optional)</span>
            </label>
            <input
              id="slug" name="slug" type="text"
              placeholder="auto-generated-from-name"
              className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
            />
            <p className="mt-1 text-xs text-[var(--ad-text-secondary)]">Auto-generated from name if left blank.</p>
          </div>
          {type !== "division" && parents.length > 0 && (
            <div>
              <label htmlFor="parentId" className="block text-sm font-medium text-[var(--ad-text-primary)] mb-1.5">
                {parentLabel || "Parent"} <span className="text-[var(--ad-error)]">*</span>
              </label>
              <select
                id="parentId" name={type === "district" ? "divisionId" : "districtId"} required
                className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-paper)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all"
              >
                <option value="">Select {parentLabel?.toLowerCase() || "parent"}...</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.count !== undefined ? ` (${p.count})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          {state.status === "error" && (
            <div className="rounded-lg bg-[var(--ad-error)]/10 border border-[var(--ad-error)]/20 p-3 flex items-start gap-2">
              <div className="h-4 w-4 rounded-full bg-[var(--ad-error)]/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-[var(--ad-error)]">!</span>
              </div>
              <p className="text-sm text-[var(--ad-error)]">{state.message}</p>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] bg-transparent hover:bg-[var(--ad-paper)] rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={pending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-primary)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
              {pending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
              ) : (
                <><Plus className="h-4 w-4" /> Create {config.label}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}