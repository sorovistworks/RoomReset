import Link from "next/link";
import { Menu } from "lucide-react";
import { SITE } from "@/lib/site";
import { buttonClass } from "./ui";
import { Wordmark } from "./wordmark";

const NAV = [
  { href: "/discover", label: "Taste DNA" },
  { href: "/results", label: "My results" },
  { href: "/coming-soon", label: "Coming soon" },
  { href: "/#early-access", label: "Early access" },
];


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
        {/* No-JS mobile menu */}
        <details className="group relative md:hidden">
          <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full border border-line" aria-label="Open menu">
            <Menu className="size-5" aria-hidden />
          </summary>
          <nav aria-label="Mobile" className="absolute right-0 top-14 w-64 rounded-2xl border border-line bg-paper p-3 shadow-[0_20px_60px_-20px_rgba(38,35,31,0.25)]">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded-xl px-4 py-3 text-[0.95rem] hover:bg-sand">
                {n.label}
              </Link>
            ))}
            <Link href="/discover" className={buttonClass("primary", "mt-2 w-full")}>
              Discover my taste
            </Link>
          </nav>
        </details>
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
            Personal interior design for people who rent. Discover your Taste DNA today — rental-friendly makeovers are on the way.
          </p>
          <p className="mt-6 text-xs leading-relaxed text-ink-soft">
            Your Taste DNA answers stay in this browser. We only store your email if you join early access, and your country if you vote for it.
          </p>
        </div>
        <FooterCol
          title="Explore"
          links={[
            ["/discover", "Discover your taste"],
            ["/results", "Your Taste DNA"],
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
          Photography by Unsplash contributors — <Link href="/terms#image-credits" className="underline underline-offset-4">credits</Link>
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
