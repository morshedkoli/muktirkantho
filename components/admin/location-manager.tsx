"use client";

import { useState, useMemo, useActionState, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Search,
  MapPin,
  Globe,
  MapPinned,
  ChevronDown,
  X,
} from "lucide-react";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import { bnNumber } from "@/lib/bn-number";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/admin/toast-provider";
import { useConfirm } from "@/components/admin/confirm-provider";
import { Modal } from "@/components/admin/modal";
import { Panel, StatTile, EmptyState, Field, Alert } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

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

type ParentOption = { id: string; name: string; count?: number };

type Stat = { label: string; value: number };

type LocationType = "division" | "district" | "upazila";

type Props = {
  type: LocationType;
  items: LocationItem[];
  parents?: ParentOption[];
  parentLabel?: string;
  createAction: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  deleteAction: (id: string) => Promise<void>;
  initialState: AdminActionState;
  stats?: Stat[];
};

const TYPE_CONFIG: Record<
  LocationType,
  { icon: React.ComponentType<{ className?: string }>; label: string; field: string }
> = {
  division: { icon: Globe, label: "বিভাগ", field: "" },
  district: { icon: MapPin, label: "জেলা", field: "divisionId" },
  upazila: { icon: MapPinned, label: "উপজেলা", field: "districtId" },
};

/** A server-action redirect throws — that is success, not failure. */
function isRedirectError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const err = error as { digest?: string; message?: string };
  return (
    err.digest?.startsWith("NEXT_REDIRECT") === true ||
    err.message?.includes("NEXT_REDIRECT") === true
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
  const config = TYPE_CONFIG[type];
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [parentFilter, setParentFilter] = useState("all");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (parentFilter !== "all" && type !== "division" && item.parentId !== parentFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q)
      );
    });
  }, [items, query, parentFilter, type]);

  /** Districts and upazilas are grouped under their parent; divisions are flat. */
  const groups = useMemo(() => {
    if (type === "division") return null;
    const map = new Map<string, { parent: ParentOption; items: LocationItem[] }>();
    for (const item of filtered) {
      const pid = item.parentId || "none";
      if (!map.has(pid)) {
        const parent = parents.find((p) => p.id === pid);
        map.set(pid, {
          parent: { id: pid, name: parent?.name ?? "অনির্ধারিত", count: parent?.count },
          items: [],
        });
      }
      map.get(pid)!.items.push(item);
    }
    return [...map.values()].sort((a, b) => a.parent.name.localeCompare(b.parent.name));
  }, [filtered, parents, type]);

  const toggleGroup = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
          {stats.map((stat, index) => (
            <StatTile
              key={stat.label}
              label={stat.label}
              value={bnNumber(stat.value)}
              tone={index === 0 ? "accent" : "neutral"}
              className={index === 2 ? "hidden sm:block" : undefined}
            />
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ad-text-muted)]" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${config.label} খুঁজুন…`}
            className="pl-9"
            aria-label={`${config.label} খুঁজুন`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="খোঁজা বাতিল"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--ad-text-muted)] hover:text-[var(--ad-text-primary)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {type !== "division" && parents.length > 0 && (
          <Select
            value={parentFilter}
            onChange={(e) => setParentFilter(e.target.value)}
            aria-label={`${parentLabel ?? "প্যারেন্ট"} অনুযায়ী ফিল্টার`}
            className="sm:w-52"
          >
            <option value="all">সব {parentLabel ?? "প্যারেন্ট"}</option>
            {parents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
                {parent.count !== undefined ? ` (${parent.count})` : ""}
              </option>
            ))}
          </Select>
        )}

        <Button onClick={() => setModalOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          নতুন {config.label}
        </Button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Panel flush>
          <EmptyState
            icon={config.icon}
            title={query ? "কিছু মেলেনি" : `এখনো কোনো ${config.label} নেই`}
            description={
              query
                ? `“${query}” দিয়ে কোনো ${config.label} পাওয়া যায়নি।`
                : `প্রথম ${config.label} যোগ করে কভারেজ শুরু করুন।`
            }
            action={
              query ? (
                <Button variant="outline" onClick={() => setQuery("")}>
                  খোঁজা বাতিল
                </Button>
              ) : (
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  নতুন {config.label}
                </Button>
              )
            }
          />
        </Panel>
      ) : type === "division" ? (
        <Panel flush>
          <ul className="divide-y divide-[var(--ad-border)]">
            {filtered.map((item) => (
              <LocationRow
                key={item.id}
                item={item}
                type={type}
                deleteAction={deleteAction}
              />
            ))}
          </ul>
        </Panel>
      ) : (
        <div className="space-y-3">
          {groups?.map(({ parent, items: groupItems }) => {
            const isCollapsed = collapsed.has(parent.id);
            return (
              <Panel key={parent.id} flush>
                <button
                  type="button"
                  onClick={() => toggleGroup(parent.id)}
                  aria-expanded={!isCollapsed}
                  className="flex w-full items-center justify-between gap-3 border-b border-[var(--ad-border)] bg-[var(--ad-card-alt)] px-5 py-3 text-left transition-colors hover:bg-[var(--ad-inset)]"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="adm-display truncate text-[14px]">{parent.name}</span>
                    <span className="adm-mono shrink-0 text-[11px] text-[var(--ad-text-muted)]">
                      {bnNumber(groupItems.length)}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-[var(--ad-text-muted)] transition-transform",
                      isCollapsed && "-rotate-90"
                    )}
                  />
                </button>

                {!isCollapsed && (
                  <ul className="divide-y divide-[var(--ad-border)]">
                    {groupItems.map((item) => (
                      <LocationRow
                        key={item.id}
                        item={item}
                        type={type}
                        deleteAction={deleteAction}
                      />
                    ))}
                  </ul>
                )}
              </Panel>
            );
          })}
        </div>
      )}

      <LocationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type={type}
        parents={parents}
        parentLabel={parentLabel}
        createAction={createAction}
        initialState={initialState}
      />
    </div>
  );
}

