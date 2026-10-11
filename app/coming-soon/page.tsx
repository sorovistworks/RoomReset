import type { Metadata } from "next";
import { ArrowRight, Check, ImageUp, Lock } from "lucide-react";
import { BudgetPlanner } from "@/components/budget-planner";
import { ButtonLink, ComingSoon, Eyebrow, Photo, SectionHeading } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";
import { PHOTOS, RESET_VISUAL } from "@/lib/photos";
import { ROOM_INPUTS } from "@/lib/room-inputs";

export const metadata: Metadata = {
  title: "Coming soon",
  description: "A preview of RoomReset AI makeovers, shop-the-look, budget plans and design refinements — what we're building, shown honestly.",
};

const PRODUCTS = [
  { photo: PHOTOS.lamp, name: "Ceramic table lamp", price: "≈ ₹3,500", why: "A soft, hand-thrown base and linen shade bring warm, low light." },
  { photo: PHOTOS.armchair, name: "Upholstered reading chair", price: "≈ ₹18,000", why: "Rounded, textured and quietly sculptural — a calm hero piece." },
  { photo: PHOTOS.wickerChair, name: "Woven accent chair", price: "≈ ₹9,500", why: "Natural fibre adds lightness and handcrafted texture." },
  { photo: PHOTOS.cushion, name: "Washed linen cushion", price: "≈ ₹1,200", why: "An easy, rental-friendly way to layer your palette." },
];

const REFINEMENTS = ["Make it cozier", "Change the colours", "Make it more minimal", "Add more personality", "Keep more existing furniture"];

const PLAN = [
  ["Weekend 1", "Clear, measure and plan", "Remove what doesn't serve the room and note the pieces you're keeping."],
  ["Weekend 2", "Light it right", "Add two warm lamps at different heights before buying anything else."],
  ["Weekend 3", "Layer the textiles", "Rug, curtains and bedding in your foundation and secondary colours."],
  ["Weekend 4", "Bring in the hero", "One statement piece in your accent colour or favourite material."],
  ["Ongoing", "Style and edit", "Add art, plants and ceramics slowly — and remove anything that crowds the room."],
];

