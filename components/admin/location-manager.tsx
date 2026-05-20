"use client";

import { useState, useMemo, useActionState, useRef, useEffect, useCallback } from "react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { Plus, Trash2, Loader2, Search, MapPin, Globe, MapPinned, ChevronDown, ChevronRight, Building2, X } from "lucide-react";
import { useToast } from "@/components/admin/toast-provider";
import { useConfirm } from "@/components/admin/confirm-provider";

type LocationItem = {
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
  items: LocationItem[];
  parents?: ParentOption[];
  parentLabel?: string;
  createAction: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  deleteAction: (id: string) => Promise<void>;
  initialState: AdminActionState;
  stats?: Stat[];
};

const TYPE_CONFIG = {
  division: {
    icon: Globe,
    label: "Division",
    cardBg: "bg-blue-50 dark:bg-blue-900/20",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    groupIconBg: "bg-blue-100 dark:bg-blue-900/30",
    groupIconColor: "text-blue-600 dark:text-blue-400",
  },
  district: {
    icon: MapPin,
    label: "District",
    cardBg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    groupIconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    groupIconColor: "text-emerald-600 dark:text-emerald-400",
  },
  upazila: {
    icon: MapPinned,
    label: "Upazila",
    cardBg: "bg-violet-50 dark:bg-violet-900/20",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    badgeBg: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
    groupIconBg: "bg-violet-100 dark:bg-violet-900/30",
    groupIconColor: "text-violet-600 dark:text-violet-400",
  },
} as const;

function isRedirectError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const err = error as { digest?: string; message?: string };
  return (
    err.digest?.startsWith("NEXT_REDIRECT") === true ||
    err.message?.includes("NEXT_REDIRECT") === true
  );
}

