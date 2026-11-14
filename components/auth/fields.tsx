"use client";

import { useId, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

export function Field({
  label,
  type = "text",
  hint,
  action,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  hint?: string;
  /** Small link shown opposite the label, e.g. "Forgot password?". */
  action?: React.ReactNode;
}) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-white/85">
          {label}
        </label>
        {action}
      </div>
      <div className="relative">
        <input
          id={id}
          type={isPassword && reveal ? "text" : type}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={`h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-[15px] text-white placeholder:text-white/30 transition focus:border-violet-400/70 focus:bg-white/[0.06] focus:outline-none focus:ring-4 focus:ring-violet-500/15 ${
            isPassword ? "pr-11" : ""
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Hide password" : "Show password"}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/40 transition-colors hover:text-white"
          >
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-white/40">
          {hint}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-[15px] font-semibold text-[#0b0b12] transition hover:bg-violet-100 active:scale-[0.99] disabled:opacity-60"
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Notice({
  tone,
  children,
}: {
  tone: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    error: "border-rose-400/25 bg-rose-400/10 text-rose-200",
    success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    info: "border-violet-400/25 bg-violet-400/10 text-violet-100",
  }[tone];
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-relaxed ${styles}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function GoogleButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-[15px] font-medium text-white transition hover:bg-white/[0.08] active:scale-[0.99]"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
        <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84Z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
      </svg>
      {label}
    </button>
  );
}

export function Divider() {
  return (
    <div className="flex items-center gap-3 text-xs text-white/35" role="separator">
      <span className="h-px flex-1 bg-white/10" />
      or
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
