"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Wordmark({ className = "" }: { className?: string }) {
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
      aria-label="RoomReset home"
    >
      Room<span className="italic text-clay">Reset</span>
    </Link>
  );
}
