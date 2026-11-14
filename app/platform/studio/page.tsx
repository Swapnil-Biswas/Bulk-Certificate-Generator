import type { Metadata } from "next";
import Image from "next/image";
import { AlignCenter, Maximize, MousePointer2, QrCode, ScanText, Type } from "lucide-react";

import { QuantumLayout } from "@/components/quantum-layout";
import { CardGrid, Lead, PageCta, SectionHeading } from "@/components/landing/page-bits";

export const metadata: Metadata = {
  title: "Studio editor",
  description: "Place names, text and a verification QR code on your own certificate design, right in the browser.",
};

export default function StudioPage() {
  return (
    <QuantumLayout title="A canvas for your certificate, not a form to fill in." subtitle="Studio editor">
      <Lead>
        Upload your finished design as an image, then drag the name and any other details exactly where they belong. What you see on the canvas is what gets exported.
      </Lead>

      <div className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]">
        <Image
          src="/landing/editor-dark.png"
          alt="The CertGen editor with a certificate on the canvas and the text controls open."
          width={2880}
          height={1800}
          sizes="(min-width: 1280px) 1232px, 100vw"
          className="block h-auto w-full"
        />
      </div>

      <SectionHeading eyebrow="What you can do">Everything you need to lay out a certificate</SectionHeading>
      <CardGrid
        items={[
          { icon: <MousePointer2 className="h-5 w-5" />, title: "Drag, resize, nudge", body: "Move fields with the mouse or the arrow keys. Side handles change the width; corner handles scale the text." },
          { icon: <Type className="h-5 w-5" />, title: "26 fonts built in", body: "Scripts, serifs and sans-serifs, loaded in the editor and rendered the same way in every export." },
          { icon: <ScanText className="h-5 w-5" />, title: "Text that always fits", body: "Turn on “Shrink long text to fit” and long names get smaller on one line instead of overflowing the design." },
          { icon: <AlignCenter className="h-5 w-5" />, title: "Alignment and centring", body: "Align text left, centre or right inside its box, and snap a field to the centre of the page while dragging." },
          { icon: <QrCode className="h-5 w-5" />, title: "Verification QR code", body: "Place one QR code on the design. On export each certificate gets its own code and public verification page." },
          { icon: <Maximize className="h-5 w-5" />, title: "Fits your screen", body: "The canvas scales to your window automatically. Zoom in for detail with the toolbar or Ctrl/⌘ + scroll." },
        ]}
      />

      <SectionHeading eyebrow="Keyboard">Shortcuts</SectionHeading>
      <dl className="grid max-w-3xl grid-cols-1 gap-x-10 gap-y-3 text-[15px] sm:grid-cols-2">
        {[
          ["Arrow keys", "Move the selected field by 1 px"],
          ["Shift + arrow keys", "Move by 10 px"],
          ["Delete", "Remove the selected field"],
          ["Ctrl/⌘ + D", "Duplicate the selected text field"],
          ["Ctrl/⌘ + S", "Save the template"],
          ["Ctrl/⌘ + 0", "Fit the certificate to the screen"],
        ].map(([keys, action]) => (
          <div key={keys} className="flex items-center justify-between gap-4 border-b border-white/[0.07] py-2.5">
            <dt className="font-mono text-[13px] text-white">{keys}</dt>
            <dd className="text-right text-[var(--mk-muted)]">{action}</dd>
          </div>
        ))}
      </dl>

      <PageCta />
    </QuantumLayout>
  );
}
