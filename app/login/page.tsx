"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { Divider, Field, GoogleButton, Notice, SubmitButton } from "@/components/auth/fields";

type Message = { tone: "error" | "success" | "info"; text: string; code?: string };

function messageFor(code: string | null | undefined, isNew = false): Message | null {
  switch (code) {
    case null:
    case undefined:
    case "":
      return null;
    case "PendingApproval":
      return {
        tone: "info",
        code,
        text: isNew
          ? "Your account has been created. An administrator needs to approve it before you can sign in — try again a little later."
          : "Your account is waiting for an administrator to approve it. You'll be able to sign in once that's done.",
      };
    case "EmailNotVerified":
      return { tone: "error", code, text: "Please confirm your email address first. We sent you a link when you signed up." };
    case "AccessDenied":
      return { tone: "error", code, text: "This account doesn't have access. Contact us if you think that's a mistake." };
    case "CredentialsSignin":
      return { tone: "error", code, text: "That email and password don't match. Check them and try again." };
    case "OAuthAccountNotLinked":
      return { tone: "error", code, text: "This email is already registered with a password. Sign in with your password instead." };
    default:
      return { tone: "error", code, text: "We couldn't sign you in. Please try again." };
  }
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<Message | null>(() =>
    messageFor(searchParams.get("error"), searchParams.get("new") === "1")
  );

  const registered = searchParams.get("registered");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await signIn("credentials", { email, password, redirect: false });

    if (!result?.ok) {
      setMessage(messageFor(result?.error || "CredentialsSignin"));
      setLoading(false);
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl");
    if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") && !callbackUrl.startsWith("/login")) {
      window.location.href = callbackUrl;
      return;
    }

    const session = await fetch("/api/auth/session").then((r) => r.json()).catch(() => null);
    window.location.href = session?.user?.role === "ADMIN" ? "/admin" : "/dashboard";
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(
        res.ok
          ? { tone: "success", text: `If ${email} has an account, a reset link is on its way. It expires in 1 hour.` }
          : { tone: "error", text: data.error || "We couldn't send the reset email. Please try again." }
      );
    } catch {
      setMessage({ tone: "error", text: "Couldn't reach the server. Check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    if (!email) {
      setMessage({ tone: "error", code: "EmailNotVerified", text: "Enter your email address above, then choose “Send a new link”." });
      return;
    }
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(
        res.ok
          ? { tone: "success", text: `A new confirmation link has been sent to ${email}.` }
          : { tone: "error", code: "EmailNotVerified", text: data.error || "We couldn't send the email. Please try again." }
      );
    } finally {
      setResending(false);
    }
  }

  const switchMode = (next: "login" | "forgot") => {
    setMode(next);
    setMessage(null);
  };

  if (mode === "forgot") {
    return (
      <AuthShell
        title="Reset your password"
        subtitle="Enter the email you signed up with and we'll send you a link to choose a new password."
        footer={
          <button onClick={() => switchMode("login")} className="font-medium text-white hover:underline">
            Back to log in
          </button>
        }
      >
        <form onSubmit={handleForgot} className="space-y-4">
          {message && <Notice tone={message.tone}>{message.text}</Notice>}
          <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <SubmitButton loading={loading}>Send reset link</SubmitButton>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Log in to CertGen"
      subtitle="Welcome back. Pick up where you left off."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="font-medium text-white hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        {registered && !message && (
          <Notice tone="success">
            {registered === "pending"
              ? "Account created. We couldn't send the confirmation email, so an administrator will confirm your account manually."
              : "Account created. Check your inbox for a confirmation link, then log in here."}
          </Notice>
        )}
        {message && (
          <Notice tone={message.tone}>
            {message.text}
            {message.code === "EmailNotVerified" && (
              <button
                type="button"
                onClick={resendVerification}
                disabled={resending}
                className="mt-1 block font-semibold underline underline-offset-2 disabled:opacity-60"
              >
                {resending ? "Sending…" : "Send a new link"}
              </button>
            )}
          </Notice>
        )}

        <GoogleButton label="Continue with Google" onClick={() => signIn("google", { callbackUrl: "/dashboard" })} />
        <Divider />

        <form onSubmit={handleLogin} className="space-y-4">
          <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            action={
              <button type="button" onClick={() => switchMode("forgot")} className="text-sm text-[var(--mk-accent-soft)] hover:underline">
                Forgot password?
              </button>
            }
          />
          <SubmitButton loading={loading}>Log in</SubmitButton>
        </form>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mk min-h-screen" />}>
      <LoginForm />
    </Suspense>
  );
}
