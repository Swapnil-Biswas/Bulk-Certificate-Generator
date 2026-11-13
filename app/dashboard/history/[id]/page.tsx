import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, ShieldCheck, Link2, Info } from "lucide-react";

import { getSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { CopyButton } from "@/components/copy-button";
import { plural, shortDate } from "@/lib/utils/format";

const SHOWN = 500;

function recipientOf(metadata: unknown): string {
  if (metadata && typeof metadata === "object") {
    const m = metadata as Record<string, unknown>;
    for (const key of ["name", "Name", "names", "Names", "Full Name", "fullname"]) {
      if (typeof m[key] === "string" && m[key]) return m[key] as string;
    }
    const first = Object.values(m).find((v) => typeof v === "string" && v);
    if (typeof first === "string") return first;
  }
  return "—";
}

export default async function BatchPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const batch = await prisma.certificateBatch.findFirst({
    where: { id, userId: session.user.id },
    include: {
      certificates: { orderBy: { createdAt: "asc" }, take: SHOWN, select: { id: true, metadata: true, status: true } },
      _count: { select: { certificates: true } },
    },
  });
  if (!batch) notFound();

  const facts = [
    { label: "Template", value: batch.templateName },
    { label: "Format", value: batch.format },
    { label: "Certificates", value: batch.count.toLocaleString("en-US") },
    { label: "Created", value: shortDate(batch.createdAt) },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Link href="/dashboard/history" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        All batches
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">{batch.name}</h1>
        <p className="text-sm text-muted-foreground mt-1.5">{batch.status}</p>
      </div>

      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {facts.map((f) => (
          <div key={f.label} className="rounded-2xl border border-border bg-card p-4">
            <dt className="text-xs text-muted-foreground">{f.label}</dt>
            <dd className="mt-1 text-sm font-semibold text-foreground truncate" title={f.value}>{f.value}</dd>
          </div>
        ))}
      </dl>

      {batch.merkleRoot && (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-violet-500" />
            <h2 className="text-sm font-semibold text-foreground">Batch fingerprint</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            A single hash (Merkle root) computed from every certificate in this batch. If any certificate is altered, it no longer matches.
          </p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted px-3 py-2 font-mono text-xs text-foreground">
              {batch.merkleRoot}
            </code>
            <CopyButton value={batch.merkleRoot} label="Copy fingerprint" />
          </div>
          {batch.transactionHash ? (
            <a
              href={`https://amoy.polygonscan.com/tx/${batch.transactionHash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
            >
              Anchored on Polygon — view transaction <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Not anchored on-chain. Certificates are still checked against this fingerprint.
            </p>
          )}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Certificates
          {batch._count.certificates > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">{batch._count.certificates.toLocaleString("en-US")}</span>
          )}
        </h2>

        {batch.certificates.length > 0 ? (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <ul className="divide-y divide-border">
              {batch.certificates.map((cert) => (
                <li key={cert.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{recipientOf(cert.metadata)}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground mt-0.5">{cert.id}</p>
                  </div>
                  {cert.status !== "VALID" && (
                    <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-500">{cert.status}</span>
                  )}
                  <CopyButton value={`/verify/${cert.id}`} absolute label="Copy verification link" icon={<Link2 className="h-4 w-4" />} />
                  <Link
                    href={`/verify/${cert.id}`}
                    target="_blank"
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Verify <ExternalLink className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
            {batch._count.certificates > SHOWN && (
              <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
                Showing the first {SHOWN} of {plural(batch._count.certificates, "certificate")}.
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              This export has no individual verification records. Bulk exports made from a CSV or name list create one verifiable record per recipient.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
