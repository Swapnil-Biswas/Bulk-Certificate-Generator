"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  FileArchive,
  Fingerprint,
  Layers3,
  MousePointer2,
  QrCode,
  ShieldCheck,
  Table2,
  Type,
  Download,
} from "lucide-react";

// Faces used on the sample certificates — the same ones the editor offers.
import "@fontsource/great-vibes";
import "@fontsource/poppins";
import "@fontsource/playfair-display";

import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { Certificate, QrGlyph, type Design } from "@/components/landing/certificate";
import { VerifyLookup } from "@/components/verify-lookup";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText, ScrambleTextPlugin);

/* ───────────────────────── content ───────────────────────── */

const recipients = [
  { name: "Aarav Sharma", track: "Open Innovation" },
  { name: "Sofia Martinez", track: "FinTech" },
  { name: "Mei Tanaka", track: "Climate" },
  { name: "Noah Williams", track: "Health" },
  { name: "Fatima Al-Sayed", track: "Open Innovation" },
  { name: "Lucas Oliveira", track: "Education" },
];

const useCases = [
  "Hackathons",
  "University courses",
  "Bootcamps",
  "Workshops",
  "Conferences",
  "Volunteer programmes",
  "Online courses",
  "Competitions",
  "Internships",
  "Webinars",
];

const galleryA: { design: Design; name: string }[] = [
  { design: "achievement", name: "Emma Johansson" },
  { design: "hackathon", name: "Ravi Patel" },
  { design: "appreciation", name: "Kwame Mensah" },
  { design: "workshop", name: "Chloe Dubois" },
  { design: "achievement", name: "Liam O'Connor" },
  { design: "hackathon", name: "Hana Suzuki" },
];
const galleryB: { design: Design; name: string }[] = [
  { design: "workshop", name: "Mateo Rossi" },
  { design: "appreciation", name: "Isla Campbell" },
  { design: "hackathon", name: "Zara Ahmed" },
  { design: "achievement", name: "Ethan Kim" },
  { design: "workshop", name: "Sofia Martinez" },
  { design: "appreciation", name: "Aarav Sharma" },
];

const fonts = [
  { name: "Great Vibes", family: "'Great Vibes', cursive" },
  { name: "Playfair Display", family: "'Playfair Display', serif" },
  { name: "Poppins", family: "'Poppins', sans-serif" },
];

const SAMPLE_HASH = "9f2c41d7a8e05b3364f1c0de72ab98155e0c6d4fb1a3907e28c5d6f04b7a1e93";

const faqs = [
  {
    q: "What do I need to get started?",
    a: "Two things: your certificate design as an image (PNG or JPG), and a list of the people receiving it. Upload the design, drag a name field into place, import the list, and export.",
  },
  {
    q: "What kind of list can I import?",
    a: "A CSV file with column headers, or a plain text file with one name per line. Every column becomes a placeholder — a “name” column fills {{name}}, a “course” column fills {{course}}, and so on. One certificate is generated per row.",
  },
  {
    q: "How does verification work?",
    a: "When you add a verification QR to a design, every exported certificate gets its own code. Scanning it opens a public page that re-computes the certificate's SHA-256 fingerprint and checks it against the record created at issue. If anything was altered, the check fails.",
  },
  {
    q: "Where does the blockchain come in?",
    a: "Each batch gets a Merkle root — a single fingerprint covering every certificate in it. CertGen is built to anchor that root on the Polygon network, which lets a third party confirm a batch existed without relying on our servers. Fingerprint checks work whether or not a batch is anchored.",
  },
  {
    q: "What can I export?",
    a: "PNG or PDF, at the original resolution of the design you uploaded. Single certificates download directly; bulk exports arrive as one ZIP with a file per recipient, named after them.",
  },
  {
    q: "Why does my account need approval?",
    a: "New accounts are reviewed by an administrator before they can open the editor. It keeps the verification registry trustworthy. You will be able to sign in as soon as your account is approved.",
  },
];

/* ───────────────────────── small pieces ───────────────────────── */

