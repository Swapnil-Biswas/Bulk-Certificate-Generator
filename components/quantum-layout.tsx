import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";

/** Shell for the marketing sub-pages (platform, resources, legal, contact). */
export function QuantumLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="mk min-h-screen font-sans antialiased text-slate-200">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="mk-grid-bg absolute inset-0" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[140px]" />
      </div>

      <SiteNav />

      <main className="relative z-10 pt-36 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          {(title || subtitle) && (
            <header className="mb-16 animate-in fade-in slide-in-from-bottom-3 duration-700">
              {subtitle && (
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--mk-accent-soft)]">{subtitle}</p>
              )}
              {title && (
                <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl">
                  {title}
                </h1>
              )}
            </header>
          )}
          {children}
        </div>
      </main>

      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}
