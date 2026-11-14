"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { usePrefersDark, useStoredValue } from "@/lib/hooks/use-stored-value";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark" || value === "system";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useStoredValue("theme", "light");
  const prefersDark = usePrefersDark();

  const theme: Theme = isTheme(stored) ? stored : "light";
  const resolvedTheme: "light" | "dark" = theme === "dark" || (theme === "system" && prefersDark) ? "dark" : "light";

  // Mirror the choice onto <html>. (lib/theme-script.ts does the same before first paint.)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo(() => ({ theme, setTheme: setStored as (theme: Theme) => void, resolvedTheme }), [theme, setStored, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
