"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The cushion mark; the button is a hole, so it sits on any background.
const CUSHION = "M26.9 19Q50 24 73.1 19Q84 16 81 26.9Q76 50 81 73.1Q84 84 73.1 81Q50 76 26.9 81Q16 84 19 73.1Q24 50 19 26.9Q16 16 26.9 19ZM54.5 50a4.5 4.5 0 1 0-9 0a4.5 4.5 0 1 0 9 0Z";

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
      className={`inline-flex items-center gap-1.5 font-serif text-[1.65rem] leading-none tracking-tight ${className}`}
      aria-label="Habitaste — home page"
    >
      {mark && (
        <svg viewBox="0 0 100 100" className="size-9 text-terracotta" aria-hidden>
          <path fill="currentColor" fillRule="evenodd" d={CUSHION} />
        </svg>
      )}
      <span>
        Habi<span className="italic text-clay">taste</span>
      </span>
    </Link>
  );
}
