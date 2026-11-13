"use client";

import { QuantumLayout } from "@/components/quantum-layout";
import { motion } from "framer-motion";
import { useState } from "react";
import { Send, MessageSquare, Mail, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <QuantumLayout 
      title="CONTACT SUPPORT" 
      subtitle="COMMUNICATION NODE 04"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-12"
        >
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-6">TRANSMIT YOUR INQUIRY.</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Our support infrastructure is available for specialized integration requests, 
              security audits, and enterprise-grade deployment consultations.
            </p>
          </div>

          <div className="space-y-8">
            {[
              { icon: <Mail className="h-5 w-5" />, title: "Direct Registry", desc: "support@certificategenerator.space" },
              { icon: <MessageSquare className="h-5 w-5" />, title: "Live Protocol", desc: "Available for Enterprise Nodes" },
              { icon: <ShieldCheck className="h-5 w-5" />, title: "Security Node", desc: "security@certificategenerator.space" }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="h-10 w-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-500 shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{item.title}</h4>
                  <p className="text-sm font-bold text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 md:p-12 rounded-[40px] border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl relative"
        >
          {status === "success" ? (
            <div className="py-24 text-center animate-in zoom-in-95 duration-500">
              <div className="h-20 w-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                <Send className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Transmission Success</h3>
              <p className="text-slate-500 font-medium">Your inquiry has been encrypted and sent to the support node.</p>
              <button 
                onClick={() => setStatus("idle")}
                className="mt-12 px-8 py-4 bg-white/5 text-white rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/10 transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Alexander Pierce"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full h-14 rounded-2xl bg-white/[0.03] border border-white/10 px-6 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-violet-500/50 transition-colors font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Protocol</label>
                  <input 
                    required
                    type="email" 
                    placeholder="e.g. alex@enterprise.io"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full h-14 rounded-2xl bg-white/[0.03] border border-white/10 px-6 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-violet-500/50 transition-colors font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject Header</label>
                <input 
                  type="text" 
                  placeholder="e.g. Enterprise License Query"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full h-14 rounded-2xl bg-white/[0.03] border border-white/10 px-6 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-violet-500/50 transition-colors font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Transmission Data</label>
                <textarea 
                  required
                  rows={6}
                  placeholder="Describe your inquiry with technical detail..."
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full rounded-2xl bg-white/[0.03] border border-white/10 p-6 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-violet-500/50 transition-colors font-medium resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={status === "sending"}
                className="w-full h-16 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-violet-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {status === "sending" ? "Encrypting..." : (
                  <>
                    <span>Execute Transmission</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
              
              {status === "error" && (
                <p className="text-center text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                  Transmission failed. Please verify connection and retry.
                </p>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </QuantumLayout>
  );
}
