"use client";

import { useState } from "react";
import { Trash2, Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TemplateCardActions({
  templateId,
  templateName,
}: {
  templateId: string;
  templateName?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<"delete" | "duplicate" | null>(null);

  const handleDelete = async () => {
    setBusy("delete");
    const res = await fetch(`/api/templates/${templateId}`, { method: "DELETE" });
    setBusy(null);
    setConfirming(false);
    if (res.ok) router.refresh();
  };

  const handleDuplicate = async () => {
    setBusy("duplicate");
    try {
      const res = await fetch(`/api/templates/${templateId}/duplicate`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 shrink-0" role="group" aria-label={`Delete ${templateName ?? "template"}?`}>
        <button
          onClick={() => setConfirming(false)}
          className="h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={busy === "delete"}
          className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg bg-rose-500 text-xs font-semibold text-white hover:bg-rose-600 transition-colors disabled:opacity-60"
        >
          {busy === "delete" && <Loader2 className="h-3 w-3 animate-spin" />}
          Delete
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <button
        onClick={handleDuplicate}
        disabled={busy !== null}
        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        title="Duplicate"
        aria-label={`Duplicate ${templateName ?? "template"}`}
      >
        {busy === "duplicate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
      </button>
      <button
        onClick={() => setConfirming(true)}
        className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
        title="Delete"
        aria-label={`Delete ${templateName ?? "template"}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