function BrowserFrame({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] ${className}`}
    >
      <div className="flex h-9 items-center gap-2 border-b border-white/[0.07] px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="mx-auto hidden sm:block rounded-md bg-white/[0.05] px-3 py-0.5 font-mono text-[11px] text-white/35">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--mk-accent-soft)]" data-reveal>
      {children}
    </p>
  );
}

function spot(e: React.MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

/* ───────────────────────── page ───────────────────────── */

export default function LandingPage() {
  const root = useRef<HTMLDivElement>(null);
  const liveName = useRef<HTMLSpanElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 1024px)",
          fine: "(pointer: fine)",
        },
        (ctx) => {
          const { motion, desktop, fine } = ctx.conditions as Record<string, boolean>;

          if (!motion) {
            // Content is fully visible without animation.
            gsap.set(q("[data-hero]"), { autoAlpha: 1 });
            return;
          }

          /* Smooth scroll (pointer devices only — touch keeps native momentum). */
          if (fine) {
            ScrollSmoother.create({
              wrapper: "#smooth-wrapper",
              content: "#smooth-content",
              smooth: 1.15,
              effects: true,
            });
          }

          /* Reading progress */
          gsap.to(".mk-progress", {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
          });

          /* ── Hero intro ── */
          gsap.set(q(".hero-title"), { autoAlpha: 1 });
          SplitText.create(q(".hero-title"), {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 115,
                duration: 1.15,
                ease: "power4.out",
                stagger: 0.1,
                delay: 0.1,
              }),
          });
          gsap.fromTo(
            q(".hero-fade"),
            { y: 22, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", stagger: 0.09, delay: 0.55 }
          );
          gsap.fromTo(
            q(".hero-stage"),
            { y: 90, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1.4, ease: "power3.out", delay: 0.75 }
          );
          gsap.fromTo(
            q(".hero-float"),
            { autoAlpha: 0, scale: 0.9 },
            { autoAlpha: 1, scale: 1, duration: 1, ease: "back.out(1.4)", stagger: 0.12, delay: 1.25 }
          );

          /* Hero screenshot: tilted on arrival, flattens as it scrolls into view. */
          gsap.fromTo(
            q(".hero-shot"),
            { rotateX: 24, scale: 0.9 },
            {
              rotateX: 0,
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: q(".hero-stage")[0], start: "top 92%", end: "top 12%", scrub: 0.6 },
            }
          );
          gsap.to(q(".hero-copy"), {
            yPercent: -12,
            autoAlpha: 0.15,
            ease: "none",
            scrollTrigger: { trigger: q(".hero")[0], start: "top top", end: "55% top", scrub: true },
          });

          /* Gentle idle float on hero cards */
          q(".hero-float-inner").forEach((el, i) => {
            gsap.to(el, {
              y: i % 2 ? 14 : -14,
              rotate: i % 2 ? 1.5 : -1.5,
              duration: 3.6 + i * 0.7,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            });
          });

          /* ── Generic reveals ── */
          q("[data-split]").forEach((el) => {
            SplitText.create(el, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(self.lines, {
                  yPercent: 110,
                  duration: 1,
                  ease: "power4.out",
                  stagger: 0.08,
                  scrollTrigger: { trigger: el, start: "top 86%", once: true },
                }),
            });
          });
          q("[data-reveal]").forEach((el) => {
            gsap.from(el, {
              y: 32,
              autoAlpha: 0,
              duration: 0.95,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            });
          });
          q("[data-reveal-group]").forEach((group) => {
            gsap.from(group.children, {
              y: 44,
              autoAlpha: 0,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.09,
              scrollTrigger: { trigger: group, start: "top 84%", once: true },
            });
          });

          /* ── Marquee leans with scroll velocity ── */
          const skewTo = gsap.quickTo(q(".mk-marquee-skew"), "skewX", { duration: 0.5, ease: "power3" });
          ScrollTrigger.create({
            trigger: q(".marquee")[0],
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => skewTo(gsap.utils.clamp(-14, 14, self.getVelocity() / -160)),
          });

          /* ── How it works ── */
          const how = q(".mk-how")[0] as HTMLElement;
          const steps = q(".mk-how-step") as HTMLElement[];
          const panels = q(".mk-how-panel") as HTMLElement[];
          const rows = q(".how-row") as HTMLElement[];
          const counterEl = q(".how-count")[0];
          const nameState = { i: 0 };
          const count = { v: 0 };
          let shown = -1;

          const showName = () => {
            const i = Math.round(nameState.i);
            if (i === shown || !liveName.current) return;
            shown = i;
            liveName.current.textContent = recipients[i].name;
            rows.forEach((row, j) => row.setAttribute("data-on", String(j === i)));
            gsap.fromTo(liveName.current, { autoAlpha: 0.2, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3, overwrite: true });
          };
          const showCount = () => {
            if (counterEl) counterEl.textContent = Math.round(count.v).toLocaleString("en-US");
          };

          if (desktop) {
            how.dataset.pinned = "true";
            const setStep = (i: number) => steps.forEach((s, j) => (s.dataset.active = String(i === j)));
            setStep(0);
            gsap.set(panels.slice(1), { autoAlpha: 0, scale: 0.97 });

            const tl = gsap.timeline({
              defaults: { ease: "power2.inOut" },
              scrollTrigger: {
                trigger: how,
                start: "top top",
                end: "+=2800",
                pin: q(".mk-how-pin")[0],
                scrub: 0.6,
              },
              onUpdate() {
                const t = this.time();
                setStep(t < this.labels.two ? 0 : t < this.labels.three ? 1 : 2);
              },
            });

            tl.to(q(".how-editor-img"), { scale: 1.5, duration: 1 })
              .fromTo(q(".how-cursor"), { xPercent: 600, yPercent: 500, autoAlpha: 0 }, { xPercent: 0, yPercent: 0, autoAlpha: 1, duration: 0.7 }, 0.15)
              .to(q(".how-cursor-ring"), { scale: 1, autoAlpha: 1, duration: 0.2 }, 0.8)
              .addLabel("two")
              .to(panels[0], { autoAlpha: 0, scale: 1.04, duration: 0.3 })
              .to(panels[1], { autoAlpha: 1, scale: 1, duration: 0.3 }, "<")
              .from(q(".how-sheet"), { x: -40, autoAlpha: 0, duration: 0.3 }, "<0.1")
              .to(nameState, { i: recipients.length - 1, duration: 1.1, ease: "none", onUpdate: showName })
              .addLabel("three")
              .to(panels[1], { autoAlpha: 0, scale: 1.04, duration: 0.3 })
              .to(panels[2], { autoAlpha: 1, scale: 1, duration: 0.3 }, "<")
              .from(q(".how-stack-card"), { x: 0, y: 0, rotate: 0, duration: 0.8, stagger: 0.04, ease: "power3.out" })
              .to(count, { v: 412, duration: 0.8, ease: "none", onUpdate: showCount }, "<")
              .fromTo(q(".how-bar"), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "none" }, "<")
              .from(q(".how-done"), { autoAlpha: 0, y: 16, scale: 0.94, duration: 0.25, stagger: 0.08 })
              .to({}, { duration: 0.25 });
            tl.fromTo(q(".how-progress"), { scaleY: 0 }, { scaleY: 1, ease: "none", duration: tl.duration() }, 0);

            showName();
          } else {
            // Stacked layout: each visual plays on its own as it comes into view.
            gsap.to(nameState, {
              i: recipients.length - 1,
              duration: 7,
              ease: "none",
              repeat: -1,
              repeatDelay: 1,
              onUpdate: showName,
              scrollTrigger: { trigger: panels[1], start: "top 80%", toggleActions: "play pause resume pause" },
            });
            gsap.to(count, {
              v: 412,
              duration: 2,
              ease: "power2.out",
              onUpdate: showCount,
              scrollTrigger: { trigger: panels[2], start: "top 75%", once: true },
            });
            gsap.fromTo(
              q(".how-bar"),
              { scaleX: 0 },
              { scaleX: 1, duration: 2, ease: "power2.out", scrollTrigger: { trigger: panels[2], start: "top 75%", once: true } }
            );
            gsap.from(q(".how-stack-card"), {
              x: 0,
              y: 0,
              rotate: 0,
              duration: 1,
              stagger: 0.06,
              ease: "power3.out",
              scrollTrigger: { trigger: panels[2], start: "top 75%", once: true },
            });
          }

          /* ── Gallery rows drift in opposite directions ── */
          gsap.fromTo(
            q(".gallery-a"),
            { xPercent: 0 },
            { xPercent: -18, ease: "none", scrollTrigger: { trigger: q(".gallery")[0], start: "top bottom", end: "bottom top", scrub: 0.5 } }
          );
          gsap.fromTo(
            q(".gallery-b"),
            { xPercent: -18 },
            { xPercent: 0, ease: "none", scrollTrigger: { trigger: q(".gallery")[0], start: "top bottom", end: "bottom top", scrub: 0.5 } }
          );

          /* ── Feature details ── */
          gsap.to(q(".feat-hash"), {
            duration: 2,
            scrambleText: { text: SAMPLE_HASH, chars: "0123456789abcdef", speed: 0.5 },
            scrollTrigger: { trigger: q(".feat-hash")[0], start: "top 88%", once: true },
          });
          gsap.from(q(".feat-font"), {
            yPercent: 60,
            autoAlpha: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: q(".feat-font")[0], start: "top 90%", once: true },
          });
          gsap.fromTo(
            q(".feat-shot"),
            { yPercent: 10 },
            { yPercent: -6, ease: "none", scrollTrigger: { trigger: q(".feat-shot")[0], start: "top bottom", end: "bottom top", scrub: 0.6 } }
          );

          /* ── Verification: checks tick in one by one ── */
          gsap.from(q(".verify-check"), {
            x: -18,
            autoAlpha: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.18,
            scrollTrigger: { trigger: q(".verify-checks")[0], start: "top 82%", once: true },
          });
          gsap.fromTo(
            q(".verify-phone"),
            { y: 60, rotate: 3 },
            { y: -40, rotate: -1, ease: "none", scrollTrigger: { trigger: q(".verify-phone")[0], start: "top bottom", end: "bottom top", scrub: 0.6 } }
          );

          /* ── Dashboard: dark-to-light wipe driven by scroll ── */
          const wipe = gsap.timeline({
            scrollTrigger: { trigger: q(".dash")[0], start: "top 55%", end: "bottom 60%", scrub: 0.6 },
          });
          wipe
            .fromTo(q(".dash-light"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none" })
            .fromTo(q(".dash-handle"), { left: "0%" }, { left: "100%", ease: "none" }, 0);
          gsap.fromTo(
            q(".dash-frame"),
            { scale: 0.92, rotateX: 10 },
            { scale: 1, rotateX: 0, ease: "none", scrollTrigger: { trigger: q(".dash")[0], start: "top 95%", end: "top 35%", scrub: 0.6 } }
          );

          /* ── Closing call to action ── */
          gsap.fromTo(
            q(".cta-glow"),
            { scale: 0.6, autoAlpha: 0.3 },
            { scale: 1.15, autoAlpha: 1, ease: "none", scrollTrigger: { trigger: q(".cta")[0], start: "top bottom", end: "center center", scrub: 0.6 } }
          );

          /* Magnetic primary buttons */
          const cleanups: (() => void)[] = [];
          if (fine) {
            (q(".magnetic") as HTMLElement[]).forEach((el) => {
              const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
              const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
              const move = (e: MouseEvent) => {
                const r = el.getBoundingClientRect();
                xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
                yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
              };
              const leave = () => {
                xTo(0);
                yTo(0);
              };
              el.addEventListener("mousemove", move);
              el.addEventListener("mouseleave", leave);
              cleanups.push(() => {
                el.removeEventListener("mousemove", move);
                el.removeEventListener("mouseleave", leave);
              });
            });
          }

          return () => {
            cleanups.forEach((fn) => fn());
            delete how.dataset.pinned;
            steps.forEach((s) => delete s.dataset.active);
          };
        }
      );
    },
    { scope: root }
  );

  return (
    <div ref={root} className="mk font-sans antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to content
      </a>
      <div
        aria-hidden
        className="mk-progress fixed inset-x-0 top-0 z-[60] h-0.5 origin-left scale-x-0 bg-gradient-to-r from-violet-500 via-violet-300 to-sky-300"
      />
      <SiteNav />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main id="main" className="overflow-x-clip">
            {/* ───────────── Hero ───────────── */}
            <section className="hero relative px-6 pt-36 sm:pt-44">
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="mk-grid-bg absolute inset-0" />
                <div className="mk-aurora-a absolute -top-40 left-1/2 h-[620px] w-[900px] -translate-x-[70%] rounded-full bg-violet-600/25 blur-[140px]" />
                <div className="mk-aurora-b absolute -top-24 left-1/2 h-[520px] w-[720px] translate-x-[5%] rounded-full bg-sky-500/15 blur-[140px]" />
                <div className="mk-noise absolute inset-0" />
              </div>

              <div className="hero-copy relative mx-auto max-w-5xl text-center">
                <div data-hero className="hero-fade inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-2 pr-4 text-sm text-white/70 backdrop-blur">
                  <span className="ml-1.5 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]" />
                  QR verification on every certificate
                </div>

                <h1
                  data-hero
                  className="hero-title mt-7 text-balance text-[clamp(2.75rem,8vw,6.5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
                >
                  One design. Every name. <br className="hidden sm:block" />
                  <span className="font-serif font-normal italic tracking-[-0.02em] text-[var(--mk-accent-soft)]">
                    Verifiably
                  </span>{" "}
                  real.
                </h1>

                <p data-hero className="hero-fade mx-auto mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-[var(--mk-muted)] sm:text-xl">
                  Design a certificate once, drop in your list of names, and export hundreds as PNG or PDF — each with a QR code anyone can scan to confirm it&apos;s genuine.
                </p>

                <div data-hero className="hero-fade mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="magnetic group inline-flex h-13 items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-base font-semibold text-[#0b0b12] shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_20px_60px_-10px_rgba(139,108,255,0.6)] transition-colors hover:bg-violet-100"
                  >
                    Start generating
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="#how"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-base font-medium text-white backdrop-blur transition-colors hover:bg-white/[0.08]"
                  >
                    See how it works
                  </Link>
                </div>

                <p data-hero className="hero-fade mt-5 text-sm text-[var(--mk-dim)]">
                  Works with any certificate design · PNG &amp; PDF · CSV or plain list
                </p>
              </div>

              {/* Product shot */}
              <div data-hero className="hero-stage relative mx-auto mt-16 max-w-6xl sm:mt-20" style={{ perspective: "1800px" }}>
                <div aria-hidden className="absolute -inset-x-10 -top-10 bottom-1/3 rounded-[50%] bg-violet-600/30 blur-[120px]" />
                <div className="hero-shot relative origin-top will-change-transform" style={{ transformStyle: "preserve-3d" }}>
                  <BrowserFrame label="certificategenerator.space/dashboard/certificates">
                    <Image
                      src="/landing/editor-dark.png"
                      alt="The CertGen editor: a certificate design on a canvas with a selected name field and its font, colour and alignment controls."
                      width={2880}
                      height={1800}
                      sizes="(min-width: 1200px) 1152px, 100vw"
                      preload
                      className="block h-auto w-full"
                    />
                  </BrowserFrame>
                </div>

                <div data-speed="1.12" className="hero-float absolute -left-6 top-[18%] hidden w-64 lg:block xl:-left-24">
                  <div className="hero-float-inner rounded-xl border border-white/10 bg-[#0d0d14]/90 p-2 shadow-2xl backdrop-blur">
                    <Certificate design="achievement" name="Emma Johansson" sizes="256px" eager className="rounded-md" />
                  </div>
                </div>
                <div data-speed="1.2" className="hero-float absolute -right-6 top-[46%] hidden w-72 lg:block xl:-right-24">
                  <div className="hero-float-inner flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-[#0d0d14]/90 p-4 shadow-2xl backdrop-blur">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">Certificate is authentic</span>
                      <span className="block font-mono text-[11px] text-white/45">cert_029ed1f1…</span>
                    </span>
                  </div>
                </div>

                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--mk-bg)] to-transparent" />
              </div>
            </section>

            {/* ───────────── Use-case marquee ───────────── */}
            <section className="marquee relative -mt-6 border-y border-white/[0.07] py-6" aria-label="Made for">
              <div className="mk-marquee-skew flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
                <ul className="mk-marquee-track flex shrink-0 items-center">
                  {[...useCases, ...useCases].map((item, i) => (
                    <li
                      key={i}
                      aria-hidden={i >= useCases.length}
                      className="flex items-center whitespace-nowrap px-7 text-lg text-white/45"
                    >
                      {item}
                      <span className="ml-14 h-1.5 w-1.5 rounded-full bg-violet-400/60" />
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* ───────────── How it works ───────────── */}
            <section id="how" className="mk-how relative scroll-mt-24">
              <div className="mk-how-pin mx-auto flex max-w-7xl flex-col justify-center px-6 py-24 lg:h-screen lg:py-0">
                <div className="grid grid-cols-1 items-center gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                  <div className="lg:row-span-4 lg:self-center">
                    <Eyebrow>How it works</Eyebrow>
                    <h2
                      data-split
                      className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl"
                    >
                      From a blank design to a finished batch in three steps.
                    </h2>

                    <div className="relative mt-10 hidden lg:block">
                      <span aria-hidden className="absolute bottom-2 left-[15px] top-2 w-px bg-white/10" />
                      <span aria-hidden className="how-progress absolute bottom-2 left-[15px] top-2 w-px origin-top scale-y-0 bg-gradient-to-b from-violet-400 to-sky-300" />
                      <ol className="space-y-7">
                        {howSteps.map((step, i) => (
                          <li key={step.title} className="mk-how-step relative pl-12">
                            <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[var(--mk-bg)] font-mono text-xs text-white/80">
                              {i + 1}
                            </span>
                            <h3 className="text-xl font-semibold tracking-tight text-white">{step.title}</h3>
                            <div className="mk-how-body">
                              <p className="pt-2 text-base leading-relaxed text-[var(--mk-muted)]">{step.body}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Panel 1 — design */}
                  <StepCaption index={0} />
                  <div className="mk-how-panel lg:col-start-2 lg:row-start-1 lg:row-span-4 lg:self-center">
                    <BrowserFrame label="Editor">
                      <div className="relative overflow-hidden">
                        <Image
                          src="/landing/editor-dark.png"
                          alt="Placing a name field on a certificate in the editor."
                          width={2880}
                          height={1800}
                          sizes="(min-width: 1024px) 700px, 100vw"
                          className="how-editor-img block h-auto w-full"
                          style={{ transformOrigin: "56% 52%" }}
                        />
                        <span aria-hidden className="how-cursor-ring absolute left-[49%] top-[48%] hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 scale-50 rounded-full border-2 border-violet-300/80 opacity-0 lg:block" />
                        <MousePointer2 aria-hidden className="how-cursor absolute left-[49%] top-[48%] hidden h-7 w-7 fill-white text-violet-500 drop-shadow-lg lg:block" />
                      </div>
                    </BrowserFrame>
                  </div>

                  {/* Panel 2 — import */}
                  <StepCaption index={1} />
                  <div className="mk-how-panel relative lg:col-start-2 lg:row-start-1 lg:row-span-4 lg:self-center">
                    <div className="relative pb-16 pl-0 sm:pl-24">
                      <div className="rounded-2xl border border-white/10 bg-[#0d0d14] p-2.5 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]">
                        <Certificate design="hackathon" name={recipients[0].name} nameRef={liveName} className="rounded-lg" />
                      </div>
                      <div className="how-sheet absolute bottom-0 left-0 w-[min(19rem,80%)] overflow-hidden rounded-xl border border-white/10 bg-[#11111a]/95 shadow-2xl backdrop-blur">
                        <div className="flex items-center gap-2 border-b border-white/[0.07] px-3.5 py-2.5 text-xs text-white/60">
                          <Table2 className="h-3.5 w-3.5 text-emerald-300" />
                          <span className="font-mono">participants.csv</span>
                          <span className="ml-auto text-white/35">412 rows</span>
                        </div>
                        <table className="w-full text-left font-mono text-[11px]">
                          <thead>
                            <tr className="text-white/35">
                              <th className="px-3.5 py-1.5 font-normal">name</th>
                              <th className="px-3.5 py-1.5 font-normal">track</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recipients.map((r, i) => (
                              <tr
                                key={r.name}
                                data-on={i === 0}
                                className="how-row border-t border-white/[0.05] text-white/55 transition-colors duration-200 data-[on=true]:bg-violet-500/20 data-[on=true]:text-white"
                              >
                                <td className="px-3.5 py-1.5">{r.name}</td>
                                <td className="px-3.5 py-1.5">{r.track}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Panel 3 — export */}
                  <StepCaption index={2} />
                  <div className="mk-how-panel lg:col-start-2 lg:row-start-1 lg:row-span-4 lg:self-center">
                    <div className="relative mx-auto aspect-[16/11] w-full max-w-2xl">
                      {stack.map((card, i) => (
                        <div key={card.name} className="absolute left-[21%] top-[4%] w-[58%]" style={{ zIndex: i }}>
                          <div
                            className="how-stack-card rounded-xl border border-white/10 bg-[#0d0d14] p-1.5 shadow-2xl"
                            style={{ transform: `translate(${card.x}%, ${card.y}%) rotate(${card.r}deg)` }}
                          >
                            <Certificate design={card.design} name={card.name} sizes="380px" className="rounded-md" />
                          </div>
                        </div>
                      ))}

                      <div className="absolute inset-x-[8%] bottom-0 rounded-2xl border border-white/10 bg-[#11111a]/95 p-4 shadow-2xl backdrop-blur">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-white/70">
                            <FileArchive className="h-4 w-4 text-violet-300" />
                            <span className="font-mono text-xs">certificates_pdf.zip</span>
                          </span>
                          <span className="tabular-nums text-white">
                            <span className="how-count font-semibold">412</span>
                            <span className="text-white/40"> / 412</span>
                          </span>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="how-bar h-full origin-left rounded-full bg-gradient-to-r from-violet-500 to-sky-300" />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="how-done inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                            <Check className="h-3 w-3" /> Export complete
                          </span>
                          <span className="how-done inline-flex items-center gap-1.5 rounded-full bg-violet-400/10 px-2.5 py-1 text-xs font-medium text-violet-200">
                            <QrCode className="h-3 w-3" /> 412 verification pages live
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ───────────── Gallery ───────────── */}
            <section className="gallery relative overflow-hidden py-24 sm:py-32">
              <div className="mx-auto max-w-7xl px-6">
                <Eyebrow>Your design, untouched</Eyebrow>
                <h2 data-split className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
                  Classic or modern, formal or playful — it&apos;s your artwork, with the right name on every copy.
                </h2>
              </div>

              <div className="mt-14 space-y-5" aria-hidden="true">
                {[galleryA, galleryB].map((row, r) => (
                  <div key={r} className={`${r === 0 ? "gallery-a" : "gallery-b"} flex w-max gap-5 pl-6 will-change-transform`}>
                    {row.map((item, i) => (
                      <div
                        key={i}
                        className="w-[72vw] shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] p-2 transition-transform duration-500 hover:-translate-y-1.5 sm:w-[420px]"
                      >
                        <Certificate design={item.design} name={item.name} sizes="420px" className="rounded-lg" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p className="sr-only">
                Sample certificates in four styles — achievement, participation, workshop completion and appreciation — each personalised with a different recipient&apos;s name.
              </p>
            </section>

            {/* ───────────── Features ───────────── */}
            <section id="features" className="relative scroll-mt-24 px-6 py-24 sm:py-32">
              <div className="mx-auto max-w-7xl">
                <div className="max-w-3xl">
                  <Eyebrow>Features</Eyebrow>
                  <h2 data-split className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
                    Everything between &ldquo;we need certificates&rdquo; and &ldquo;they&apos;re sent&rdquo;.
                  </h2>
                </div>

                <div data-reveal-group className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6">
                  {/* Editor */}
                  <article onMouseMove={spot} className="mk-spot overflow-hidden rounded-3xl border border-white/[0.08] bg-[var(--mk-surface)] md:col-span-4">
                    <div className="p-7 sm:p-9">
                      <FeatureIcon><MousePointer2 className="h-5 w-5" /></FeatureIcon>
                      <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">A canvas editor that feels like a design tool</h3>
                      <p className="mt-2.5 max-w-xl text-base leading-relaxed text-[var(--mk-muted)]">
                        Drag fields exactly where they belong. Resize with handles, pick a font and colour, align left, centre or right — what you see on the canvas is what gets exported.
                      </p>
                    </div>
                    <div className="relative ml-7 overflow-hidden rounded-tl-2xl border-l border-t border-white/10 sm:ml-9">
                      <Image
                        src="/landing/editor-dark.png"
                        alt="Editor with field properties: content, font, colour and alignment."
                        width={2880}
                        height={1800}
                        sizes="(min-width: 768px) 800px, 100vw"
                        className="feat-shot block h-auto w-[135%] max-w-none"
                      />
                    </div>
                  </article>

                  {/* Bulk */}
                  <article onMouseMove={spot} className="mk-spot flex flex-col rounded-3xl border border-white/[0.08] bg-[var(--mk-surface)] p-7 sm:p-9 md:col-span-2">
                    <FeatureIcon><Table2 className="h-5 w-5" /></FeatureIcon>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">One row, one certificate</h3>
                    <p className="mt-2.5 text-base leading-relaxed text-[var(--mk-muted)]">
                      Import a CSV or a plain list of names. Every column becomes a placeholder you can drop into the design.
                    </p>
                    <div className="mt-auto pt-8 font-mono text-sm">
                      {["{{name}}", "{{course}}", "{{date}}"].map((p, i) => (
                        <span
                          key={p}
                          className="mb-2 mr-2 inline-block rounded-lg border border-violet-400/25 bg-violet-400/10 px-3 py-1.5 text-violet-200"
                          style={{ transform: `rotate(${[-2, 1.5, -1][i]}deg)` }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </article>

                  {/* QR */}
                  <article onMouseMove={spot} className="mk-spot flex flex-col rounded-3xl border border-white/[0.08] bg-[var(--mk-surface)] p-7 sm:p-9 md:col-span-2">
                    <FeatureIcon><QrCode className="h-5 w-5" /></FeatureIcon>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">A QR code per person</h3>
                    <p className="mt-2.5 text-base leading-relaxed text-[var(--mk-muted)]">
                      Drop a verification QR on the design once. On export, each certificate gets its own code and its own public page.
                    </p>
                    <div className="relative mt-auto w-28 self-start overflow-hidden rounded-xl pt-8">
                      <div className="relative overflow-hidden rounded-xl">
                        <QrGlyph seed={11} className="block h-auto w-full" />
                        <span aria-hidden className="mk-scan absolute inset-x-0 top-0 h-[10%] bg-gradient-to-b from-violet-500/0 via-violet-500/70 to-violet-500/0" />
                      </div>
                    </div>
                  </article>

                  {/* Fingerprint */}
                  <article onMouseMove={spot} className="mk-spot flex flex-col rounded-3xl border border-white/[0.08] bg-[var(--mk-surface)] p-7 sm:p-9 md:col-span-2">
                    <FeatureIcon><Fingerprint className="h-5 w-5" /></FeatureIcon>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">Tamper-evident by design</h3>
                    <p className="mt-2.5 text-base leading-relaxed text-[var(--mk-muted)]">
                      Each certificate is fingerprinted with SHA-256 and rolled into a Merkle root for its batch. Change one character and it no longer matches.
                    </p>
                    <p className="mt-auto pt-8">
                      <span className="feat-hash block break-all rounded-xl border border-white/10 bg-black/40 p-3.5 font-mono text-[11px] leading-relaxed text-emerald-300/90">
                        {SAMPLE_HASH}
                      </span>
                    </p>
                  </article>

                  {/* Fonts */}
                  <article onMouseMove={spot} className="mk-spot flex flex-col rounded-3xl border border-white/[0.08] bg-[var(--mk-surface)] p-7 sm:p-9 md:col-span-2">
                    <FeatureIcon><Type className="h-5 w-5" /></FeatureIcon>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">26 fonts, ready to use</h3>
                    <p className="mt-2.5 text-base leading-relaxed text-[var(--mk-muted)]">
                      Elegant scripts, sturdy serifs and clean sans-serifs — rendered identically on screen and in the export.
                    </p>
                    <div className="mt-auto space-y-1 overflow-hidden pt-8" aria-hidden="true">
                      {fonts.map((f) => (
                        <p key={f.name} className="feat-font truncate text-[1.7rem] leading-tight text-white/85" style={{ fontFamily: f.family }}>
                          {f.name}
                        </p>
                      ))}
                    </div>
                  </article>

                  {/* Templates */}
                  <article onMouseMove={spot} className="mk-spot overflow-hidden rounded-3xl border border-white/[0.08] bg-[var(--mk-surface)] md:col-span-3">
                    <div className="p-7 sm:p-9">
                      <FeatureIcon><Layers3 className="h-5 w-5" /></FeatureIcon>
                      <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">Save it once, reuse it every cohort</h3>
                      <p className="mt-2.5 max-w-lg text-base leading-relaxed text-[var(--mk-muted)]">
                        Templates keep your background and every field position. Next event, open it, import the new list, export.
                      </p>
                    </div>
                    <div className="ml-7 overflow-hidden rounded-tl-2xl border-l border-t border-white/10 sm:ml-9">
                      <Image
                        src="/landing/templates-dark.png"
                        alt="Template library with four saved certificate designs."
                        width={2880}
                        height={1800}
                        sizes="(min-width: 768px) 640px, 100vw"
                        className="block h-auto w-[130%] max-w-none"
                      />
                    </div>
                  </article>

                  {/* Export */}
                  <article onMouseMove={spot} className="mk-spot flex flex-col rounded-3xl border border-white/[0.08] bg-[var(--mk-surface)] p-7 sm:p-9 md:col-span-3">
                    <FeatureIcon><Download className="h-5 w-5" /></FeatureIcon>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">Print-ready exports</h3>
                    <p className="mt-2.5 max-w-lg text-base leading-relaxed text-[var(--mk-muted)]">
                      PNG or PDF at the full resolution of your original artwork. Bulk exports arrive as a single ZIP, each file named after its recipient.
                    </p>
                    <ul className="mt-auto grid grid-cols-2 gap-3 pt-8 font-mono text-xs text-white/70">
                      {["Aarav_Sharma.pdf", "Sofia_Martinez.pdf", "Mei_Tanaka.pdf", "Noah_Williams.pdf"].map((file) => (
                        <li key={file} className="flex items-center gap-2 truncate rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
                          <span className="h-2 w-2 shrink-0 rounded-sm bg-rose-400/80" />
                          <span className="truncate">{file}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </div>
              </div>
            </section>

            {/* ───────────── Verification ───────────── */}
            <section id="verify" className="relative scroll-mt-24 px-6 py-24 sm:py-32">
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/4 mx-auto h-[420px] max-w-4xl rounded-full bg-emerald-500/10 blur-[140px]" />
              <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
                <div>
                  <Eyebrow>Verification</Eyebrow>
                  <h2 data-split className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
                    A certificate people can actually check.
                  </h2>
                  <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--mk-muted)]">
                    Anyone holding a certificate — an employer, a university, the recipient — scans the code and sees, in plain language, whether it&apos;s genuine. No account, no app.
                  </p>

                  <ul className="verify-checks mt-9 space-y-5">
                    {verifyChecks.map((c) => (
                      <li key={c.title} className="verify-check flex gap-4">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span>
                          <span className="block text-base font-medium text-white">{c.title}</span>
                          <span className="block text-base leading-relaxed text-[var(--mk-muted)]">{c.body}</span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div data-reveal className="mt-10 max-w-xl rounded-2xl border border-white/[0.08] bg-[var(--mk-surface)] p-5">
                    <p className="mb-3 text-sm font-medium text-white">Have a certificate? Check it now.</p>
                    <VerifyLookup variant="marketing" />
                  </div>
                </div>

                <div className="relative mx-auto w-full max-w-md" style={{ perspective: "1400px" }}>
                  <div className="verify-phone overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0d14] p-2 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]">
                    <div className="relative overflow-hidden rounded-[1.6rem]">
                      <Image
                        src="/landing/verify-dark.png"
                        alt="Public verification page reading “This certificate is authentic”, with the recipient's name and the checks that passed."
                        width={2880}
                        height={1800}
                        sizes="(min-width: 1024px) 448px, 90vw"
                        className="-ml-[50%] block h-auto w-[200%] max-w-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ───────────── Dashboard ───────────── */}
            <section className="dash relative px-6 py-24 sm:py-32">
              <div className="mx-auto max-w-7xl">
                <div className="mx-auto max-w-3xl text-center">
                  <Eyebrow>Dashboard</Eyebrow>
                  <h2 data-split className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
                    Every batch, template and verification link in one place.
                  </h2>
                  <p data-reveal className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[var(--mk-muted)]">
                    Look up who received what, months later. In dark mode, or light — keep scrolling.
                  </p>
                </div>

                <div className="relative mx-auto mt-14 max-w-6xl" style={{ perspective: "1800px" }}>
                  <div aria-hidden className="absolute inset-x-10 -top-10 bottom-1/2 rounded-[50%] bg-violet-600/20 blur-[120px]" />
                  <div className="dash-frame relative origin-bottom will-change-transform">
                    <BrowserFrame label="certificategenerator.space/dashboard">
                      <div className="relative">
                        <Image
                          src="/landing/dashboard-dark.png"
                          alt="CertGen dashboard showing certificates generated, recent batches and saved templates."
                          width={2880}
                          height={1800}
                          sizes="(min-width: 1200px) 1152px, 100vw"
                          className="block h-auto w-full"
                        />
                        <Image
                          src="/landing/dashboard-light.png"
                          alt=""
                          width={2880}
                          height={1800}
                          sizes="(min-width: 1200px) 1152px, 100vw"
                          className="dash-light absolute inset-0 block h-full w-full"
                          style={{ clipPath: "inset(0 100% 0 0)" }}
                        />
                        <span aria-hidden className="dash-handle absolute inset-y-0 left-0 w-px bg-white/70 shadow-[0_0_24px_4px_rgba(139,108,255,0.7)]" />
                      </div>
                    </BrowserFrame>
                  </div>
                </div>
              </div>
            </section>

            {/* ───────────── FAQ ───────────── */}
            <section id="faq" className="relative scroll-mt-24 px-6 py-24 sm:py-32">
              <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
                <div>
                  <Eyebrow>FAQ</Eyebrow>
                  <h2 data-split className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
                    Questions, answered.
                  </h2>
                  <p data-reveal className="mt-5 text-lg leading-relaxed text-[var(--mk-muted)]">
                    Something else on your mind?{" "}
                    <Link href="/contact" className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white">
                      Get in touch
                    </Link>
                    .
                  </p>
                </div>

                <div data-reveal-group className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                  {faqs.map((faq, i) => {
                    const open = openFaq === i;
                    return (
                      <div key={faq.q}>
                        <h3>
                          <button
                            onClick={() => setOpenFaq(open ? null : i)}
                            aria-expanded={open}
                            aria-controls={`faq-${i}`}
                            className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium text-white transition-colors hover:text-[var(--mk-accent-soft)] sm:text-xl"
                          >
                            {faq.q}
                            <ChevronDown className={`h-5 w-5 shrink-0 text-white/50 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                          </button>
                        </h3>
                        <div id={`faq-${i}`} className="mk-faq-body" data-open={open} inert={!open}>
                          <div>
                            <p className="max-w-2xl pb-7 text-base leading-relaxed text-[var(--mk-muted)]">{faq.a}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ───────────── CTA ───────────── */}
            <section className="cta relative overflow-hidden px-6 py-32 sm:py-44">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="cta-glow absolute left-1/2 top-1/2 h-[560px] w-[min(1100px,120vw)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(139,108,255,0.42),rgba(56,189,248,0.12)_60%,transparent)]" />
                <div className="mk-noise absolute inset-0" />
              </div>
              <div className="relative mx-auto max-w-4xl text-center">
                <h2 data-split className="text-balance text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[1] tracking-[-0.04em] text-white">
                  Your next batch is one{" "}
                  <span className="font-serif font-normal italic tracking-[-0.02em] text-[var(--mk-accent-soft)]">spreadsheet</span>{" "}
                  away.
                </h2>
                <p data-reveal className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/60">
                  Bring a design and a list of names. Leave with a ZIP of certificates, each one verifiable.
                </p>
                <div data-reveal className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="magnetic group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-[#0b0b12] shadow-[0_20px_60px_-10px_rgba(139,108,255,0.7)] transition-colors hover:bg-violet-100"
                  >
                    Create your account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-1.5 px-6 py-4 text-base font-medium text-white/80 transition-colors hover:text-white"
                  >
                    I already have one
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </section>
          </main>

          <SiteFooter />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── section data & helpers ───────────────────────── */

