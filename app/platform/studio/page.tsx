"use client";

import { QuantumLayout } from "@/components/quantum-layout";
import { motion } from "framer-motion";
import { MousePointer2, Layers, PenTool, Type, Move, Maximize, Palette } from "lucide-react";

export default function StudioPage() {
  const tools = [
    { icon: <Layers className="h-5 w-5" />, title: "Layer Management", desc: "Complex z-index control with non-destructive editing." },
    { icon: <Type className="h-5 w-5" />, title: "Typographic Engine", desc: "Global font library support with precise kerning and line-height control." },
    { icon: <Move className="h-5 w-5" />, title: "Precision Anchors", desc: "Dynamic data-binding points with absolute coordinate mapping." },
    { icon: <Palette className="h-5 w-5" />, title: "Visual Styles", desc: "Advanced CSS-like styling including gradients, shadows, and masks." },
    { icon: <Maximize className="h-5 w-5" />, title: "Resolution Scaling", desc: "Lossless vector scaling for high-resolution print outputs." },
    { icon: <PenTool className="h-5 w-5" />, title: "Vector Paths", desc: "Full SVG path support for intricate decorative elements." }
  ];

  return (
    <QuantumLayout 
      title="DESIGN STUDIO" 
      subtitle="CREATIVE ENGINE 03"
    >
      <div className="flex flex-col lg:flex-row gap-20 items-center mb-32">
        <div className="flex-1">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-8 leading-none">HIGH-PRECISION <br /> CANVAS INTERFACE.</h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">
            The CertGen Studio is powered by a custom-tuned React-Konva engine, providing GPU-accelerated rendering for complex vector manipulations directly in the browser.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
              Canvas_V3.2
            </div>
            <div className="px-4 py-2 rounded-lg bg-violet-600/20 border border-violet-500/30 text-[10px] font-black text-violet-400 uppercase tracking-widest">
              GPU_ACCELERATED
            </div>
          </div>
        </div>
        
        <div className="flex-1 relative group w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
          <div className="relative aspect-video rounded-3xl border border-white/10 bg-[#0d1117] overflow-hidden flex items-center justify-center p-8">
             <div className="absolute inset-0 bg-grid opacity-[0.05]" />
             <motion.div 
               animate={{ 
                 scale: [1, 1.05, 1],
                 rotate: [0, 1, 0]
               }}
               transition={{ duration: 10, repeat: Infinity }}
               className="w-full h-full border border-white/5 bg-white/[0.02] rounded-xl relative overflow-hidden flex items-center justify-center"
             >
                <div className="text-center">
                  <MousePointer2 className="h-8 w-8 text-violet-500 mx-auto mb-4" />
                  <div className="h-2 w-32 bg-white/10 rounded-full mx-auto mb-2" />
                  <div className="h-1 w-20 bg-white/5 rounded-full mx-auto" />
                </div>
                {/* Decorative tooltips */}
                <div className="absolute top-10 left-10 p-2 rounded-lg bg-violet-600 text-[8px] font-black uppercase tracking-widest text-white shadow-xl">
                  Anchor_Point
                </div>
                <div className="absolute bottom-12 right-12 p-2 rounded-lg bg-white/10 border border-white/20 text-[8px] font-black uppercase tracking-widest text-white/40">
                  Layer_03
                </div>
             </motion.div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 mb-6 group-hover:text-white group-hover:bg-violet-600 transition-all">
              {tool.icon}
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3">{tool.title}</h3>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">{tool.desc}</p>
          </motion.div>
        ))}
      </div>
    </QuantumLayout>
  );
}
