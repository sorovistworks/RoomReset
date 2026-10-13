"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The cushion mark; the button is a hole, so it sits on any background.
const CUSHION = "M16 16Q50 27 84 16Q73 50 84 84Q50 73 16 84Q27 50 16 16ZM54.5 50a4.5 4.5 0 1 0-9 0a4.5 4.5 0 1 0 9 0Z";

export function Wordmark({ className = "", mark = false }: { className?: string; mark?: boolean }) {
  const pathname = usePathname();
  return (
    <Link
      href="/"
      // Next treats a link to the current URL as a no-op, so on the home page scroll back to the top instead.
      onClick={(e) => {
        if (pathname !== "/") return;
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }}
      className={`font-serif text-[1.65rem] leading-none tracking-tight ${className}`}
      aria-label="Habitaste — home page"
    >
      {mark ? (
        <svg viewBox="0 0 100 100" className="size-10 text-terracotta" aria-hidden>
          <path fill="currentColor" fillRule="evenodd" d={CUSHION} />
        </svg>
      ) : (
        <>
          Habi<span className="italic text-clay">taste</span>
        </>
      )}
    </Link>
  );
}
