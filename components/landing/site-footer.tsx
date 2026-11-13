import Link from "next/link";
import { Logo } from "@/components/logo";

const groups = [
  {
    title: "Product",
    links: [
      { name: "Studio editor", href: "/platform/studio" },
      { name: "Workflow", href: "/platform/workflow" },
      { name: "Infrastructure", href: "/platform/infrastructure" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Documentation", href: "/resources/documentation" },
      { name: "Security", href: "/resources/security" },
      { name: "Status", href: "/resources/status" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy", href: "/legal/privacy" },
      { name: "Terms", href: "/legal/terms" },
      { name: "Compliance", href: "/legal/compliance" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#07070b]">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Logo iconClassName="h-9 w-9" />
              <span className="text-lg font-semibold tracking-tight text-white">CertGen</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              Design a certificate once. Generate one for everyone on your list. Let anyone verify it.
            </p>
          </div>

          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-sm font-medium text-white">{group.title}</h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-white/50 transition-colors hover:text-white">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.08] pt-6 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CertGen. Made by Swapnil.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="transition-colors hover:text-white">Log in</Link>
            <Link href="/register" className="transition-colors hover:text-white">Create account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
