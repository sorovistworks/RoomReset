"use client";

import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, Check, ClipboardList, Copy, Globe, Lock, Pencil, RotateCcw, Share2, X } from "lucide-react";
import { PHOTOS } from "@/lib/photos";
import { clearSaved, loadSaved, saveProgress } from "@/lib/storage";
import { buildHomePlan, type HomePlan, type Item, type RankedPalette } from "@/lib/home-plan";
import { decodeAnswers, encodeAnswers } from "@/lib/taste-engine";
import { isComplete, type Answers } from "@/lib/taste-data";
import type { Hand } from "@/lib/home-data";
import { buttonClass, ButtonLink, Eyebrow, MiniRoom, Photo } from "./ui";
import { WaitlistForm } from "./waitlist-form";

type View = { kind: "loading" } | { kind: "empty" } | { kind: "partial"; step: number } | { kind: "invalid-share" } | { kind: "ready"; answers: Answers; shared: boolean };

const BUDGET_COLOURS = ["#5C4033", "#B86B4B", "#B5BFA4", "#C19A6B", "#6F7148", "#8C6A55", "#D4B48C"];
const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
// ₹2.2 lakh / ₹85k — short enough to read inside a sentence.
const short = (n: number) => (n >= 100_000 ? `₹${(n / 100_000).toFixed(1).replace(/\.0$/, "")} lakh` : `₹${Math.round(n / 1000)}k`);
const span = ([lo, hi]: [number, number]) => (lo >= 100_000 ? `₹${(lo / 100_000).toFixed(1).replace(/\.0$/, "")}–${short(hi).slice(1)}` : `${short(lo)}–${short(hi).slice(1)}`);
const itemLabel = (item: Item) => `${item.name}${(item.quantity ?? 1) > 1 ? ` × ${item.quantity}` : ""}`;

export function Results() {
  const [view, setView] = useState<View>({ kind: "loading" });

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const fragment = new URLSearchParams(location.hash.replace(/^#/, ""));
    const d = fragment.get("d") ?? query.get("d");
    if (d !== null) {
      const shared = decodeAnswers(d);
      if (!shared || !isComplete(shared)) return setView({ kind: "invalid-share" });
      return setView({ kind: "ready", answers: shared, shared: fragment.get("local") !== "1" });
    }
    const saved = loadSaved();
    if (saved?.completed) return setView({ kind: "ready", answers: saved.answers, shared: false });
    if (saved && saved.answers.styles.length) return setView({ kind: "partial", step: saved.step });
    setView({ kind: "empty" });
  }, []);

  if (view.kind === "loading") return <div className="wrap min-h-[60vh] py-24" aria-busy="true" aria-label="Loading your plan" />;
  if (view.kind === "empty" || view.kind === "partial" || view.kind === "invalid-share") return <EmptyState partial={view.kind === "partial"} invalidShare={view.kind === "invalid-share"} />;
  return <Report answers={view.answers} shared={view.shared} />;
}

function EmptyState({ partial, invalidShare = false }: { partial: boolean; invalidShare?: boolean }) {
  return (
    <section className="wrap grid min-h-[70vh] items-center gap-12 py-20 lg:grid-cols-2">
      <div>
        <Eyebrow>Your home plan</Eyebrow>
        <h1 className="display mt-5 text-5xl sm:text-6xl">{invalidShare ? "This shared link is incomplete." : partial ? "You're part-way there." : "Your plan will live here."}</h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
          {invalidShare
            ? "The answer payload is missing, damaged or from an incompatible version. We have not substituted a different plan from this browser."
            : partial
            ? "Your answers are saved in this browser. Pick up where you left off — it only takes a couple more minutes."
            : "Answer thirteen quick questions and get your top palettes, a material list, what to buy or skip, and a plan for every room. Free, no sign-up."}
        </p>
        <ButtonLink href="/discover" className="mt-10">
          {invalidShare ? "Create my own plan" : partial ? "Continue my plan" : "Plan my home"} <ArrowRight className="size-4" aria-hidden />
        </ButtonLink>
      </div>
      <Photo photo={PHOTOS.japandi} sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-4/5 max-h-[70vh] rounded-t-full rounded-b-4xl" />
    </section>
  );
}

