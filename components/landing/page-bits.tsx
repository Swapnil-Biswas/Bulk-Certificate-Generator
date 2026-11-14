import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Building blocks for the marketing sub-pages (platform, resources, legal). */

export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="max-w-3xl text-pretty text-lg leading-relaxed text-[var(--mk-muted)] sm:text-xl">{children}</p>;
}

export function CardGrid({
  items,
  columns = 3,
}: {
  items: { icon?: React.ReactNode; title: string; body: React.ReactNode }[];
  columns?: 2 | 3;
}) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${columns === 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"}`}>
      {items.map((item) => (
        <article key={item.title} className="rounded-3xl border border-white/[0.08] bg-[var(--mk-surface)] p-7">
          {item.icon && (
            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[var(--mk-accent-soft)]">
              {item.icon}
            </span>
          )}
          <h3 className="text-lg font-semibold tracking-tight text-white">{item.title}</h3>
          <div className="mt-2 text-[15px] leading-relaxed text-[var(--mk-muted)]">{item.body}</div>
        </article>
      ))}
    </div>
  );
}

export function SectionHeading({ eyebrow, children }: { eyebrow?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 mt-20 first:mt-0">
      {eyebrow && <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--mk-accent-soft)]">{eyebrow}</p>}
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">{children}</h2>
    </div>
  );
}

/** Long-form text (documentation, legal). */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl space-y-5 text-[16px] leading-relaxed text-[var(--mk-muted)] [&_a]:text-white [&_a]:underline [&_a]:decoration-white/30 [&_a]:underline-offset-4 hover:[&_a]:decoration-white [&_code]:rounded [&_code]:bg-white/[0.07] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-violet-200 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-white [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-white [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
      {children}
    </div>
  );
}

export function CodeBlock({ label, children }: { label?: string; children: string }) {
  return (
    <figure className="max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-black/40">
      {label && <figcaption className="border-b border-white/[0.07] px-4 py-2 font-mono text-xs text-white/45">{label}</figcaption>}
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-slate-200">{children}</pre>
    </figure>
  );
}

export function PageCta({
  title = "Ready to make your first batch?",
  body = "Bring a design and a list of names. It takes a few minutes.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="relative mt-24 overflow-hidden rounded-3xl border border-white/[0.08] bg-[var(--mk-surface)] px-7 py-12 text-center sm:py-16">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-64 w-[640px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/25 blur-[100px]" />
      <h2 className="relative text-balance text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">{title}</h2>
      <p className="relative mx-auto mt-3 max-w-md text-[var(--mk-muted)]">{body}</p>
      <Link
        href="/register"
        className="group relative mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-base font-semibold text-[#0b0b12] transition-colors hover:bg-violet-100"
      >
        Create your account
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </section>
  );
}
