import { Layers3, Plus, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/get-session";
import { listTemplates } from "@/lib/templates";
import TemplateCardActions from "@/components/template-card-actions";
import { TemplatePreview } from "@/components/template-preview";
import { relativeDayInline } from "@/lib/utils/format";

const categories = ["All", "Participation", "Achievement", "Workshop", "Appreciation", "Custom"];

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { q, category } = await searchParams;
  const activeCategory = category || "All";
  const filtered = !!q || activeCategory !== "All";

  const templates = await listTemplates(session.user.id, {
    q,
    category: activeCategory !== "All" ? activeCategory : undefined,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Saved designs you can reuse for the next event or cohort.
          </p>
        </div>

        <Link
          href="/dashboard/certificates"
          className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 hover:bg-violet-500 transition active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New template
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-1 px-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <Link
                key={cat}
                href={`?${new URLSearchParams({ ...(q && { q }), ...(cat !== "All" && { category: cat }) })}`}
                aria-current={isActive ? "true" : undefined}
                className={`h-9 px-3.5 inline-flex items-center rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-violet-500/10 text-violet-600 dark:text-violet-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        <form className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          {activeCategory !== "All" && <input type="hidden" name="category" value={activeCategory} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search templates"
            aria-label="Search templates"
            className="w-full h-10 rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {templates.map((template) => (
          <article
            key={template.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5"
          >
            <Link
              href={`/dashboard/certificates?id=${template.id}`}
              className="relative block aspect-[1.414/1] overflow-hidden bg-muted"
              aria-label={`Open ${template.name} in the editor`}
            >
              <TemplatePreview
                src={template.previewUrl}
                name={template.name}
                className="transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute top-3 left-3 rounded-md bg-black/60 backdrop-blur px-2 py-1 text-[11px] font-medium text-white">
                {template.category}
              </span>
              <span className="absolute inset-0 flex items-center justify-center bg-slate-950/50 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
                <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  Open in editor
                </span>
              </span>
            </Link>

            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-foreground" title={template.name}>
                  {template.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Edited {relativeDayInline(template.updatedAt)}
                </p>
              </div>
              <TemplateCardActions templateId={template.id} templateName={template.name} />
            </div>
          </article>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-4">
              <Layers3 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {filtered ? "No templates match" : "No templates yet"}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
              {filtered
                ? "Try a different search or category."
                : "Design a certificate in the editor and save it — it will appear here for reuse."}
            </p>
            {filtered ? (
              <Link href="/dashboard/templates" className="mt-5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline">
                Clear filters
              </Link>
            ) : (
              <Link
                href="/dashboard/certificates"
                className="mt-5 h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white hover:bg-violet-500 transition"
              >
                <Plus className="h-4 w-4" />
                Create a template
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
