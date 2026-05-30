import Link from "next/link";
import { ArrowRight, Zap, Globe, Github } from "lucide-react";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#02040a] transition-colors duration-200 antialiased font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-default">
          <Logo iconClassName="h-10 w-10" />
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">CertGen</span>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/login" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Log In</Link>
          <Link href="/register" className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-md active:scale-95">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/5 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-900/30 text-violet-600 dark:text-violet-400 text-[11px] font-bold uppercase tracking-widest mb-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <Zap className="h-3.5 w-3.5" />
          Next-Gen Asset Generation
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tight leading-[0.9] mb-10 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Design, generate, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-cyan-400">deploy</span> assets at scale.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Create professional templates in our studio workspace. 
          Bulk generate thousands of high-resolution certificates from a single registry.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Link 
            href="/register"
            className="px-8 py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 transition shadow-xl shadow-violet-500/20 active:scale-95 flex items-center gap-3"
          >
            Start Designing
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="https://github.com" 
            target="_blank"
            className="px-8 py-4 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white rounded-2xl font-bold text-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition active:scale-95 flex items-center gap-2"
          >
            <Github className="h-5 w-5" />
            Source Code
          </a>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000">
           <div className="p-8 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-left space-y-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                 <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Cloud Workspace</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Access your designs from anywhere. Fully persistent database synchronization for all your templates.</p>
           </div>
           <div className="p-8 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-left space-y-4">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600">
                 <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Batch Engine</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">High-speed CSV processing. Generate thousands of unique assets in seconds with real-time feedback.</p>
           </div>
           <div className="p-8 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-left space-y-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                 <Logo iconClassName="h-6 w-6 rounded-lg" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Secure Ledger</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Coming soon: Blockchain-backed verification to ensure the authenticity of every generated document.</p>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-8 py-16 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 mt-20">
        <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <Logo iconClassName="h-6 w-6 rounded-lg" />
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tighter">CertGen Studio</span>
        </div>
        <div className="flex items-center gap-10">
          <Link href="#" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link>
          <Link href="#" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Status: Online</Link>
        </div>
      </footer>
    </div>
  );
}
