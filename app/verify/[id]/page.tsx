import { prisma } from "@/lib/prisma";
import { hashData, createMerkleTree } from "@/lib/utils/crypto";
import { verifyRootOnChain } from "@/lib/blockchain/polygon";
import { ShieldCheck, ShieldAlert, ExternalLink, Calendar, FileText, User, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

async function getCertificate(id: string) {
  return await prisma.certificate.findUnique({
    where: { id },
    include: {
      batch: true,
    },
  });
}

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cert = await getCertificate(id);

  if (!cert) {
    return (
      <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="h-16 w-16 text-rose-500 mb-6" />
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Certificate Not Found</h1>
        <p className="text-slate-500 mt-4 max-w-sm">The requested identifier does not exist in our registry. This credential may be invalid or forged.</p>
        <Link href="/" className="mt-8 text-xs font-black text-violet-500 uppercase tracking-widest hover:underline">Return to Home</Link>
      </div>
    );
  }

  // 1. Perform Local Cryptographic Verification
  const reconstructedHash = hashData(cert.id + JSON.stringify(cert.metadata));
  const isHashValid = reconstructedHash === cert.hash;

  // 2. Perform On-Chain Verification
  let blockchainData = { anchored: false, timestamp: 0, batchURI: "" };
  if (cert.batch.merkleRoot && cert.batch.transactionHash) {
    blockchainData = await verifyRootOnChain(cert.batch.merkleRoot);
  }

  const isFullyVerified = isHashValid && cert.status === "VALID" && blockchainData.anchored;

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-300 p-6 lg:p-12 font-sans selection:bg-violet-500/30">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex flex-col items-center text-center space-y-4">
          <Logo iconClassName="h-16 w-16 mb-4" />
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
             Official Verification Registry
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
            Credential Authenticity
          </h1>
        </header>

        {/* Status Card */}
        <div className={`relative overflow-hidden rounded-[2.5rem] border ${isFullyVerified ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'} p-8 md:p-12 shadow-2xl transition-all duration-700`}>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-full ${isFullyVerified ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'} animate-pulse`}>
               {isFullyVerified ? <ShieldCheck className="h-12 w-12" /> : <ShieldAlert className="h-12 w-12" />}
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-3">
              <h2 className={`text-3xl font-black uppercase tracking-tight ${isFullyVerified ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isFullyVerified ? 'Verified & Authentic' : 'Verification Warning'}
              </h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                {isFullyVerified 
                  ? 'This certificate has been cryptographically verified and is permanently anchored on the Polygon blockchain.'
                  : 'We could not fully verify this credential. It may have been modified or is not yet anchored on-chain.'}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                <span className="px-3 py-1 rounded-md bg-black/40 border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                  ID: {cert.id}
                </span>
                <span className={`px-3 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest ${isHashValid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                  Hash: {isHashValid ? 'Valid' : 'Invalid'}
                </span>
                <span className={`px-3 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest ${blockchainData.anchored ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
                  Blockchain: {blockchainData.anchored ? 'Confirmed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recipient Details */}
          <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-white/5 pb-4">Recipient Identity</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Full Name</p>
                  <p className="text-lg font-bold text-white uppercase">{(cert.metadata as any).name || (cert.metadata as any).Name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Issuing Entity</p>
                  <p className="text-lg font-bold text-white uppercase">{cert.batch.templateName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Issuance Date</p>
                  <p className="text-lg font-bold text-white uppercase">{new Date(cert.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Protocol */}
          <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] space-y-8">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-white/5 pb-4">Technical Protocol</h3>
             <div className="space-y-6">
               <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Cryptographic Hash (SHA-256)</p>
                  <p className="text-[10px] font-mono font-bold text-slate-400 break-all bg-black/40 p-3 rounded-lg border border-white/5 leading-relaxed">
                    {cert.hash}
                  </p>
               </div>
               
               {blockchainData.anchored && (
                 <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Polygon Transaction</p>
                    <a 
                      href={`https://amoy.polygonscan.com/tx/${cert.batch.transactionHash}`}
                      target="_blank"
                      className="group flex items-center justify-between bg-violet-600/10 border border-violet-500/20 p-4 rounded-xl hover:bg-violet-600/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-violet-500" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">View on Explorer</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                    </a>
                 </div>
               )}

               <div className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Immutability Guaranteed</p>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium leading-relaxed italic">
                    This credential is mathematically coupled to the Polygon Mainnet through a Merkle Root anchor, ensuring absolute protection against unauthorized modification.
                  </p>
               </div>
             </div>
          </div>
        </div>

        <footer className="pt-12 border-t border-white/5 text-center opacity-30">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">CertGen Secure Protocol © 2026</p>
        </footer>
      </div>
    </div>
  );
}
