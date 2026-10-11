import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { Photo as PhotoData } from "@/lib/photos";

type Variant = "primary" | "secondary" | "ghost" | "light";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-ivory hover:bg-[#3a352f]",
  secondary: "border border-ink/80 text-ink hover:bg-ink hover:text-ivory",
  ghost: "text-ink underline-offset-[6px] hover:underline px-0!",
  light: "bg-ivory text-ink hover:bg-white",
};

export const buttonClass = (variant: Variant = "primary", extra = "") =>
  `inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-medium tracking-wide transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${extra}`;

export function ButtonLink({ variant, className = "", ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

export function ComingSoon({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] ${
        tone === "dark" ? "border-clay/40 text-clay" : "border-ivory/40 text-ivory"
      } ${className}`}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      Coming soon
    </span>
  );
}

// Fixed-ratio photo: the wrapper reserves space so images never shift layout while loading.
export function Photo({
  photo,
  sizes,
  className = "",
  imgClassName = "",
  preload,
}: {
  photo: PhotoData;
  sizes: string;
  className?: string;
  imgClassName?: string;
  preload?: boolean;
}) {
  return (
    <div className={`${/\babsolute\b/.test(className) ? "" : "relative"} overflow-hidden bg-sand ${className}`}>
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} preload={preload} className={`object-cover ${imgClassName}`} />
    </div>
  );
}

export function SwatchStrip({ colours, className = "h-3" }: { colours: string[]; className?: string }) {
  return (
    <div className={`flex overflow-hidden rounded-full ${className}`} aria-hidden>
      {colours.map((c) => (
        <span key={c} className="flex-1" style={{ background: c }} />
      ))}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${className}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="display mt-4 text-4xl sm:text-5xl">{title}</h2>
      {children && <div className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">{children}</div>}
    </div>
  );
}
