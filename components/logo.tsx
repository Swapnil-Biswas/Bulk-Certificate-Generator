/**
 * The CertGen mark: a "C" drawn as a seal ring, with a check breaking out through its opening.
 * Keep the paths in sync with app/icon.svg (the browser tab icon) so the two stay identical.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M24.42 17.18A8.5 8.5 0 1 1 16.74 7.53" />
        <path d="M11.9 15.9l3.3 3.5 8.9-10.6" />
      </g>
    </svg>
  );
}

export function Logo({ className, iconClassName }: { className?: string, iconClassName?: string }) {
  return (
    <div className={className}>
      <div className={`overflow-hidden rounded-[25%] bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 ring-1 ring-white/10 ${iconClassName || "h-10 w-10"}`}>
        <LogoMark className="h-full w-full text-white" />
      </div>
    </div>
  );
}
