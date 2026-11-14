import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Layers3,
  FileText,
  FolderOpen,
  ShieldCheck,
  Plus,
  ArrowRight,
  ArrowUpRight,
  Upload,
  Table2,
  Download,
  Check,
} from "lucide-react";

import { getSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { listTemplates } from "@/lib/templates";
import { TemplatePreview } from "@/components/template-preview";
import { plural, relativeDay, relativeDayInline } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const userId = session.user.id;
  const monthAgo = daysAgo(30);

  const [user, templateCount, batchCount, totals, lastMonth, recentBatches, recentTemplates] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      prisma.certificateTemplate.count({ where: { userId } }),
      prisma.certificateBatch.count({ where: { userId } }),
      prisma.certificateBatch.aggregate({ where: { userId }, _sum: { count: true } }),
      prisma.certificateBatch.aggregate({
        where: { userId, createdAt: { gte: monthAgo } },
        _sum: { count: true },
      }),
      prisma.certificateBatch.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          count: true,
          format: true,
          status: true,
          templateName: true,
          createdAt: true,
          _count: { select: { certificates: true } },
        },
      }),
      listTemplates(userId, { take: 3 }),
    ]);

  if (!user) redirect("/login");

  const totalGenerated = totals._sum.count ?? 0;
  const generatedThisMonth = lastMonth._sum.count ?? 0;
  const verifiable = await prisma.certificate.count({ where: { batch: { userId } } });
  const firstName = user.name?.trim().split(/\s+/)[0] || "there";
  const isNew = templateCount === 0 && batchCount === 0;

  const stats = [
    {
      label: "Certificates generated",
      value: totalGenerated.toLocaleString("en-US"),
      note: generatedThisMonth > 0 ? `${generatedThisMonth.toLocaleString("en-US")} in the last 30 days` : "None in the last 30 days",
      icon: FileText,
      href: "/dashboard/history",
    },
    {
      label: "Batches",
      value: batchCount.toLocaleString("en-US"),
      note: "Bulk and single exports",
      icon: FolderOpen,
      href: "/dashboard/history",
    },
    {
      label: "Saved templates",
      value: templateCount.toLocaleString("en-US"),
      note: "Reusable designs",
      icon: Layers3,
      href: "/dashboard/templates",
    },
    {
      label: "Verifiable certificates",
      value: verifiable.toLocaleString("en-US"),
      note: "With a public verification page",
      icon: ShieldCheck,
      href: "/dashboard/verification",
    },
  ];

  const steps = [
    {
      icon: Upload,
      title: "Upload your design",
      body: "Start with any certificate image — PNG or JPG — and place a name field on it.",
      done: templateCount > 0,
    },
    {
      icon: Table2,
      title: "Add your recipients",
      body: "Import a CSV or a plain list of names. Each row becomes one certificate.",
      done: batchCount > 0,
    },
    {
      icon: Download,
      title: "Export everything",
      body: "Download a ZIP of PNGs or PDFs, each with its own verification QR code.",
      done: verifiable > 0,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            {isNew ? `Welcome, ${firstName}` : `Welcome back, ${firstName}`}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {isNew
              ? "Three steps to your first batch of certificates."
              : "Here is what you have been generating lately."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/templates"
            className="h-10 px-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted transition active:scale-[0.98]"
          >
            <Layers3 className="h-4 w-4 text-muted-foreground" />
            Use a template
          </Link>
          <Link
            href="/dashboard/certificates"
            className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 hover:bg-violet-500 transition active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            New certificate
          </Link>
        </div>
      </div>

      {/* Getting started — shown until the first verifiable batch exists */}
      {verifiable === 0 && (
        <section className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.07] to-transparent p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-base font-semibold text-foreground">Getting started</h2>
            <span className="text-xs font-medium text-muted-foreground">
              {steps.filter((s) => s.done).length} of {steps.length} done
            </span>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        step.done ? "bg-emerald-500/15 text-emerald-500" : "bg-violet-500/10 text-violet-500"
                      }`}
                    >
                      {step.done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.body}</p>
                </li>
              );
            })}
          </ol>
          <Link
            href="/dashboard/certificates"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline"
          >
            Open the editor <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Your numbers">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-violet-500/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                <Icon className="h-4 w-4 text-muted-foreground/60 group-hover:text-violet-500 transition-colors" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-foreground tracking-tight tabular-nums">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
            </Link>
          );
        })}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Recent batches */}
        <section className="xl:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Recent batches</h2>
            <Link
              href="/dashboard/history"
              className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {recentBatches.length > 0 ? (
              <ul className="divide-y divide-border">
                {recentBatches.map((batch) => (
                  <li key={batch.id}>
                    <Link
                      href={`/dashboard/history/${batch.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors"
                    >
                      <span className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-[10px] font-bold text-violet-600 dark:text-violet-300">
                        {batch.format}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">{batch.name}</span>
                        <span className="block truncate text-xs text-muted-foreground mt-0.5">
                          {plural(batch.count, "certificate")} · {batch.templateName}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-xs text-muted-foreground">{relativeDay(batch.createdAt)}</span>
                        <StatusPill status={batch.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">No batches yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Every export you make shows up here, ready to look up later.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Recent templates */}
        <section className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Your templates</h2>
            <Link
              href="/dashboard/templates"
              className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentTemplates.length > 0 ? (
            <ul className="space-y-3">
              {recentTemplates.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/dashboard/certificates?id=${t.id}`}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 hover:border-violet-500/40 transition-colors"
                  >
                    <span className="block h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      <TemplatePreview src={t.previewUrl} name={t.name} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">{t.name}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {t.category} · edited {relativeDayInline(t.updatedAt)}
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-violet-500 transition-colors mr-1" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
              <h3 className="text-sm font-semibold text-foreground">No templates saved</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Save a design in the editor to reuse it for the next event.
              </p>
              <Link
                href="/dashboard/certificates"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline"
              >
                Create your first template <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Completed"
      ? "text-emerald-600 dark:text-emerald-400"
      : status === "Processing"
        ? "text-sky-600 dark:text-sky-400"
        : "text-rose-600 dark:text-rose-400";
  return (
    <span className={`mt-1 inline-flex items-center gap-1.5 text-xs font-medium ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
