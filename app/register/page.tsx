"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Logo } from "@/components/logo";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful! Please check your email for verification.");
        router.push("/login");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#02040a] p-6 selection:bg-violet-500/30">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e293b_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="w-full max-w-[480px] relative z-10">
        {/* Decorative Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />

        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/50 backdrop-blur-2xl shadow-2xl p-8 md:p-12 space-y-10 group">
          {/* Subtle Shine Effect */}
          <div className="absolute -top-[100%] left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent transition-all duration-1000 group-hover:top-0 pointer-events-none" />

          <div className="space-y-4 text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white/5 border border-white/10 mb-2 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Logo iconClassName="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none">Create Account</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Join the CertGen design network</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-violet-500 transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-2xl border border-white/5 bg-white/[0.03] py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:bg-white/[0.05] transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-violet-500 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@nexus.com"
                  className="w-full rounded-2xl border border-white/5 bg-white/[0.03] py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:bg-white/[0.05] transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-violet-500 transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-white/5 bg-white/[0.03] py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:bg-white/[0.05] transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group/btn overflow-hidden rounded-2xl bg-white py-4 px-4 text-black font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 opacity-0 group-hover/btn:opacity-10 transition-opacity" />
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-[#0a0c14] px-4 text-slate-500 font-black">Direct Identity Sync</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                import("next-auth/react").then(({ signIn }) => {
                  signIn("google");
                });
              }}
              className="w-full relative group/google overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 py-4 px-4 text-white font-black text-[11px] uppercase tracking-[0.2em] transition hover:bg-white/[0.05] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google Auth Engine
            </button>
          </form>

          <div className="pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Already have an account? <Link href="/login" className="text-white hover:text-violet-400 font-black ml-1 transition-colors underline underline-offset-4 decoration-white/20">Sign In</Link>
            </p>
          </div>

          {/* Bottom Status Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 flex">
            <div className="flex-1 bg-violet-600/50 animate-pulse" />
            <div className="flex-1 bg-blue-600/50 animate-pulse [animation-delay:200ms]" />
            <div className="flex-1 bg-emerald-600/50 animate-pulse [animation-delay:400ms]" />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Data Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-violet-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Quantum Secured</span>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-8 text-center space-y-2 pointer-events-none opacity-30">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">CertGen Studio © 2026</p>
      </footer>
    </div>
  );
}
