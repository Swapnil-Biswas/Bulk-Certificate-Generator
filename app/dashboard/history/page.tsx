import { getSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { History, Download, ExternalLink, Search, FileText, Calendar } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { q, status } = await searchParams;

  const batches = await prisma.certificateBatch.findMany({
    where: {
      userId: session.user.id,
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { templateName: { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(status && status !== "All" && {
        status: status,
      }),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Generation Registry</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Audit and retrieve your historically generated certificate batches.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-xl">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Batches Logged</span>
          <div className="h-4 w-px bg-border mx-1" />
          <span className="text-sm font-bold text-foreground leading-none">{batches.length}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between p-2 rounded-2xl bg-muted border border-border">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto p-1 no-scrollbar">
          {["All", "Completed", "Processing", "Failed"].map((s) => {
            const isActive = (status || "All") === s;
            return (
              <Link
                key={s}
                href={`?${new URLSearchParams({
                  ...(q && { q }),
                  status: s,
                })}`}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-card text-violet-600 shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
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
              placeholder="Filter batch registry..."
              className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition shadow-sm"
            />
          </form>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Entity / Batch</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Protocol</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Unit Count</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Deployment</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right px-8">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 transition-transform group-hover:scale-110">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-foreground block leading-none">{batch.name}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tighter opacity-60">Source: {batch.templateName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-[10px] font-black text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                      {batch.format}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-bold text-foreground">
                      {batch.count}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                       <span className="text-xs font-bold text-muted-foreground tabular-nums">
                         {new Date(batch.createdAt).toLocaleDateString()}
                       </span>
                       <div className="flex items-center gap-1.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${
                            batch.status === "Completed" ? "bg-emerald-500" : 
                            batch.status === "Processing" ? "bg-blue-500 animate-pulse" : "bg-rose-500"
                          }`} />
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                            batch.status === "Completed" ? "text-emerald-500" : 
                            batch.status === "Processing" ? "text-blue-500" : "text-rose-500"
                          }`}>
                            {batch.status}
                          </span>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right px-8">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border" title="Download Export">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border" title="Audit Details">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {batches.length === 0 && (
            <div className="py-32 text-center bg-muted/10">
              <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6 text-muted-foreground/20 shadow-inner">
                <History className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground tracking-tight">Registry empty</h3>
              <p className="mt-2 text-xs text-muted-foreground font-medium max-w-xs mx-auto leading-relaxed">
                {q || status !== "All"
                  ? "No historical data matched the requested filter parameters."
                  : "Generation history is empty. Initialize a new batch to start logging registry entries."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
