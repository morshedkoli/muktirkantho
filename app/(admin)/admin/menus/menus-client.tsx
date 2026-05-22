"use client";

import { useState, useTransition } from "react";
import {
  Plus, Trash2, ChevronUp, ChevronDown, ExternalLink,
  ToggleLeft, ToggleRight, Pencil, Check, X, GripVertical, Tag,
} from "lucide-react";

type MenuItem = {
  id: string;
  label: string;
  href: string;
  icon: string | null;
  order: number;
  isActive: boolean;
  openNewTab: boolean;
};

type Category = { id: string; name: string; slug: string };

type AddMode = "manual" | "category";

const BLANK_ADD = { label: "", href: "", icon: "", openNewTab: false };

export function MenusClient({
  initial,
  categories,
}: {
  initial: MenuItem[];
  categories: Category[];
}) {
  const [items, setItems] = useState<MenuItem[]>(initial);
  const [editId, setEditId] = useState<string | null>(null);
  const [editState, setEditState] = useState<{ label: string; href: string; icon: string; openNewTab: boolean }>({ label: "", href: "", icon: "", openNewTab: false });
  const [addMode, setAddMode] = useState<AddMode>("category");
  const [newItem, setNewItem] = useState(BLANK_ADD);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
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

  async function addManual() {
    if (!newItem.label.trim() || !newItem.href.trim()) {
      setError("লেবেল ও URL আবশ্যক");
      return;
    }
    setError("");
    try {
      const item = await api("/api/admin/menus", "POST", {
        label: newItem.label.trim(),
        href: newItem.href.trim(),
        icon: newItem.icon.trim() || null,
        openNewTab: newItem.openNewTab,
      });
      setItems((prev) => [...prev, item]);
      setNewItem(BLANK_ADD);
    } catch { setError("যোগ করতে সমস্যা হয়েছে"); }
  }

  async function addFromCategories() {
    if (selectedCats.size === 0) { setError("কমপক্ষে একটি বিভাগ বেছে নিন"); return; }
    setError("");
    const toAdd = categories.filter((c) => selectedCats.has(c.id));
    const existing = items.map((i) => i.href);
    try {
      const created: MenuItem[] = [];
      for (const cat of toAdd) {
        const href = `/category/${cat.slug}`;
        if (existing.includes(href)) continue;
        const item = await api("/api/admin/menus", "POST", { label: cat.name, href, icon: null, openNewTab: false });
        created.push(item);
      }
      setItems((prev) => [...prev, ...created]);
      setSelectedCats(new Set());
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

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const aOrder = next[index].order;
    const bOrder = next[target].order;
    next[index] = { ...next[index], order: bOrder };
    next[target] = { ...next[target], order: aOrder };
    next.sort((a, b) => a.order - b.order);
    setItems(next);
    startTransition(async () => {
      try {
        await Promise.all([
          api(`/api/admin/menus/${next.find(i => i.order === bOrder)?.id ?? items[index].id}`, "PUT", { order: bOrder }),
          api(`/api/admin/menus/${next.find(i => i.order === aOrder)?.id ?? items[target].id}`, "PUT", { order: aOrder }),
        ]);
      } catch { setError("ক্রম আপডেট করতে সমস্যা হয়েছে"); }
    });
  }

  function startEdit(item: MenuItem) {
    setEditId(item.id);
    setEditState({ label: item.label, href: item.href, icon: item.icon ?? "", openNewTab: item.openNewTab });
  }

  async function saveEdit(id: string) {
    if (!editState.label.trim() || !editState.href.trim()) { setError("লেবেল ও URL আবশ্যক"); return; }
    try {
      const updated = await api(`/api/admin/menus/${id}`, "PUT", {
        ...editState,
        icon: editState.icon.trim() || null,
      });
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...updated } : i));
      setEditId(null);
      setError("");
    } catch { setError("সংরক্ষণ করতে সমস্যা হয়েছে"); }
  }

  const toggleCat = (id: string) =>
    setSelectedCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const alreadyAdded = new Set(items.map((i) => i.href));

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Current menu items ── */}
      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden">
        <div className="border-b border-[var(--ad-border)] px-5 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--ad-text-primary)]">
            মেনু আইটেম ({items.length}টি)
          </h2>
          <span className="text-xs text-[var(--ad-text-muted)]">ক্রম পরিবর্তন করুন</span>
        </div>

        {items.length === 0 ? (
          <div className="py-10 text-center text-sm text-[var(--ad-text-muted)]">
            এখনো কোনো মেনু আইটেম নেই।
          </div>
        ) : (
          <div className="divide-y divide-[var(--ad-border)]">
            {items.map((item, index) => (
              <div key={item.id} className={`flex items-center gap-3 px-4 py-2.5 ${!item.isActive ? "opacity-50" : ""}`}>
                <GripVertical className="h-4 w-4 shrink-0 text-[var(--ad-text-muted)]" />

                {/* Order buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => move(index, -1)} disabled={index === 0}
                    className="rounded p-0.5 text-[var(--ad-text-muted)] hover:bg-[var(--ad-bg)] disabled:opacity-20 transition-colors">
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => move(index, 1)} disabled={index === items.length - 1}
                    className="rounded p-0.5 text-[var(--ad-text-muted)] hover:bg-[var(--ad-bg)] disabled:opacity-20 transition-colors">
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {editId === item.id ? (
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <input value={editState.icon} onChange={(e) => setEditState((s) => ({ ...s, icon: e.target.value }))}
                      placeholder="আইকন (ইমোজি)"
                      className="h-8 w-16 rounded border border-[var(--ad-border)] bg-[var(--ad-bg)] px-2 text-center text-sm focus:border-[var(--ad-green)] outline-none" />
                    <input value={editState.label} onChange={(e) => setEditState((s) => ({ ...s, label: e.target.value }))}
                      placeholder="লেবেল"
                      className="h-8 flex-1 min-w-[100px] rounded border border-[var(--ad-border)] bg-[var(--ad-bg)] px-2.5 text-sm focus:border-[var(--ad-green)] outline-none" />
                    <input value={editState.href} onChange={(e) => setEditState((s) => ({ ...s, href: e.target.value }))}
                      placeholder="URL"
                      className="h-8 flex-[2] min-w-[140px] rounded border border-[var(--ad-border)] bg-[var(--ad-bg)] px-2.5 text-sm focus:border-[var(--ad-green)] outline-none" />
                    <label className="flex items-center gap-1.5 text-xs text-[var(--ad-text-secondary)] cursor-pointer">
                      <input type="checkbox" checked={editState.openNewTab} onChange={(e) => setEditState((s) => ({ ...s, openNewTab: e.target.checked }))} className="rounded" />
                      নতুন ট্যাব
                    </label>
                    <div className="flex gap-1">
                      <button onClick={() => saveEdit(item.id)}
                        className="flex items-center gap-1 rounded bg-[var(--ad-green)] px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90">
                        <Check className="h-3.5 w-3.5" /> সংরক্ষণ
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="flex items-center gap-1 rounded border border-[var(--ad-border)] px-2.5 py-1.5 text-xs text-[var(--ad-text-secondary)] hover:bg-[var(--ad-bg)]">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center gap-3 min-w-0">
                    {item.icon && (
                      <span className="text-base leading-none shrink-0">{item.icon}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[var(--ad-text-primary)] truncate">{item.label}</div>
                      <div className="flex items-center gap-1 text-xs text-[var(--ad-text-muted)] mt-0.5">
                        <span className="truncate">{item.href}</span>
                        {item.openNewTab && <ExternalLink className="h-3 w-3 shrink-0" />}
                      </div>
                    </div>

                    <button onClick={() => toggleActive(item)} className="shrink-0">
                      {item.isActive
                        ? <ToggleRight className="h-5 w-5 text-[var(--ad-green)]" />
                        : <ToggleLeft className="h-5 w-5 text-[var(--ad-text-muted)]" />}
                    </button>
                    <button onClick={() => startEdit(item)}
                      className="shrink-0 rounded p-1.5 text-[var(--ad-text-muted)] hover:bg-[var(--ad-bg)] hover:text-[var(--ad-text-primary)] transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteItem(item.id)}
                      className="shrink-0 rounded p-1.5 text-[var(--ad-text-muted)] hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add new item ── */}
      <div className="rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] overflow-hidden">
        {/* Mode tabs */}
        <div className="flex border-b border-[var(--ad-border)]">
          <button
            onClick={() => setAddMode("category")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
              addMode === "category"
                ? "border-[var(--ad-green)] text-[var(--ad-green)]"
                : "border-transparent text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)]"
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            বিভাগ থেকে যোগ করুন
          </button>
          <button
            onClick={() => setAddMode("manual")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
              addMode === "manual"
                ? "border-[var(--ad-green)] text-[var(--ad-green)]"
                : "border-transparent text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)]"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            ম্যানুয়াল যোগ করুন
          </button>
        </div>

        <div className="p-5">
          {addMode === "category" ? (
            <div className="space-y-4">
              <p className="text-xs text-[var(--ad-text-muted)]">বিভাগ নির্বাচন করুন — স্বয়ংক্রিয়ভাবে লেবেল ও URL তৈরি হবে।</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const href = `/category/${cat.slug}`;
                  const added = alreadyAdded.has(href);
                  const selected = selectedCats.has(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => !added && toggleCat(cat.id)}
                      disabled={added}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                        added
                          ? "border-[var(--ad-border)] bg-[var(--ad-bg)] text-[var(--ad-text-muted)] cursor-not-allowed line-through"
                          : selected
                          ? "border-[var(--ad-green)] bg-[var(--ad-green)] text-white"
                          : "border-[var(--ad-border)] text-[var(--ad-text-secondary)] hover:border-[var(--ad-green)] hover:text-[var(--ad-green)]"
                      }`}
                    >
                      {cat.name}
                      {added && " ✓"}
                    </button>
                  );
                })}
                {categories.length === 0 && (
                  <p className="text-xs text-[var(--ad-text-muted)]">কোনো বিভাগ পাওয়া যায়নি।</p>
                )}
              </div>
              <button
                onClick={addFromCategories}
                disabled={selectedCats.size === 0}
                className="flex items-center gap-2 rounded-lg bg-[var(--ad-green)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                {selectedCats.size > 0 ? `${selectedCats.size}টি বিভাগ যোগ করুন` : "বিভাগ বেছে নিন"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <input
                  value={newItem.icon}
                  onChange={(e) => setNewItem((s) => ({ ...s, icon: e.target.value }))}
                  placeholder="🏠 আইকন"
                  className="h-9 w-20 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-bg)] px-2.5 text-center text-sm placeholder:text-[var(--ad-text-muted)] focus:border-[var(--ad-green)] outline-none"
                />
                <input
                  value={newItem.label}
                  onChange={(e) => setNewItem((s) => ({ ...s, label: e.target.value }))}
                  placeholder="লেবেল (যেমন: হোম)"
                  className="h-9 flex-1 min-w-[130px] rounded-lg border border-[var(--ad-border)] bg-[var(--ad-bg)] px-3 text-sm placeholder:text-[var(--ad-text-muted)] focus:border-[var(--ad-green)] outline-none"
                />
                <input
                  value={newItem.href}
                  onChange={(e) => setNewItem((s) => ({ ...s, href: e.target.value }))}
                  placeholder="URL (যেমন: /news)"
                  className="h-9 flex-[2] min-w-[160px] rounded-lg border border-[var(--ad-border)] bg-[var(--ad-bg)] px-3 text-sm placeholder:text-[var(--ad-text-muted)] focus:border-[var(--ad-green)] outline-none"
                />
                <label className="flex items-center gap-2 text-sm text-[var(--ad-text-secondary)] cursor-pointer">
                  <input type="checkbox" checked={newItem.openNewTab} onChange={(e) => setNewItem((s) => ({ ...s, openNewTab: e.target.checked }))} className="rounded" />
                  নতুন ট্যাব
                </label>
                <button
                  onClick={addManual}
                  className="flex items-center gap-2 rounded-lg bg-[var(--ad-green)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-4 w-4" /> যোগ করুন
                </button>
              </div>
              <p className="text-xs text-[var(--ad-text-muted)]">
                আইকন ঘরে যেকোনো ইমোজি দিন (যেমন 🏠 📰 🌍)। URL যেমন: <code className="rounded bg-[var(--ad-bg)] px-1">/</code>, <code className="rounded bg-[var(--ad-bg)] px-1">/news</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
