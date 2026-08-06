"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * localStorage is an external store, so it is read through
 * `useSyncExternalStore` rather than a mount effect. That keeps the server
 * render and the hydration pass on the fallback value — no mismatch — and
 * swaps in the persisted value immediately after hydration, without the
 * cascading re-render a `setState`-in-effect would cause.
 */

const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  // Catches writes made by other tabs; same-tab writes go through `emit`.
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function emit(): void {
  for (const listener of listeners) listener();
}

/**
 * Read and write a primitive value persisted in localStorage.
 *
 * `parse` must be defined outside the component — a new function identity on
 * every render would re-run the snapshot read on every render.
 */
export function useStoredValue<T extends string | number | boolean>(
  key: string,
  fallback: T,
  parse: (raw: string) => T | null
): [T, (next: T) => void] {
  const getSnapshot = useCallback((): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return parse(raw) ?? fallback;
    } catch {
      return fallback;
    }
  }, [key, fallback, parse]);

  const getServerSnapshot = useCallback((): T => fallback, [fallback]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T) => {
      try {
        localStorage.setItem(key, String(next));
      } catch {}
      emit();
    },
    [key]
  );

  return [value, setValue];
}
