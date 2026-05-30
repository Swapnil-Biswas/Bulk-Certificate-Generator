import { getSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { Layers3, Plus, Search, MoreVertical, Filter } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import TemplateCardActions from "@/components/template-card-actions";

const categories = [
  "All",
  "Participation",
  "Achievement",
  "Workshop",
  "Appreciation",
  "Custom",
];

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { q, category } = await searchParams;

  const templates = await prisma.certificateTemplate.findMany({
    where: {
      userId: session.user.id,
      ...(q && {
        name: {
          contains: q,
          mode: "insensitive",
        },
      }),
      ...(category && category !== "All" && {
        category: category,
      }),
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Design Library</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Manage and reuse your custom certificate designs.
          </p>
        </div>

        <Link
          href="/dashboard/certificates"
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 font-bold text-white text-sm shadow-sm transition hover:bg-violet-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Create New Design
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between p-2 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto p-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = (category || "All") === cat;
            return (
              <Link
                key={cat}
                href={`?${new URLSearchParams({
                  ...(q && { q }),
                  category: cat,
                })}`}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-card text-violet-600 shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80 p-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <form>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search library..."
              className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition shadow-sm"
            />
          </form>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-violet-500/30"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
              {/* Template Preview Placeholder */}
              <div className="flex h-full w-full items-center justify-center text-muted-foreground/20">
                <Layers3 className="h-16 w-16 transition-transform duration-500 group-hover:scale-110" />
              </div>

              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 rounded-md bg-card/90 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest text-foreground shadow-sm ring-1 ring-black/5">
                  {template.category}
                </span>
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                <Link
                  href={`/dashboard/certificates?id=${template.id}`}
                  className="rounded-lg bg-white px-5 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 transition transform translate-y-2 group-hover:translate-y-0 duration-300"
                >
                  Edit Template
                </Link>
              </div>
            </div>

            <div className="mt-4 px-1 pb-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground truncate max-w-[180px]">
                    {template.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-tighter">
                    Revised {new Date(template.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <TemplateCardActions templateId={template.id} />
              </div>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 py-32 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-card shadow-sm mb-6">
              <Layers3 className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              Empty design library
            </h3>
            <p className="mt-2 text-xs text-muted-foreground font-medium max-w-xs mx-auto leading-relaxed">
              {q || category !== "All" 
                ? "No templates match your active filters. Try resetting them."
                : "You haven't designed any templates yet. Start by creating your first workspace design."}
            </p>
            {!q && category === "All" && (
              <Link
                href="/dashboard/certificates"
                className="mt-8 px-6 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs hover:scale-105 transition-transform"
              >
                Create Template
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
