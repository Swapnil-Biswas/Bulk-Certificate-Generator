import type { Metadata } from "next";
import Link from "next/link";

import { QuantumLayout } from "@/components/quantum-layout";
import { Prose } from "@/components/landing/page-bits";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <QuantumLayout title="Terms of Use" subtitle="Legal">
      <Prose>
        <p className="text-sm text-[var(--mk-dim)]">Last updated: 14 November 2026</p>
        <p>These terms apply when you use CertGen. By creating an account or using the service, you agree to them.</p>

        <h2>Your account</h2>
        <ul>
          <li>Provide accurate details and keep your password to yourself. You are responsible for what happens under your account.</li>
          <li>New accounts are reviewed and may be declined. We may suspend or remove accounts that break these terms.</li>
        </ul>

        <h2>Acceptable use</h2>
        <p>Use CertGen to issue certificates you are genuinely entitled to issue. You must not:</p>
        <ul>
          <li>create certificates that impersonate another organisation, or that misrepresent qualifications, awards or identity;</li>
          <li>upload content you don&apos;t have the right to use, or that is unlawful;</li>
          <li>include other people&apos;s personal details without a proper reason to do so;</li>
          <li>attempt to disrupt the service, access other users&apos; data, or get around verification.</li>
        </ul>

        <h2>Your content</h2>
        <p>
          You keep all rights to your designs and data. You give us permission to store and process them only as needed to provide the service — for example saving your templates and showing verification pages.
        </p>

        <h2>Verification</h2>
        <p>
          A verification page confirms that a certificate matches the record created when it was issued through CertGen. It does not confirm who the issuer is or whether the certificate&apos;s statements are true. The issuer is responsible for the content of the certificates they create.
        </p>

        <h2>Availability</h2>
        <p>
          CertGen is provided “as is”, without guarantees of uptime or fitness for a particular purpose. We may change or discontinue features. Keep your own copies of exported certificates and recipient lists.
        </p>

        <h2>Liability</h2>
        <p>
          To the extent the law allows, we are not liable for indirect or consequential losses arising from use of the service, including loss of data or reliance on a certificate.
        </p>

        <h2>Changes to these terms</h2>
        <p>We may update these terms. The date above shows the latest version; continuing to use CertGen after a change means you accept it.</p>

        <h2>Contact</h2>
        <p>Questions about these terms? Use the <Link href="/contact">contact form</Link>.</p>
      </Prose>
    </QuantumLayout>
  );
}
