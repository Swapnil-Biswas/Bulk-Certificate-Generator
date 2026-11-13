"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copies `value` to the clipboard; `absolute` prefixes the current origin for path-only values. */
export function CopyButton({
  value,
  label = "Copy",
  absolute = false,
  icon,
}: {
  value: string;
  label?: string;
  absolute?: boolean;
  icon?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(absolute ? window.location.origin + value : value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Copied" : label}
      aria-label={copied ? "Copied" : label}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : icon ?? <Copy className="h-4 w-4" />}
    </button>
  );
}
