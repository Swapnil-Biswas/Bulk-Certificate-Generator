"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { MailCheck, UserCheck } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Divider, Field, GoogleButton, Notice, SubmitButton } from "@/components/auth/fields";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | { emailSent: boolean }>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "We couldn't create your account. Please try again.");
        return;
      }
      setDone({ emailSent: data.emailSent !== false });
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    const steps = done.emailSent
      ? [
          { icon: MailCheck, title: "Confirm your email", body: `Open the link we sent to ${email}. It expires in 24 hours.` },
          { icon: UserCheck, title: "Wait for approval", body: "An administrator reviews new accounts. You can log in as soon as yours is approved." },
        ]
      : [
          { icon: UserCheck, title: "Wait for approval", body: "We couldn't send your confirmation email, so an administrator will confirm and approve your account manually." },
        ];
    return (
      <AuthShell
        title="Your account is created"
        subtitle={done.emailSent ? "Two quick steps before you can start." : "One step left before you can start."}
        footer={
          <Link href="/login" className="font-medium text-white hover:underline">
            Go to log in
          </Link>
        }
      >
        <ol className="space-y-5">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[var(--mk-accent-soft)]">
                <step.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-white">
                  {i + 1}. {step.title}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-[var(--mk-muted)]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Design once, generate for everyone on your list."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-white hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Notice tone="error">{error}</Notice>}

        <GoogleButton label="Sign up with Google" onClick={() => signIn("google", { callbackUrl: "/dashboard" })} />
        <Divider />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
          <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Field
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="At least 8 characters."
          />
          <SubmitButton loading={loading}>Create account</SubmitButton>
        </form>

        <p className="text-center text-xs leading-relaxed text-white/40">
          New accounts are reviewed by an administrator before first sign-in. By continuing you agree to the{" "}
          <Link href="/legal/terms" className="underline underline-offset-2 hover:text-white/70">Terms</Link> and{" "}
          <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-white/70">Privacy Policy</Link>.
        </p>
      </div>
    </AuthShell>
  );
}
