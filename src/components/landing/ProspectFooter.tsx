import Link from "next/link";

const links = [
  { href: "https://quelliv.com/about", label: "About" },
  { href: "https://quelliv.com/services", label: "Services" },
  { href: "https://quelliv.com/membership", label: "Membership" },
  { href: "https://quelliv.com/blog", label: "Blog" },
  { href: "https://quelliv.com/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

export default function ProspectFooter() {
  return (
    <footer className="border-t border-quelliv-border/80 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="font-brand text-[1.85rem] leading-none text-[#1a1a1a]">
          Quelliv
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-quelliv-muted">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="hover:text-quelliv-navy"
              {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-center gap-4 text-quelliv-muted">
          <a
            href="https://x.com/quelliv"
            target="_blank"
            rel="noreferrer"
            aria-label="X"
            className="hover:text-quelliv-navy"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.882 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/quelliv"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="hover:text-quelliv-navy"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/company/quelliv"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="hover:text-quelliv-navy"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zM8.5 8.5h3.8v2h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.49V23h-4V8.5z" />
            </svg>
          </a>
        </div>
      </div>
      <div className="pb-8 text-center text-xs text-quelliv-muted/80">
        © {new Date().getFullYear()} Quelliv. All rights reserved.
      </div>
    </footer>
  );
}
