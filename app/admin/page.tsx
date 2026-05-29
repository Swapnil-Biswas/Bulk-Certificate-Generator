import AdminUserActions from "@/components/admin-user-actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/get-session";

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-black p-10 text-white">
      <h1 className="mb-8 text-4xl font-bold">Admin Dashboard</h1>

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-xl border border-zinc-800 p-5"
          >
            <div className="font-semibold">{user.name}</div>
            <div className="text-zinc-400">{user.email}</div>

            <div className="mt-2 text-sm">
              Role: {user.role}
            </div>

            <div className="text-sm">
              Approval: {user.approvalStatus}
            </div>

            <div className="text-sm">
              Verified: {user.emailVerified ? "YES" : "NO"}
            </div>
            <AdminUserActions userId={user.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
