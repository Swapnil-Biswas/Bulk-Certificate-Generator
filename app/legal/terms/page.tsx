"use client";

import { QuantumLayout } from "@/components/quantum-layout";
import { motion } from "framer-motion";
import { FileText, Scale, Zap, ShieldAlert, Ban, CheckCircle } from "lucide-react";

export default function TermsPage() {
  const points = [
    { icon: <CheckCircle className="h-5 w-5" />, title: "Service Access", desc: "Access to the CertGen synthesis engine is provided on a subscription or per-use basis as defined in your service agreement." },
    { icon: <Zap className="h-5 w-5" />, title: "Acceptable Use", desc: "Users agree to utilize the platform only for legitimate asset synthesis. Any use for fraudulent or illegal purposes is strictly prohibited." },
    { icon: <Scale className="h-5 w-5" />, title: "Intellectual Property", desc: "You retain all rights to your templates and data. CertGen retains rights to the underlying synthesis engine and platform infrastructure." },
    { icon: <ShieldAlert className="h-5 w-5" />, title: "Liability", desc: "CertGen is provided 'as-is'. While we maintain high availability, we are not liable for any indirect damages resulting from service interruptions." },
    { icon: <Ban className="h-5 w-5" />, title: "Termination", desc: "We reserve the right to suspend or terminate access to any node or account that violates these terms or engages in platform abuse." }
  ];

  return (
    <QuantumLayout 
      title="TERMS OF USE" 
      subtitle="LEGAL AGREEMENT"
    >
      <div className="max-w-4xl">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-20"
        >
          <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12">
            By accessing the CertGen platform, you agree to abide by the following terms and conditions. These terms ensure the integrity of our network and the quality of service for all node operators.
          </p>
          <div className="h-px w-full bg-white/5" />
        </motion.div>

        <div className="space-y-12">
          {points.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-8 group"
            >
              <div className="shrink-0 h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-500 group-hover:bg-violet-600 group-hover:text-white transition-all duration-500">
                {p.icon}
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-3">{p.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 p-12 rounded-[40px] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="flex items-center gap-4 mb-6">
            <FileText className="h-6 w-6 text-violet-500" />
            <h4 className="text-xl font-black text-white uppercase tracking-tighter">Enterprise Service Level Agreement (SLA)</h4>
          </div>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            Enterprise customers are eligible for custom SLAs providing guaranteed uptime, dedicated node capacity, and priority engineering support.
          </p>
          <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-colors">
            Review Enterprise Terms
          </button>
        </div>
      </div>
    </QuantumLayout>
  );
}
