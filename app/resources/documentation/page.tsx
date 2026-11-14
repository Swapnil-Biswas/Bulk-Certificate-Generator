import type { Metadata } from "next";
import Link from "next/link";

import { QuantumLayout } from "@/components/quantum-layout";
import { CodeBlock, Lead, PageCta, Prose } from "@/components/landing/page-bits";

export const metadata: Metadata = {
  title: "Documentation",
  description: "How to design, bulk-generate and verify certificates with CertGen.",
};

const toc = [
  ["getting-started", "Getting started"],
  ["design", "Preparing your design"],
  ["fields", "Fields and placeholders"],
  ["recipients", "Recipient lists"],
  ["export", "Exporting"],
  ["verification", "Verification"],
  ["templates", "Templates and history"],
  ["troubleshooting", "Troubleshooting"],
];

export default function DocumentationPage() {
  return (
    <QuantumLayout title="Documentation" subtitle="Resources">
      <Lead>Everything you need to go from a certificate design to a verified batch.</Lead>

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3 text-sm font-medium text-white">On this page</p>
          <ul className="space-y-2 border-l border-white/10 text-sm">
            {toc.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="-ml-px block border-l border-transparent pl-4 text-[var(--mk-muted)] transition-colors hover:border-violet-400 hover:text-white">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Prose>
          <h2 id="getting-started" className="!mt-0 scroll-mt-28">Getting started</h2>
          <ol>
            <li><Link href="/register">Create an account</Link> and confirm your email address.</li>
            <li>Wait for an administrator to approve the account. New accounts are reviewed before first sign-in.</li>
            <li>Log in and choose <strong>New certificate</strong> to open the editor.</li>
          </ol>

          <h2 id="design" className="scroll-mt-28">Preparing your design</h2>
          <p>
            CertGen works on top of your own artwork. Export the certificate from your design tool as a <strong>PNG or JPG</strong> (up to 12 MB) with the recipient&apos;s name — and anything else that changes per person — left blank.
          </p>
          <ul>
            <li>Exports keep the image&apos;s original pixel size, so upload at the resolution you want to print. 2000–3500 px wide suits most A4 and Letter certificates.</li>
            <li>Keep signatures, logos and fixed wording in the image itself.</li>
          </ul>

          <h2 id="fields" className="scroll-mt-28">Fields and placeholders</h2>
          <p>
            A <strong>text field</strong> is a box you place on the design. Its content can be fixed text, a placeholder, or a mix such as <code>Awarded to {"{{name}}"}</code>.
          </p>
          <ul>
            <li>A placeholder is a column name in double braces: <code>{"{{name}}"}</code>, <code>{"{{course}}"}</code>.</li>
            <li>Matching ignores capital letters and extra spaces, so <code>{"{{ Name }}"}</code> fills from a <code>name</code> column.</li>
            <li><strong>Shrink long text to fit</strong> keeps the text on one line and reduces its size when it would overflow the box. Turn it off for a fixed size that wraps onto more lines.</li>
            <li>Drag the side handles to change the box width; drag a corner to scale the text.</li>
          </ul>

          <h2 id="recipients" className="scroll-mt-28">Recipient lists</h2>
          <p>Open the <strong>Recipients</strong> tab and import a file, or paste names directly.</p>
        </Prose>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:ml-[268px] lg:grid-cols-2">
        <CodeBlock label="CSV — first row is the header">{`name,course
Aarav Sharma,Product Design
Sofia Martinez,Data Analysis`}</CodeBlock>
        <CodeBlock label="TXT — one name per line">{`Aarav Sharma
Sofia Martinez`}</CodeBlock>
      </div>

      <div className="mt-6 lg:ml-[268px]">
        <Prose>
          <ul>
            <li>One certificate is generated per row, up to 5,000 rows per batch.</li>
            <li>Click any row, or use the arrows under the canvas, to preview that person&apos;s certificate.</li>
            <li>If a placeholder in your design has no matching column, the editor warns you before you export.</li>
          </ul>

          <h2 id="export" className="scroll-mt-28">Exporting</h2>
          <ul>
            <li><strong>Export all</strong> produces one ZIP with a PDF or PNG per recipient, named after them. Duplicate names get a number so nothing is overwritten.</li>
            <li><strong>Download PDF / PNG</strong> exports only the certificate currently on the canvas.</li>
            <li>Files are rendered in your browser. Keep the tab open until the download starts; large batches can take a minute or two.</li>
          </ul>

          <h2 id="verification" className="scroll-mt-28">Verification</h2>
          <p>
            Add a <strong>QR code</strong> field to the design. During export every certificate receives its own code, linking to a public page at <code>/verify/…</code> that confirms the certificate matches the record created when it was issued.
          </p>
          <ul>
            <li>Bulk exports always create verification records, with or without a QR code. Find the links under <strong>History</strong>.</li>
            <li>Anyone can check a certificate — no account is needed. They can also paste its ID on the home page.</li>
          </ul>

          <h2 id="templates" className="scroll-mt-28">Templates and history</h2>
          <ul>
            <li><strong>Save</strong> stores the background and every field as a template you can reopen from <strong>Templates</strong>.</li>
            <li><strong>History</strong> lists every batch with its recipients and verification links.</li>
          </ul>

          <h2 id="troubleshooting" className="scroll-mt-28">Troubleshooting</h2>
          <h3>The name is cut off or too small</h3>
          <p>Widen the text box with its side handles. With “Shrink long text to fit” on, a wider box lets long names stay larger.</p>
          <h3>A placeholder shows as {"{{name}}"} in the export</h3>
          <p>No column in your list matches it. Check the header row of your CSV, or use the placeholder buttons in the editor to insert the exact name.</p>
          <h3>My template opens without its background</h3>
          <p>Templates saved with an early version of the editor did not store the image. Upload the background again and save — your fields stay in place.</p>
          <h3>I didn&apos;t receive the confirmation email</h3>
          <p>Check your spam folder, then use “Send a new link” on the login page. If it still doesn&apos;t arrive, <Link href="/contact">contact us</Link> and an administrator can confirm your account.</p>
        </Prose>
      </div>

      <PageCta />
    </QuantumLayout>
  );
}
