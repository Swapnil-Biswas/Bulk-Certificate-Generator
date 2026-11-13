import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, ShieldQuestion, ExternalLink, Check, X, Minus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { hashData, createMerkleTree } from "@/lib/utils/crypto";
import { verifyRootOnChain } from "@/lib/blockchain/polygon";
import { Logo } from "@/components/logo";
import { VerifyLookup } from "@/components/verify-lookup";
import { shortDate } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Verify a certificate",
  robots: { index: false },
};

function recipientOf(metadata: unknown): string | null {
  if (metadata && typeof metadata === "object") {
    const m = metadata as Record<string, unknown>;
    for (const key of ["name", "Name", "names", "Names", "Full Name", "fullname"]) {
      if (typeof m[key] === "string" && m[key]) return m[key] as string;
    }
    const first = Object.values(m).find((v) => typeof v === "string" && v);
    if (typeof first === "string") return first;
  }
  return null;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07070b] text-slate-300 font-sans selection:bg-violet-500/30">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(124,92,255,0.14),transparent)]"
      />
      <header className="relative mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo iconClassName="h-8 w-8" />
          <span className="text-base font-semibold tracking-tight text-white">CertGen</span>
        </Link>
        <span className="text-xs text-slate-500">Certificate verification</span>
      </header>
      <main className="relative mx-auto max-w-3xl px-6 pb-20">{children}</main>
    </div>
  );
}

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cert = await prisma.certificate.findUnique({ where: { id }, include: { batch: true } });

  if (!cert) {
    return (
      <Shell>
        <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
          <ShieldQuestion className="h-10 w-10 text-amber-400" />
          <h1 className="mt-5 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            No certificate with this ID
          </h1>
          <p className="mt-3 max-w-xl text-slate-400 leading-relaxed">
            We have no record of <code className="font-mono text-slate-200 break-all">{id}</code>. Check the ID for typos, or scan the QR code on the certificate again. If it still isn&apos;t found, the certificate was not issued through CertGen.
          </p>
          <div className="mt-8 max-w-xl">
            <VerifyLookup variant="marketing" />
          </div>
        </section>
      </Shell>
    );
  }

  // 1. The stored details still produce the fingerprint recorded at issue time.
  const hashValid = hashData(cert.id + JSON.stringify(cert.metadata)) === cert.hash;

  // 2. That fingerprint belongs to the batch's Merkle root.
  let inBatch: boolean | null = null;
  if (cert.batch.merkleRoot && Array.isArray(cert.merkleProof)) {
    try {
      inBatch = createMerkleTree([]).verify(cert.merkleProof as string[], cert.hash, cert.batch.merkleRoot);
    } catch {
      inBatch = false;
    }
  }

  // 3. The batch root is anchored on Polygon (only when the issuer anchored it).
  let anchored: boolean | null = null;
  if (cert.batch.merkleRoot && cert.batch.transactionHash) {
    anchored = (await verifyRootOnChain(cert.batch.merkleRoot)).anchored;
  }

  const revoked = cert.status !== "VALID";
  const intact = hashValid && inBatch !== false;
  const state: "verified" | "revoked" | "failed" = revoked ? "revoked" : intact ? "verified" : "failed";

  const tone = {
    verified: { ring: "border-emerald-400/25", glow: "bg-emerald-400/10", text: "text-emerald-300", Icon: ShieldCheck },
    revoked: { ring: "border-amber-400/25", glow: "bg-amber-400/10", text: "text-amber-300", Icon: ShieldAlert },
    failed: { ring: "border-rose-400/25", glow: "bg-rose-400/10", text: "text-rose-300", Icon: ShieldAlert },
  }[state];

  const headline = {
    verified: "This certificate is authentic",
    revoked: "This certificate has been revoked",
    failed: "This certificate could not be verified",
  }[state];

  const summary = {
    verified: anchored
      ? "Its details match the issuer's record exactly, and that record is anchored on the Polygon blockchain."
      : "Its details match the record created when it was issued and have not been changed since.",
    revoked: "It was issued through CertGen, but the issuer has since marked it as no longer valid.",
    failed: "The details on record no longer match the fingerprint created at issue. Treat this certificate with caution.",
  }[state];

  const checks: { label: string; detail: string; result: boolean | null }[] = [
    {
      label: "Details unchanged",
      detail: "The recipient details still match the SHA-256 fingerprint taken at issue.",
      result: hashValid,
    },
    {
      label: "Part of the issued batch",
      detail: "The fingerprint is included in the batch's Merkle root.",
      result: inBatch,
    },
    {
      label: "Anchored on Polygon",
      detail:
        anchored === null
          ? "The issuer did not anchor this batch on-chain. The checks above still apply."
          : "The batch's Merkle root is recorded on the Polygon blockchain.",
      result: anchored,
    },
  ];

  const recipient = recipientOf(cert.metadata);
  const extra = Object.entries((cert.metadata ?? {}) as Record<string, unknown>).filter(
    ([, v]) => typeof v === "string" && v && v !== recipient
  ) as [string, string][];

  return (
    <Shell>
      <section className={`relative mt-6 overflow-hidden rounded-3xl border ${tone.ring} bg-white/[0.03] p-8 sm:p-10`}>
        <div aria-hidden className={`absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl ${tone.glow}`} />
        <div className="relative">
          <span className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${tone.glow} ${tone.text}`}>
            <tone.Icon className="h-7 w-7" />
          </span>
          <h1 className="mt-6 text-2xl sm:text-4xl font-semibold tracking-tight text-white">{headline}</h1>
          <p className="mt-3 max-w-xl text-slate-400 leading-relaxed">{summary}</p>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
        <h2 className="text-sm font-medium text-slate-500">Issued to</h2>
        <p className="mt-2 font-serif text-4xl sm:text-5xl text-white leading-tight break-words">{recipient ?? "—"}</p>

        <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 border-t border-white/10 pt-8">
          <div>
            <dt className="text-sm text-slate-500">Certificate</dt>
            <dd className="mt-1 text-base font-medium text-white">{cert.batch.templateName}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Issued on</dt>
            <dd className="mt-1 text-base font-medium text-white">{shortDate(cert.createdAt)}</dd>
          </div>
          {extra.slice(0, 6).map(([key, value]) => (
            <div key={key}>
              <dt className="text-sm text-slate-500 capitalize">{key}</dt>
              <dd className="mt-1 text-base font-medium text-white break-words">{value}</dd>
            </div>
          ))}
          <div className="sm:col-span-2">
            <dt className="text-sm text-slate-500">Certificate ID</dt>
            <dd className="mt-1 font-mono text-sm text-slate-200 break-all">{cert.id}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
        <h2 className="text-lg font-semibold text-white">What was checked</h2>
        <ul className="mt-6 space-y-5">
          {checks.map((check) => (
            <li key={check.label} className="flex gap-4">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  check.result === true
                    ? "bg-emerald-400/15 text-emerald-300"
                    : check.result === false
                      ? "bg-rose-400/15 text-rose-300"
                      : "bg-white/10 text-slate-400"
                }`}
              >
                {check.result === true ? (
                  <Check className="h-3.5 w-3.5" />
                ) : check.result === false ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  <Minus className="h-3.5 w-3.5" />
                )}
              </span>
              <div>
                <p className="text-sm font-medium text-white">
                  {check.label}
                  <span className="sr-only">
                    : {check.result === true ? "passed" : check.result === false ? "failed" : "not applicable"}
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-slate-400 leading-relaxed">{check.detail}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-sm text-slate-500">Fingerprint (SHA-256)</p>
          <p className="mt-2 rounded-xl border border-white/10 bg-black/40 p-3.5 font-mono text-xs text-slate-300 break-all leading-relaxed">
            {cert.hash}
          </p>
          {anchored && cert.batch.transactionHash && (
            <a
              href={`https://amoy.polygonscan.com/tx/${cert.batch.transactionHash}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-300 hover:text-violet-200"
            >
              View the Polygon transaction <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </section>

      <p className="mt-8 text-center text-sm text-slate-500">
        Issued with{" "}
        <Link href="/" className="text-slate-300 hover:text-white underline underline-offset-4">
          CertGen
        </Link>
        . Anyone can verify a certificate — no account needed.
      </p>
    </Shell>
  );
}
