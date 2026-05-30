"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!token) {
      alert("Invalid or missing token");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        const data = await res.json();
        alert(data.error || "Reset failed");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-200">
        <div className="w-full max-w-[440px] space-y-8 p-12 rounded-2xl bg-card border border-border shadow-xl text-center">
          <Logo className="flex justify-center mb-2" iconClassName="h-12 w-12" />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Password Reset</h1>
          <p className="text-sm text-muted-foreground font-medium">Your password has been updated successfully. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-200">
      <div className="w-full max-w-[440px] space-y-8 p-12 rounded-2xl bg-card border border-border shadow-xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-3">
          <Logo className="flex justify-center mb-2" iconClassName="h-12 w-12" />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Set New Password</h1>
          <p className="text-sm text-muted-foreground font-medium">Enter your new secure password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-muted/50 py-3.5 pl-11 pr-4 font-semibold text-foreground focus:bg-card focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-muted/50 py-3.5 pl-11 pr-4 font-semibold text-foreground focus:bg-card focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-4 px-4 text-white font-bold text-sm shadow-lg shadow-violet-500/20 transition hover:bg-violet-700 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Update Password
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
