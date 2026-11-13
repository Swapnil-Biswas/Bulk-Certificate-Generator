"use client";

import { QuantumLayout } from "@/components/quantum-layout";
import { motion } from "framer-motion";
import { ShieldCheck, Fingerprint, Lock, Key, Eye, Binary, Zap } from "lucide-react";

export default function SecurityPage() {
  const features = [
    {
      icon: <Fingerprint className="h-6 w-6" />,
      title: "SHA-256 Integrity",
      desc: "Every asset is hashed using the SHA-256 algorithm during synthesis, creating a unique cryptographic fingerprint that detects any subsequent tampering."
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "AES-256 Encryption",
      desc: "Data in transit and at rest is protected using industry-standard AES-256 encryption protocols, ensuring end-to-end privacy."
    },
    {
      icon: <Binary className="h-6 w-6" />,
      title: "Immutable Registry",
      desc: "Verification metadata is optionally anchored to decentralized ledgers, providing a permanent and independent audit trail."
    },
    {
      icon: <Key className="h-6 w-6" />,
      title: "HSM Key Storage",
      desc: "Sensitive cryptographic keys are stored in Hardware Security Modules (HSM) with strict access controls and audit logging."
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Audit Protocols",
      desc: "Continuous monitoring and automated auditing of all synthesis operations ensure strict adherence to security policies."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Verification",
      desc: "Our high-speed verification nodes can validate asset integrity in sub-50ms using decentralized proof-of-authenticity."
    }
  ];

  return (
    <QuantumLayout 
      title="SECURITY" 
      subtitle="CRYPTOGRAPHIC ARCHITECTURE"
    >
      <div className="flex flex-col lg:flex-row gap-20 items-center mb-32">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-6">
            <ShieldCheck className="h-3 w-3" />
            SOC2 Type II Compliant
          </div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-8 leading-none">TAMPER-PROOF <br /> BY DESIGN.</h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Security is not a feature at CertGen; it is the substrate. Our architecture utilizes advanced cryptographic primitives to ensure that every asset generated is provably authentic and resistant to manipulation.
          </p>
        </div>
        <div className="flex-1 relative">
           <div className="absolute inset-0 bg-violet-600/10 blur-[120px] rounded-full" />
           <div className="relative p-1 rounded-[48px] bg-gradient-to-br from-white/10 to-transparent">
             <div className="bg-[#0d1117] rounded-[44px] p-12 overflow-hidden relative">
                <div className="absolute inset-0 bg-grid opacity-[0.05]" />
                <motion.div 
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="relative z-10 flex flex-col items-center gap-6"
                >
                  <Lock className="h-20 w-20 text-violet-500" />
                  <div className="space-y-2 text-center">
                    <div className="h-2 w-48 bg-white/10 rounded-full mx-auto" />
                    <div className="h-2 w-32 bg-white/5 rounded-full mx-auto" />
                  </div>
                  <div className="mt-4 font-mono text-[10px] text-violet-400/50 break-all text-center">
                    8f67e432f86d8a7b9c2e5a4f1d0c3b9a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c
                  </div>
                </motion.div>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-10 rounded-[32px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group"
          >
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-8 text-violet-500 group-hover:bg-violet-600 group-hover:text-white transition-all duration-500">
              {f.icon}
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4">{f.title}</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </QuantumLayout>
  );
}
