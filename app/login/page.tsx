"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Logo } from "@/components/logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isForgotMode) {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          alert("Reset email sent! Please check your inbox.");
          setIsForgotMode(false);
        } else {
          const data = await res.json().catch(() => ({}));
          alert(data.error || "Failed to send reset email.");
        }
      } catch (err) {
        alert("Network error.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result?.ok) {
      alert("Login failed");
      setLoading(false);
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    if (session.user.role === "ADMIN") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-200">
      <div className="w-full max-w-[440px] space-y-8 p-12 rounded-2xl bg-card border border-border shadow-xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-3">
          <Logo className="flex justify-center mb-2" iconClassName="h-12 w-12" />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {isForgotMode ? "Reset Password" : "Sign in to CertGen"}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {isForgotMode 
              ? "Enter your email to receive a recovery link" 
              : "Enter your credentials to access your studio"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              className="w-full rounded-xl border border-border bg-muted/50 py-3.5 px-4 font-semibold text-foreground focus:bg-card focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!isForgotMode && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Password</label>
                <button 
                  type="button" 
                  onClick={() => setIsForgotMode(true)}
                  className="text-[11px] font-bold text-violet-600 hover:text-violet-700"
                >
                  Forgot?
                </button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-muted/50 py-3.5 px-4 font-semibold text-foreground focus:bg-card focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isForgotMode}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-4 px-4 text-white font-bold text-sm shadow-lg shadow-violet-500/20 transition hover:bg-violet-700 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isForgotMode ? "Send Recovery Link" : "Sign In"
            )}
          </button>

          {isForgotMode && (
            <button
              type="button"
              onClick={() => setIsForgotMode(false)}
              className="w-full text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
            >
              Back to Sign In
            </button>
          )}
        </form>

        {!isForgotMode && (
          <div className="text-center pt-2">
            <p className="text-xs font-semibold text-muted-foreground">
              New to CertGen? <Link href="/register" className="text-violet-600 hover:text-violet-700 font-bold ml-1">Create an account</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
