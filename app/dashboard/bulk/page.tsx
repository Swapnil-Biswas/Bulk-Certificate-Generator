import { FileSpreadsheet, ArrowRight, Upload, Download } from "lucide-react";
import Link from "next/link";

export default function BulkGeneratePage() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-900">Bulk Generation</h1>
        <p className="mt-2 text-lg text-slate-500">
          Generate hundreds of certificates in seconds using CSV or TXT data sources.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-4xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <FileSpreadsheet className="h-40 w-40 text-slate-900" />
          </div>

          <div className="relative z-10 space-y-8">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900">1. Upload Template</h3>
                <p className="text-sm text-slate-500">Choose your base certificate image in the editor.</p>
              </div>

              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900">2. Import Data</h3>
                <p className="text-sm text-slate-500">Upload a CSV or TXT file with names or other fields.</p>
              </div>

              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900">3. Batch Export</h3>
                <p className="text-sm text-slate-500">Export all certificates as a high-quality ZIP archive.</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <Link
                href="/dashboard/certificates"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white shadow-xl transition hover:bg-slate-800 active:scale-95"
              >
                Go to Certificate Editor
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-8">
          <h4 className="font-bold text-slate-900 mb-2">Pro Tip: CSV Headers</h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            Use double curly braces in your text fields (e.g., <code className="bg-white px-1.5 py-0.5 rounded border">{"{{name}}"}</code>) to match your CSV column headers. The system will automatically swap them for each row.
          </p>
        </div>
      </div>
    </div>
  );
}
