"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { Field, Notice, SubmitButton } from "@/components/auth/fields";

function ResetForm() {
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const backToLogin = (
    <Link href="/login" className="font-medium text-white hover:underline">
      Back to log in
    </Link>
  );

  if (!token) {
    return (
      <AuthShell title="This link isn't complete" subtitle="The reset link is missing its code. Open the link from your email again, or request a new one from the login page." footer={backToLogin}>
        <Link href="/login" className="flex h-11 w-full items-center justify-center rounded-xl bg-white text-[15px] font-semibold text-[#0b0b12] transition hover:bg-violet-100">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password updated" subtitle="You can now log in with your new password.">
        <Link href="/login" className="flex h-11 w-full items-center justify-center rounded-xl bg-white text-[15px] font-semibold text-[#0b0b12] transition hover:bg-violet-100">
          Log in
        </Link>
      </AuthShell>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Choose a password with at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setDone(true);
      else setError(data.error || "We couldn't update your password. Please try again.");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Pick something you don't use anywhere else." footer={backToLogin}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Notice tone="error">{error}</Notice>}
        <Field label="New password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} hint="At least 8 characters." />
        <Field label="Confirm new password" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <SubmitButton loading={loading}>Update password</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="mk min-h-screen" />}>
      <ResetForm />
    </Suspense>
  );
}
