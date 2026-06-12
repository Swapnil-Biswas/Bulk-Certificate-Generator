import { prisma } from "@/lib/prisma";
import { MailCheck, XCircle, ArrowRight, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

type VerifyPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyPageProps) {
  const { token } = await searchParams;

  let status: "loading" | "success" | "error" = "loading";
  let message = "";

  if (!token) {
    status = "error";
    message = "The verification link appears to be invalid or incomplete.";
  } else {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      status = "error";
      message = "This verification token has already been used or is invalid.";
    } else if (verificationToken.expires < new Date()) {
      status = "error";
      message = "This verification link has expired. Please request a new one.";
    } else {
      await prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { emailVerified: new Date() },
      });

      await prisma.verificationToken.delete({
        where: { token },
      });

      status = "success";
      message = "Your email has been verified. Access is pending admin approval.";
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#02040a] p-6 selection:bg-violet-500/30">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e293b_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="w-full max-w-[500px] relative z-10">
        {/* Decorative Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />

        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/50 backdrop-blur-2xl shadow-2xl p-8 md:p-12 space-y-10 text-center group">
          {/* Subtle Shine Effect */}
          <div className="absolute -top-[100%] left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent transition-all duration-1000 group-hover:top-0 pointer-events-none" />

          <div className="space-y-4">
            <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white/5 border border-white/10 mb-2 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Logo iconClassName="h-10 w-10 text-white" />
            </div>
            
            <div className="flex justify-center">
              {status === "success" ? (
                <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 animate-in zoom-in duration-500">
                  <MailCheck className="h-8 w-8" />
                </div>
              ) : (
                <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 animate-in zoom-in duration-500">
                  <XCircle className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none">
                {status === "success" ? "Verified" : "Verification Failed"}
              </h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
                {status === "success" ? "Identity confirmed" : "Process interrupted"}
              </p>
            </div>
          </div>

          <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-[280px] mx-auto">
            {message}
          </p>

          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full relative group/btn overflow-hidden rounded-2xl bg-white py-4 px-4 text-black font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition active:scale-[0.98] gap-3"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 opacity-0 group-hover/btn:opacity-10 transition-opacity" />
            Return to Login
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>

          {/* Bottom Status Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 flex">
            <div className={`flex-1 ${status === 'success' ? 'bg-emerald-600/50' : 'bg-rose-600/50'} animate-pulse`} />
            <div className="flex-1 bg-violet-600/50 animate-pulse [animation-delay:200ms]" />
            <div className="flex-1 bg-blue-600/50 animate-pulse [animation-delay:400ms]" />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocol Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-violet-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Quantum Secured</span>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-8 text-center space-y-2 pointer-events-none opacity-30">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">CertGen Studio © 2026</p>
      </footer>
    </div>
  );
}