export default function ComingSoonPage() {
  return (
    <>
      <section className="wrap pb-16 pt-14 sm:pt-20">
        <Eyebrow className="rise">Coming soon to RoomReset</Eyebrow>
        <h1 className="display rise mt-6 max-w-4xl text-[clamp(2.8rem,7vw,5.6rem)]" style={{ animationDelay: "80ms" }}>
          The future of your room, <em className="text-clay">previewed honestly.</em>
        </h1>
        <p className="rise mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft" style={{ animationDelay: "160ms" }}>
          The features on this page are not live yet. Here&apos;s exactly what we&apos;re building, and how each one will use your Taste DNA. Taste DNA
          itself is free and available today.
        </p>
        <nav aria-label="On this page" className="rise mt-10 flex flex-wrap gap-2 text-sm" style={{ animationDelay: "240ms" }}>
          {[
            ["#makeovers", "AI makeovers"],
            ["#room", "Room details"],
            ["#shop", "Shop the look"],
            ["#budget", "Budget planner"],
            ["#refine", "Refinements"],
            ["#plan", "Makeover plan"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="rounded-full border border-line px-4 py-2 text-ink-soft transition-colors hover:border-ink hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
      </section>

      {/* A. AI makeover */}
      <section id="makeovers" className="scroll-mt-20 border-t border-line py-20 sm:py-28">
        <div className="wrap">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="AI Makeovers — Coming soon" title="Your own room, reimagined in your style.">
              <p>Upload a photo and RoomReset will show your space restyled around your Taste DNA, your budget and your landlord&apos;s rules.</p>
            </SectionHeading>
            <ComingSoon />
          </div>
          <div className="mt-14 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
            <figure>
              <Photo photo={PHOTOS.emptyRoom} sizes="(min-width: 768px) 45vw, 100vw" className="aspect-4/3 rounded-[1.75rem]" />
              <figcaption className="mt-3 text-sm text-ink-soft">Your room today</figcaption>
            </figure>
            <ArrowRight className="mx-auto size-6 rotate-90 text-clay md:rotate-0" aria-hidden />
            <figure>
              <Photo photo={RESET_VISUAL} sizes="(min-width: 768px) 45vw, 100vw" className="aspect-4/3 rounded-[1.75rem]" />
              <figcaption className="mt-3 text-sm text-ink-soft">Your RoomReset</figcaption>
            </figure>
          </div>
          <p className="mt-6 rounded-2xl border border-line bg-paper px-5 py-3 text-xs leading-relaxed text-ink-soft">
            Illustrative concept only: the second image is an AI visualisation of the same room, made with a general image model for this preview. It is not a RoomReset makeover, and AI makeovers are not available yet.
          </p>
        </div>
      </section>

      {/* Room details preview */}
      <section id="room" className="scroll-mt-20 bg-paper py-20 sm:py-28">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Room details — preview" title="Designed around your real room.">
              <p>Future makeovers will consider everything that makes your space yours. This is a preview of the form — it can&apos;t be filled in yet.</p>
            </SectionHeading>
          </div>
          <fieldset disabled aria-describedby="room-note" className="grid gap-4 opacity-95 sm:grid-cols-2 lg:col-span-8">
            <legend className="sr-only">Room details (preview, disabled)</legend>
            {ROOM_INPUTS.map((input) => (
              <div key={input.id} className={`rounded-2xl border border-line bg-ivory p-5 ${input.kind === "photo" ? "sm:col-span-2" : ""}`}>
                <p className="text-sm font-medium">{input.label}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{input.hint}</p>
                {input.kind === "photo" && (
                  <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line py-10 text-center text-sm text-ink-soft">
                    <ImageUp className="size-6" strokeWidth={1.4} aria-hidden />
                    Photo uploads open at launch
                  </div>
                )}
                {input.kind === "text" && (
                  <input aria-label={input.label} placeholder={input.placeholder} className="mt-4 min-h-11 w-full cursor-not-allowed rounded-full border border-line bg-paper px-4 text-sm" />
                )}
                {input.kind === "choice" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {input.options.map((o) => (
                      <span key={o} className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft">
                        {o}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <p id="room-note" className="flex items-center gap-2 text-xs text-ink-soft sm:col-span-2">
              <Lock className="size-3.5" aria-hidden /> Preview only. Nothing here is uploaded, submitted or stored.
            </p>
          </fieldset>
        </div>
      </section>

      {/* B. Shop the look */}
      <section id="shop" className="wrap scroll-mt-20 py-20 sm:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Shop the look — preview" title="Every piece chosen for a reason.">
            <p>Each recommendation will explain why it suits your palette, materials and room — so you buy less, and better.</p>
          </SectionHeading>
          <p className="max-w-xs text-xs leading-relaxed text-ink-soft md:text-right">Illustrative layout. Product names and prices are examples, not live listings.</p>
        </div>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <li key={p.name} className="flex flex-col overflow-hidden rounded-3xl border border-line bg-paper">
              <Photo photo={p.photo} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw" className="aspect-square" />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-serif text-xl leading-tight">{p.name}</p>
                  <p className="shrink-0 text-sm text-ink-soft">{p.price}</p>
                </div>
                <p className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-ink-soft">Illustrative price</p>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                  <span className="font-medium text-ink">Why it matches: </span>
                  {p.why}
                </p>
                <div className="mt-auto pt-5">
                  <button type="button" disabled className="min-h-11 w-full cursor-not-allowed rounded-full border border-line text-sm text-ink-soft">
                    Shopping opens soon
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* C. Budget */}
      <section id="budget" className="scroll-mt-20 border-y border-line bg-sand/40 py-20 sm:py-28">
        <div className="wrap">
          <SectionHeading eyebrow="Budget planner — try it now" title="Know where your money matters most.">
            <p>A simple, working guide to splitting a rental-makeover budget. Room-specific plans will come with AI makeovers.</p>
          </SectionHeading>
          <div className="mt-12">
            <BudgetPlanner />
          </div>
        </div>
      </section>

      {/* D. Refinements */}
      <section id="refine" className="wrap scroll-mt-20 grid gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
        <SectionHeading eyebrow="Design refinements — coming soon" title="Not quite right? Just say so.">
          <p>After your first makeover, you&apos;ll be able to refine it in plain language until it feels exactly like you. These controls aren&apos;t active yet.</p>
        </SectionHeading>
        <ul className="flex flex-wrap gap-3" aria-label="Future refinement options (not yet available)">
          {REFINEMENTS.map((r) => (
            <li key={r} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-dashed border-line bg-paper px-5 text-[0.95rem] text-ink-soft">
              <Lock className="size-3.5" aria-hidden />
              {r}
            </li>
          ))}
          <li className="basis-full pt-2">
            <ComingSoon />
          </li>
        </ul>
      </section>

      {/* E. Plan */}
      <section id="plan" className="scroll-mt-20 bg-paper py-20 sm:py-28">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Makeover plan — sample" title="A clear path from inspiration to finished room.">
              <p>Personalised step-by-step plans are coming soon. Here&apos;s the kind of guide you&apos;ll receive — a general sample, not tailored to your room.</p>
            </SectionHeading>
          </div>
          <ol className="divide-y divide-line border-y border-line lg:col-span-7">
            {PLAN.map(([when, title, body]) => (
              <li key={title} className="grid grid-cols-[2rem_1fr] gap-4 py-6 sm:grid-cols-[2rem_7rem_1fr]">
                <span aria-hidden className="mt-1 flex size-6 items-center justify-center rounded-md border border-line text-transparent">
                  <Check className="size-3.5" />
                </span>
                <span className="text-sm text-ink-soft sm:pt-0.5">{when}</span>
                <div className="col-start-2 sm:col-start-3">
                  <p className="font-serif text-xl">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Early access */}
      <section className="bg-ink py-20 text-ivory sm:py-28">
        <div className="wrap grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow text-ivory/60!">Early access</p>
            <h2 className="display mt-4 text-4xl sm:text-5xl">Be first in line when makeovers launch.</h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ivory/70">
              Start with your free Taste DNA today, then join the list so we can tailor your invite.
            </p>
            <ButtonLink href="/discover" variant="light" className="mt-8">
              Discover my taste <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
          <div className="rounded-4xl border border-ivory/15 p-7 sm:p-10">
            <WaitlistForm tone="dark" />
          </div>
        </div>
      </section>
    </>
  );
}
