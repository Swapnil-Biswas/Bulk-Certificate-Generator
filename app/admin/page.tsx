import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Search, Users, UserCheck, MailWarning, FileText, MailCheck, CircleAlert } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/get-session";
import AdminUserActions from "@/components/admin-user-actions";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { plural, shortDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

const filters = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "inactive", label: "Blocked or rejected" },
  { key: "unverified", label: "Email not confirmed" },
] as const;
type FilterKey = (typeof filters)[number]["key"];

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  REJECTED: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  BLOCKED: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};
const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  BLOCKED: "Blocked",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const { q, filter } = await searchParams;
  const active: FilterKey = filters.some((f) => f.key === filter) ? (filter as FilterKey) : "all";

  const where = {
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(active === "pending" && { approvalStatus: "PENDING" as const }),
    ...(active === "approved" && { approvalStatus: "APPROVED" as const }),
    ...(active === "inactive" && { approvalStatus: { in: ["BLOCKED" as const, "REJECTED" as const] } }),
    ...(active === "unverified" && { emailVerified: null }),
  };

  const [users, totalUsers, pendingCount, unverifiedCount, totals, perUser] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        approvalStatus: true,
        emailVerified: true,
        createdAt: true,
        accounts: { select: { provider: true } },
        _count: { select: { certificateTemplates: true, certificateBatches: true } },
      },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { approvalStatus: "PENDING" } }),
    prisma.user.count({ where: { emailVerified: null } }),
    prisma.certificateBatch.aggregate({ _sum: { count: true }, _count: true }),
    prisma.certificateBatch.groupBy({ by: ["userId"], _sum: { count: true } }),
  ]);

  const generatedBy = new Map(perUser.map((row) => [row.userId, row._sum.count ?? 0]));
  // People waiting for a decision come first.
  const sorted = [...users].sort(
    (a, b) => Number(b.approvalStatus === "PENDING") - Number(a.approvalStatus === "PENDING")
  );

  const stats = [
    { label: "Users", value: totalUsers, note: "All accounts", icon: Users, href: "/admin" },
    { label: "Waiting for approval", value: pendingCount, note: pendingCount ? "Needs your decision" : "Nothing to review", icon: UserCheck, href: "/admin?filter=pending", alert: pendingCount > 0 },
    { label: "Email not confirmed", value: unverifiedCount, note: "Can't sign in yet", icon: MailWarning, href: "/admin?filter=unverified" },
    { label: "Certificates generated", value: totals._sum.count ?? 0, note: plural(totals._count, "batch", "batches"), icon: FileText },
  ];

  const href = (next: { filter?: string; q?: string }) => {
    const params = new URLSearchParams();
    const f = next.filter ?? active;
    const query = next.q ?? q;
    if (f && f !== "all") params.set("filter", f);
    if (query) params.set("q", query);
    const s = params.toString();
    return s ? `/admin?${s}` : "/admin";
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" aria-label="CertGen dashboard">
              <Logo iconClassName="h-9 w-9" />
            </Link>
            <div>
              <p className="text-sm font-semibold leading-tight">Admin</p>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">Accounts and access</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:p-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Approve new sign-ups, manage roles and remove accounts.
          </p>
        </div>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Summary">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const body = (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                  <Icon className={`h-4 w-4 ${stat.alert ? "text-amber-500" : "text-muted-foreground/60"}`} />
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{stat.value.toLocaleString("en-US")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
              </>
            );
            const cls = `rounded-2xl border bg-card p-5 transition-colors ${stat.alert ? "border-amber-500/40" : "border-border"}`;
            return stat.href ? (
              <Link key={stat.label} href={stat.href} className={`${cls} hover:border-violet-500/40`}>
                {body}
              </Link>
            ) : (
              <div key={stat.label} className={cls}>
                {body}
              </div>
            );
          })}
        </section>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 no-scrollbar">
            {filters.map((f) => (
              <Link
                key={f.key}
                href={href({ filter: f.key })}
                aria-current={active === f.key ? "true" : undefined}
                className={`inline-flex h-9 items-center whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-colors ${
                  active === f.key
                    ? "bg-violet-500/10 text-violet-600 dark:text-violet-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {f.label}
                {f.key === "pending" && pendingCount > 0 && (
                  <span className="ml-2 rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold leading-5 text-white">{pendingCount}</span>
                )}
              </Link>
            ))}
          </div>

          <form className="relative w-full lg:w-80" action="/admin">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            {active !== "all" && <input type="hidden" name="filter" value={active} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by name or email"
              aria-label="Search users"
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition"
            />
          </form>
        </div>

        <section className="rounded-2xl border border-border bg-card">
          {sorted.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th scope="col" className="px-5 py-3 font-medium">User</th>
                    <th scope="col" className="px-5 py-3 font-medium">Status</th>
                    <th scope="col" className="px-5 py-3 font-medium">Email</th>
                    <th scope="col" className="px-5 py-3 font-medium text-right">Certificates</th>
                    <th scope="col" className="px-5 py-3 font-medium">Joined</th>
                    <th scope="col" className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sorted.map((user) => {
                    const isSelf = user.id === session.user.id;
                    const viaGoogle = user.accounts.some((a) => a.provider === "google");
                    return (
                      <tr key={user.id} className={user.approvalStatus === "PENDING" ? "bg-amber-500/[0.04]" : undefined}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-semibold text-white">
                              {user.name.trim().charAt(0).toUpperCase() || "?"}
                            </span>
                            <div className="min-w-0">
                              <p className="flex items-center gap-2 font-medium">
                                <span className="truncate">{user.name}</span>
                                {user.role === "ADMIN" && (
                                  <span className="rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[11px] font-medium text-violet-600 dark:text-violet-300">Admin</span>
                                )}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {user.email}
                                {viaGoogle && " · Google"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle[user.approvalStatus]}`}>
                            {statusLabel[user.approvalStatus]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {user.emailVerified ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MailCheck className="h-3.5 w-3.5 text-emerald-500" />
                              Confirmed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                              <CircleAlert className="h-3.5 w-3.5" />
                              Not confirmed
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums">
                          <p className="font-medium">{(generatedBy.get(user.id) ?? 0).toLocaleString("en-US")}</p>
                          <p className="text-xs text-muted-foreground">{plural(user._count.certificateTemplates, "template")}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">{shortDate(user.createdAt)}</td>
                        <td className="px-5 py-4">
                          <AdminUserActions
                            isSelf={isSelf}
                            user={{
                              id: user.id,
                              name: user.name,
                              role: user.role,
                              approvalStatus: user.approvalStatus,
                              emailVerified: !!user.emailVerified,
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-base font-semibold">{q || active !== "all" ? "No users match" : "No users yet"}</h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                {active === "pending" && !q ? "You're all caught up — nobody is waiting for approval." : "Try a different search or filter."}
              </p>
              {(q || active !== "all") && (
                <Link href="/admin" className="mt-5 inline-block text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline">
                  Clear filters
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
