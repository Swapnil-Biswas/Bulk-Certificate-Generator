"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/** Accepts a certificate ID or a full verification link and opens its public verification page. */
export function VerifyLookup({ variant = "dashboard" }: { variant?: "dashboard" | "marketing" }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = value.trim();
    const id = raw.includes("/verify/") ? raw.split("/verify/")[1].split(/[?#/]/)[0] : raw;
    if (!id) {
      setError("Enter a certificate ID or paste a verification link.");
      return;
    }
    setError("");
    router.push(`/verify/${encodeURIComponent(id)}`);
  };

  const marketing = variant === "marketing";

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${
              marketing ? "text-white/40" : "text-muted-foreground"
            }`}
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="cert_1a2b3c4d_… or a verification link"
            aria-label="Certificate ID or verification link"
            aria-invalid={!!error}
            spellCheck={false}
            autoComplete="off"
            className={
              marketing
                ? "w-full h-12 rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 font-mono text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400/60 focus:bg-white/[0.06] transition"
                : "w-full h-11 rounded-xl border border-border bg-card pl-10 pr-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition"
            }
          />
        </div>
        <button
          type="submit"
          className={
            marketing
              ? "h-12 px-6 rounded-xl bg-white text-sm font-semibold text-slate-950 hover:bg-violet-100 transition active:scale-[0.98]"
              : "h-11 px-5 rounded-xl bg-violet-600 text-sm font-semibold text-white hover:bg-violet-500 transition active:scale-[0.98]"
          }
        >
          Verify
        </button>
      </div>
      {error && (
        <p role="alert" className={`mt-2 text-sm ${marketing ? "text-rose-300" : "text-rose-500"}`}>
          {error}
        </p>
      )}
    </form>
  );
}