const howSteps = [
  {
    title: "Upload your design",
    body: "Start from any certificate image. Add a text field, drag it where the name goes, and style it — font, colour, alignment.",
  },
  {
    title: "Import your list",
    body: "Drop in a CSV or a list of names. CertGen maps each row onto the design and shows you exactly how it will look.",
  },
  {
    title: "Export the whole batch",
    body: "Download every certificate as PNG or PDF in a single ZIP. Each one carries its own QR code and verification page.",
  },
];

const stack: { design: Design; name: string; x: number; y: number; r: number }[] = [
  { design: "hackathon", name: "Lucas Oliveira", x: -46, y: 4, r: -11 },
  { design: "hackathon", name: "Noah Williams", x: 46, y: 6, r: 10 },
  { design: "hackathon", name: "Mei Tanaka", x: -24, y: -6, r: -5 },
  { design: "hackathon", name: "Sofia Martinez", x: 24, y: -4, r: 5 },
  { design: "hackathon", name: "Aarav Sharma", x: 0, y: -10, r: 0 },
];

const verifyChecks = [
  {
    title: "Details unchanged",
    body: "The name and details still match the fingerprint taken when it was issued.",
  },
  {
    title: "Part of the issued batch",
    body: "The certificate belongs to the batch the issuer actually generated.",
  },
  {
    title: "Clear answer, either way",
    body: "Authentic, revoked or not found — stated plainly, with the evidence underneath.",
  },
];

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[var(--mk-accent-soft)]">
      {children}
    </span>
  );
}

/** Step heading shown above each visual in the stacked (mobile / reduced-motion) layout. */
function StepCaption({ index }: { index: number }) {
  const step = howSteps[index];
  return (
    <div className="mt-6 lg:hidden">
      <p className="font-mono text-xs text-[var(--mk-accent-soft)]">Step {index + 1}</p>
      <h3 className="mt-1.5 text-2xl font-semibold tracking-tight text-white">{step.title}</h3>
      <p className="mt-2 text-base leading-relaxed text-[var(--mk-muted)]">{step.body}</p>
    </div>
  );
}
