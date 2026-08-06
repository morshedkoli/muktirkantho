"use client";

import React, { createContext, useCallback, useContext, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const THEME_STORAGE_KEY = "theme";
const THEME_EVENT = "muktirkantho:themechange";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * The applied theme lives on `<html data-theme>`, written by the blocking script
 * in `app/layout.tsx` before first paint. That attribute — not React state — is
 * the source of truth, so it is read through `useSyncExternalStore` rather than
 * mirrored into state inside an effect.
 */
function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  const onSystemChange = () => {
    // Only follow the OS while the reader hasn't chosen explicitly.
    if (readStoredTheme()) return;
    applyTheme(media.matches ? "dark" : "light");
    onChange();
  };

  window.addEventListener(THEME_EVENT, onChange);
  media.addEventListener("change", onSystemChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    media.removeEventListener("change", onSystemChange);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

/** Server render has no DOM; the blocking script corrects this before paint. */
function getServerSnapshot(): Theme {
  return "light";
}

function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  // Keeps native UI — scrollbars, form controls, date pickers — in step with
  // the page instead of leaving light widgets on a dark background.
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    // Suppress transitions for one frame so the switch snaps rather than
    // cross-fading every colour on the page at once.
    root.classList.add("disable-transitions");
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode / storage disabled — the theme still applies to this page.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.remove("disable-transitions"));
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(getSnapshot() === "dark" ? "light" : "dark");
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
