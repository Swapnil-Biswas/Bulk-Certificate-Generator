import { getSession } from "@/lib/auth/get-session";
import { User, Mail, Shield, Bell, Lock } from "lucide-react";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Account Settings</h1>
        <p className="mt-2 text-lg text-slate-500">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-6">
          {/* Profile Section */}
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-violet-600" />
              Profile Information
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      defaultValue={session.user.name ?? ""}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      readOnly
                      defaultValue={session.user.email ?? ""}
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pl-11 pr-4 font-medium text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="rounded-xl bg-violet-600 px-8 py-3 font-bold text-white shadow-lg transition hover:bg-violet-700 active:scale-[0.98]">
                  Save Changes
                </button>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-rose-600" />
              Security
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900">Change Password</h4>
                  <p className="text-sm text-slate-500">Update your account password regularly.</p>
                </div>
                <button className="rounded-xl border border-slate-200 bg-white px-6 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm">
                  Update
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                </div>
                <button className="rounded-xl bg-rose-50 border border-rose-100 px-6 py-2 text-sm font-bold text-rose-600 hover:bg-rose-100 transition shadow-sm">
                  Enable
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-4 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Account Role
            </h3>
            <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">Status</span>
              <span className="text-xl font-bold text-emerald-900 uppercase tracking-tight">
                {session.user.role}
              </span>
            </div>
            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
              Your role determines your permissions. Admins can manage users and system-wide settings.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Notifications
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500" defaultChecked />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition">Email on generation complete</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500" defaultChecked />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition">Security alerts</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
