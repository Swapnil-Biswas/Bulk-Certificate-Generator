import { getSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { Layers3, Plus, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TemplatesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const templates = await prisma.certificateTemplate.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">My Templates</h1>
          <p className="mt-2 text-lg text-slate-500">
            Manage and reuse your custom certificate designs
          </p>
        </div>

        <Link
          href="/dashboard/certificates"
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-4 font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Create Template
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {templates.map((template) => (
          <div
            key={template.id}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-xl"
          >
            <div className="aspect-video overflow-hidden rounded-2xl bg-slate-100">
              {/* Template Preview Placeholder */}
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <Layers3 className="h-12 w-12" />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-bold text-slate-900">
                {template.name}
              </h3>
              <p className="text-sm text-slate-500">
                Last modified:{" "}
                {new Date(template.updatedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Link
                href={`/dashboard/certificates?id=${template.id}`}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Edit
              </Link>
              <button className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                Duplicate
              </button>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm">
              <Layers3 className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900">
              No templates found
            </h3>
            <p className="mt-2 text-slate-500">
              You haven't saved any certificate templates yet.
            </p>
            <Link
              href="/dashboard/certificates"
              className="mt-8 font-bold text-violet-600 hover:underline"
            >
              Create your first template &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
