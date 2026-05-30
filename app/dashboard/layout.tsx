"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  PenTool,
  Layers3,
  History,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Logo } from "@/components/logo";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Certificate Editor", href: "/dashboard/certificates", icon: PenTool },
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
  const { setTheme, resolvedTheme } = useTheme();

  const isEditorWorkspace = pathname === "/dashboard/certificates";
  const [collapsed, setCollapsed] = useState(isEditorWorkspace);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setCollapsed(isEditorWorkspace);
  }, [isEditorWorkspace]);

  // If in editor workspace, return children directly without the dashboard sidebar/header
  // This allows the editor to handle its own full-viewport layout.
  if (isEditorWorkspace) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-background antialiased font-sans transition-colors duration-200">
        {/* Global Mini-Sidebar (Icons Only) */}
        <aside className="w-16 shrink-0 h-full border-r border-border bg-card flex flex-col items-center py-6 gap-2 z-50">
          <Logo className="mb-6" iconClassName="h-10 w-10" />

          <nav className="flex-1 flex flex-col items-center gap-1 overflow-y-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-center h-10 w-10 rounded-lg transition-all duration-200 group ${
                    active
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={item.name}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-white" : "group-hover:scale-110 transition-transform"}`} />
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-border w-full flex flex-col items-center gap-4">
             <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="h-10 w-10 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Toggle Theme"
              >
                {resolvedTheme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>
              
              <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold shadow-sm">
                <UserIcon className="h-4 w-4" />
              </div>
          </div>
        </aside>

        {/* Studio Workspace */}
        <main className="flex-1 h-full overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-200 antialiased font-sans">
      {/* Global Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 border-r border-border bg-card transition-all duration-300 ease-in-out ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-6 py-8">
            <Logo iconClassName="h-10 w-10" />
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-foreground leading-tight tracking-tight">CertGen</h1>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Professional</p>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-1 px-3 overflow-y-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-sm transition-all duration-200 group ${
                    active
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${active ? "text-white" : "group-hover:scale-110 transition-transform"}`} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-center rounded-xl bg-muted p-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? "pl-20" : "pl-64"}`}>
        <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md transition-colors duration-200">
          <div className="flex items-center justify-between px-8 py-4">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {navItems.find(i => i.href === pathname)?.name || "Overview"}
            </h1>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2.5 rounded-xl border border-border bg-muted/50 px-3 py-2 shadow-sm transition-all focus-within:ring-1 focus-within:ring-violet-500/30 focus-within:bg-card">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Quick search..."
                  className="bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/60 w-40 font-medium"
                />
              </div>

              <div className="h-6 w-px bg-border mx-1" />

              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground transition-all hover:bg-muted shadow-sm"
              >
                {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <button className="relative rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground transition-all hover:bg-muted shadow-sm">
                <Bell className="h-4 w-4" />
              </button>

              <div className="relative ml-2">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-1.5 pr-3 transition hover:bg-muted shadow-sm"
                >
                  <div className="h-8 w-8 rounded-md bg-violet-600 flex items-center justify-center text-white font-bold shadow-sm">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${userMenuOpen ? 'rotate-90' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-xl border border-border bg-card p-2 shadow-xl z-50 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Account Registry</p>
                      </div>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-500/5 transition-all"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
