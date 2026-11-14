import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

/** Shared frame for sign-in, sign-up and account recovery screens. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mk relative flex min-h-screen flex-col font-sans antialiased">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="mk-grid-bg absolute inset-0" />
        <div className="mk-aurora-a absolute -top-48 left-1/2 h-[560px] w-[820px] -translate-x-[65%] rounded-full bg-violet-600/20 blur-[140px]" />
        <div className="mk-aurora-b absolute -top-32 left-1/2 h-[460px] w-[640px] translate-x-[5%] rounded-full bg-sky-500/10 blur-[140px]" />
        <div className="mk-aurora-c absolute top-48 left-1/2 h-[380px] w-[560px] translate-x-[15%] rounded-full bg-emerald-500/10 blur-[140px]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo iconClassName="h-8 w-8" />
          <span className="text-[17px] font-semibold tracking-tight text-white">CertGen</span>
        </Link>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-16 pt-4">
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="rounded-3xl border border-white/[0.09] bg-[#0d0d14]/80 p-7 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-9">
            <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
            {subtitle && <p className="mt-2 text-sm leading-relaxed text-[var(--mk-muted)]">{subtitle}</p>}
            <div className="mt-7">{children}</div>
          </div>
          {footer && <div className="mt-6 text-center text-sm text-[var(--mk-muted)]">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
