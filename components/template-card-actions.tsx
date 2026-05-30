"use client";

import { Trash2, Copy, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TemplateCardActions({ templateId }: { templateId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    const res = await fetch(`/api/templates/${templateId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  const handleDuplicate = async () => {
    const res = await fetch(`/api/templates/${templateId}`);
    if (res.ok) {
      const template = await res.json();
      const duplicateRes = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...template,
          name: `${template.name} (Copy)`,
          id: undefined,
        }),
      });
      if (duplicateRes.ok) router.refresh();
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button 
        onClick={handleDuplicate}
        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Duplicate"
      >
        <Copy className="h-4 w-4" />
      </button>
      <button 
        onClick={handleDelete}
        className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