function Report({ answers, shared }: { answers: Answers; shared: boolean }) {
  const p = useMemo(() => buildHomePlan(answers), [answers]);
  const top = p.palettes[0];

  // Keep the stored style id in sync for the waitlist form.
  useEffect(() => {
    if (shared) return;
    const s = loadSaved();
    if (s && s.primaryStyle !== p.primaryStyle) saveProgress({ ...s, primaryStyle: p.primaryStyle });
  }, [shared, p.primaryStyle]);

  return (
    <article>
      {shared && (
        <div className="border-b border-line bg-sand/70">
          <p className="wrap flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-ink-soft">You&apos;re viewing someone&apos;s shared home plan.</span>
            <Link href="/discover" className="font-medium text-clay underline underline-offset-4">
              Plan your own →
            </Link>
          </p>
        </div>
      )}

      {/* Header */}
      <header className="wrap grid gap-12 pb-20 pt-12 sm:pt-16 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-7">
          <Eyebrow className="rise">{shared ? "A shared home plan" : "Your home plan"}</Eyebrow>
          <h1 className="display rise mt-6 text-[clamp(2.6rem,7vw,5.4rem)]" style={{ animationDelay: "80ms" }}>
            Set up around <em>{shared ? "their" : "your"} life</em>, room by room.
          </h1>
          <ul className="rise mt-7 flex flex-wrap gap-2 text-sm" style={{ animationDelay: "160ms" }}>
            {p.summary.map((t) => (
              <li key={t} className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-ink-soft">
                {t}
              </li>
            ))}
          </ul>
          {/* The actions live at the end of the report; up here, invite people to read it first. */}
          <a href="#your-plan" className="rise group mt-10 inline-flex items-center gap-3 text-sm font-medium" style={{ animationDelay: "240ms" }}>
            <span className="flex size-11 items-center justify-center rounded-full border border-ink/70 transition-colors group-hover:bg-ink group-hover:text-ivory">
              <ArrowDown className="nudge size-4" aria-hidden />
            </span>
            {shared ? "Scroll to see their plan" : "Scroll to see your plan"}
          </a>
        </div>
        <figure className="rise lg:col-span-5" style={{ animationDelay: "200ms" }}>
          <MiniRoom colours={top.room} className="aspect-4/3 rounded-4xl" />
          <figcaption className="mt-4 flex items-center justify-between gap-4 text-sm">
            <span>
              <span className="text-ink-soft">Your top palette · </span>
              <span className="font-serif text-xl">{top.palette.name}</span>
            </span>
            <span className="flex gap-1" aria-hidden>
              {top.colours.map((c) => (
                <span key={c.hex} className="size-5 rounded-full border border-black/10" style={{ background: c.hex }} />
              ))}
            </span>
          </figcaption>
        </figure>
      </header>

      {p.constraints.length > 0 && (
        <section className="wrap pb-16" aria-labelledby="constraints">
          <div className="rounded-3xl border border-clay/35 bg-[#f7e8df] p-6 sm:p-8">
            <Eyebrow>Confirm before you buy</Eyebrow>
            <h2 id="constraints" className="mt-3 font-serif text-3xl">The quiz cannot safely infer these details.</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink-soft">
              {p.constraints.map((constraint) => (
                <li key={constraint} className="flex gap-3"><span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-clay" />{constraint}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 1. Palettes */}
      <section id="your-plan" className="scroll-mt-16 bg-paper py-20 sm:py-28" aria-labelledby="palettes">
        <div className="wrap">
          <div className="max-w-2xl">
            <Eyebrow>Your top five palettes</Eyebrow>
            <h2 id="palettes" className="display mt-4 text-4xl sm:text-5xl">
              Chosen from fifty, for your taste, your flat and your weather.
            </h2>
          </div>
          <PaletteHero r={top} />
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {p.palettes.slice(1).map((r, i) => (
              <li key={r.palette.id} className="overflow-hidden rounded-2xl border border-line bg-ivory">
                <MiniRoom colours={r.room} className="aspect-16/10" />
                <div className="p-5">
                  <div className="flex h-3 overflow-hidden rounded-full" aria-hidden>
                    {r.colours.map((c) => (
                      <span key={c.hex} className="flex-1" style={{ background: c.hex }} />
                    ))}
                  </div>
                  <p className="mt-4 flex items-baseline gap-2 font-serif text-2xl leading-tight">
                    <span className="text-base text-clay/80">0{i + 2}</span> {r.palette.name}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">Inspired by {r.palette.inspiredBy}</p>
                  <p className="mt-3 text-sm leading-snug text-ink-soft">{r.why.join(" · ")}</p>
                  <Avoided r={r} />
                </div>
              </li>
            ))}
          </ol>
          {(p.fixtureNotes.length > 0 || p.finishes.length > 0) && (
            <div className="mt-10 grid gap-8 rounded-3xl border border-line bg-ivory p-6 sm:p-8 lg:grid-cols-2">
              {p.fixtureNotes.length > 0 && (
                <div>
                  <h3 className="eyebrow">Working with what&apos;s already there</h3>
                  <ul className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-ink-soft">
                    {p.fixtureNotes.map((n) => (
                      <li key={n} className="flex gap-3">
                        <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-clay" />
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {p.finishes.length > 0 && (
                <div>
                  <h3 className="eyebrow">Finishes we&apos;d choose for you</h3>
                  <ul className="mt-4 space-y-4">
                    {p.finishes.map((f) => (
                      <ColourRow key={f.label} hex={f.hex} title={`${f.label}: ${f.name}`} why={f.why} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. Rooms */}
      <Rooms plan={p} />

      {/* 3. Delegate */}
      <Chores plan={p} />

      {/* 4. Move-in plan */}
      <section className="wrap py-20 sm:py-28" aria-labelledby="movein">
        <div className="max-w-2xl">
          <Eyebrow>Your move-in plan</Eyebrow>
          <h2 id="movein" className="display mt-4 text-4xl sm:text-5xl">
            In the right order, so nothing gets done twice.
          </h2>
        </div>
        <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-3">
          <Stage n="01" title="Before you move in">
            <ul className="space-y-3 text-[0.95rem] leading-relaxed text-ink-soft">
              {p.checks.map((c) => (
                <li key={c} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-clay" />
                  {c}
                </li>
              ))}
            </ul>
          </Stage>
          <Stage n="02" title="First two weeks">
            <StageItems plan={p} verdict="now" />
          </Stage>
          <Stage n="03" title="Months one to three">
            <StageItems plan={p} verdict="later" />
          </Stage>
        </ol>
      </section>

      {/* 5. Budget */}
      <section className="border-y border-line bg-sand/40 py-20 sm:py-24" aria-labelledby="budget">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <Eyebrow>Your budget, split by room</Eyebrow>
            <h2 id="budget" className="display mt-4 text-4xl">
              A ceiling of {inr.format(p.budget.total)}.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">A cost-weighted starting split for “{p.budget.label}”, using the exact ceiling you entered.</p>
            <p className="mt-4 leading-relaxed">
              {p.budget.fit === "fits"
                ? `Your revised buy-now list is about ${span(p.budget.cost.now)}. It stays under the ceiling at the top of the estimate; later items add ${span(p.budget.cost.later)}.`
                : p.budget.fit === "stretch"
                  ? `Your essential buy-now range is ${span(p.budget.cost.now)}. Only its lower end fits ${short(p.budget.total)}, so get written quotes before ordering; later items add ${span(p.budget.cost.later)}.`
                  : `The essentials alone run ${span(p.budget.cost.now)}, above ${short(p.budget.total)}. Start with them, and add the rest as the budget allows.`}
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="flex h-5 overflow-hidden rounded-full" aria-hidden>
              {p.budget.rooms.map((r, i) => (
                <span key={r.id} style={{ flex: r.share, background: BUDGET_COLOURS[i] }} />
              ))}
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-5">
              {p.budget.rooms.map((r, i) => (
                <div key={r.id}>
                  <dt className="flex items-center gap-2 text-xs text-ink-soft">
                    <span aria-hidden className="size-2.5 rounded-full" style={{ background: BUDGET_COLOURS[i] }} />
                    {r.name} · {r.share}%
                  </dt>
                  <dd className="mt-1 font-serif text-2xl tabular-nums">{inr.format(r.amount)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="wrap mt-14">
          <div className="grid gap-10 border-t border-line pt-12 lg:grid-cols-12">
            {p.budget.postpone.length > 0 && (
              <div className="lg:col-span-4">
                <h3 className="eyebrow">Moved to later</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">To keep the buy-now list within your budget, these moved to later. Bring any back if you’d rather spend there first.</p>
                <ul className="mt-5 divide-y divide-line border-y border-line">
                  {p.budget.postpone.map((i) => (
                    <li key={i.name} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                      <span>{itemLabel(i)}</span>
                      <span className="shrink-0 tabular-nums text-ink-soft">{i.cost}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className={`grid gap-10 ${new Set(p.budget.tips.map((t) => t.kind)).size > 1 ? "sm:grid-cols-2" : "max-w-2xl"} ${p.budget.postpone.length ? "lg:col-span-8" : "lg:col-span-12"}`}>
              {(["spend", "save"] as const).map((kind) => {
                const tips = p.budget.tips.filter((t) => t.kind === kind);
                return tips.length ? (
                  <div key={kind}>
                    <h3 className="eyebrow">{kind === "spend" ? "Where to spend" : "Where to save"}</h3>
                    <ul className="mt-5 space-y-4">
                      {tips.map((t) => (
                        <li key={t.text} className="flex gap-4 text-[0.95rem] leading-relaxed">
                          <span aria-hidden className="mt-3 h-px w-5 shrink-0 bg-clay" />
                          {t.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              })}
            </div>
            <p className="text-xs text-ink-soft lg:col-span-12">Ranges remain estimates. Known quantities are multiplied, but the quiz does not ask for window counts, so each per-window curtain line is counted once. Replace installation, delivery and unknown quantities with written quotes.</p>
          </div>
        </div>
      </section>

      <p className="wrap pt-10 text-xs leading-relaxed text-ink-soft">
        Prices are illustrative Indian market ranges, not live quotes, and vary by city, scope and brand. This is general guidance, not a medical or accessibility
        assessment — check permissions and use qualified professionals for electrical, plumbing, structural and individual accessibility work.
      </p>

      {!shared && (
        <section className="wrap pt-16" aria-labelledby="ready">
          <div className="rounded-4xl border border-line bg-paper p-7 sm:p-10">
            <Eyebrow>Your plan, ready to use</Eyebrow>
            <h2 id="ready" className="display mt-4 text-3xl sm:text-4xl">
              Share it, copy the checklist, or fine-tune your answers.
            </h2>
            <Actions answers={answers} plan={p} />
          </div>
        </section>
      )}

      {/* Future */}
      <section className="py-20 sm:py-28" aria-labelledby="future">
        <div className="wrap grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative overflow-hidden rounded-4xl">
            <Photo photo={PHOTOS.emptyRoom} sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-4/3" imgClassName="scale-105 blur-[3px] grayscale-35" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/35 p-6 text-center text-ivory">
              <span className="flex size-14 items-center justify-center rounded-full border border-ivory/60 bg-ink/40">
                <Lock className="size-5" aria-hidden />
              </span>
              <p className="font-serif text-2xl">Your room, in {top.palette.name}</p>
              <span className="rounded-full bg-ivory/90 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-ink">AI Makeovers — Coming soon</span>
            </div>
          </div>
          <div>
            <Eyebrow>Your future RoomReset</Eyebrow>
            <h2 id="future" className="display mt-4 text-4xl sm:text-5xl">
              Imagine this plan in your actual rooms.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">RoomReset AI Makeovers are coming soon. Be among the first to see your space transformed.</p>
            <div className="mt-8">
              <WaitlistForm styleId={shared ? undefined : p.primaryStyle} />
            </div>
            <Link href="/coming-soon" className="mt-6 inline-flex items-center gap-2 text-sm text-ink underline-offset-4 hover:underline">
              Preview what&apos;s coming <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}

function PaletteHero({ r }: { r: RankedPalette }) {
  const roles = [r.wallsFixed ? "Palette foundation · walls stay" : "Walls · ≈60%", "Large pieces · ≈30%", "Wood & depth", "Accent", "Accent"];
  return (
    <div className="mt-12 grid overflow-hidden rounded-3xl border border-line bg-ivory lg:grid-cols-[1fr_1.2fr]">
      <MiniRoom colours={r.room} className="aspect-4/3 lg:aspect-auto" />
      <div className="p-6 sm:p-10">
        <p className="eyebrow">01 · Best match</p>
        <h3 className="display mt-3 text-4xl">{r.palette.name}</h3>
        <p className="mt-1 text-sm text-ink-soft">Inspired by {r.palette.inspiredBy}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {r.why.map((w) => (
            <li key={w} className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft">
              {w}
            </li>
          ))}
        </ul>
        <ul className="mt-8 grid grid-cols-5 gap-2">
          {r.colours.map((c, i) => (
            <SwatchChip key={c.hex} name={c.name} hex={c.hex} role={roles[i]} />
          ))}
        </ul>
        <Avoided r={r} />
      </div>
    </div>
  );
}

function Avoided({ r }: { r: RankedPalette }) {
  if (!r.avoided.length) return null;
  return <p className="mt-3 text-xs text-clay">Includes {r.avoided.join(" and ")}, which you said you&apos;d rather avoid — swap it for a neutral.</p>;
}

function SwatchChip({ name, hex, role }: { name: string; hex: string; role: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }
  return (
    <li>
      <div className="aspect-3/4 rounded-xl border border-black/5" style={{ background: hex }} />
      <p className="mt-2 text-[0.62rem] uppercase leading-tight tracking-[0.12em] text-ink-soft">{role}</p>
      <p className="mt-1 text-sm leading-tight">{name}</p>
      <button type="button" onClick={copy} className="mt-0.5 inline-flex items-center gap-1 font-mono text-[0.68rem] text-ink-soft hover:text-ink" aria-label={`Copy ${hex}`}>
        {hex} {copied ? <Check className="size-3" aria-hidden /> : <Copy className="size-3" aria-hidden />}
      </button>
    </li>
  );
}

function Rooms({ plan }: { plan: HomePlan }) {
  const [tab, setTab] = useState(0);
  const room = plan.rooms[tab];
  const top = plan.palettes[0];

  function onKey(e: KeyboardEvent) {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    const next = (tab + d + plan.rooms.length) % plan.rooms.length;
    setTab(next);
    document.getElementById(`tab-${plan.rooms[next].id}`)?.focus();
  }

  return (
    <section className="wrap py-20 sm:py-28" aria-labelledby="rooms">
      <div className="max-w-2xl">
        <Eyebrow>Room by room</Eyebrow>
        <h2 id="rooms" className="display mt-4 text-4xl sm:text-5xl">
          What to use, buy, skip — and why.
        </h2>
      </div>

      <div role="tablist" aria-label="Rooms" onKeyDown={onKey} className="-mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {plan.rooms.map((r, i) => (
          <button
            key={r.id}
            id={`tab-${r.id}`}
            type="button"
            role="tab"
            aria-selected={i === tab}
            aria-controls="room-panel"
            tabIndex={i === tab ? 0 : -1}
            onClick={() => setTab(i)}
            className={`min-h-11 shrink-0 rounded-full border px-5 text-sm transition ${i === tab ? "border-ink bg-ink text-ivory" : "border-line bg-paper hover:border-ink/40"}`}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div id="room-panel" role="tabpanel" aria-labelledby={`tab-${room.id}`} key={room.id} className="fade mt-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-paper p-5 sm:flex-row sm:items-center sm:p-6">
          <span className="flex shrink-0 gap-1" aria-hidden>
            {top.colours.map((c) => (
              <span key={c.hex} className="size-6 rounded-full border border-black/10" style={{ background: c.hex }} />
            ))}
          </span>
          <p className="text-[0.95rem] leading-relaxed">
            <span className="text-ink-soft">Colour, in {top.palette.name}: </span>
            {room.colourUse}
          </p>
        </div>

        {room.look.length > 0 && (
          <div className="mt-4 rounded-2xl border border-line p-5 sm:p-6">
            <h3 className="eyebrow">The look</h3>
            <ul className="mt-3 space-y-2">
              {room.look.map((t) => (
                <li key={t} className="flex gap-3 text-[0.95rem] leading-relaxed">
                  <span aria-hidden className="mt-3 h-px w-4 shrink-0 bg-clay" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <BuyColumn title="Buy now" note="Needed from day one" items={room.buy.now} tone="now" />
          <BuyColumn title="Buy later" note="Once you've lived in it" items={room.buy.later} tone="later" />
          <BuyColumn title="Skip" note="Not worth it for you" items={room.buy.skip} tone="skip" />
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <div className={`lg:col-span-5 ${room.materials.length ? "" : "hidden"}`}>
            <h3 className="eyebrow">Material priority</h3>
            <ol className="mt-5 divide-y divide-line border-y border-line">
              {room.materials.map((m, i) => (
                <li key={m.name} className="grid grid-cols-[2.25rem_1fr] gap-2 py-4">
                  <span className="font-serif text-2xl text-clay/80">{i + 1}</span>
                  <div>
                    <p className="font-serif text-xl leading-tight">{m.name}</p>
                    <p className="mt-1 text-sm leading-snug text-ink-soft">{m.why}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
            <TipList title="Do" items={room.dos} good />
            <TipList title="Don't" items={room.donts} />
          </div>
        </div>

        {room.id === "kitchen" && (
          <div className="mt-12 rounded-3xl border border-line bg-paper p-6 sm:p-8">
            <h3 className="eyebrow">Fridge and storage colours</h3>
            <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <ColourRow hex={plan.kitchen.fridge.hex} title={`Fridge: ${plan.kitchen.fridge.name}`} why={plan.kitchen.fridge.why} />
              {plan.kitchen.storage.map((s) => (
                <ColourRow key={s.name} hex={s.hex} title={s.name} why={s.why} />
              ))}
            </ul>
            <p className="mt-5 text-sm text-ink-soft">Skip floral or printed fridge doors, and keep open-shelf containers to two finishes at most.</p>
          </div>
        )}

      </div>
    </section>
  );
}

function ColourRow({ hex, title, why }: { hex: string; title: string; why?: string }) {
  return (
    <li className="flex gap-4">
      <span aria-hidden className="size-11 shrink-0 rounded-xl border border-black/10" style={{ background: hex }} />
      <div>
        <p className="text-[0.95rem] font-medium leading-snug">{title}</p>
        {why && <p className="mt-0.5 text-sm leading-snug text-ink-soft">{why}</p>}
      </div>
    </li>
  );
}

function TipList({ title, items, good }: { title: string; items: string[]; good?: boolean }) {
  return (
    <div>
      <h3 className="eyebrow">{title}</h3>
      <ul className="mt-5 space-y-4">
        {items.map((t) => (
          <li key={t} className="flex gap-3 text-[0.95rem] leading-relaxed">
            {good ? <Check className="mt-1 size-4 shrink-0 text-olive" aria-hidden /> : <X className="mt-1 size-4 shrink-0 text-clay" aria-hidden />}
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BuyColumn({ title, note, items, tone }: { title: string; note: string; items: Item[]; tone: "now" | "later" | "skip" }) {
  const box = { now: "border-ink bg-ink text-ivory", later: "border-line bg-paper", skip: "border-dashed border-line bg-transparent" }[tone];
  const soft = tone === "now" ? "text-ivory/70" : "text-ink-soft";
  return (
    <div className={`rounded-3xl border p-6 ${box}`}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-3xl">{title}</h3>
        <span className={`text-xs ${soft}`}>{note}</span>
      </div>
      {items.length ? (
        <ul className={`mt-5 divide-y ${tone === "now" ? "divide-ivory/15" : "divide-line"}`}>
          {items.map((it) => (
            <li key={it.name} className="py-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className={`font-medium ${tone === "skip" ? "line-through decoration-clay/50" : ""}`}>{itemLabel(it)}</p>
                <span className={`shrink-0 text-xs tabular-nums ${soft}`}>{it.cost}</span>
              </div>
              <p className={`mt-1 text-sm leading-snug ${soft}`}>{it.why}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className={`mt-5 text-sm ${soft}`}>Nothing here for you.</p>
      )}
    </div>
  );
}

const HAND: Record<Hand, string> = { help: "Hand to your help", machine: "Let a machine do it", local: "Send it out", you: "Keep it yourself" };

function Chores({ plan }: { plan: HomePlan }) {
  return (
    <section className="bg-ink py-20 text-ivory sm:py-28" aria-labelledby="delegate">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow text-ivory/60!">Delegate the daily grind</p>
            <h2 id="delegate" className="display mt-4 text-4xl sm:text-5xl">
              {plan.choreHeadline}
            </h2>
          </div>
          {plan.hoursFreed > 0 && (
            <p className="lg:col-span-4 lg:text-right">
              <span className="display block text-7xl text-[#d9a184]">{plan.hoursFreed}</span>
              <span className="text-sm text-ivory/70">hours a week back</span>
            </p>
          )}
        </div>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-ivory/10 bg-ivory/10 sm:grid-cols-2 lg:grid-cols-3">
          {plan.chores.map((c) => (
            <li key={c.task} className="flex flex-col bg-ink p-6">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-serif text-2xl">{c.task}</p>
                <span className="text-xs text-ivory/60">~{c.hours} h/week</span>
              </div>
              <p className={`mt-4 self-start rounded-full px-3 py-1 text-xs font-medium ${c.hand === "you" ? "border border-ivory/30 text-ivory/80" : "bg-[#d9a184] text-ink"}`}>{HAND[c.hand]}</p>
              <p className="mt-3 text-sm leading-relaxed text-ivory/80">{c.why}</p>
              <p className="mt-auto pt-4 text-xs text-ivory/60">
                {c.hand === "machine" && c.machine ? `${c.machine.name} · ${c.machine.cost}` : c.help}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stage({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <li className="bg-paper p-7 sm:p-9">
      <span className="font-serif text-5xl text-clay/80">{n}</span>
      <h3 className="mt-5 font-serif text-2xl">{title}</h3>
      <div className="mt-5">{children}</div>
    </li>
  );
}

function StageItems({ plan, verdict }: { plan: HomePlan; verdict: "now" | "later" }) {
  return (
    <dl className="space-y-4">
      {plan.rooms
        .filter((r) => r.buy[verdict].length)
        .map((r) => (
          <div key={r.id}>
            <dt className="eyebrow">{r.name}</dt>
            <dd className="mt-1 text-[0.95rem] leading-relaxed text-ink-soft">{r.buy[verdict].map(itemLabel).join(" · ")}</dd>
          </div>
        ))}
      {plan.otherPurchases[verdict].length > 0 && (
        <div>
          <dt className="eyebrow">Household tools</dt>
          <dd className="mt-1 text-[0.95rem] leading-relaxed text-ink-soft">{plan.otherPurchases[verdict].map(itemLabel).join(" · ")}</dd>
        </div>
      )}
    </dl>
  );
}

function checklistText(plan: HomePlan) {
  const lines = ["My RoomReset home plan", "", "Before moving in:", ...plan.checks.map((c) => `☐ ${c}`), "", "Buy first:"];
  for (const r of plan.rooms) if (r.buy.now.length) lines.push(`${r.name}: ${r.buy.now.map(itemLabel).join(", ")}`);
  if (plan.otherPurchases.now.length) lines.push(`Household tools: ${plan.otherPurchases.now.map(itemLabel).join(", ")}`);
  lines.push("", "Later:");
  for (const r of plan.rooms) if (r.buy.later.length) lines.push(`${r.name}: ${r.buy.later.map(itemLabel).join(", ")}`);
  if (plan.otherPurchases.later.length) lines.push(`Household tools: ${plan.otherPurchases.later.map(itemLabel).join(", ")}`);
  lines.push("", `Top palette: ${plan.palettes[0].palette.name} (${plan.palettes[0].colours.map((c) => c.hex).join(" ")})`);
  return lines.join("\n");
}

function Actions({ answers, plan }: { answers: Answers; plan: HomePlan }) {
  const [msg, setMsg] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmShare, setConfirmShare] = useState(false);

  useEffect(() => {
    if (!confirmReset && !confirmShare) return;
    const t = setTimeout(() => {
      setConfirmReset(false);
      setConfirmShare(false);
    }, 7000);
    return () => clearTimeout(t);
  }, [confirmReset, confirmShare]);

  async function share() {
    if (!confirmShare) {
      setConfirmShare(true);
      setMsg("The link will contain your household, routine, taste and budget answers — but no name or email. Tap Share again to continue.");
      return;
    }
    const url = `${location.origin}${process.env.NEXT_PUBLIC_BASE_PATH}/results#d=${encodeAnswers(answers)}`;
    const text = `My RoomReset home plan — top palette: ${plan.palettes[0].palette.name}. Plan yours:`;
    setConfirmShare(false);
    try {
      if (navigator.share) return await navigator.share({ title: "My home plan", text, url });
      await navigator.clipboard.writeText(`${text} ${url}`);
      setMsg("Link copied — it carries your quiz answers, never your name or email.");
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        history.replaceState(null, "", url);
        setMsg("Sharing failed. The address bar now contains the share link; copy it manually if you still want to send these answers.");
      }
    }
  }

  async function copyChecklist() {
    try {
      await navigator.clipboard.writeText(checklistText(plan));
      setMsg("Checklist copied — paste it into WhatsApp or your notes.");
    } catch {
      setMsg("Couldn't copy automatically on this browser.");
    }
  }

  function reset() {
    if (!confirmReset) return setConfirmReset(true);
    clearSaved();
    location.assign(`${process.env.NEXT_PUBLIC_BASE_PATH}/discover`);
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={share} className={buttonClass("primary", "px-5")}>
          <Share2 className="size-4" aria-hidden /> {confirmShare ? "Share answers in link" : "Share my plan"}
        </button>
        <button type="button" onClick={copyChecklist} className={buttonClass("secondary", "px-5")}>
          <ClipboardList className="size-4" aria-hidden /> Copy checklist
        </button>
        <Link href="/#beyond" className={buttonClass("secondary", "px-5")}>
          <Globe className="size-4" aria-hidden /> Not in India? Vote for your country
        </Link>
        <Link href="/discover?step=1" className={buttonClass("ghost", "")}>
          <Pencil className="size-4" aria-hidden /> Edit answers
        </Link>
        <button type="button" onClick={reset} className={buttonClass("ghost", "text-ink-soft")}>
          <RotateCcw className="size-4" aria-hidden /> {confirmReset ? "Tap again to confirm" : "Reset"}
        </button>
      </div>
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-ink-soft">
        {msg || (confirmReset ? "This clears your saved answers from this browser." : "")}
      </p>
    </div>
  );
}
