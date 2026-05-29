"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  PenTool,
  Layers3,
  History,
  ShieldCheck,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Search,
  Bell,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Certificate Editor", href: "/dashboard/certificates", icon: PenTool },
  { name: "Bulk Generate", href: "/dashboard/bulk", icon: FileSpreadsheet },
  { name: "Templates", href: "/dashboard/templates", icon: Layers3 },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Verification", href: "/dashboard/verification", icon: ShieldCheck },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isEditorWorkspace =
    pathname === "/dashboard/certificates";

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (isEditorWorkspace) {
      setCollapsed(true);
    }
  }, [isEditorWorkspace]);

  if (isEditorWorkspace) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-100">
        <aside
          className={`border-r border-slate-200 bg-white transition-all duration-300 ${
            collapsed ? "w-24" : "w-72"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-center px-4 py-6">
              {!collapsed ? (
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-blue-500 shadow-lg">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      CertGen
                    </h1>
                    <p className="text-sm text-slate-500">
                      Creative Workspace
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-blue-500 shadow-lg">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
              )}
            </div>

            <nav className="flex-1 space-y-3 px-3 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-center rounded-2xl p-4 transition ${
                      active
                        ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                    title={item.name}
                  >
                    <Icon className="h-6 w-6" />
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-200 p-3">
              <button
                onClick={() =>
                  setCollapsed(!collapsed)
                }
                className="flex w-full items-center justify-center rounded-2xl bg-slate-100 p-4"
              >
                {collapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside
        className={`border-r border-slate-200 bg-white transition-all duration-300 ${
          collapsed ? "w-24" : "w-72"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-6">
            {!collapsed ? (
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-blue-500 shadow-lg">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    CertGen
                  </h1>
                  <p className="text-sm text-slate-500">
                    Creative Workspace
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-blue-500 shadow-lg">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-3 px-4 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 font-medium transition ${
                    active
                      ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-6 w-6 shrink-0" />

                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <button
              onClick={() =>
                setCollapsed(!collapsed)
              }
              className="flex w-full items-center justify-center rounded-2xl bg-slate-100 p-4"
            >
              {collapsed ? (
                <ChevronRight className="h-6 w-6" />
              ) : (
                <ChevronLeft className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between px-10 py-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                CertGen Workspace
              </h1>

              <p className="mt-2 text-lg text-slate-500">
                Design, generate and manage certificates
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  placeholder="Search..."
                  className="bg-transparent outline-none"
                />
              </div>

              <button className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <Bell className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-10">{children}</div>
      </main>
    </div>
  );
}