function DeleteButton({
  item,
  type,
  deleteAction,
}: {
  item: LocationItem;
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
      className="absolute top-2 right-2 p-1.5 rounded-lg text-[var(--ad-text-secondary)] hover:text-[var(--ad-error)] hover:bg-[var(--ad-error)]/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
      title={`Delete ${type}`}
    >
      {isDeleting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function LocationCard({
  item,
  type,
  config,
  deleteAction,
}: {
  item: LocationItem;
  type: string;
  config: (typeof TYPE_CONFIG)[keyof typeof TYPE_CONFIG];
  deleteAction: (id: string) => Promise<void>;
}) {
  const Icon = config.icon;
  return (
    <div className={`relative group rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
      <DeleteButton item={item} type={type} deleteAction={deleteAction} />

      {/* Icon */}
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${config.iconBg} mb-3`}>
        <Icon className={`h-4.5 w-4.5 ${config.iconColor}`} />
      </div>

      {/* Name */}
      <p className="font-semibold text-sm text-[var(--ad-text-primary)] leading-snug pr-6 truncate">
        {item.name}
      </p>

      {/* Slug */}
      <p className="mt-0.5 text-[11px] font-mono text-[var(--ad-text-muted)] truncate">
        /{item.slug}
      </p>

      {/* Count badge */}
      {item.count !== undefined && (
        <div className="mt-3 pt-3 border-t border-[var(--ad-border)]">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${config.badgeBg}`}>
            {item.count} {item.countLabel ?? "items"}
          </span>
        </div>
      )}
    </div>
  );
}

export function LocationManager({
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
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set(parents.map((p) => p.id).concat(items.map((i) => i.parentId ?? "")))
  );
  const config = TYPE_CONFIG[type];

  const filtered = useMemo(() => {
    let result = items;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.slug.toLowerCase().includes(q)
      );
    }
    if (parentFilter !== "all" && type !== "division") {
      result = result.filter((i) => i.parentId === parentFilter);
    }
    return result;
  }, [items, searchQuery, parentFilter, type]);

  const groupedByParent = useMemo(() => {
    if (type === "division") return null;
    const grouped = new Map<string, { parent: ParentOption; items: LocationItem[] }>();
    for (const item of filtered) {
      const pid = item.parentId || "none";
      if (!grouped.has(pid)) {
        const parent = parents.find((p) => p.id === pid);
        grouped.set(pid, {
          parent: { id: pid, name: parent?.name || "Unassigned", count: parent?.count },
          items: [],
        });
      }
      grouped.get(pid)!.items.push(item);
    }
    return Array.from(grouped.values()).sort((a, b) =>
      a.parent.name.localeCompare(b.parent.name)
    );
  }, [filtered, parents, type]);

  const toggleParent = (id: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-4"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ad-text-muted)]">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--ad-text-primary)]">
                {stat.value.toLocaleString()}
              </p>
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
              placeholder={`Search ${type.toLowerCase()}s…`}
              className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] pl-9 pr-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)]"
              >
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
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.count !== undefined ? ` (${p.count})` : ""}
                </option>
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
      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
        parents={parents}
        parentLabel={parentLabel}
        createAction={createAction}
        initialState={initialState}
      />

      {/* Cards */}
      {type === "division" ? (
        filtered.length === 0 ? (
          <EmptyState type={type} searchQuery={searchQuery} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((item) => (
              <LocationCard
                key={item.id}
                item={item}
                type={type}
                config={config}
                deleteAction={deleteAction}
              />
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <EmptyState type={type} searchQuery={searchQuery} />
      ) : (
        <div className="space-y-5">
          {groupedByParent?.map(({ parent, items: groupItems }) => (
            <div key={parent.id} className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden">
              {/* Group header */}
              <button
                onClick={() => toggleParent(parent.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[var(--ad-background)]/60 hover:bg-[var(--ad-background)] transition-colors border-b border-[var(--ad-border)]"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${config.groupIconBg}`}>
                    <Building2 className={`h-3.5 w-3.5 ${config.groupIconColor}`} />
                  </div>
                  <span className="font-semibold text-sm text-[var(--ad-text-primary)]">
                    {parent.name}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${config.badgeBg}`}>
                    {groupItems.length}
                  </span>
                </div>
                {expandedParents.has(parent.id) ? (
                  <ChevronDown className="h-4 w-4 text-[var(--ad-text-secondary)]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[var(--ad-text-secondary)]" />
                )}
              </button>

              {/* Group cards */}
              {expandedParents.has(parent.id) && (
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {groupItems.map((item) => (
                    <LocationCard
                      key={item.id}
                      item={item}
                      type={type}
                      config={config}
                      deleteAction={deleteAction}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ type, searchQuery }: { type: string; searchQuery: string }) {
  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
  const Icon = config.icon;
  return (
    <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-16 text-center">
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${config.iconBg} mb-4`}>
        <Icon className={`h-7 w-7 ${config.iconColor}`} />
      </div>
      {searchQuery ? (
        <>
          <p className="font-semibold text-[var(--ad-text-primary)]">No results found</p>
          <p className="text-sm text-[var(--ad-text-secondary)] mt-1">
            No {type.toLowerCase()}s match &ldquo;{searchQuery}&rdquo;
          </p>
        </>
      ) : (
        <>
          <p className="font-semibold text-[var(--ad-text-primary)]">No {type.toLowerCase()}s yet</p>
          <p className="text-sm text-[var(--ad-text-secondary)] mt-1">
            Click &ldquo;Add {config.label}&rdquo; to get started
          </p>
        </>
      )}
    </div>
  );
}

// ─── MODAL ──────────────────────────────────────────────

function LocationModal({
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
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && formRef.current) formRef.current.reset();
  }, [isOpen]);

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      await formAction(formData);
    },
    [formAction]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--ad-card)] rounded-2xl shadow-2xl border border-[var(--ad-border)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ad-border)]">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.iconBg}`}>
              <config.icon className={`h-4 w-4 ${config.iconColor}`} />
            </div>
            <h2 className="text-base font-semibold text-[var(--ad-text-primary)]">
              Add {config.label}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--ad-border)]/50 text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form ref={formRef} action={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] mb-1.5 font-mono">
              Name <span className="text-[var(--ad-error)] normal-case font-normal tracking-normal">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              placeholder={`Enter ${type.toLowerCase()} name…`}
              className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-xs font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] mb-1.5 font-mono">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              placeholder="auto-generated-from-name"
              className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)] font-mono"
            />
          </div>
          {type !== "division" && parents.length > 0 && (
            <div>
              <label htmlFor="parentId" className="block text-xs font-bold uppercase tracking-wider text-[var(--ad-text-secondary)] mb-1.5 font-mono">
                {parentLabel || "Parent"} <span className="text-[var(--ad-error)] normal-case font-normal tracking-normal">*</span>
              </label>
              <select
                id="parentId"
                name={type === "district" ? "divisionId" : "districtId"}
                required
                className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all"
              >
                <option value="">Select {parentLabel?.toLowerCase() || "parent"}…</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.count !== undefined ? ` (${p.count})` : ""}
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
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] bg-transparent hover:bg-[var(--ad-border)]/40 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-primary)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ad-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create {config.label}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
