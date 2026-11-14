import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck, MailX } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Confirm your email", robots: { index: false } };
export const dynamic = "force-dynamic";

async function confirm(token?: string): Promise<{ ok: boolean; title: string; message: string }> {
  if (!token) {
    return { ok: false, title: "This link isn't complete", message: "The confirmation link is missing its code. Open the link from your email again." };
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) {
    return {
      ok: false,
      title: "This link has already been used",
      message: "If you've confirmed your email before, you're all set — just log in. Otherwise, request a new link from the login page.",
    };
  }
  if (record.expires < new Date()) {
    return { ok: false, title: "This link has expired", message: "Confirmation links last 24 hours. Log in with your email and password to request a new one." };
  }

  const user = await prisma.user.findUnique({ where: { email: record.identifier }, select: { id: true, approvalStatus: true, role: true } });
  if (!user) {
    await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
    return { ok: false, title: "Account not found", message: "The account this link belongs to no longer exists." };
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } }),
  ]);

  const approved = user.approvalStatus === "APPROVED" || user.role === "ADMIN";
  return {
    ok: true,
    title: "Email confirmed",
    message: approved
      ? "Your account is ready. Log in to get started."
      : "Thanks! An administrator will review your account next. You'll be able to log in once it's approved.",
  };
}

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const result = await confirm(token);
  const Icon = result.ok ? MailCheck : MailX;

  return (
    <AuthShell title={result.title} subtitle={result.message}>
      <div className="space-y-5">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            result.ok ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"
          }`}
        >
          <Icon className="h-6 w-6" />
        </span>
        <Link href="/login" className="flex h-11 w-full items-center justify-center rounded-xl bg-white text-[15px] font-semibold text-[#0b0b12] transition hover:bg-violet-100">
          Go to log in
        </Link>
      </div>
    </AuthShell>
  );
}
