import { History, Search, ChevronRight, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { getSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { plural, shortDate } from "@/lib/utils/format";

const statuses = ["All", "Completed", "Processing", "Failed"];

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { q, status } = await searchParams;
  const activeStatus = status || "All";
  const filtered = !!q || activeStatus !== "All";

  const batches = await prisma.certificateBatch.findMany({
    where: {
      userId: session.user.id,
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { templateName: { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(activeStatus !== "All" && { status: activeStatus }),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      templateName: true,
      format: true,
      count: true,
      status: true,
      createdAt: true,
      _count: { select: { certificates: true } },
    },
  });

  const total = batches.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">History</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Every batch you have exported. Open one to see its certificates and verification links.
          </p>
        </div>
        <p className="text-sm text-muted-foreground tabular-nums">
          {plural(batches.length, "batch", "batches")} · {plural(total, "certificate")}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-1 px-1">
          {statuses.map((s) => {
            const isActive = activeStatus === s;
            return (
              <Link
                key={s}
                href={`?${new URLSearchParams({ ...(q && { q }), ...(s !== "All" && { status: s }) })}`}
                aria-current={isActive ? "true" : undefined}
                className={`h-9 px-3.5 inline-flex items-center rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-violet-500/10 text-violet-600 dark:text-violet-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {s}
              </Link>
            );
          })}
        </div>

        <form className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          {activeStatus !== "All" && <input type="hidden" name="status" value={activeStatus} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by batch or template"
            aria-label="Search batches"
            className="w-full h-10 rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition"
          />
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {batches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th scope="col" className="px-5 py-3 font-medium">Batch</th>
                  <th scope="col" className="px-5 py-3 font-medium">Format</th>
                  <th scope="col" className="px-5 py-3 font-medium text-right">Certificates</th>
                  <th scope="col" className="px-5 py-3 font-medium">Created</th>
                  <th scope="col" className="px-5 py-3 font-medium">Status</th>
                  <th scope="col" className="px-5 py-3 font-medium"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {batches.map((batch) => (
                  <tr key={batch.id} className="group relative hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/history/${batch.id}`} className="block after:absolute after:inset-0">
                        <span className="block font-semibold text-foreground">{batch.name}</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">{batch.templateName}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {batch.format}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-foreground tabular-nums">
                      {batch.count.toLocaleString("en-US")}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{shortDate(batch.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            batch.status === "Completed"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : batch.status === "Processing"
                                ? "text-sky-600 dark:text-sky-400"
                                : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full bg-current ${batch.status === "Processing" ? "animate-pulse" : ""}`} />
                          {batch.status}
                        </span>
                        {batch._count.certificates > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title="Certificates in this batch have public verification pages">
                            <ShieldCheck className="h-3.5 w-3.5 text-violet-500" />
                            Verifiable
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ChevronRight className="inline h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 px-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <History className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {filtered ? "No batches match" : "No batches yet"}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
              {filtered
                ? "Try a different search or status."
                : "Export certificates from the editor and each batch will be listed here."}
            </p>
            {filtered && (
              <Link href="/dashboard/history" className="mt-5 inline-block text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline">
                Clear filters
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
