import AdminUserActions from "@/components/admin-user-actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/get-session";
import { FileText, Clock, Search, Shield, ArrowUpRight, Mail, Users, Filter } from "lucide-react";
import Link from "next/link";
import { User } from "@prisma/client";
import { Logo } from "@/components/logo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface UserWithRelations extends User {
  certificateBatches: { count: number }[];
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { q } = await searchParams;

  const users = (await prisma.user.findMany({
    where: {
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      certificateBatches: {
        select: {
          count: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as UserWithRelations[];

  const totalUsers = await prisma.user.count();
  const globalStats = await prisma.certificateBatch.aggregate({
    _sum: { count: true },
  });

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-300 p-6 lg:p-12 font-sans selection:bg-violet-500/30">
      <div className="max-w-[1500px] mx-auto space-y-10">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div className="flex items-center gap-5">
            <Logo iconClassName="h-14 w-14" />
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Command Center</h1>

              <div className="flex items-center gap-2 mt-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Operational Registry</p>
              </div>
            </div>
          </div>

          <Link 
            href="/dashboard"
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 transition-all active:scale-95 shadow-sm"
          >
            <ArrowUpRight className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </header>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors shadow-sm">
            <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">Total Node Members</p>
              <h4 className="text-4xl font-bold text-white tracking-tighter">{totalUsers.toLocaleString()}</h4>
            </div>
            <Users className="h-10 w-10 text-white/5 group-hover:text-violet-500/20 transition-all duration-500" />
          </div>
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors shadow-sm">
            <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">Assets Processed</p>
              <h4 className="text-4xl font-bold text-white tracking-tighter">{(globalStats._sum.count || 0).toLocaleString()}</h4>
            </div>
            <FileText className="h-10 w-10 text-white/5 group-hover:text-blue-500/20 transition-all duration-500" />
          </div>
        </div>

        {/* Search Matrix */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-4 px-4 py-2 border-r border-white/5">
             <Filter className="h-4 w-4 text-slate-600" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Registry Search Engine</span>
          </div>

          <div className="relative w-full lg:w-[600px]">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-700" />
            </div>
            <form>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="FILTER BY IDENTIFIER, NAME OR EMAIL..."
                className="w-full rounded-xl border border-white/10 bg-black/60 py-4 pl-14 pr-6 text-[10px] font-bold text-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all shadow-inner placeholder:text-slate-800 tracking-widest"
              />
            </form>
          </div>
        </div>

        {/* Member Matrix Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {users.map((user) => {
            const generatedCount = user.certificateBatches.reduce((acc, batch) => acc + batch.count, 0);
            
            return (
              <div
                key={user.id}
                className="group relative flex flex-col p-8 rounded-2xl border border-white/5 bg-[#0a0c14] hover:bg-[#0d0f1a] hover:border-white/10 transition-all duration-300 shadow-xl"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 font-black text-xl shadow-inner group-hover:bg-violet-600 group-hover:text-white transition-all">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-white text-lg uppercase tracking-wider leading-none">{user.name}</h3>
                      <div className="flex flex-col gap-1.5 mt-3">
                        <p className="text-slate-600 text-[10px] font-bold flex items-center gap-2 uppercase tracking-[0.1em]">
                           <Mail className="h-3 w-3 opacity-30" />
                           {user.email}
                        </p>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${user.approvalStatus === 'APPROVED' ? 'text-emerald-500' : 'text-rose-500'}`}>
                           Access Status: {user.approvalStatus}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${user.emailVerified ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800'}`} />
                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Verified</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-8">
                  <div className="p-5 rounded-xl bg-black/40 border border-white/5 shadow-inner flex items-center justify-between px-8">
                    <div className="flex items-center gap-3">
                       <FileText className="h-4 w-4 text-blue-500 opacity-60" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Lifetime Registry Output</span>
                    </div>
                    <span className="text-2xl font-black text-white tracking-tighter">{generatedCount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 mt-auto flex items-center justify-end relative z-10">
                  <AdminUserActions userId={user.id} />
                </div>
              </div>
            );
          })}
        </div>

        {users.length === 0 && (
          <div className="py-48 text-center bg-black/20 rounded-3xl border border-dashed border-white/5">
            <Search className="h-16 w-16 text-white/5 mx-auto mb-6 opacity-50" />
            <h4 className="text-white font-black uppercase tracking-[0.4em] text-xl">Command Registry Null</h4>
            <p className="text-slate-700 text-[11px] font-bold uppercase tracking-widest mt-3">The requested identifier parameters yielded zero matching node entities</p>
          </div>
        )}
      </div>
    </div>
  );
}
