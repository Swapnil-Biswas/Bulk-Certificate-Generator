"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { flushSync } from "react-dom";
import { usePrefersDark, useStoredValue } from "@/lib/hooks/use-stored-value";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark" || value === "system";

type Resolved = "light" | "dark";

function applyTheme(resolved: Resolved) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

const REVEAL_MS = 520;
const FADE_MS = 280;

/** Where the last click or tap landed, so the new theme can spread out from the control that was pressed. */
let lastPointer: { x: number; y: number; at: number } | null = null;
/** Identifies the newest switch, so an interrupted one does not clean up after its successor. */
let switchId = 0;

function revealOrigin(): { x: number; y: number } {
  if (lastPointer && performance.now() - lastPointer.at < 1000) return lastPointer;
  // Keyboard activation: spread from the focused control instead.
  const focused = document.activeElement;
  if (focused instanceof HTMLElement && focused !== document.body) {
    const rect = focused.getBoundingClientRect();
    if (rect.width > 0) return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

/**
 * Swap the theme as one coordinated change instead of every element fading on its own clock.
 * Preferred: a view transition where the new theme expands in a circle from the pressed control.
 * Without view transitions: a single short cross-fade. With reduced motion: an instant swap.
 */
function switchTheme(commit: () => void) {
  const root = document.documentElement;
  const id = ++switchId;
  const cleanup = (...classes: string[]) => {
    if (id === switchId) root.classList.remove(...classes);
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.remove("theme-fade");
    root.classList.add("theme-switching");
    commit();
    requestAnimationFrame(() => requestAnimationFrame(() => cleanup("theme-switching")));
    return;
  }

  if (typeof document.startViewTransition !== "function") {
    root.classList.remove("theme-switching");
    root.classList.add("theme-fade");
    commit();
    window.setTimeout(() => cleanup("theme-fade"), FADE_MS + 60);
    return;
  }

  const { x, y } = revealOrigin();
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  // Freeze per-element transitions so both snapshots show a settled theme.
  root.classList.remove("theme-fade");
  root.classList.add("theme-switching");
  const transition = document.startViewTransition(commit);
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: REVEAL_MS, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    })
    .catch(() => {});
  transition.finished.catch(() => {}).then(() => cleanup("theme-switching"));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useStoredValue("theme", "light");
  const prefersDark = usePrefersDark();

  const theme: Theme = isTheme(stored) ? stored : "light";
  const resolvedTheme: Resolved = theme === "dark" || (theme === "system" && prefersDark) ? "dark" : "light";

  // Mirror the choice onto <html>. (lib/theme-script.ts does the same before first paint.)
  // Also covers changes that do not come through setTheme: another tab, or the system scheme.
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const remember = (event: PointerEvent) => {
      lastPointer = { x: event.clientX, y: event.clientY, at: performance.now() };
    };
    window.addEventListener("pointerdown", remember, { capture: true, passive: true });
    return () => window.removeEventListener("pointerdown", remember, { capture: true });
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      const root = document.documentElement;
      const prefersDarkNow = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const nextResolved: Resolved = next === "dark" || (next === "system" && prefersDarkNow) ? "dark" : "light";
      const current: Resolved = root.classList.contains("dark") ? "dark" : "light";

      // e.g. "dark" to "system" on a dark system: nothing visible changes.
      if (nextResolved === current) {
        setStored(next);
        return;
      }

      switchTheme(() => {
        // Render synchronously so icons and theme-dependent inline styles are in the new snapshot.
        flushSync(() => setStored(next));
        applyTheme(nextResolved);
      });
    },
    [setStored]
  );

  const value = useMemo(() => ({ theme, setTheme, resolvedTheme }), [theme, setTheme, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
