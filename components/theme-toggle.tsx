"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Switch theme"
      title="Switch theme"
      className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
