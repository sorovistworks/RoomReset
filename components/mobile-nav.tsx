"use client";

import { useRef } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { buttonClass } from "./ui";

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const menu = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    if (menu.current) menu.current.open = false;
  }

  return (
    <details ref={menu} className="group relative md:hidden">
      <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full border border-line" aria-label="Open menu">
        <Menu className="size-5" aria-hidden />
      </summary>
      <nav aria-label="Mobile" className="absolute right-0 top-14 w-64 rounded-2xl border border-line bg-paper p-3 shadow-[0_20px_60px_-20px_rgba(38,35,31,0.25)]">
        {links.map((link) => <Link key={link.href} href={link.href} onClick={closeMenu} className="block rounded-xl px-4 py-3 text-[0.95rem] hover:bg-sand">{link.label}</Link>)}
        <Link href="/discover" onClick={closeMenu} className={buttonClass("primary", "mt-2 w-full")}>Discover my taste</Link>
      </nav>
    </details>
  );
}
