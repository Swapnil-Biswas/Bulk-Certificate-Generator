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
  Activity
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
            {['Infrastructure', 'Workflow', 'Security'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="group relative text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]">
                {item}
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
        <section className="max-w-7xl mx-auto px-6 pb-48">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-blue-600/20 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
            <div className="relative rounded-[36px] border border-white/10 bg-[#0d1117]/80 backdrop-blur-3xl p-3 shadow-2xl overflow-hidden">
               <div className="h-10 flex items-center justify-between px-6 border-b border-white/5">
                 <div className="flex gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="h-3 w-32 rounded bg-white/5" />
                    <div className="h-3 w-8 rounded bg-white/5" />
                 </div>
               </div>
               
               <div className="aspect-[21/9] bg-black/60 relative flex items-center justify-center overflow-hidden">
                  {/* Dynamic Workspace Mockup */}
                  <div className="w-[70%] aspect-[1.414/1] bg-white rounded-lg shadow-[0_50px_100px_rgba(0,0,0,0.5)] p-12 flex flex-col items-center justify-center group-hover:scale-[1.02] transition-transform duration-700">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mb-10">
                      <Logo iconClassName="h-8 w-8 text-white" />
                    </div>
                    <div className="h-5 w-64 bg-slate-100 rounded-full mb-6" />
                    <div className="h-14 w-[80%] bg-slate-900/5 rounded-2xl mb-12" />
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="h-3 bg-slate-100 rounded-full" />
                      <div className="h-3 bg-slate-100 rounded-full" />
                    </div>
                  </div>

                  {/* Context UI Overlays */}
                  <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute top-12 right-12 p-5 rounded-2xl bg-violet-600 border border-white/20 shadow-2xl"
                  >
                    <MousePointer2 className="h-4 w-4 text-white mb-2" />
                    <p className="text-[9px] font-black text-white uppercase tracking-widest">Active_Layer_01</p>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-12 left-12 p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl"
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Data Stream</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">84.2 GB Processed</p>
                      </div>
                    </div>
                  </motion.div>
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

        {/* CTA Section */}
        <section className="py-64 relative">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase mb-12">SCALE NOW.</h2>
              <p className="text-xl text-slate-500 font-medium mb-16 max-w-2xl mx-auto">Access the world's most advanced asset synthesis engine. Zero friction. Total control.</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
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
                      <li key={item}><Link href="#" className="text-sm text-slate-500 hover:text-white transition-colors font-medium">{item}</Link></li>
                    ))}
                  </ul>
                </div>
              ) : group === 'Resources' ? (
                <div key={group}>
                  <h5 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10">{group}</h5>
                  <ul className="space-y-6">
                    {['Documentation', 'API Status', 'Security'].map(item => (
                      <li key={item}><Link href="#" className="text-sm text-slate-500 hover:text-white transition-colors font-medium">{item}</Link></li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div key={group}>
                  <h5 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10">{group}</h5>
                  <ul className="space-y-6">
                    {['Privacy Policy', 'Terms of Use', 'Compliance'].map(item => (
                      <li key={item}><Link href="#" className="text-sm text-slate-500 hover:text-white transition-colors font-medium">{item}</Link></li>
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
