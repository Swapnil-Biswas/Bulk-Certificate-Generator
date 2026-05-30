import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import {
  Layers3,
  FileText,
  Download,
  CheckCircle2,
  Plus,
  ArrowRight,
  Clock,
  Zap,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch real stats
  const [templateCount, batchCount, user] = await Promise.all([
    prisma.certificateTemplate.count({
      where: { userId: session.user.id }
    }),
    prisma.certificateBatch.count({
      where: { userId: session.user.id }
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        certificateBatches: {
          select: { count: true }
        }
      }
    })
  ]);

  if (!user) redirect("/login");

  const totalGeneratedCount = user.certificateBatches.reduce((acc, batch) => acc + batch.count, 0);

  const stats = [
    {
      title: "Certificates Generated",
      value: totalGeneratedCount.toLocaleString(),
      icon: FileText,
      gradient: "from-blue-500 to-indigo-500",
      description: "Lifetime generation"
    },
    {
      title: "Templates Saved",
      value: templateCount.toString(),
      icon: Layers3,
      gradient: "from-violet-500 to-purple-500",
      description: "Custom designs"
    },
    {
      title: "Batches Processed",
      value: batchCount.toString(),
      icon: Download,
      gradient: "from-emerald-500 to-teal-500",
      description: "Bulk operations"
    },
    {
      title: "Identity Verified",
      value: user.emailVerified ? "Verified" : "Pending",
      icon: CheckCircle2,
      gradient: "from-amber-500 to-orange-500",
      description: "Security status"
    },
  ];

  const recentBatches = await prisma.certificateBatch.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Design professional certificate templates and manage your generations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/certificates"
            className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 transition shadow-sm active:scale-95 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Design
          </Link>
          <Link 
            href="/dashboard/bulk"
            className="px-5 py-2.5 bg-muted text-foreground border border-border rounded-xl font-bold text-sm hover:bg-border/50 transition active:scale-95 flex items-center gap-2"
          >
            <Zap className="h-4 w-4 text-violet-500" />
            Bulk Create
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-violet-500/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg shadow-inherit/10`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.description}</span>
              </div>

              <div>
                <h4 className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</h4>
                <p className="text-sm font-semibold text-muted-foreground mt-1">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-violet-500" />
              Recent Batches
            </h3>
            <Link href="/dashboard/history" className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 group">
              View All History
              <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            {recentBatches.length > 0 ? (
              <div className="divide-y divide-border">
                {recentBatches.map((batch) => (
                  <div key={batch.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground leading-none">{batch.name}</p>
                        <p className="text-xs text-muted-foreground font-semibold mt-2">
                          {batch.count} certificates generated • Template: {batch.templateName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </p>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-2 block">
                        {batch.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <div className="h-20 w-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-10 w-10 text-muted-foreground/20" />
                </div>
                <h4 className="text-lg font-bold text-foreground">No recent activity found</h4>
                <p className="text-sm text-muted-foreground mt-1">Start generating certificates to see your history here.</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground px-1">Resource Center</h3>
          <div className="grid grid-cols-1 gap-4">
            <Link 
              href="/dashboard/templates"
              className="p-5 rounded-2xl border border-border bg-card shadow-sm flex items-center justify-between group cursor-pointer hover:border-violet-500/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-violet-500 transition-colors">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Template Library</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Manage your designs</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              href="/dashboard/verification"
              className="p-5 rounded-2xl border border-border bg-card shadow-sm flex items-center justify-between group cursor-pointer hover:border-violet-500/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-violet-500 transition-colors">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Verification Beta</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Blockchain validation</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="p-8 rounded-2xl bg-slate-900 border border-white/5 text-white overflow-hidden relative shadow-lg">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <CheckCircle2 className="h-24 w-24" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1.5">Platform Update</p>
                <h4 className="text-xl font-bold mb-4">v2.5 Terminal Live</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  We've rolled out a major update to the editor workspace and database infrastructure. Enjoy faster generation and reliable persistence.
                </p>
                <button className="mt-6 w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition">
                  View Changelog
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
