import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";

import {
  Layers3,
  FileText,
  Download,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    title: "Certificates Generated",
    value: "1,284",
    icon: FileText,
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    title: "Templates Saved",
    value: "24",
    icon: Layers3,
    gradient: "from-violet-500 to-fuchsia-400",
  },
  {
    title: "Downloads",
    value: "3,912",
    icon: Download,
    gradient: "from-emerald-500 to-lime-400",
  },
  {
    title: "Verified",
    value: "846",
    icon: CheckCircle2,
    gradient: "from-orange-500 to-pink-400",
  },
];

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 p-10 text-white shadow-2xl">
        <h3 className="text-5xl font-bold">
          Create stunning certificates in minutes.
        </h3>

        <p className="mt-5 text-lg text-white/90">
          Design custom certificates, bulk generate from TXT or CSV,
          export PNG/PDF, and verify authenticity.
        </p>
      </section>

      <section className="grid grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-3xl border border-white bg-white p-6 shadow-sm"
            >
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient}`}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>

              <p className="text-sm text-slate-500">{stat.title}</p>
              <h4 className="mt-2 text-3xl font-bold">{stat.value}</h4>
            </div>
          );
        })}
      </section>
    </div>
  );
}
