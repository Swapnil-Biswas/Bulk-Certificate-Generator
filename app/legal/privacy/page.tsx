"use client";

import { QuantumLayout } from "@/components/quantum-layout";
import { motion } from "framer-motion";
import { Shield, Eye, Database, Globe, UserCheck, Lock } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    { icon: <Database className="h-5 w-5" />, title: "Data Collection", content: "We collect minimal operational data required to provide asset synthesis services, including template metadata and registry headers." },
    { icon: <Eye className="h-5 w-5" />, title: "Data Usage", content: "Your data is used exclusively for the generation and distribution of assets as directed by your account operations." },
    { icon: <Lock className="h-5 w-5" />, title: "Security Measures", content: "We employ multi-layer encryption and strict access controls to protect your data from unauthorized access or disclosure." },
    { icon: <Globe className="h-5 w-5" />, title: "International Transfer", content: "Data may be processed across our global node network, ensuring compliance with local data protection regulations." },
    { icon: <UserCheck className="h-5 w-5" />, title: "User Rights", content: "You maintain full ownership of your data and can request deletion or export of your account registry at any time." },
    { icon: <Shield className="h-5 w-5" />, title: "Compliance", content: "Our privacy practices are designed to align with major global standards, including GDPR and CCPA." }
  ];

  return (
    <QuantumLayout 
      title="PRIVACY POLICY" 
      subtitle="LEGAL FRAMEWORK"
    >
      <div className="max-w-4xl">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="prose prose-invert mb-20"
        >
          <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12">
            At CertGen, we prioritize the privacy and security of your data. This policy outlines our commitment to transparency and the rigorous protocols we use to handle your information within our synthesis engine.
          </p>
          <div className="h-px w-full bg-white/5 mb-20" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {sections.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-violet-500">
                  {s.icon}
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-widest">{s.title}</h3>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">{s.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 p-10 rounded-3xl border border-white/5 bg-white/[0.01]">
          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Last Updated: May 24, 2026</h4>
          <p className="text-slate-600 text-xs font-medium leading-relaxed">
            CertGen Systems Inc. reserves the right to update this policy as our infrastructure evolves. We will notify active node operators of any significant changes via the platform dashboard.
          </p>
        </div>
      </div>
    </QuantumLayout>
  );
}
