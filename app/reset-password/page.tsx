"use client";

import { useState, Suspense } from "react";
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, Sparkles, KeyRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
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
        alert("Password reset successful! You can now sign in.");
        router.push("/login");
      } else {
        const data = await res.json();
        alert(data.error || "Reset failed");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-black uppercase tracking-widest text-rose-500">Invalid Session</h1>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No recovery token provided</p>
        <Link href="/login" className="inline-block px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl">Return to Login</Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/50 backdrop-blur-2xl shadow-2xl p-8 md:p-12 space-y-10 group">
      {/* Subtle Shine Effect */}
      <div className="absolute -top-[100%] left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent transition-all duration-1000 group-hover:top-0 pointer-events-none" />

      <div className="space-y-4 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white/5 border border-white/10 mb-2 shadow-inner group-hover:scale-110 transition-transform duration-500">
          <Logo iconClassName="h-10 w-10 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none">New Password</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Initialize your account credentials</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
          <div className="relative group/input">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-violet-500 transition-colors">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full rounded-2xl border border-white/5 bg-white/[0.03] py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:bg-white/[0.05] transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm Password</label>
          <div className="relative group/input">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-violet-500 transition-colors">
              <KeyRound className="h-4 w-4" />
            </div>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full rounded-2xl border border-white/5 bg-white/[0.03] py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:bg-white/[0.05] transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full relative group/btn overflow-hidden rounded-2xl bg-white py-4 px-4 text-black font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 opacity-0 group-hover/btn:opacity-10 transition-opacity" />
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Update Password
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Bottom Status Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 flex">
        <div className="flex-1 bg-violet-600/50 animate-pulse" />
        <div className="flex-1 bg-blue-600/50 animate-pulse [animation-delay:200ms]" />
        <div className="flex-1 bg-emerald-600/50 animate-pulse [animation-delay:400ms]" />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#02040a] p-6 selection:bg-violet-500/30">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e293b_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="w-full max-w-[460px] relative z-10">
        {/* Decorative Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />

        <Suspense fallback={
          <div className="w-full max-w-[460px] h-[500px] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white/20 animate-spin" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocol Secured</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-violet-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Quantum Protected</span>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-8 text-center space-y-2 pointer-events-none opacity-30">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">CertGen Studio © 2026</p>
      </footer>
    </div>
  );
}
