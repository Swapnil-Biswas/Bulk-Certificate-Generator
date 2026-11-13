"use client";

import { QuantumLayout } from "@/components/quantum-layout";
import { motion } from "framer-motion";
import { Book, Code, Terminal, Cpu, Globe, Lock, Search } from "lucide-react";

export default function DocumentationPage() {
  const sections = [
    { icon: <Book className="h-5 w-5" />, title: "Getting Started", items: ["Quick Start Guide", "Architecture Overview", "Platform Terminology"] },
    { icon: <Code className="h-5 w-5" />, title: "API Reference", items: ["Authentication", "Endpoint Registry", "Webhooks", "Rate Limits"] },
    { icon: <Terminal className="h-5 w-5" />, title: "CLI Tooling", items: ["Installation", "Command Index", "Configuration", "CI/CD Integration"] },
    { icon: <Cpu className="h-5 w-5" />, title: "Core Engine", items: ["Layer Interpolation", "Font Management", "Dynamic Mapping"] },
    { icon: <Globe className="h-5 w-5" />, title: "Network", items: ["Polygon Integration", "Node Distribution", "Edge Delivery"] },
    { icon: <Lock className="h-5 w-5" />, title: "Security", items: ["Cryptographic Proof", "SHA-256 Protocol", "Access Control"] }
  ];

  return (
    <QuantumLayout 
      title="DOCUMENTATION" 
      subtitle="KNOWLEDGE BASE"
    >
      <div className="relative mb-20">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search documentation, API refs, and guides..." 
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-10 rounded-[32px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
                {section.icon}
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-widest">{section.title}</h3>
            </div>
            <ul className="space-y-4">
              {section.items.map((item, j) => (
                <li key={j}>
                  <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 group">
                    <div className="h-1 w-1 rounded-full bg-violet-500/40 group-hover:bg-violet-500 transition-colors" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="mt-32 p-12 rounded-[40px] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent flex flex-col md:flex-row items-center justify-between gap-10">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Need personalized integration support?</h3>
          <p className="text-slate-500 font-medium max-w-lg">Our engineering team is available for enterprise-tier architectural consulting and custom node deployments.</p>
        </div>
        <button className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-transform active:scale-95 whitespace-nowrap">
          Contact Engineering
        </button>
      </div>
    </QuantumLayout>
  );
}
