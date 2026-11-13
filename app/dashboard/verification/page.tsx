import Link from "next/link";
import { redirect } from "next/navigation";
import { QrCode, Fingerprint, Link2, ChevronRight, ShieldCheck } from "lucide-react";

import { getSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { VerifyLookup } from "@/components/verify-lookup";
import { plural, relativeDay } from "@/lib/utils/format";

export default async function VerificationPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const batches = await prisma.certificateBatch.findMany({
    where: { userId: session.user.id, certificates: { some: {} } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      name: true,
      createdAt: true,
      transactionHash: true,
      _count: { select: { certificates: true } },
    },
  });

  const explain = [
    {
      icon: QrCode,
      title: "Each certificate gets a QR code",
      body: "Add a verification QR in the editor. On export, every certificate gets its own code and link.",
    },
    {
      icon: Fingerprint,
      title: "The details are fingerprinted",
      body: "Recipient data is hashed with SHA-256 and combined into one fingerprint per batch.",
    },
    {
      icon: Link2,
      title: "Anyone can check it",
      body: "Scanning the code opens a public page that confirms the certificate matches what you issued.",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Verification</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Look up any certificate, or review which of your batches can be verified publicly.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">Check a certificate</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Paste the ID printed under a QR code, or the link it points to.
        </p>
        <div className="max-w-2xl">
          <VerifyLookup />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {explain.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 mb-4">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.body}</p>
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Verifiable batches</h2>
        {batches.length > 0 ? (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <ul className="divide-y divide-border">
              {batches.map((batch) => (
                <li key={batch.id}>
                  <Link
                    href={`/dashboard/history/${batch.id}`}
                    className="group flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0 text-violet-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">{batch.name}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {plural(batch._count.certificates, "verification record")} · {relativeDay(batch.createdAt)}
                      </span>
                    </span>
                    <span className="hidden sm:inline text-xs text-muted-foreground">
                      {batch.transactionHash ? "Anchored on Polygon" : "Fingerprint stored"}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              No verifiable batches yet. Import a recipient list in the editor and export — each certificate gets a verification record automatically.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
