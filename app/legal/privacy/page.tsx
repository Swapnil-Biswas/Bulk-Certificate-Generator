import type { Metadata } from "next";
import Link from "next/link";

import { QuantumLayout } from "@/components/quantum-layout";
import { Prose } from "@/components/landing/page-bits";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <QuantumLayout title="Privacy Policy" subtitle="Legal">
      <Prose>
        <p className="text-sm text-[var(--mk-dim)]">Last updated: 14 November 2026</p>
        <p>
          This policy explains what information CertGen collects, why, and what you can do about it. CertGen is an independent project operated by its creator; “we” and “us” refer to that operator.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Account details</strong> — your name, email address and, if you sign up with a password, a hashed version of it. If you use Google sign-in, we receive your name and email from Google.</li>
          <li><strong>Templates</strong> — the certificate images you upload and the fields you place on them.</li>
          <li><strong>Recipient data</strong> — when you export a batch, the rows of your recipient list (for example names and course titles) are stored as verification records so each certificate can be checked later.</li>
          <li><strong>Messages</strong> — what you send through the contact form, including your email address.</li>
          <li><strong>Technical logs</strong> — basic server logs used to keep the service running and to investigate errors.</li>
        </ul>

        <h2>What we don&apos;t collect</h2>
        <p>
          Finished certificate files are generated in your browser and are not uploaded to us. We don&apos;t use advertising trackers and we don&apos;t sell personal information.
        </p>

        <h2>How information is used</h2>
        <ul>
          <li>To run your account and the editor.</li>
          <li>To show public verification pages. <strong>Anyone with a certificate&apos;s link or ID can see the details recorded for that certificate</strong>, such as the recipient&apos;s name. Only include information you are entitled to share.</li>
          <li>To send essential emails: address confirmation and password resets.</li>
          <li>To respond to your messages and keep the service secure.</li>
        </ul>

        <h2>Services we rely on</h2>
        <p>
          We use Resend to deliver email, Google for optional sign-in, and Cloudflare to route traffic to the site. These providers process data on our behalf only as needed to provide those functions.
        </p>

        <h2>If you issue certificates</h2>
        <p>
          You decide whose details go into a batch, and you are responsible for having the right to use them. If a recipient asks you to remove their record, contact us and we will help.
        </p>

        <h2>Keeping and deleting data</h2>
        <p>
          We keep your data while your account exists. Deleting an account removes its templates, batches and verification records. To have your account or a specific record deleted, or to get a copy of your data, <Link href="/contact">contact us</Link>.
        </p>

        <h2>Changes</h2>
        <p>If this policy changes in a meaningful way, we will update the date above and note the change on this page.</p>

        <h2>Contact</h2>
        <p>Questions about privacy? Use the <Link href="/contact">contact form</Link>.</p>
      </Prose>
    </QuantumLayout>
  );
}
