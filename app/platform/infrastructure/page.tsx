"use client";

import { QuantumLayout } from "@/components/quantum-layout";
import { motion } from "framer-motion";
import { Cpu, Globe, Zap, Shield, Database, Server } from "lucide-react";

export default function InfrastructurePage() {
  const specs = [
    {
      icon: <Cpu className="h-6 w-6 text-violet-500" />,
      title: "Quantum Nodes",
      desc: "High-performance compute clusters optimized for cryptographic synthesis and layer interpolation."
    },
    {
      icon: <Globe className="h-6 w-6 text-violet-500" />,
      title: "Edge Distribution",
      desc: "Global CDN integration ensuring sub-100ms asset delivery across all geographic regions."
    },
    {
      icon: <Zap className="h-6 w-6 text-violet-500" />,
      title: "Polygon Sync",
      desc: "Real-time state synchronization with the Polygon PoS network for immutable registry updates."
    },
    {
      icon: <Shield className="h-6 w-6 text-violet-500" />,
      title: "Node Integrity",
      desc: "Hardware-level security modules (HSM) protecting validator keys and sensitive processing logic."
    },
    {
      icon: <Database className="h-6 w-6 text-violet-500" />,
      title: "Elastic Storage",
      desc: "Decentralized storage protocols (IPFS/Arweave) for long-term archival of high-resolution assets."
    },
    {
      icon: <Server className="h-6 w-6 text-violet-500" />,
      title: "Load Balancing",
      desc: "Dynamic traffic routing with automated failover across multiple independent data centers."
    }
  ];

  return (
    <QuantumLayout 
      title="INFRASTRUCTURE" 
      subtitle="FOUNDATIONAL LAYER 01"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {specs.map((spec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-10 rounded-[32px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
          >
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-violet-600 transition-all duration-500">
              {spec.icon}
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4">{spec.title}</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">{spec.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-24 p-12 rounded-[40px] border border-violet-500/20 bg-violet-600/5 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-6">POLYGON MAINNET INTEGRATION</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              Every asset generated is optionally anchored to the Polygon blockchain, providing a verifiable, tamper-proof audit trail for enterprise-grade credentials. Our bridge protocols ensure near-instant finality with minimal gas overhead.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Mainnet Online</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      </motion.div>
    </QuantumLayout>
  );
}