/* ── Row ─────────────────────────────────────────────────────────────────── */

function LocationRow({
  item,
  type,
  deleteAction,
}: {
  item: LocationItem;
  type: LocationType;
  deleteAction: (id: string) => Promise<void>;
}) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: `${config.label} মুছবেন?`,
      message: `“${item.name}” স্থায়ীভাবে মুছে যাবে। এই কাজটি ফেরানো যাবে না।`,
      confirmText: "মুছে ফেলুন",
      cancelText: "বাতিল",
      type: "danger",
    });
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteAction(item.id);
      showToast(`${config.label} মুছে ফেলা হয়েছে`, "success");
    } catch (error) {
      if (isRedirectError(error)) {
        showToast(`${config.label} মুছে ফেলা হয়েছে`, "success");
        return;
      }
      showToast(`${config.label} মুছে ফেলা যায়নি`, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <li className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-[var(--ad-card-alt)]">
      <Icon className="h-4 w-4 shrink-0 text-[var(--ad-text-muted)]" />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-[var(--ad-text-primary)]">
          {item.name}
        </span>
        <span className="adm-mono block truncate text-[10.5px] text-[var(--ad-text-muted)]">
          /{item.slug}
        </span>
      </span>

      {item.count !== undefined && (
        <span className="adm-mono shrink-0 text-[11.5px] text-[var(--ad-text-secondary)]">
          {bnNumber(item.count)} {item.countLabel === "districts" ? "জেলা" : "উপজেলা"}
        </span>
      )}

      <Button
        type="button"
        variant="icon"
        size="icon"
        onClick={handleDelete}
        disabled={deleting}
        aria-label={`${item.name} মুছুন`}
        className="shrink-0 hover:bg-[var(--ad-error-tint)] hover:text-[var(--ad-error)]"
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </li>
  );
}

/* ── Create dialog ───────────────────────────────────────────────────────── */

function LocationModal({
  open,
  onClose,
  type,
  parents,
  parentLabel,
  createAction,
  initialState,
}: {
  open: boolean;
  onClose: () => void;
  type: LocationType;
  parents: ParentOption[];
  parentLabel?: string;
  createAction: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  initialState: AdminActionState;
}) {
  const config = TYPE_CONFIG[type];
  const [state, formAction, pending] = useActionState(createAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state.status !== "error") {
      formRef.current?.reset();
      onClose();
    }
    wasPending.current = pending;
  }, [pending, state.status, onClose]);

  useEffect(() => {
    if (open) formRef.current?.reset();
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      kicker="অঞ্চল"
      title={`নতুন ${config.label}`}
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            বাতিল
          </Button>
          <Button type="submit" form="location-form" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                তৈরি হচ্ছে…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                তৈরি করুন
              </>
            )}
          </Button>
        </>
      }
    >
      <form id="location-form" ref={formRef} action={formAction} className="space-y-4">
        <Field label="নাম" htmlFor="location-name" required>
          <Input
            id="location-name"
            name="name"
            type="text"
            required
            autoFocus
            placeholder={`${config.label}ের নাম`}
          />
        </Field>

        <Field
          label="স্লাগ"
          htmlFor="location-slug"
          hint="খালি রাখলে নাম থেকে স্বয়ংক্রিয়ভাবে তৈরি হবে"
        >
          <Input
            id="location-slug"
            name="slug"
            type="text"
            placeholder="auto-generated"
            className="adm-mono"
          />
        </Field>

        {type !== "division" && parents.length > 0 && (
          <Field label={parentLabel ?? "প্যারেন্ট"} htmlFor="location-parent" required>
            <Select id="location-parent" name={config.field} required defaultValue="">
              <option value="" disabled>
                নির্বাচন করুন…
              </option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {state.status === "error" && <Alert tone="error">{state.message}</Alert>}
      </form>
    </Modal>
  );
}
