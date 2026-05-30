"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-200">
      <div className="w-full max-w-[480px] space-y-8 p-12 rounded-2xl bg-card border border-border shadow-xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-3">
          <Logo className="flex justify-center mb-2" iconClassName="h-12 w-12" />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Create your Studio</h1>
          <p className="text-sm text-muted-foreground font-medium">Join CertGen and start generating professional assets</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="John Doe"
                className="w-full rounded-xl border border-border bg-muted/50 py-3.5 pl-11 pr-4 font-semibold text-foreground focus:bg-card focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full rounded-xl border border-border bg-muted/50 py-3.5 pl-11 pr-4 font-semibold text-foreground focus:bg-card focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-muted/50 py-3.5 pl-11 pr-4 font-semibold text-foreground focus:bg-card focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                Create Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs font-semibold text-muted-foreground">
            Already have an account? <Link href="/login" className="text-violet-600 hover:text-violet-700 font-bold ml-1">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
