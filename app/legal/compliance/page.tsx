import type { Metadata } from "next";
import Link from "next/link";

import { QuantumLayout } from "@/components/quantum-layout";
import { Prose } from "@/components/landing/page-bits";

export const metadata: Metadata = { title: "Compliance" };

export default function CompliancePage() {
  return (
    <QuantumLayout title="Compliance" subtitle="Legal">
      <Prose>
        <p className="text-sm text-[var(--mk-dim)]">Last updated: 14 November 2026</p>

        <h2 className="!mt-0">Certifications</h2>
        <p>
          CertGen is an independent project. It <strong>does not hold formal certifications or attestations</strong> such as SOC 2, ISO/IEC 27001 or HIPAA, and has not been through a third-party audit. If your organisation requires these from its suppliers, please take that into account before using CertGen.
        </p>

        <h2>Data protection</h2>
        <p>We aim to follow the core principles of data-protection laws such as the GDPR:</p>
        <ul>
          <li><strong>Minimal data</strong> — we store what is needed to run accounts and verify certificates, described in the <Link href="/legal/privacy">Privacy Policy</Link>.</li>
          <li><strong>Access and deletion</strong> — you can ask for a copy of your data or have it deleted through the <Link href="/contact">contact form</Link>.</li>
          <li><strong>Your role as an issuer</strong> — when you upload a recipient list, you decide what personal data is processed and why. You are responsible for having a lawful basis and for informing your recipients where required.</li>
        </ul>

        <h2>Security practices</h2>
        <p>
          Passwords are hashed, connections are encrypted with HTTPS, and new accounts are reviewed before they can issue certificates. The <Link href="/resources/security">Security page</Link> describes these measures and their limits.
        </p>

        <h2>Questions</h2>
        <p>
          If you need specific information for a vendor assessment, <Link href="/contact">get in touch</Link> and we will answer what we can.
        </p>
      </Prose>
    </QuantumLayout>
  );
}
