"use client";

import { useCallback, useSyncExternalStore } from "react";

const EVENT = "certgen:storage";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/**
 * A localStorage-backed value that renders `fallback` on the server and during hydration,
 * then switches to the saved value — without a hydration mismatch. Stays in sync across tabs.
 */
export function useStoredValue(key: string, fallback: string): [string, (value: string) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key) ?? fallback;
      } catch {
        return fallback;
      }
    },
    () => fallback
  );

  const set = useCallback(
    (next: string) => {
      try {
        localStorage.setItem(key, next);
      } catch {}
      window.dispatchEvent(new Event(EVENT));
    },
    [key]
  );

  return [value, set];
}

function subscribeToScheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Whether the operating system is set to a dark colour scheme. */
export function usePrefersDark(): boolean {
  return useSyncExternalStore(
    subscribeToScheme,
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false
  );
}
