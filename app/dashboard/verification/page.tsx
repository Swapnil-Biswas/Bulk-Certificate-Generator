import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function VerificationPage() {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
        <Logo iconClassName="h-32 w-32 rounded-[2.5rem]" />
      </div>

      <div className="text-center space-y-4 max-w-md mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-black uppercase tracking-[0.2em]">
          <Clock className="h-3 w-3" />
          Under Development
        </div>
        <h1 className="text-5xl font-black text-foreground tracking-tight leading-tight">
          Coming Soon
        </h1>
        <p className="text-lg text-muted-foreground font-medium leading-relaxed">
          Our advanced blockchain-backed certificate verification system is currently in development.
        </p>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 px-8 py-4 bg-muted hover:bg-border text-foreground rounded-2xl font-bold transition-all active:scale-95 border border-border"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>
      </div>

      <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="p-6 rounded-[2rem] border border-border bg-card/50 text-center space-y-2">
          <h4 className="font-bold text-foreground">Secure Hashing</h4>
          <p className="text-xs text-muted-foreground font-medium">Tamper-proof certificate records</p>
        </div>
        <div className="p-6 rounded-[2rem] border border-border bg-card/50 text-center space-y-2">
          <h4 className="font-bold text-foreground">QR Integration</h4>
          <p className="text-xs text-muted-foreground font-medium">Instant scan-to-verify functionality</p>
        </div>
        <div className="p-6 rounded-[2rem] border border-border bg-card/50 text-center space-y-2">
          <h4 className="font-bold text-foreground">Public Ledger</h4>
          <p className="text-xs text-muted-foreground font-medium">Transparent validity tracking</p>
        </div>
      </div>
    </div>
  );
}
