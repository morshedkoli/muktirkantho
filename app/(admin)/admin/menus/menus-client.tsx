"use client";

import { useState, useTransition } from "react";
import {
  Plus, Trash2, ChevronUp, ChevronDown, ExternalLink,
  ToggleLeft, ToggleRight, Pencil, Check, X, GripVertical,
} from "lucide-react";

type MenuItem = {
  id: string;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
  openNewTab: boolean;
};

type EditState = { label: string; href: string; openNewTab: boolean };

export function MenusClient({ initial }: { initial: MenuItem[] }) {
  const [items, setItems] = useState<MenuItem[]>(initial);
  const [editId, setEditId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ label: "", href: "", openNewTab: false });
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("");
  const [newTab, setNewTab] = useState(false);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  async function api(path: string, method: string, body?: object) {
    const r = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  async function addItem() {
    if (!newLabel.trim() || !newHref.trim()) { setError("লেবেল ও URL আবশ্যক"); return; }
    setError("");
    try {
      const item = await api("/api/admin/menus", "POST", { label: newLabel.trim(), href: newHref.trim(), openNewTab: newTab });
      setItems((prev) => [...prev, item]);
      setNewLabel(""); setNewHref(""); setNewTab(false);
    } catch { setError("যোগ করতে সমস্যা হয়েছে"); }
  }

  async function deleteItem(id: string) {
    if (!confirm("এই মেনু আইটেমটি মুছে ফেলবেন?")) return;
    try {
      await api(`/api/admin/menus/${id}`, "DELETE");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch { setError("মুছতে সমস্যা হয়েছে"); }
  }

  async function toggleActive(item: MenuItem) {
    try {
      const updated = await api(`/api/admin/menus/${item.id}`, "PUT", { isActive: !item.isActive });
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isActive: updated.isActive } : i));
    } catch { setError("আপডেট করতে সমস্যা হয়েছে"); }
  }

  async function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const newItems = [...items];
    const a = newItems[index];
    const b = newItems[targetIndex];
    // Swap orders
    const aOrder = a.order;
    const bOrder = b.order;
    newItems[index] = { ...a, order: bOrder };
    newItems[targetIndex] = { ...b, order: aOrder };
    newItems.sort((x, y) => x.order - y.order);
    setItems(newItems);
    startTransition(async () => {
      try {
        await Promise.all([
          api(`/api/admin/menus/${a.id}`, "PUT", { order: bOrder }),
          api(`/api/admin/menus/${b.id}`, "PUT", { order: aOrder }),
        ]);
      } catch { setError("ক্রম আপডেট করতে সমস্যা হয়েছে"); }
    });
  }

  function startEdit(item: MenuItem) {
    setEditId(item.id);
    setEditState({ label: item.label, href: item.href, openNewTab: item.openNewTab });
  }

  async function saveEdit(id: string) {
    if (!editState.label.trim() || !editState.href.trim()) { setError("লেবেল ও URL আবশ্যক"); return; }
    try {
      const updated = await api(`/api/admin/menus/${id}`, "PUT", editState);
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...updated } : i));
      setEditId(null);
      setError("");
    } catch { setError("সংরক্ষণ করতে সমস্যা হয়েছে"); }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Menu items list */}
      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden">
        <div className="border-b border-[var(--ad-border)] px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--ad-text-primary)]">
            মেনু আইটেমসমূহ ({items.length}টি)
          </h2>
          <span className="text-xs text-[var(--ad-text-muted)]">ওপরে/নিচে বোতাম দিয়ে ক্রম পরিবর্তন করুন</span>
        </div>

        {items.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--ad-text-muted)]">
            এখনো কোনো মেনু আইটেম নেই। নিচের ফর্ম থেকে যোগ করুন।
          </div>
        ) : (
          <div className="divide-y divide-[var(--ad-border)]">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                {/* Drag handle indicator */}
                <GripVertical className="h-4 w-4 shrink-0 text-[var(--ad-text-muted)] cursor-grab" />

                {/* Order buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded p-0.5 text-[var(--ad-text-muted)] hover:bg-[var(--ad-bg)] disabled:opacity-30 transition-colors"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    className="rounded p-0.5 text-[var(--ad-text-muted)] hover:bg-[var(--ad-bg)] disabled:opacity-30 transition-colors"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Edit form / display */}
                {editId === item.id ? (
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <input
                      value={editState.label}
                      onChange={(e) => setEditState((s) => ({ ...s, label: e.target.value }))}
                      placeholder="লেবেল"
                      className="h-8 flex-1 min-w-[120px] rounded border border-[var(--ad-border)] bg-[var(--ad-bg)] px-2.5 text-sm text-[var(--ad-text-primary)] focus:border-[var(--ad-green)] outline-none"
                    />
                    <input
                      value={editState.href}
                      onChange={(e) => setEditState((s) => ({ ...s, href: e.target.value }))}
                      placeholder="URL (যেমন /category/politics)"
                      className="h-8 flex-1 min-w-[180px] rounded border border-[var(--ad-border)] bg-[var(--ad-bg)] px-2.5 text-sm text-[var(--ad-text-primary)] focus:border-[var(--ad-green)] outline-none"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-[var(--ad-text-secondary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editState.openNewTab}
                        onChange={(e) => setEditState((s) => ({ ...s, openNewTab: e.target.checked }))}
                        className="rounded"
                      />
                      নতুন ট্যাব
                    </label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="flex items-center gap-1 rounded bg-[var(--ad-green)] px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                      >
                        <Check className="h-3.5 w-3.5" /> সংরক্ষণ
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="flex items-center gap-1 rounded border border-[var(--ad-border)] px-2.5 py-1.5 text-xs text-[var(--ad-text-secondary)] hover:bg-[var(--ad-bg)] transition-colors"
                      >
                        <X className="h-3.5 w-3.5" /> বাতিল
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center gap-3 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-medium ${item.isActive ? "text-[var(--ad-text-primary)]" : "text-[var(--ad-text-muted)] line-through"}`}>
                        {item.label}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[var(--ad-text-muted)] mt-0.5">
                        <span className="truncate">{item.href}</span>
                        {item.openNewTab && <ExternalLink className="h-3 w-3 shrink-0" />}
                      </div>
                    </div>

                    {/* Active toggle */}
                    <button
                      onClick={() => toggleActive(item)}
                      className="shrink-0 transition-colors"
                      title={item.isActive ? "সক্রিয় — নিষ্ক্রিয় করতে ক্লিক করুন" : "নিষ্ক্রিয় — সক্রিয় করতে ক্লিক করুন"}
                    >
                      {item.isActive ? (
                        <ToggleRight className="h-6 w-6 text-[var(--ad-green)]" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-[var(--ad-text-muted)]" />
                      )}
                    </button>

                    {/* Actions */}
                    <button
                      onClick={() => startEdit(item)}
                      className="shrink-0 rounded p-1.5 text-[var(--ad-text-muted)] hover:bg-[var(--ad-bg)] hover:text-[var(--ad-text-primary)] transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="shrink-0 rounded p-1.5 text-[var(--ad-text-muted)] hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new item form */}
      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] p-5">
        <h2 className="mb-4 text-sm font-semibold text-[var(--ad-text-primary)]">নতুন মেনু আইটেম যোগ করুন</h2>
        <div className="flex flex-wrap gap-3">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="লেবেল (যেমন: রাজনীতি)"
            className="h-9 flex-1 min-w-[140px] rounded-lg border border-[var(--ad-border)] bg-[var(--ad-bg)] px-3 text-sm text-[var(--ad-text-primary)] placeholder:text-[var(--ad-text-muted)] focus:border-[var(--ad-green)] outline-none transition-colors"
          />
          <input
            value={newHref}
            onChange={(e) => setNewHref(e.target.value)}
            placeholder="URL (যেমন: /category/politics)"
            className="h-9 flex-[2] min-w-[200px] rounded-lg border border-[var(--ad-border)] bg-[var(--ad-bg)] px-3 text-sm text-[var(--ad-text-primary)] placeholder:text-[var(--ad-text-muted)] focus:border-[var(--ad-green)] outline-none transition-colors"
          />
          <label className="flex items-center gap-2 text-sm text-[var(--ad-text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={newTab}
              onChange={(e) => setNewTab(e.target.checked)}
              className="rounded"
            />
            নতুন ট্যাবে খুলবে
          </label>
          <button
            onClick={addItem}
            className="flex items-center gap-2 rounded-lg bg-[var(--ad-green)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            যোগ করুন
          </button>
        </div>
        <p className="mt-2.5 text-xs text-[var(--ad-text-muted)]">
          URL উদাহরণ: <code className="rounded bg-[var(--ad-bg)] px-1">/</code> (হোম), <code className="rounded bg-[var(--ad-bg)] px-1">/category/politics</code>, <code className="rounded bg-[var(--ad-bg)] px-1">/news</code>
        </p>
      </div>
    </div>
  );
}
