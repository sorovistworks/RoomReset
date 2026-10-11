import Link from "next/link";
import { SITE } from "@/lib/site";
import { buttonClass } from "./ui";
import { MobileNav } from "./mobile-nav";

const NAV = [
  { href: "/#room-study", label: "The room reset" },
  { href: "/resources", label: "Resources" },
  { href: "/results", label: "My results" },
  { href: "/coming-soon", label: "Coming soon" },
];

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`font-serif text-[1.65rem] leading-none tracking-tight ${className}`} aria-label="RoomReset home">
      Room<span className="italic text-clay">Reset</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ivory/95">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:bg-paper focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="wrap flex h-16 items-center justify-between gap-6">
        <Wordmark />
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm text-ink-soft transition-colors hover:text-ink">
              {n.label}
            </Link>
          ))}
          <Link href="/discover" className={buttonClass("primary", "min-h-10! px-5")}>
            Discover my taste
          </Link>
        </nav>
        <MobileNav links={NAV} />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-sand/60">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Wordmark />
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Your taste. Your rented room. Small changes that feel like home.
          </p>
          <p className="mt-6 text-xs leading-relaxed text-ink-soft">
            Taste DNA answers stay in this browser. Early access collects your email, optional name, source and style if available.
          </p>
        </div>
        <FooterCol
          title="Explore"
          links={[
            ["/discover", "Discover your taste"],
            ["/results", "Your Taste DNA"],
            ["/resources", "Resources"],
            ["/coming-soon", "What's coming"],
            ["/#early-access", "Early access"],
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            ["/contact", "Contact & support"],
            ["/privacy", "Privacy policy"],
            ["/terms", "Terms of use"],
          ]}
        />
      </div>
      <div className="wrap flex flex-col gap-2 border-t border-line py-6 text-xs text-ink-soft sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
        <p>
          Concept imagery &amp; photo <Link href="/terms#image-credits" className="underline underline-offset-4">credits</Link>
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="text-ink-soft transition-colors hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
