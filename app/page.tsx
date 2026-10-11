import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink, Eyebrow, SectionHeading } from "@/components/ui";
import { RoomImage, RoomStudy } from "@/components/room-study";
import { WaitlistForm } from "@/components/waitlist-form";
import { buildProfile } from "@/lib/taste-engine";

const example = buildProfile({
  styles: ["warm-minimalist", "japandi"], moods: ["calm", "cozy"], palettes: ["warm-earthy"],
  avoidColours: [], boldness: 2, materials: ["cotton", "wood"], dislikes: ["clutter"], statement: "quiet",
});

export default function Home() {
  return (
    <>
      <section className="wrap grid items-center gap-10 pb-14 pt-10 sm:pb-20 sm:pt-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <div>
          <Eyebrow className="rise">For rented rooms in India</Eyebrow>
          <h1 className="display rise mt-5 text-[clamp(3rem,6.5vw,5.6rem)]">
            Same room.<br /><em className="text-clay">More you.</em>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
            The tiles stay. The almirah stays. Start with your taste, then make the room you rent feel like yours.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <ButtonLink href="/discover">Find my Taste DNA <ArrowRight className="size-4" aria-hidden /></ButtonLink>
            <Link href="#room-study" className="inline-flex min-h-12 items-center text-sm text-clay underline underline-offset-4">See the room reset</Link>
          </div>
          <p className="mt-5 text-sm text-ink-soft">Free · 8 questions · about 3 minutes</p>
        </div>
        <figure>
          <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
            <RoomImage state="after" preload sizes="(min-width: 1024px) 55vw, 100vw" />
            <p className="absolute bottom-4 left-4 rounded-full bg-paper px-4 py-2 text-xs font-medium">Keep what works. Change how it feels.</p>
          </div>
          <figcaption className="mt-3 text-xs leading-relaxed text-ink-soft">AI-generated styling concept. Your own room makeovers are coming soon.</figcaption>
        </figure>
      </section>

      <RoomStudy />

      <section className="wrap grid gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-20" aria-labelledby="taste-heading">
        <div>
          <SectionHeading eyebrow="Taste DNA · available now" title={<span id="taste-heading">A room that feels like you starts with what you like.</span>}>
            <p>Choose the colours, textures and moods you&apos;re drawn to. Get your style blend, a balanced palette and ideas to take into your room.</p>
          </SectionHeading>
          <ButtonLink href="/discover" className="mt-7">Discover my taste <ArrowRight className="size-4" aria-hidden /></ButtonLink>
          <p className="mt-4 text-sm text-ink-soft">No account needed. Your answers stay in this browser.</p>
        </div>
        <article className="rounded-[1.5rem] border border-line bg-paper p-7 sm:p-9">
          <Eyebrow>One example · your result will be personal</Eyebrow>
          <h3 className="display mt-5 text-4xl">{example.title}</h3>
          <p className="mt-3 text-sm text-ink-soft">{example.styleBlend}</p>
          <ul className="mt-7 grid grid-cols-3 gap-3" aria-label="Example colour palette">
            {example.palette.main.map((swatch) => (
              <li key={swatch.hex}>
                <span className="block h-20 rounded-xl border border-black/10" style={{ background: swatch.hex }} />
                <p className="mt-2 text-xs text-ink-soft">{swatch.name}</p>
              </li>
            ))}
          </ul>
          <p className="mt-7 border-t border-line pt-5 text-sm leading-relaxed text-ink-soft">Try your palette in cotton bedding, curtains and small accents. It doesn&apos;t have to mean painting the walls.</p>
        </article>
      </section>

      <section className="border-y border-line bg-sand/50 py-12 sm:py-16" aria-labelledby="resources-heading">
        <div className="wrap flex flex-col justify-between gap-7 md:flex-row md:items-center">
          <div className="max-w-xl">
            <Eyebrow>The resource shelf</Eyebrow>
            <h2 id="resources-heading" className="display mt-4 text-4xl">Less scrolling. A place to start.</h2>
            <p className="mt-4 leading-relaxed text-ink-soft">A room checklist to use today. Focused ebooks, guides and templates on the way.</p>
          </div>
          <ButtonLink href="/resources" variant="secondary" className="self-start md:shrink-0">Explore resources <ArrowRight className="size-4" aria-hidden /></ButtonLink>
        </div>
      </section>

      <section id="early-access" className="wrap grid scroll-mt-24 gap-9 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16" aria-labelledby="early-heading">
        <div>
          <SectionHeading eyebrow="AI makeovers · coming soon" title={<span id="early-heading">Your own room is next.</span>}>
            <p>We&apos;re building photo makeovers around your taste, the furniture you keep and the changes your rental allows. Join for a launch update.</p>
          </SectionHeading>
          <Link href="/coming-soon" className="mt-5 inline-flex min-h-12 items-center gap-2 text-sm text-clay underline underline-offset-4">What&apos;s coming <ArrowRight className="size-4" aria-hidden /></Link>
        </div>
        <div className="rounded-[1.5rem] border border-line bg-paper p-6 sm:p-8"><WaitlistForm /></div>
      </section>
    </>
  );
}
