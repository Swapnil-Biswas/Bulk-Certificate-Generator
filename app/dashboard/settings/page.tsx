"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Monitor, Sun, Moon, Check, Loader2, LogOut } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const themes = [
  { id: "light", name: "Light", icon: Sun },
  { id: "dark", name: "Dark", icon: Moon },
  { id: "system", name: "System", icon: Monitor },
] as const;

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [reset, setReset] = useState<"idle" | "sending" | "sent" | "error">("idle");

  if (status === "loading") {
    return (
      <div className="h-[50vh] flex items-center justify-center" role="status" aria-label="Loading settings">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) return null;

  const sendReset = async () => {
    if (!session.user.email) return;
    setReset("sending");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });
      setReset(res.ok ? "sent" : "error");
    } catch {
      setReset("error");
    }
  };

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Your account and how CertGen looks.</p>
      </div>

      <section className="rounded-2xl border border-border bg-card divide-y divide-border">
        <header className="px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Account</h2>
        </header>
        <dl className="px-6 py-2">
          {[
            { label: "Name", value: session.user.name || "—" },
            { label: "Email", value: session.user.email || "—" },
            { label: "Role", value: session.user.role === "ADMIN" ? "Administrator" : "Member" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-6 py-3">
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className="text-sm font-medium text-foreground truncate">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-border bg-card divide-y divide-border">
        <header className="px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Appearance</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Applies to the dashboard and editor on this device.</p>
        </header>
        <div className="p-6 grid grid-cols-3 gap-3" role="radiogroup" aria-label="Theme">
          {themes.map((t) => {
            const Icon = t.icon;
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(t.id)}
                className={`relative flex flex-col items-center gap-2.5 rounded-xl border p-4 text-sm font-medium transition-colors ${
                  active
                    ? "border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-300"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {active && <Check className="absolute right-2.5 top-2.5 h-3.5 w-3.5" />}
                <Icon className="h-5 w-5" />
                {t.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card divide-y divide-border">
        <header className="px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Security</h2>
        </header>
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Password</h3>
            <p className="text-sm text-muted-foreground mt-0.5" aria-live="polite">
              {reset === "sent"
                ? `Check ${session.user.email} for a reset link.`
                : reset === "error"
                  ? "Could not send the email. Try again in a moment."
                  : "We will email you a link to choose a new password."}
            </p>
          </div>
          <button
            onClick={sendReset}
            disabled={reset === "sending" || reset === "sent"}
            className="h-10 shrink-0 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted transition disabled:opacity-60"
          >
            {reset === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
            {reset === "sent" ? "Email sent" : "Send reset link"}
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Sign out</h3>
            <p className="text-sm text-muted-foreground mt-0.5">End your session on this device.</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="h-10 shrink-0 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </section>
    </div>
  );
}
