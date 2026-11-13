"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Zap, 
  Globe, 
  Layout, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2,
  FileText,
  MousePointer2,
  Sparkles,
  Command,
  Activity,
  PenTool,
  Layers3,
  Settings,
  ChevronLeft,
  QrCode
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useRef, useState, useEffect } from "react";

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [0, -100]), springConfig);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#02040a] text-slate-200 selection:bg-violet-500/30 selection:text-white font-sans overflow-x-hidden">
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
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <Logo iconClassName="h-8 w-8" />
            <span className="text-lg font-black tracking-tighter text-white uppercase">CertGen</span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-10">
            {[
              { name: 'Visualizer', path: '#visualizer' },
              { name: 'Foundation', path: '#infrastructure' },
              { name: 'Workflow', path: '#workflow' },
              { name: 'Deploy', path: '#cta' }
            ].map((item) => (
              <Link key={item.name} href={item.path} className="group relative text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]">
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-violet-500 transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[10px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-[0.2em]">Log In</Link>
            <Link 
              href="/register" 
              className="group relative px-6 py-2.5 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest overflow-hidden transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              <span className="relative z-10">Initialize</span>
              <div className="absolute inset-0 bg-slate-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-48 pb-32 px-6 flex flex-col items-center text-center">
          <motion.div style={{ y, opacity, scale }} className="flex flex-col items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-inner"
            >
              <Sparkles className="h-3 w-3 text-violet-500" />
              Production Ready v2.5.0
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl md:text-[10rem] font-black text-white tracking-tighter leading-[0.8] mb-12 max-w-5xl"
            >
              ASSETS AT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20">QUANTUM SCALE.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mb-16 leading-relaxed"
            >
              The definitive platform for bulk asset synthesis. Architected for peak performance, 
              data integrity, and seamless enterprise integration.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center gap-8"
            >
              <Link 
                href="/register"
                className="group relative px-10 py-5 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl shadow-violet-600/20 active:scale-95 flex items-center gap-4"
              >
                <span>Deploy Node</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link 
                href="#infrastructure"
                className="flex items-center gap-3 px-10 py-5 bg-white/5 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] border border-white/10 hover:bg-white/10 transition active:scale-95"
              >
                <Command className="h-4 w-4" />
                Explore Specs
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-px w-32 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear"
                }}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  rotate: i % 2 === 0 ? 45 : -45
                }}
              />
            ))}
          </div>
        </section>

        {/* Product Visualizer */}
        <section id="visualizer" className="max-w-7xl mx-auto px-6 pb-48">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative group"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/30 via-fuchsia-500/20 to-blue-600/30 rounded-[48px] blur-3xl opacity-30 group-hover:opacity-60 transition duration-1000" />
            
            {/* The "Browser" Container */}
            <div className="relative rounded-[40px] border border-white/10 bg-[#0d1117]/90 backdrop-blur-3xl p-2 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
               {/* Browser Header/Window Controls */}
               <div className="h-12 flex items-center justify-between px-8 border-b border-white/5">
                 <div className="flex gap-2.5">
                    <div className="h-3 w-3 rounded-full bg-rose-500/20 border border-rose-500/30" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/20 border border-amber-500/30" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Live_Session_Alpha_02</span>
                    </div>
                    <div className="h-4 w-px bg-white/5" />
                    <div className="h-3 w-20 rounded bg-white/5" />
                 </div>
               </div>
               
               {/* Mock Dashboard / Studio Layout */}
               <div className="aspect-[16/9] bg-[#02040a] relative flex overflow-hidden">
                  
                  {/* Mock Mini-Sidebar (80px) */}
                  <div className="w-16 shrink-0 border-r border-white/5 flex flex-col items-center py-8 gap-8">
                    <div className="p-2.5 rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
                      <Logo iconClassName="h-5 w-5" />
                    </div>
                    {[PenTool, Layers3, FileText, ShieldCheck, Settings].map((Icon, i) => (
                      <div key={i} className="p-2.5 rounded-xl text-white/20 hover:text-white/40 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                    ))}
                    <div className="mt-auto h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                      <Zap className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Mock Control Panel (300px) */}
                  <div className="w-72 shrink-0 border-r border-white/5 bg-[#0d1117]/50 flex flex-col hidden lg:flex">
                    <div className="px-6 py-6 border-b border-white/5">
                      <div className="h-3 w-24 bg-white/10 rounded-full mb-2" />
                      <div className="h-2 w-12 bg-white/5 rounded-full" />
                    </div>
                    <div className="p-6 space-y-8">
                      <div className="space-y-4">
                        <div className="h-2 w-16 bg-white/10 rounded-full" />
                        <div className="h-24 w-full rounded-2xl border border-dashed border-white/10 bg-white/[0.02]" />
                      </div>
                      <div className="space-y-6">
                        <div className="h-2 w-16 bg-white/10 rounded-full" />
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="space-y-2">
                             <div className="flex justify-between">
                                <div className="h-2 w-12 bg-white/5 rounded-full" />
                                <div className="h-2 w-8 bg-violet-500/20 rounded-full" />
                             </div>
                             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  animate={{ x: ["-100%", "0%"] }}
                                  transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, repeatDelay: 3 }}
                                  className="h-full w-1/2 bg-violet-600" 
                                />
                             </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 space-y-3">
                        <div className="h-10 w-full rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-widest flex items-center justify-center">
                          Initialize Batch
                        </div>
                        <div className="h-10 w-full rounded-xl border border-white/10 bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest flex items-center justify-center">
                          Export Registry
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mock Main Workspace */}
                  <div className="flex-1 relative flex flex-col">
                    {/* Mock Studio Header */}
                    <div className="h-14 border-b border-white/5 bg-[#0d1117]/30 flex items-center justify-between px-8">
                      <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                          <ChevronLeft className="h-4 w-4" />
                        </div>
                        <div className="h-3 w-32 bg-white/10 rounded-full" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-16 rounded-lg bg-white/5" />
                        <div className="h-8 w-24 rounded-lg bg-violet-600" />
                      </div>
                    </div>

                    {/* Canvas Area */}
                    <div 
                      className="flex-1 relative overflow-hidden flex items-center justify-center"
                      style={{
                        backgroundImage: "radial-gradient(#ffffff08 1.5px, transparent 1.5px)",
                        backgroundSize: "32px 32px",
                      }}
                    >
                      {/* Data Packets Animation */}
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: -100, y: Math.random() * 400 }}
                          animate={{ 
                            x: [0, 800],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: Math.random() * 5 + 5,
                            repeat: Infinity,
                            delay: Math.random() * 10,
                            ease: "linear"
                          }}
                          className="absolute h-px w-12 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent z-0"
                        />
                      ))}
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={`v-${i}`}
                          initial={{ y: -100, x: Math.random() * 800 }}
                          animate={{ 
                            y: [0, 600],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: Math.random() * 5 + 5,
                            repeat: Infinity,
                            delay: Math.random() * 10,
                            ease: "linear"
                          }}
                          className="absolute w-px h-12 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent z-0"
                        />
                      ))}

                      {/* Floating Tooltips (Advanced Animation) */}
                      <AnimatePresence>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: 2, duration: 0.5 }}
                          className="absolute top-24 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-violet-600 text-white text-[9px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2 whitespace-nowrap"
                        >
                          <Sparkles className="h-3 w-3" />
                          Dynamic_Map_Active
                        </motion.div>
                      </AnimatePresence>

                      {/* Mock Certificate Visual */}
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="w-[70%] max-w-2xl aspect-[1.414/1] bg-white rounded-sm shadow-[0_50px_100px_rgba(0,0,0,0.8)] p-12 relative group/cert overflow-hidden"
                      >
                         {/* Border pattern */}
                         <div className="absolute inset-4 border-2 border-slate-900/5" />
                         <div className="absolute inset-6 border-px border-slate-900/10" />
                         
                         <div className="relative h-full flex flex-col items-center justify-center text-slate-900">
                           <div className="w-12 h-12 mb-8 opacity-20 grayscale">
                             <Logo iconClassName="h-full w-full" />
                           </div>
                           <div className="h-2 w-32 bg-slate-900/10 rounded-full mb-4" />
                           <div className="h-4 w-64 bg-slate-900/5 rounded-full mb-12" />
                           
                           {/* Animated Dynamic Field */}
                           <div className="relative mb-12">
                             <motion.div 
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -inset-4 bg-violet-500/5 rounded-xl border border-violet-500/20"
                             />
                             <div className="text-4xl md:text-5xl font-serif text-slate-800 tracking-tight text-center relative z-10">
                               Alexander Pierce
                             </div>
                           </div>

                           <div className="h-1.5 w-48 bg-slate-900/5 rounded-full mb-12" />
                           
                           <div className="w-full flex justify-between items-end px-12 mt-auto">
                              <div className="space-y-2">
                                <div className="h-px w-24 bg-slate-900/20" />
                                <div className="h-2 w-16 bg-slate-900/10 rounded-full" />
                              </div>
                              <div className="h-16 w-16 bg-slate-100 rounded border border-slate-200 p-2 opacity-80">
                                <QrCode className="h-full w-full text-slate-300" />
                              </div>
                              <div className="space-y-2">
                                <div className="h-px w-24 bg-slate-900/20" />
                                <div className="h-2 w-16 bg-slate-900/10 rounded-full" />
                              </div>
                           </div>

                           {/* Scanning Effect */}
                           <motion.div 
                              animate={{ 
                                top: ["-20%", "120%"],
                                opacity: [0, 1, 0]
                              }}
                              transition={{ 
                                duration: 3, 
                                repeat: Infinity, 
                                ease: "linear",
                                repeatDelay: 1
                              }}
                              className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-violet-500/10 to-transparent pointer-events-none z-20"
                           >
                              <div className="absolute top-1/2 left-0 right-0 h-px bg-violet-500/40" />
                           </motion.div>
                           </div>

                           {/* Selection Overlay */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-16 border-2 border-violet-500 pointer-events-none rounded opacity-0 group-hover/cert:opacity-100 transition-opacity">
                            <div className="absolute -top-1.5 -left-1.5 h-3 w-3 bg-white border-2 border-violet-500 rounded-sm" />
                            <div className="absolute -top-1.5 -right-1.5 h-3 w-3 bg-white border-2 border-violet-500 rounded-sm" />
                            <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 bg-white border-2 border-violet-500 rounded-sm" />
                            <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 bg-white border-2 border-violet-500 rounded-sm" />
                         </div>
                      </motion.div>

                      {/* Floating UI Elements (Parallax) */}
                      <motion.div 
                        animate={{ 
                          y: [0, -20, 0],
                          rotate: [0, 5, 0]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-20 right-20 p-5 rounded-2xl bg-[#1d2127] border border-white/10 shadow-2xl backdrop-blur-xl z-20"
                      >
                         <div className="flex items-center gap-4 mb-3">
                           <div className="h-2 w-2 rounded-full bg-violet-500" />
                           <div className="h-2 w-20 bg-white/10 rounded-full" />
                         </div>
                         <div className="h-8 w-32 bg-white/5 rounded-lg" />
                      </motion.div>

                      <motion.div 
                        animate={{ 
                          y: [0, 20, 0],
                          rotate: [0, -5, 0]
                        }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-20 left-20 p-5 rounded-2xl bg-violet-600 border border-white/20 shadow-2xl z-20"
                      >
                         <MousePointer2 className="h-4 w-4 text-white mb-3" />
                         <div className="h-2 w-24 bg-white/30 rounded-full" />
                      </motion.div>

                      {/* Mock Cursor (Superior Animation) */}
                      <motion.div 
                        animate={{ 
                          x: [200, -100, 50, 200],
                          y: [100, -50, 80, 100],
                          scale: [1, 0.9, 1.1, 1]
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/2 left-1/2 z-50 pointer-events-none"
                      >
                        <MousePointer2 className="h-6 w-6 text-white drop-shadow-[0_0_10px_rgba(124,58,237,0.5)] fill-violet-600" />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                          transition={{ duration: 12, repeat: Infinity, times: [0, 0.1, 0.2] }}
                          className="absolute top-0 left-0 w-12 h-12 bg-violet-500/20 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2"
                        />
                      </motion.div>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </section>


        {/* Feature Grid */}
        <section id="infrastructure" className="py-48 border-t border-white/5 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-end mb-32">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <p className="text-[10px] font-black text-violet-500 uppercase tracking-[0.4em] mb-6">Foundational Layer</p>
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">THE CORE ENGINE.</h2>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                className="text-xl text-slate-500 font-medium leading-relaxed"
              >
                Built on a reactive processing architecture that guarantees sub-millisecond layer 
                interpolation even at extreme batch volumes.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Layout className="h-6 w-6" />,
                  title: "Pro Studio",
                  desc: "Advanced vector manipulation suite with full typographic control and real-time GPU acceleration."
                },
                {
                  icon: <Cpu className="h-6 w-6" />,
                  title: "Batch Sync",
                  desc: "Parallel processing pipeline capable of synthesizing 10,000+ assets in a single browser thread."
                },
                {
                  icon: <ShieldCheck className="h-6 w-6" />,
                  title: "Secure Auth",
                  desc: "Multi-layered authentication protocols with admin-controlled node verification systems."
                }
              ].map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-12 rounded-[32px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 group"
                >
                  <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-white mb-10 group-hover:scale-110 group-hover:bg-violet-600 transition-all duration-500">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6">{f.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Workflow */}
        <section id="workflow" className="py-48 bg-white/[0.01] border-y border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-32 items-center">
              <div className="flex-1 space-y-16">
                 <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                 >
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase mb-8">SYNCED <br /> WORKFLOW.</h2>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed">Transform static templates into dynamic credential systems with three high-performance operations.</p>
                 </motion.div>

                 <div className="space-y-12">
                   {[
                     { step: "01", title: "Ingest Template", desc: "Native support for high-fidelity raster and vector assets." },
                     { step: "02", title: "Map Registry", desc: "Automated header-to-anchor mapping with validation protocols." },
                     { step: "03", title: "Bulk Synthesis", desc: "High-speed rendering with instant ZIP/PDF distribution." }
                   ].map((s, i) => (
                     <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-10 group cursor-default"
                     >
                       <span className="text-3xl font-black text-white/5 group-hover:text-violet-500/50 transition-colors duration-500">{s.step}</span>
                       <div>
                         <h4 className="text-lg font-black text-white uppercase tracking-[0.2em] mb-3">{s.title}</h4>
                         <p className="text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                       </div>
                     </motion.div>
                   ))}
                 </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex-1 relative"
              >
                <div className="absolute inset-0 bg-violet-600/10 blur-[120px] rounded-full" />
                <div className="relative aspect-square rounded-[60px] border border-white/10 bg-[#0d1117] flex items-center justify-center p-12 overflow-hidden shadow-2xl">
                   <div className="absolute inset-0 bg-grid opacity-[0.05]" />
                   <div className="relative space-y-4 w-full">
                     {[...Array(4)].map((_, i) => (
                       <motion.div 
                        key={i}
                        animate={{ 
                          x: [0, 10, 0],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{ 
                          duration: 3 + i, 
                          repeat: Infinity,
                          delay: i * 0.5
                        }}
                        className="h-16 w-full rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between px-8"
                       >
                         <div className="flex items-center gap-4">
                           <div className="h-2 w-2 rounded-full bg-emerald-500" />
                           <div className="h-3 w-40 bg-white/5 rounded-full" />
                         </div>
                         <div className="h-6 w-20 rounded-lg bg-white/5" />
                       </motion.div>
                     ))}
                   </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-48 border-t border-white/5 relative">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-24"
            >
              <p className="text-[10px] font-black text-violet-500 uppercase tracking-[0.4em] mb-6">Common Inquiries</p>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">FREQUENTLY ASKED.</h2>
            </motion.div>

            <div className="space-y-6">
              {[
                { 
                  q: "How secure is the blockchain verification?", 
                  a: "Every certificate batch is anchored to the Polygon network using SHA-256 Merkle Roots. This creates an immutable cryptographic proof that is independent of our own servers, allowing third parties to verify authenticity without our intervention." 
                },
                { 
                  q: "Can I use custom fonts in the studio?", 
                  a: "Yes. Our High-Performance Studio is integrated with FontSource and Google Fonts, supporting hundreds of professional typefaces. You can adjust weight, tracking, and alignment with sub-pixel precision." 
                },
                { 
                  q: "Is there a limit to bulk generation?", 
                  a: "Our reactive processing architecture is built for scale. Standard accounts can synthesize up to 10,000 assets in a single batch, while enterprise nodes have virtually no architectural limits due to our parallel processing pipeline." 
                },
                { 
                  q: "Do you support dynamic QR codes?", 
                  a: "Absolutely. You can drop a QR layer into any template, and our engine will automatically generate a unique verification URL for every single recipient during the bulk synthesis process." 
                }
              ].map((faq, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-[24px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group"
                >
                  <h4 className="text-lg font-black text-white uppercase tracking-widest mb-4 flex items-center gap-4">
                    <span className="text-violet-500/50">0{i+1}</span>
                    {faq.q}
                  </h4>
                  <p className="text-slate-500 font-medium leading-relaxed pl-10">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="py-64 relative">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase mb-12">SCALE NOW.</h2>
              <p className="text-xl text-slate-500 font-medium mb-16 max-w-2xl mx-auto">Access the world's most advanced asset synthesis engine. Zero friction. Total control.</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-24">
                <Link 
                  href="/register"
                  className="px-12 py-6 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-95"
                >
                  Get Started
                </Link>
                <Link 
                  href="/login"
                  className="px-12 py-6 bg-white/5 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] border border-white/10 hover:bg-white/10 transition active:scale-95"
                >
                  Access Platform
                </Link>
              </div>

              <div className="pt-24 border-t border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Need specialized integration?</p>
                <Link 
                  href="/contact"
                  className="group inline-flex items-center gap-4 text-white hover:text-violet-400 transition-colors"
                >
                  <span className="text-2xl font-black uppercase tracking-tighter">Contact Support Node</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-3 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 pt-32 pb-16 bg-[#02040a] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-24 mb-32">
            <div>
              <div className="flex items-center gap-3 mb-10">
                <Logo iconClassName="h-10 w-10" />
                <span className="text-2xl font-black text-white tracking-tighter uppercase">CertGen</span>
              </div>
              <p className="text-slate-500 font-medium max-w-sm">Synthesizing the future of digital credentials through high-performance infrastructure.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-24">
              {['Platform', 'Resources', 'Legal'].map((group) => (group === 'Platform' ? (
                <div key={group}>
                  <h5 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10">{group}</h5>
                  <ul className="space-y-6">
                    {['Infrastructure', 'Workflow', 'Studio'].map(item => (
                      <li key={item}><Link href={`/platform/${item.toLowerCase()}`} className="text-sm text-slate-500 hover:text-white transition-colors font-medium">{item}</Link></li>
                    ))}
                  </ul>
                </div>
              ) : group === 'Resources' ? (
                <div key={group}>
                  <h5 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10">{group}</h5>
                  <ul className="space-y-6">
                    {[
                      { name: 'Documentation', path: '/resources/documentation' },
                      { name: 'API Status', path: '/resources/status' },
                      { name: 'Security', path: '/resources/security' }
                    ].map(item => (
                      <li key={item.name}><Link href={item.path} className="text-sm text-slate-500 hover:text-white transition-colors font-medium">{item.name}</Link></li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div key={group}>
                  <h5 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10">{group}</h5>
                  <ul className="space-y-6">
                    {[
                      { name: 'Privacy Policy', path: '/legal/privacy' },
                      { name: 'Terms of Use', path: '/legal/terms' },
                      { name: 'Compliance', path: '/legal/compliance' }
                    ].map(item => (
                      <li key={item.name}><Link href={item.path} className="text-sm text-slate-500 hover:text-white transition-colors font-medium">{item.name}</Link></li>
                    ))}
                  </ul>
                </div>
              )))}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-16 border-t border-white/5 gap-10">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">© 2026 CERTGEN SYSTEMS INC. OPERATIONAL STATUS: GREEN</p>
            <div className="flex items-center gap-12">
               <Link href="#" className="text-[10px] font-black text-slate-700 hover:text-white transition-colors uppercase tracking-widest">Global Ops</Link>
               <Link href="#" className="text-[10px] font-black text-slate-700 hover:text-white transition-colors uppercase tracking-widest">Network</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
