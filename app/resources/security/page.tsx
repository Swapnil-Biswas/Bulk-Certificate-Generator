import type { Metadata } from "next";
import Link from "next/link";
import { Fingerprint, KeyRound, MonitorSmartphone, ShieldCheck, UserCheck, Lock } from "lucide-react";

import { QuantumLayout } from "@/components/quantum-layout";
import { CardGrid, Lead, Prose, SectionHeading } from "@/components/landing/page-bits";

export const metadata: Metadata = {
  title: "Security",
  description: "How CertGen protects accounts and keeps certificates verifiable.",
};

export default function SecurityPage() {
  return (
    <QuantumLayout title="Security, described plainly." subtitle="Resources">
      <Lead>What CertGen does to protect your account and to make certificates hard to fake — and what it doesn&apos;t claim.</Lead>

      <SectionHeading eyebrow="Certificates">Tamper-evident records</SectionHeading>
      <CardGrid
        items={[
          { icon: <Fingerprint className="h-5 w-5" />, title: "SHA-256 fingerprints", body: "Each certificate's ID and details are hashed when the batch is exported. Any later change to the record produces a different hash." },
          { icon: <ShieldCheck className="h-5 w-5" />, title: "Merkle proofs", body: "A batch's fingerprints are combined into a Merkle root. The verification page checks that a certificate really belongs to its batch." },
          { icon: <MonitorSmartphone className="h-5 w-5" />, title: "Files stay with you", body: "Certificate images and PDFs are generated in your browser. We store verification records, not the finished files." },
        ]}
      />

      <SectionHeading eyebrow="Accounts">Access control</SectionHeading>
      <CardGrid
        items={[
          { icon: <KeyRound className="h-5 w-5" />, title: "Hashed passwords", body: "Passwords are hashed with bcrypt and never stored or logged in readable form. You can also sign in with Google." },
          { icon: <UserCheck className="h-5 w-5" />, title: "Reviewed sign-ups", body: "Email addresses are confirmed and every new account is approved by an administrator before it can issue certificates." },
          { icon: <Lock className="h-5 w-5" />, title: "Encrypted connections", body: "The site is served over HTTPS. Password reset and confirmation links are single-use and expire." },
        ]}
      />

      <SectionHeading eyebrow="Being straightforward">What we don&apos;t claim</SectionHeading>
      <Prose>
        <p>
          CertGen is an independent project. It has not been audited by a third party and holds no formal security certifications such as SOC 2 or ISO 27001. If your organisation requires those, CertGen may not be the right fit.
        </p>
        <p>
          A verification page confirms that a certificate matches what was issued through CertGen. It does not vouch for the issuer&apos;s identity or for the truth of what the certificate says.
        </p>
        <h3>Reporting a problem</h3>
        <p>
          Found a vulnerability or something that looks wrong? Please <Link href="/contact">tell us</Link>, with enough detail to reproduce it. We appreciate responsible reports.
        </p>
      </Prose>
    </QuantumLayout>
  );
}
