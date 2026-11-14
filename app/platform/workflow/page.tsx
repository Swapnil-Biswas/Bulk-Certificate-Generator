import type { Metadata } from "next";
import Link from "next/link";

import { QuantumLayout } from "@/components/quantum-layout";
import { CodeBlock, Lead, PageCta, SectionHeading } from "@/components/landing/page-bits";

export const metadata: Metadata = {
  title: "Workflow",
  description: "From a certificate design and a list of names to a ZIP of finished, verifiable certificates.",
};

const steps = [
  {
    title: "Upload your design",
    body: "Use any PNG or JPG up to 12 MB. Leave the space for the name empty — you'll add it as a field. The export keeps the image's original resolution.",
  },
  {
    title: "Place your fields",
    body: "Add a text field for each detail that changes per person. Type a placeholder such as {{name}} as its content, then choose the font, colour and alignment.",
  },
  {
    title: "Import your recipients",
    body: "Upload a CSV with a header row, a text file with one name per line, or simply paste names. Step through the list to preview each certificate before exporting.",
  },
  {
    title: "Export",
    body: "Download everything as PDF or PNG in one ZIP, each file named after its recipient. If your design has a QR code, every certificate gets its own verification page.",
  },
  {
    title: "Save it for next time",
    body: "Save the design as a template. For the next event, open it, import the new list and export again.",
  },
];

export default function WorkflowPage() {
  return (
    <QuantumLayout title="One design in. A certificate for everyone out." subtitle="Workflow">
      <Lead>Five steps, most of which you only do once per design.</Lead>

      <ol className="mt-14 max-w-3xl">
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-6 pb-10 last:pb-0">
            {i < steps.length - 1 && <span aria-hidden className="absolute left-[19px] top-11 bottom-1 w-px bg-white/10" />}
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[var(--mk-bg)] font-mono text-sm text-white">
              {i + 1}
            </span>
            <div className="pt-1.5">
              <h2 className="text-xl font-semibold tracking-tight text-white">{step.title}</h2>
              <p className="mt-2 text-[16px] leading-relaxed text-[var(--mk-muted)]">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <SectionHeading eyebrow="Recipient lists">What your file should look like</SectionHeading>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CodeBlock label="participants.csv">{`name,course,date
Aarav Sharma,Product Design,14 March 2026
Sofia Martinez,Data Analysis,14 March 2026
Mei Tanaka,Product Design,14 March 2026`}</CodeBlock>
        <CodeBlock label="names.txt">{`Aarav Sharma
Sofia Martinez
Mei Tanaka`}</CodeBlock>
      </div>
      <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-[var(--mk-muted)]">
        Each column header becomes a placeholder, so the CSV above gives you <code className="font-mono text-violet-200">{"{{name}}"}</code>,{" "}
        <code className="font-mono text-violet-200">{"{{course}}"}</code> and <code className="font-mono text-violet-200">{"{{date}}"}</code>. Matching ignores capital letters. A batch can hold up to 5,000 recipients. More detail is in the{" "}
        <Link href="/resources/documentation" className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">documentation</Link>.
      </p>

      <PageCta />
    </QuantumLayout>
  );
}
