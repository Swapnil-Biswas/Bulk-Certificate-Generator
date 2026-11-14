"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { QuantumLayout } from "@/components/quantum-layout";
import { Field, Notice, SubmitButton } from "@/components/auth/fields";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setSent(true);
      else setError(typeof data.error === "string" ? data.error : "Your message couldn't be sent. Please try again.");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <QuantumLayout title="Get in touch." subtitle="Contact">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="space-y-6 text-lg leading-relaxed text-[var(--mk-muted)]">
          <p>Questions about CertGen, trouble with your account, or a certificate that needs correcting — send a message and we&apos;ll reply by email.</p>
          <ul className="space-y-3 text-base">
            <li><span className="font-medium text-white">Waiting for approval?</span> Mention the email address you signed up with.</li>
            <li><span className="font-medium text-white">Problem with a certificate?</span> Include its ID or verification link.</li>
            <li><span className="font-medium text-white">Found a bug?</span> Tell us what you did and what happened.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-white/[0.09] bg-[#0d0d14]/80 p-7 sm:p-9">
          {sent ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-xl font-semibold text-white">Message sent</h2>
              <p className="mt-2 text-[var(--mk-muted)]">Thanks, {form.name.split(" ")[0] || "there"}. We&apos;ll reply to {form.email}.</p>
              <button
                onClick={() => {
                  setSent(false);
                  setForm((prev) => ({ ...prev, subject: "", message: "" }));
                }}
                className="mt-6 text-sm font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <Notice tone="error">{error}</Notice>}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Your name" autoComplete="name" required maxLength={120} value={form.name} onChange={set("name")} />
                <Field label="Email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" />
              </div>
              <Field label="Subject" maxLength={200} value={form.subject} onChange={set("subject")} placeholder="What is this about?" />
              <div>
                <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-white/85">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={6}
                  maxLength={5000}
                  value={form.message}
                  onChange={set("message")}
                  className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-[15px] text-white placeholder:text-white/30 transition focus:border-violet-400/70 focus:bg-white/[0.06] focus:outline-none focus:ring-4 focus:ring-violet-500/15"
                />
              </div>
              <SubmitButton loading={loading}>Send message</SubmitButton>
            </form>
          )}
        </div>
      </div>
    </QuantumLayout>
  );
}
