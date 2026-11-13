"use client";

import { QuantumLayout } from "@/components/quantum-layout";
import { motion } from "framer-motion";
import { Activity, Globe, Server, Cpu, Database, CheckCircle2 } from "lucide-react";

export default function StatusPage() {
  const systems = [
    { name: "Global Edge Network", status: "Operational", uptime: "99.99%", latency: "24ms" },
    { name: "Synthesis Engine (v2.5)", status: "Operational", uptime: "100%", latency: "140ms" },
    { name: "Polygon Bridge Node", status: "Operational", uptime: "99.95%", latency: "800ms" },
    { name: "Asset CDN", status: "Operational", uptime: "99.99%", latency: "12ms" },
    { name: "API Gateway", status: "Operational", uptime: "99.98%", latency: "45ms" },
    { name: "Database Cluster", status: "Operational", uptime: "99.99%", latency: "5ms" }
  ];

  const regions = [
    { name: "US-EAST-1", load: 42 },
    { name: "EU-WEST-1", load: 28 },
    { name: "AP-SOUTH-1", load: 15 },
    { name: "SA-EAST-1", load: 8 }
  ];

  return (
    <QuantumLayout 
      title="SYSTEM STATUS" 
      subtitle="REAL-TIME MONITORING"
    >
      <div className="flex flex-col md:flex-row items-center justify-between p-10 rounded-[40px] border border-emerald-500/20 bg-emerald-500/5 mb-16">
        <div className="flex items-center gap-6 mb-6 md:mb-0">
          <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Activity className="h-8 w-8 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">All Systems Operational</h2>
            <p className="text-emerald-500/70 text-sm font-bold uppercase tracking-widest">Verified at 14:32:05 UTC</p>
          </div>
        </div>
        <div className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Global Uptime (30d)</span>
          <span className="text-2xl font-black text-white">99.998%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Service Health</h3>
          {systems.map((sys, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-black text-white uppercase tracking-widest">{sys.name}</span>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right hidden sm:block">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Latency</span>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{sys.latency}</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                  {sys.status}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-12">
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Network Distribution</h3>
            <div className="grid grid-cols-2 gap-6">
              {regions.map((reg, i) => (
                <div key={i} className="p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-4">{reg.name}</span>
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-3xl font-black text-white">{reg.load}%</span>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Load</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${reg.load}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-violet-600" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-10 rounded-[32px] border border-white/5 bg-gradient-to-br from-violet-600/5 to-transparent">
             <div className="flex items-center gap-4 mb-6">
                <Globe className="h-6 w-6 text-violet-500" />
                <h4 className="text-xl font-black text-white uppercase tracking-tighter">Live Traffic Monitor</h4>
             </div>
             <div className="h-32 flex items-end gap-1 px-2">
                {[...Array(30)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: [`${Math.random() * 60 + 20}%`, `${Math.random() * 60 + 20}%`] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 }}
                    className="flex-1 bg-violet-600/20 rounded-t-sm min-h-[10%]" 
                  />
                ))}
             </div>
          </div>
        </div>
      </div>
    </QuantumLayout>
  );
}
