"use client";

import { QuantumLayout } from "@/components/quantum-layout";
import { motion } from "framer-motion";
import { ShieldCheck, FileCheck, Globe, Lock, Cpu, Database } from "lucide-react";

export default function CompliancePage() {
  const certifications = [
    { title: "SOC2 Type II", status: "Certified", desc: "Rigorous independent auditing of our security, availability, and processing integrity controls." },
    { title: "ISO/IEC 27001", status: "Compliant", desc: "International standard for information security management systems (ISMS)." },
    { title: "GDPR / CCPA", status: "Aligned", desc: "Strict adherence to data protection and privacy regulations for global operations." },
    { title: "HIPAA", status: "Capable", desc: "Infrastructure designed to support healthcare-grade data security and privacy requirements." }
  ];

  return (
    <QuantumLayout 
      title="COMPLIANCE" 
      subtitle="ENTERPRISE STANDARDS"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-8 leading-none">REGULATED <br /> SYNTHESIS.</h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">
            CertGen is architected to meet the demanding compliance requirements of global enterprises, financial institutions, and government agencies. Our multi-layered security model ensures that every asset generated adheres to the highest industry standards.
          </p>
          <div className="space-y-4">
             {["Automated Audit Logs", "Role-Based Access Control (RBAC)", "Regional Data Residency", "End-to-End Encryption"].map((item, i) => (
               <div key={i} className="flex items-center gap-3">
                 <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                 <span className="text-xs font-black text-white uppercase tracking-widest">{item}</span>
               </div>
             ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map((cert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-black text-white uppercase tracking-widest">{cert.title}</h3>
                  <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                    {cert.status}
                  </div>
                </div>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">{cert.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-12 rounded-[40px] border border-white/5 bg-white/[0.01] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <FileCheck className="h-8 w-8 text-violet-500" />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Blockchain-Verified Audits</h3>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed">
              Leverage the Polygon mainnet for immutable, time-stamped proofs of compliance. Every synthesis batch generates a cryptographic receipt that can be independently verified without compromising sensitive data.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="h-32 w-32 rounded-3xl border border-white/5 bg-white/[0.02] flex items-center justify-center p-6">
                <Database className="h-full w-full text-white/10" />
             </div>
             <div className="h-32 w-32 rounded-3xl border border-white/5 bg-white/[0.02] flex items-center justify-center p-6">
                <Globe className="h-full w-full text-white/10" />
             </div>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-violet-600/5 blur-[100px] rounded-full" />
      </div>
    </QuantumLayout>
  );
}
