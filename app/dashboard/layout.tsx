"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  PenTool,
  Layers3,
  History,
  ShieldCheck,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Plus,
  ChevronsUpDown,
  UserCog,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Logo } from "@/components/logo";
import { useStoredValue } from "@/lib/hooks/use-stored-value";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, hint: "Your activity at a glance" },
  { name: "Editor", href: "/dashboard/certificates", icon: PenTool, hint: "Design and generate certificates" },
  { name: "Templates", href: "/dashboard/templates", icon: Layers3, hint: "Your saved designs" },
  { name: "History", href: "/dashboard/history", icon: History, hint: "Every batch you have generated" },
  { name: "Verification", href: "/dashboard/verification", icon: ShieldCheck, hint: "Check any certificate" },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, hint: "Account and appearance" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

function initialsOf(name?: string | null, email?: string | null) {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { setTheme, resolvedTheme } = useTheme();

  const isEditorWorkspace = pathname === "/dashboard/certificates";
  // Remembered between visits.
  const [sidebarState, setSidebar] = useStoredValue("certgen:sidebar", "open");
  const collapsed = sidebarState === "collapsed";
  const toggleCollapsed = () => setSidebar(collapsed ? "open" : "collapsed");

  // Menus are tied to the page they were opened on, so navigating closes them.
  const [mobileOpenAt, setMobileOpenAt] = useState<string | null>(null);
  const [userMenuAt, setUserMenuAt] = useState<string | null>(null);
  const mobileOpen = mobileOpenAt === pathname;
  const userMenuOpen = userMenuAt === pathname;
  const setMobileOpen = (open: boolean) => setMobileOpenAt(open ? pathname : null);
  const setUserMenuOpen = (open: boolean) => setUserMenuAt(open ? pathname : null);

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
  const user = session?.user;
  const initials = initialsOf(user?.name, user?.email);
  const current = navItems.find((i) => isActive(pathname, i.href));

  // The editor is a full-viewport workspace: slim icon rail only.
  if (isEditorWorkspace) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-background antialiased font-sans transition-colors duration-200">
        <aside className="hidden sm:flex w-14 shrink-0 h-full border-r border-border bg-card flex-col items-center py-4 gap-1 z-50">
          <Link href="/dashboard" title="Back to overview" className="mb-4">
            <Logo iconClassName="h-9 w-9" />
          </Link>

          <nav className="flex-1 flex flex-col items-center gap-1" aria-label="Dashboard">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.name}
                  aria-label={item.name}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-center h-9 w-9 rounded-lg transition-colors ${
                    active
                      ? "bg-violet-600 text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>

          <button
            onClick={toggleTheme}
            className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Switch theme"
            aria-label="Switch theme"
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </aside>

        <main className="flex-1 h-full overflow-hidden">{children}</main>
      </div>
    );
  }

  const sidebar = (compact: boolean) => (
    <div className="flex h-full flex-col">
      <div className={`flex items-center gap-3 h-16 shrink-0 ${compact ? "justify-center px-2" : "px-5"}`}>
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <Logo iconClassName="h-9 w-9" />
          {!compact && (
            <span className="text-[17px] font-semibold text-foreground tracking-tight">CertGen</span>
          )}
        </Link>
      </div>

      <div className={compact ? "px-2 pb-3" : "px-3 pb-3"}>
        <Link
          href="/dashboard/certificates"
          title="New certificate"
          className={`flex items-center justify-center gap-2 rounded-xl bg-violet-600 text-white text-sm font-semibold shadow-sm shadow-violet-600/25 hover:bg-violet-500 active:scale-[0.98] transition ${
            compact ? "h-10 w-full" : "h-10 px-4"
          }`}
        >
          <Plus className="h-4 w-4" />
          {!compact && <span>New certificate</span>}
        </Link>
      </div>

      <nav className={`flex-1 space-y-0.5 overflow-y-auto no-scrollbar ${compact ? "px-2" : "px-3"}`} aria-label="Dashboard">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={compact ? item.name : undefined}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
                compact ? "h-10 justify-center" : "h-10 px-3"
              } ${
                active
                  ? "bg-violet-500/10 text-violet-600 dark:text-violet-300"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {active && !compact && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-violet-500" />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!compact && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`border-t border-border ${compact ? "p-2" : "p-3"}`}>
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
            className={`flex w-full items-center gap-3 rounded-lg transition-colors hover:bg-muted ${
              compact ? "justify-center p-1.5" : "p-2"
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[11px] font-semibold text-white">
              {initials}
            </span>
            {!compact && (
              <>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-medium text-foreground leading-tight">
                    {user?.name || "Your account"}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground leading-tight mt-0.5">
                    {user?.email || ""}
                  </span>
                </span>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </>
            )}
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div
                role="menu"
                className={`absolute bottom-full mb-2 z-50 w-56 rounded-xl border border-border bg-card p-1.5 shadow-xl ${
                  compact ? "left-0" : "left-0 right-0 w-auto"
                }`}
              >
                <Link
                  role="menuitem"
                  href="/dashboard/settings"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Settings
                </Link>
                {user?.role === "ADMIN" && (
                  <Link
                    role="menuitem"
                    href="/admin"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <UserCog className="h-4 w-4 text-muted-foreground" />
                    Admin panel
                  </Link>
                )}
                <button
                  role="menuitem"
                  onClick={toggleTheme}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  )}
                  {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
                </button>
                <div className="my-1 h-px bg-border" />
                <button
                  role="menuitem"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-200 antialiased font-sans">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-40 border-r border-border bg-card transition-[width] duration-300 ease-out ${
          collapsed ? "w-[68px]" : "w-60"
        }`}
      >
        {sidebar(collapsed)}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border bg-card shadow-2xl animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar(false)}
          </aside>
        </div>
      )}

      <main
        className={`flex-1 min-w-0 flex flex-col transition-[padding] duration-300 ease-out ${
          collapsed ? "lg:pl-[68px]" : "lg:pl-60"
        }`}
      >
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="lg:hidden rounded-lg p-2 -ml-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                onClick={toggleCollapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="hidden lg:flex rounded-lg p-2 -ml-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground leading-tight">
                  {current?.name || "Dashboard"}
                </p>
                <p className="hidden sm:block truncate text-xs text-muted-foreground leading-tight mt-0.5">
                  {current?.hint}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                aria-label="Switch theme"
                title="Switch theme"
                className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Link
                href="/dashboard/certificates"
                className="lg:hidden flex h-9 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                New
              </Link>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 sm:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
