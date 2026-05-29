import { ShieldCheck, Search, CheckCircle2 } from "lucide-react";

export default function VerificationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Certificate Verification</h1>
        <p className="mt-2 text-lg text-slate-500">
          Verify the authenticity of any certificate generated through this platform
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-50 text-violet-600 shadow-sm">
              <ShieldCheck className="h-10 w-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Verify a Certificate</h3>
              <p className="text-slate-500">
                Enter the unique verification code found at the bottom of the certificate.
              </p>
            </div>

            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="e.g. CERT-2026-X8Y2-Z9W0"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 text-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>

            <button className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-lg transition hover:bg-slate-800 active:scale-[0.98]">
              Verify Authenticity
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          <div className="rounded-2xl bg-emerald-50 p-6 border border-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mb-4" />
            <h4 className="font-bold text-emerald-900 mb-1">Secure & Valid</h4>
            <p className="text-sm text-emerald-700 leading-relaxed">
              Every certificate contains a unique hash verified against our blockchain-backed database.
            </p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-6 border border-blue-100">
            <ShieldCheck className="h-8 w-8 text-blue-600 mb-4" />
            <h4 className="font-bold text-blue-900 mb-1">Instant Results</h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              Employers can instantly verify credentials without contacting the issuer manually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
