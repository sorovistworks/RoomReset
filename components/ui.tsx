import Image from "next/image";
import Link from "next/link";
import { Fragment, type ComponentProps, type CSSProperties, type ReactNode } from "react";
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
  eager,
}: {
  photo: PhotoData;
  sizes: string;
  className?: string;
  imgClassName?: string;
  preload?: boolean;
  eager?: boolean;
}) {
  return (
    <div className={`${/\babsolute\b/.test(className) ? "" : "relative"} overflow-hidden bg-sand ${className}`}>
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} preload={preload} loading={eager ? "eager" : undefined} fetchPriority={eager ? "high" : undefined} className={`object-cover ${imgClassName}`} />
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

// Illustrative CSS room: [wall, rug, sofa, cushion, art, lamp, floor?, door?].
export function MiniRoom({ colours, className = "" }: { colours: string[]; className?: string }) {
  const [wall, rug, sofa, cushion, art, lamp, floor, door] = colours;
  const t = "transition-colors duration-700";
  return (
    <div className={`relative overflow-hidden ${t} ${className}`} style={{ background: wall }} aria-hidden>
      <div className={`absolute inset-x-0 bottom-0 h-[22%] ${floor ? "" : "bg-black/6"}`} style={floor ? { background: floor } : undefined} />
      {door && <div className="absolute bottom-[22%] right-[2%] h-[58%] w-[8%] rounded-t-sm border-2 border-black/10" style={{ background: door }} />}
      <div className={`absolute left-[14%] top-[16%] h-[30%] w-[22%] rounded-sm border-[6px] border-paper ${t}`} style={{ background: art }} />
      <div className="absolute right-[16%] top-[30%] h-[44%] w-0.5 bg-black/30" />
      <div className={`absolute right-[11%] top-[24%] h-[10%] w-[11%] rounded-t-full ${t}`} style={{ background: lamp }} />
      <div className={`absolute bottom-[8%] left-1/2 h-[10%] w-[78%] -translate-x-1/2 rounded-[50%] ${t}`} style={{ background: rug }} />
      <div className={`absolute bottom-[15%] left-[12%] h-[26%] w-[58%] rounded-t-[2.5rem] rounded-b-xl ${t}`} style={{ background: sofa }} />
      <div className={`absolute bottom-[29%] left-[18%] h-[14%] w-[12%] rotate-[-8deg] rounded-xl ${t}`} style={{ background: cushion }} />
      <div className={`absolute bottom-[29%] left-[46%] h-[13%] w-[11%] rotate-6 rounded-xl ${t}`} style={{ background: art }} />
    </div>
  );
}

// Illustrative CSS bedroom: [wall, bedding, frame, throw, art, floor?, door?, curtain].
export function MiniBedroom({ colours, className = "" }: { colours: string[]; className?: string }) {
  const [wall, bedding, frame, accent, art, floor, door, curtain] = colours;
  const t = "transition-colors duration-700";
  return (
    <div className={`relative overflow-hidden ${t} ${className}`} style={{ background: wall }} aria-hidden>
      <div className={`absolute inset-x-0 bottom-0 h-[22%] ${floor ? "" : "bg-black/6"}`} style={floor ? { background: floor } : undefined} />
      {door && <div className="absolute bottom-[22%] left-[2%] h-[58%] w-[8%] rounded-t-sm border-2 border-black/10" style={{ background: door }} />}
      <div className="absolute right-[7%] top-[12%] h-[44%] w-[20%] bg-white/55" />
      <div className={`absolute right-[22%] top-[10%] h-[50%] w-[6%] rounded-b-sm ${t}`} style={{ background: curtain }} />
      <div className={`absolute right-[5%] top-[10%] h-[50%] w-[6%] rounded-b-sm ${t}`} style={{ background: curtain }} />
      <div className="absolute right-[4%] top-[10%] h-[1.5%] w-[26%] bg-black/30" />
      <div className={`absolute left-[27%] top-[13%] h-[18%] w-[18%] rounded-sm border-[5px] border-paper ${t}`} style={{ background: art }} />
      <div className={`absolute bottom-[22%] left-[14%] h-[34%] w-[46%] rounded-t-2xl ${t}`} style={{ background: frame }} />
      <div className="absolute bottom-[34%] left-[18%] h-[9%] w-[17%] rounded-lg bg-paper" />
      <div className="absolute bottom-[34%] left-[39%] h-[9%] w-[17%] rounded-lg bg-paper" />
      <div className={`absolute bottom-[33%] left-[30%] h-[9%] w-[9%] -rotate-6 rounded-lg ${t}`} style={{ background: accent }} />
      <div className={`absolute bottom-[12%] left-[11%] h-[22%] w-[52%] rounded-xl ${t}`} style={{ background: bedding }} />
      <div className={`absolute bottom-[12%] left-[48%] h-[22%] w-[9%] ${t}`} style={{ background: accent }} />
      <div className={`absolute bottom-[8%] left-[12%] h-[5%] w-[50%] rounded-sm ${t}`} style={{ background: frame }} />
      <div className={`absolute bottom-[12%] left-[65%] h-[16%] w-[10%] rounded-sm ${t}`} style={{ background: frame }} />
      <div className="absolute bottom-[28%] left-[69.5%] h-[10%] w-0.5 bg-black/30" />
      <div className={`absolute bottom-[37%] left-[66%] h-[8%] w-[8%] rounded-t-full ${t}`} style={{ background: art }} />
    </div>
  );
}

// Illustrative CSS kitchen: [wall, uppers ("" = open rack), lowers, backsplash, counter, runner, floor?], plus the recommended fridge and container colours.
export function MiniKitchen({ colours, fridge, containers, className = "" }: { colours: string[]; fridge: string; containers: string[]; className?: string }) {
  const [wall, uppers, lowers, splash, counter, runner, floor] = colours;
  const [tin, lid1, lid2] = containers;
  const t = "transition-colors duration-700";
  const doors = (n: number) => Array.from({ length: n }, (_, i) => <span key={i} className="flex-1 border-r border-black/10 last:border-r-0" />);
  return (
    <div className={`relative overflow-hidden ${t} ${className}`} style={{ background: wall }} aria-hidden>
      <div className={`absolute inset-x-0 bottom-0 h-[12%] ${floor ? "" : "bg-black/6"}`} style={floor ? { background: floor } : undefined} />
      {uppers ? (
        <>
          <div className={`absolute left-[6%] top-[9%] flex h-[26%] w-[33%] rounded-sm ${t}`} style={{ background: uppers }}>{doors(2)}</div>
          <div className={`absolute left-[61%] top-[9%] flex h-[26%] w-[15%] rounded-sm ${t}`} style={{ background: uppers }}>{doors(1)}</div>
        </>
      ) : (
        [24, 34].map((top) => <div key={top} className="absolute left-[6%] h-[1.5%] w-[30%] bg-[#C9CBCC]" style={{ top: `${top}%` }} />)
      )}
      <div className="absolute left-[43%] top-[6%] h-[18%] w-[14%] bg-[#C9CBCC]" />
      <div className="absolute left-[39%] top-[24%] h-[9%] w-[22%] bg-[#B7B9BA] [clip-path:polygon(18%_0,82%_0,100%_100%,0_100%)]" />
      <div className={`absolute bottom-[45%] left-[6%] right-[24%] h-[16%] ${t}`} style={{ background: splash }} />
      <div className="absolute bottom-[45.5%] left-[10%] h-[9%] w-[4.5%] rounded-t-md border border-black/10" style={{ background: tin }} />
      {[lid1, lid2].map((lid, i) => (
        <div key={i} className="absolute bottom-[45.5%] flex w-[4.5%] flex-col" style={{ left: `${16 + i * 6}%`, height: i ? "7%" : "10%" }}>
          <span className="h-[22%] rounded-t-sm" style={{ background: lid }} />
          <span className="flex-1 rounded-b-sm border border-black/10 bg-white/60" />
        </div>
      ))}
      <div className="absolute bottom-[45%] left-[42%] h-[1.5%] w-[16%] rounded-sm bg-[#2B2A28]" />
      <div className={`absolute bottom-[42%] left-[4%] right-[23%] h-[3.5%] rounded-sm ${t}`} style={{ background: counter }} />
      <div className={`absolute bottom-[12%] left-[6%] right-[24%] flex h-[30%] ${t}`} style={{ background: lowers }}>{doors(4)}</div>
      <div className="absolute bottom-[12%] right-[4%] flex h-[66%] w-[17%] flex-col rounded-md border border-black/15" style={{ background: fridge }}>
        <span className="relative h-[38%] border-b border-black/15">
          <span className="absolute bottom-[12%] left-[10%] h-[40%] w-[4%] rounded-full bg-black/25" />
        </span>
        <span className="relative flex-1">
          <span className="absolute left-[10%] top-[10%] h-[30%] w-[4%] rounded-full bg-black/25" />
        </span>
      </div>
      <div className={`absolute bottom-[3%] left-[13%] h-[6%] w-[44%] rounded-sm ${t}`} style={{ background: runner }} />
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
      {children && <div data-reveal className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">{children}</div>}
    </div>
  );
}

// Words are pre-split on the server so the heading is complete without JS; the sr-only copy keeps one clean accessible name.
export function SplitWords({ text, start = 0 }: { text: string; start?: number }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden data-split>
        {text.split(" ").map((w, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            <span className="mb-[-0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
              <span data-w className="inline-block" style={{ "--i": start + i } as CSSProperties}>
                {w}
              </span>
            </span>
          </Fragment>
        ))}
      </span>
    </>
  );
}
