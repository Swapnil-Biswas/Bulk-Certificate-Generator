"use client";

import { QuantumLayout } from "@/components/quantum-layout";
import { motion } from "framer-motion";
import { ArrowDown, Upload, Map as MapIcon, Zap, FileJson, CheckCircle2 } from "lucide-react";

export default function WorkflowPage() {
  const steps = [
    {
      step: "01",
      icon: <Upload className="h-6 w-6" />,
      title: "Ingest Template",
      desc: "Upload high-fidelity SVG or PDF templates. Our engine decomposes assets into addressable layers for dynamic manipulation."
    },
    {
      step: "02",
      icon: <MapIcon className="h-6 w-6" />,
      title: "Map Registry",
      desc: "Connect your data source via CSV or API. Map specific data fields to template anchors with real-time validation and type checking."
    },
    {
      step: "03",
      icon: <Zap className="h-6 w-6" />,
      title: "Bulk Synthesis",
      desc: "Execute the synthesis engine. Parallel nodes process thousands of assets per minute, applying precise typographic and visual logic."
    }
  ];

  return (
    <QuantumLayout 
      title="WORKFLOW" 
      subtitle="OPERATIONAL PIPELINE 02"
    >
      <div className="relative space-y-12">
        {steps.map((s, i) => (
          <div key={i} className="relative">
            {i !== steps.length - 1 && (
              <div className="absolute left-[2.45rem] top-24 bottom-0 w-px bg-gradient-to-b from-violet-600/50 to-transparent z-0" />
            )}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="flex gap-12 relative z-10"
            >
              <div className="shrink-0 h-20 w-20 rounded-3xl bg-violet-600 flex items-center justify-center text-white shadow-2xl shadow-violet-600/20">
                {s.icon}
              </div>
              <div className="pt-2">
                <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.4em] mb-2 block">{s.step} Operation</span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">{s.title}</h3>
                <p className="text-slate-500 max-w-2xl font-medium leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <div className="p-10 rounded-[32px] border border-white/5 bg-white/[0.01] flex flex-col justify-between aspect-square md:aspect-auto md:h-80">
          <div>
            <FileJson className="h-8 w-8 text-violet-500 mb-6" />
            <h4 className="text-xl font-black text-white uppercase tracking-widest mb-4">API FIRST</h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">Integrate synthesis directly into your existing CI/CD or enterprise software stack via our robust REST and GraphQL endpoints.</p>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
             <motion.div 
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="h-full w-1/3 bg-violet-600" 
             />
          </div>
        </div>
        <div className="p-10 rounded-[32px] border border-white/5 bg-white/[0.01] flex flex-col justify-between aspect-square md:aspect-auto md:h-80">
          <div>
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-6" />
            <h4 className="text-xl font-black text-white uppercase tracking-widest mb-4">Instant Validation</h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">Automated pre-flight checks ensure every asset meets resolution, typographic, and data integrity standards before synthesis begins.</p>
          </div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, delay: i * 0.1, repeat: Infinity }}
                className="h-2 w-full bg-emerald-500/50 rounded-full" 
              />
            ))}
          </div>
        </div>
      </motion.div>
    </QuantumLayout>
  );
}
