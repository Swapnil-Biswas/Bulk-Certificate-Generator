"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export function QuantumLayout({ children, title, subtitle }: { children: React.ReactNode, title?: string, subtitle?: string }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-200 selection:bg-violet-500/30 selection:text-white font-sans overflow-x-hidden">
      {/* Interactive Spotlight Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid opacity-[0.05]" />
        <motion.div 
          className="absolute inset-0 z-10 opacity-30"
          animate={{
            background: `radial-gradient(1200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(124, 58, 237, 0.08), transparent 40%)`
          }}
        />
        <div className="absolute top-0 -left-1/4 w-full h-full bg-violet-600/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 -right-1/4 w-full h-full bg-blue-600/5 blur-[160px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#02040a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo iconClassName="h-8 w-8 group-hover:rotate-12 transition-transform" />
            <span className="text-lg font-black tracking-tighter text-white uppercase">CertGen</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            {['Platform', 'Resources', 'Legal'].map((item) => (
              <span key={item} className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                {item}
              </span>
            ))}
          </div>

          <Link 
            href="/" 
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {(title || subtitle) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-20"
            >
              {subtitle && <p className="text-[10px] font-black text-violet-500 uppercase tracking-[0.4em] mb-4">{subtitle}</p>}
              {title && <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none mb-8">{title}</h1>}
              <div className="h-px w-24 bg-gradient-to-r from-violet-600 to-transparent" />
            </motion.div>
          )}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-[#02040a] relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo iconClassName="h-6 w-6" />
            <span className="text-sm font-black text-white tracking-tighter uppercase">CertGen</span>
          </div>
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">
            © 2026 CERTGEN SYSTEMS INC. OPERATIONAL STATUS: GREEN
          </p>
        </div>
      </footer>
    </div>
  );
}
