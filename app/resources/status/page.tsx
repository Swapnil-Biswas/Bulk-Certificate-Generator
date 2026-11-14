import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { QuantumLayout } from "@/components/quantum-layout";
import { Lead } from "@/components/landing/page-bits";

export const metadata: Metadata = { title: "Status", description: "Live status of the CertGen service." };
export const dynamic = "force-dynamic";

async function checkDatabase(): Promise<{ ok: boolean; ms: number }> {
  const started = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, ms: Math.round(performance.now() - started) };
  } catch {
    return { ok: false, ms: Math.round(performance.now() - started) };
  }
}

export default async function StatusPage() {
  const db = await checkDatabase();
  const checkedAt = new Date();

  const checks = [
    { name: "Website", detail: "This page loaded, so the application is serving requests.", ok: true },
    {
      name: "Database",
      detail: db.ok ? `Responding in ${db.ms} ms.` : "Not responding. Sign-in, saving and verification are affected.",
      ok: db.ok,
    },
    {
      name: "Certificate verification",
      detail: db.ok ? "Verification pages can look up certificates." : "Unavailable while the database is down.",
      ok: db.ok,
    },
  ];
  const allOk = checks.every((c) => c.ok);

  return (
    <QuantumLayout title={allOk ? "All systems operational." : "We're having problems."} subtitle="Status">
      <Lead>
        A live check, run when you opened this page at{" "}
        <time dateTime={checkedAt.toISOString()}>
          {checkedAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC
        </time>
        .
      </Lead>

      <ul className="mt-12 max-w-3xl divide-y divide-white/[0.08] overflow-hidden rounded-3xl border border-white/[0.08] bg-[var(--mk-surface)]">
        {checks.map((check) => (
          <li key={check.name} className="flex items-center justify-between gap-6 px-6 py-5">
            <div>
              <p className="text-base font-medium text-white">{check.name}</p>
              <p className="mt-0.5 text-sm text-[var(--mk-muted)]">{check.detail}</p>
            </div>
            <span className={`inline-flex shrink-0 items-center gap-1.5 text-sm font-medium ${check.ok ? "text-emerald-300" : "text-rose-300"}`}>
              {check.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {check.ok ? "Operational" : "Down"}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-[var(--mk-dim)]">
        This page reflects the moment it was loaded; refresh to check again. Something not working that isn&apos;t shown here?{" "}
        <Link href="/contact" className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">Let us know</Link>.
      </p>
    </QuantumLayout>
  );
}
