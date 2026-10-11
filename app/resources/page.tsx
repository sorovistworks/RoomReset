import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink, ComingSoon, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Resources for your rented room",
  description: "A practical rental-room checklist and budget planner, with focused ebooks, guides and templates coming soon for Indian renters.",
};

const SHELF = [
  { type: "Checklist", title: "Before you buy anything", description: "A quick room audit. Work out what stays, what gets in the way and what needs attention first.", href: "#room-checklist" },
  { type: "Ebook", title: "The rented-room reset", description: "A planned handbook for making a room feel like home, with changes you can take to your next place." },
  { type: "Guide", title: "Lighting without rewiring", description: "A planned guide to plug-in lamps, useful task light and working with the fittings you already have." },
  { type: "Template", title: "Your room, on a budget", description: "A planned worksheet for measurements, things to keep and a shopping list in rupees." },
];

const CHECKLIST = [
  ["Know your limits", "Check your rental agreement and ask about alterations. Removable adhesives can still lift paint; use existing rods and hooks where possible."],
  ["Measure the real room", "Note the bed, window and furniture sizes. Check door swings, sockets, fan clearance and the route through the room."],
  ["Keep the useful pieces", "A steel almirah, plastic chair or mixed furniture can work. Start by deciding what serves you, rather than replacing it all."],
  ["Clear one surface", "Put away laundry, group chargers and give everyday items a home. Keep damaged or exposed electrical wiring for the landlord or a qualified electrician to address."],
  ["Find the first fix", "Look at the room in daylight and at night. Choose one priority: usable light, storage or textiles that work together."],
  ["Set a spending limit", "Reuse first. List the size and purpose of each purchase, including delivery. Choose washable fabrics suited to your climate and routine."],
];

export default function ResourcesPage() {
  return (
    <>
      <section className="wrap pb-12 pt-12 sm:pb-16 sm:pt-20">
        <Eyebrow>The resource shelf</Eyebrow>
        <h1 className="display mt-5 max-w-3xl text-[clamp(3rem,7vw,5.6rem)]">A little guidance.<br /><em className="text-clay">A room that works.</em></h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">Practical tools for the room you rent. Start with the free checklist; the rest of the shelf is still being made.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SHELF.map((resource, i) => (
            <article key={resource.type} className="flex flex-col rounded-2xl border border-line bg-paper p-6">
              <div className="flex items-center justify-between"><Eyebrow>{resource.type}</Eyebrow><span className="font-serif text-3xl text-clay/70" aria-hidden>0{i + 1}</span></div>
              <h2 className="mt-8 font-serif text-3xl leading-tight">{resource.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{resource.description}</p>
              <div className="mt-auto pt-7">{resource.href
                ? <Link href={resource.href} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-clay underline underline-offset-4">Use the free checklist <ArrowRight className="size-4" aria-hidden /></Link>
                : <ComingSoon />}</div>
            </article>
          ))}
        </div>
      </section>

      <section id="room-checklist" className="scroll-mt-24 border-y border-line bg-paper py-14 sm:py-20" aria-labelledby="checklist-heading">
        <div className="wrap grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div>
            <Eyebrow>Free checklist · available here</Eyebrow>
            <h2 id="checklist-heading" className="display mt-4 text-4xl sm:text-5xl">Before you buy anything.</h2>
            <p className="mt-5 leading-relaxed text-ink-soft">Six checks to help you spend on what the room actually needs. Tick them as you go; ticks are temporary and aren&apos;t saved.</p>
            <p className="mt-5 text-sm text-ink-soft">No download or email required.</p>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {CHECKLIST.map(([title, description], i) => (
              <li key={title} className="py-5">
                <label className="flex cursor-pointer items-start gap-4">
                  <input type="checkbox" className="mt-1 size-5 shrink-0 accent-clay" />
                  <span><span className="block font-medium">{i + 1}. {title}</span><span className="mt-2 block text-sm leading-relaxed text-ink-soft">{description}</span></span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap grid gap-8 py-14 sm:py-20 md:grid-cols-2">
        <div><Eyebrow>Two useful next steps</Eyebrow><h2 className="display mt-4 text-4xl">Make a little room for a plan.</h2></div>
        <div className="space-y-6">
          <div><h3 className="font-serif text-2xl">Know your taste</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">Your free Taste DNA gives you a palette and style direction before you start shopping.</p><ButtonLink href="/discover" variant="ghost" className="mt-2">Find my Taste DNA <ArrowRight className="size-4" aria-hidden /></ButtonLink></div>
          <div><h3 className="font-serif text-2xl">Sketch out your budget</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">Try the existing budget planner for a rough split in rupees. It&apos;s a starting point, not product prices or a room-specific quote.</p><ButtonLink href="/coming-soon#budget" variant="ghost" className="mt-2">Try the budget planner <ArrowRight className="size-4" aria-hidden /></ButtonLink></div>
        </div>
      </section>
    </>
  );
}
