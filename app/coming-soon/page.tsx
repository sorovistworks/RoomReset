import type { Metadata } from "next";
import { ArrowRight, ImageUp, Lock } from "lucide-react";
import { BudgetPlanner } from "@/components/budget-planner";
import { ButtonLink, ComingSoon, Eyebrow, SectionHeading } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";
import { ROOM_INPUTS } from "@/lib/room-inputs";

export const metadata: Metadata = {
  title: "What's coming",
  description: "Personalised rental-room makeovers are in development. Taste DNA and the budget planner are available now.",
};

export default function ComingSoonPage() {
  return (
    <>
      <section id="makeovers" className="wrap scroll-mt-24 pb-14 pt-12 sm:pb-20 sm:pt-20">
        <Eyebrow>What's coming</Eyebrow>
        <h1 className="display mt-5 max-w-3xl text-[clamp(3rem,7vw,5.6rem)]">Your room.<br /><em className="text-clay">Your rules.</em></h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">Photo makeovers are in development. The plan: work with your Taste DNA, your budget and the furniture and fittings you need to keep.</p>
        <div className="mt-8 flex flex-wrap gap-4"><ButtonLink href="/discover">Try Taste DNA now <ArrowRight className="size-4" aria-hidden /></ButtonLink><ButtonLink href="/#room-study" variant="ghost">See the styling concept</ButtonLink></div>
        <ul className="mt-12 grid gap-6 border-y border-line py-7 md:grid-cols-3">
          {[
            ["Photo makeovers", "A style direction for your actual room, with its layout and rental limits."],
            ["Shopping & budget plans", "Pieces sized for your space, with a shopping list in rupees."],
            ["Personal refinements", "Keep more furniture, try other colours or make the room calmer."],
          ].map(([title, body]) => <li key={title}><ComingSoon /><h2 className="mt-4 font-serif text-2xl">{title}</h2><p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p></li>)}
        </ul>
        <details id="room" className="group mt-8 scroll-mt-24 rounded-2xl border border-line bg-paper p-6">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 text-sm font-medium">The room details we'll ask for <span aria-hidden className="group-open:rotate-45">+</span></summary>
          <p className="mb-6 mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">Preview only. Uploads and room submissions are not available yet.</p>
          <fieldset disabled aria-describedby="room-note" className="grid gap-4 sm:grid-cols-2">
            <legend className="sr-only">Room details preview, disabled</legend>
            {ROOM_INPUTS.map((input) => (
              <div key={input.id} className={`rounded-xl border border-line p-4 ${input.kind === "photo" ? "sm:col-span-2" : ""}`}>
                <p className="text-sm font-medium">{input.label}</p><p className="mt-1 text-xs text-ink-soft">{input.hint}</p>
                {input.kind === "photo" && <div className="mt-4 flex items-center gap-3 text-sm text-ink-soft"><ImageUp className="size-5" aria-hidden />Photo uploads open at launch</div>}
                {input.kind === "text" && <input aria-label={input.label} placeholder={input.placeholder} className="mt-4 min-h-11 w-full cursor-not-allowed rounded-xl border border-line bg-ivory px-4 text-sm" />}
                {input.kind === "choice" && <div className="mt-4 flex flex-wrap gap-2">{input.options.map((option) => <span key={option} className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft">{option}</span>)}</div>}
              </div>
            ))}
            <p id="room-note" className="flex items-center gap-2 text-xs text-ink-soft sm:col-span-2"><Lock className="size-3.5" aria-hidden />Nothing here is uploaded, submitted or stored.</p>
          </fieldset>
        </details>
      </section>
      <section id="budget" className="scroll-mt-24 border-y border-line bg-sand/40 py-14 sm:py-20">
        <div className="wrap">
          <SectionHeading eyebrow="Budget planner · available now" title="Give your spending a starting point."><p>A rough split in rupees. Reuse what you can and adjust this guide to your room; these are allocations, not product prices.</p></SectionHeading>
          <div className="mt-9"><BudgetPlanner /></div>
        </div>
      </section>
      <section className="wrap grid gap-9 py-14 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
        <SectionHeading eyebrow="Early access" title="A launch update, when it's ready."><p>Join to hear when you can try a makeover of your own room.</p></SectionHeading>
        <div className="rounded-2xl border border-line bg-paper p-6 sm:p-8"><WaitlistForm /></div>
      </section>
    </>
  );
}
