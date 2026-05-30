import { FileSpreadsheet, ArrowRight, Upload, Download } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function BulkGeneratePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Bulk Generation</h1>
        <p className="mt-1 text-sm text-muted-foreground font-medium">
          Generate hundreds of certificates in seconds using CSV or TXT data sources.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-5xl">
        <div className="rounded-2xl border border-border bg-card p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <FileSpreadsheet className="h-64 w-64 text-violet-600" />
          </div>

          <div className="relative z-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 shadow-sm">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">1. Upload Template</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-1.5">Choose your base certificate image in the studio editor.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shadow-sm">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">2. Import Data</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-1.5">Upload a CSV or TXT file with names or other dynamic fields.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shadow-sm">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">3. Batch Export</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-1.5">Export all certificates as a high-quality ZIP archive instantly.</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <Link
                href="/dashboard/certificates"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3.5 font-bold text-white text-sm shadow-lg shadow-violet-500/20 transition hover:bg-violet-700 active:scale-95"
              >
                Enter Studio Editor
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8">
          <h4 className="font-bold text-foreground text-sm mb-2 flex items-center gap-2">
            <Logo iconClassName="h-5 w-5" />
            Registry Mapping Protocol
          </h4>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Use double curly braces in your text layers (e.g., <code className="bg-card px-1.5 py-0.5 rounded border border-border text-violet-600 font-bold mx-1">{"{{name}}"}</code>) to match your CSV column headers. The generator will automatically swap placeholders for each entry in the registry.
          </p>
        </div>
      </div>
    </div>
  );
}
