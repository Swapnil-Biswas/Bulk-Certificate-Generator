"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";

const links = [
  { name: "How it works", href: "/#how" },
  { name: "Features", href: "/#features" },
  { name: "Verification", href: "/#verify" },
  { name: "FAQ", href: "/#faq" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Tuck away while reading down the page, return as soon as the visitor scrolls up.
      setHidden(y > 480 && y > last);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-3">
        <nav
          aria-label="Main"
          className={`flex h-14 items-center justify-between rounded-2xl border px-3 sm:px-4 transition-[background-color,border-color,box-shadow] duration-500 ${
            scrolled || open
              ? "border-white/10 bg-[#0b0b12]/80 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
              : "border-transparent bg-transparent"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <Logo iconClassName="h-8 w-8" />
            <span className="text-[17px] font-semibold tracking-tight text-white">CertGen</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/login"
              className="hidden sm:inline-flex rounded-lg px-3.5 py-2 text-sm text-white/70 transition-colors hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="group inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-[#0b0b12] transition hover:bg-violet-100 active:scale-[0.97]"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="md:hidden ml-1 rounded-lg p-2 text-white/80 hover:bg-white/[0.06]"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="md:hidden mt-2 rounded-2xl border border-white/10 bg-[#0b0b12]/95 p-2 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-base text-white/80 hover:bg-white/[0.06] hover:text-white"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-base text-white/80 hover:bg-white/[0.06] hover:text-white"
            >
              Log in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
