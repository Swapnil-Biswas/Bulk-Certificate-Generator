import type { Metadata } from "next";
import { Database, Fingerprint, Link2, MonitorSmartphone, QrCode, ShieldCheck } from "lucide-react";

import { QuantumLayout } from "@/components/quantum-layout";
import { CardGrid, Lead, PageCta, Prose, SectionHeading } from "@/components/landing/page-bits";

export const metadata: Metadata = {
  title: "How it works under the hood",
  description: "How CertGen renders, stores and verifies certificates.",
};

export default function InfrastructurePage() {
  return (
    <QuantumLayout title="How CertGen works under the hood." subtitle="Infrastructure">
      <Lead>A plain description of what happens to your designs, your recipient lists and the certificates you issue.</Lead>

      <SectionHeading eyebrow="Generation">Certificates are rendered in your browser</SectionHeading>
      <CardGrid
        columns={2}
        items={[
          {
            icon: <MonitorSmartphone className="h-5 w-5" />,
            title: "Rendering happens on your device",
            body: "The editor draws every certificate on a canvas in your browser at the design's full resolution, then packs the files into a ZIP locally. The finished image and PDF files are never uploaded to us.",
          },
          {
            icon: <Database className="h-5 w-5" />,
            title: "What is stored on the server",
            body: "Your account, your saved templates (including the background image), and — for batches — one verification record per certificate containing that row of your recipient list.",
          },
        ]}
      />

      <SectionHeading eyebrow="Verification">How a certificate is checked</SectionHeading>
      <CardGrid
        items={[
          {
            icon: <Fingerprint className="h-5 w-5" />,
            title: "A fingerprint per certificate",
            body: "When a batch is exported, each certificate's ID and details are hashed with SHA-256. That hash is stored alongside the record.",
          },
          {
            icon: <ShieldCheck className="h-5 w-5" />,
            title: "A fingerprint per batch",
            body: "The hashes of a batch are combined into a Merkle tree. Its root is one value that changes if any certificate in the batch changes.",
          },
          {
            icon: <QrCode className="h-5 w-5" />,
            title: "A public page per certificate",
            body: "The QR code links to a page that recomputes the hash, checks it against the batch's Merkle root, and reports the result in plain language.",
          },
        ]}
      />

      <SectionHeading eyebrow="Blockchain">Anchoring on Polygon</SectionHeading>
      <div className="flex max-w-3xl gap-5">
        <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[var(--mk-accent-soft)]">
          <Link2 className="h-5 w-5" />
        </span>
        <Prose>
          <p>
            CertGen includes a smart contract and the code to write each batch&apos;s Merkle root to the Polygon network. Once a root is on-chain, anyone can confirm that a batch existed at a given time without trusting our database.
          </p>
          <p>
            Anchoring is applied per batch when it is enabled for the service. Every verification page states clearly whether its batch is anchored; the fingerprint checks above run either way.
          </p>
        </Prose>
      </div>

      <SectionHeading eyebrow="Stack">Built with</SectionHeading>
      <dl className="grid max-w-3xl grid-cols-1 gap-x-10 text-[15px] sm:grid-cols-2">
        {[
          ["Application", "Next.js and React"],
          ["Editor canvas", "Konva"],
          ["Database", "PostgreSQL with Prisma"],
          ["Sign-in", "Email and password, or Google"],
          ["Email", "Resend"],
          ["Network", "Cloudflare"],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b border-white/[0.07] py-3">
            <dt className="text-[var(--mk-muted)]">{label}</dt>
            <dd className="text-right font-medium text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <PageCta />
    </QuantumLayout>
  );
}
