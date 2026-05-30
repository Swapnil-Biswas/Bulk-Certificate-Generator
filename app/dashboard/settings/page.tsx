"use client";

import { useSession } from "next-auth/react";
import { User, Mail, Shield, Bell, Lock, Palette, Monitor, Sun, Moon, Check } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  if (status === "loading") {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-muted border-t-violet-600 rounded-full animate-spin" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Retrieving Registry...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground font-medium mt-1">
          Manage your personal information and studio preferences.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Profile Section */}
          <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600">
                <User className="h-4 w-4" />
              </div>
              Profile Information
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <User className="h-3.5 w-3.5 text-muted-foreground group-focus-within:text-violet-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      defaultValue={session.user.name ?? ""}
                      className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-4 text-sm font-bold text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <input
                      type="email"
                      readOnly
                      defaultValue={session.user.email ?? ""}
                      className="w-full rounded-xl border border-border bg-muted/50 py-2.5 pl-10 pr-4 text-sm font-bold text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="rounded-xl bg-foreground text-background px-8 py-2.5 font-bold text-xs shadow-lg hover:opacity-90 active:scale-95 transition-all">
                  Update Registry
                </button>
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Palette className="h-4 w-4" />
              </div>
              Studio Appearance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: "light", name: "Light Mode", icon: Sun },
                { id: "dark", name: "Dark Mode", icon: Moon },
                { id: "system", name: "Standard", icon: Monitor },
              ].map((t) => {
                const Icon = t.icon;
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
                      active
                        ? "border-violet-600 bg-violet-500/5 text-violet-600 shadow-md"
                        : "border-transparent bg-muted/50 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${active ? "animate-in zoom-in duration-300" : ""}`} />
                    <span className="font-bold text-[11px] uppercase tracking-wider">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Security Section */}
          <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600">
                <Lock className="h-4 w-4" />
              </div>
              Access Control
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/40 border border-border transition-colors hover:bg-muted group">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Change Password</h4>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Maintain security protocols by rotating keys.</p>
                </div>
                <button className="rounded-lg border border-border bg-card px-4 py-2 text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-muted transition-all shadow-sm">
                  Rotate
                </button>
              </div>

              <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/40 border border-border transition-colors hover:bg-muted">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Multi-Factor Auth</h4>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Encrypt your account login flow.</p>
                </div>
                <button className="rounded-lg bg-violet-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-violet-500/20 active:scale-95 transition-all">
                  Enable
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-md font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              Identity Status
            </h3>
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl shadow-emerald-500/20">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-80 block mb-1">Auth Level</span>
              <span className="text-2xl font-black uppercase tracking-tight">
                {session.user.role}
              </span>
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground font-medium leading-relaxed">
              Your role determines your administrative and studio permissions within the global registry.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-md font-bold text-foreground mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              Notifications
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3.5 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer h-5 w-5 rounded-md border-border bg-muted transition-all cursor-pointer appearance-none checked:bg-violet-600" defaultChecked />
                  <Check className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity left-0.5 pointer-events-none stroke-[4]" />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-tight">Process completion alerts</span>
              </label>
              <label className="flex items-center gap-3.5 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer h-5 w-5 rounded-md border-border bg-muted transition-all cursor-pointer appearance-none checked:bg-violet-600" defaultChecked />
                  <Check className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity left-0.5 pointer-events-none stroke-[4]" />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-tight">System access logs</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
