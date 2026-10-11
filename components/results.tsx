"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Lock, Pencil, RotateCcw, Share2, X } from "lucide-react";
import { PHOTOS } from "@/lib/photos";
import { clearSaved, loadSaved, saveProgress } from "@/lib/storage";
import { buildProfile, decodeAnswers, encodeAnswers, type Swatch } from "@/lib/taste-engine";
import { byId, COLOUR_FAMILIES, MATERIALS, MOODS, STYLES, type Answers } from "@/lib/taste-data";
import { buttonClass, ButtonLink, Eyebrow, Photo } from "./ui";
import { WaitlistForm } from "./waitlist-form";

type View = { kind: "loading" } | { kind: "empty" } | { kind: "partial"; step: number } | { kind: "ready"; answers: Answers; shared: boolean };

export function Results() {
  const [view, setView] = useState<View>({ kind: "loading" });

  useEffect(() => {
    const d = new URLSearchParams(location.search).get("d");
    const shared = d ? decodeAnswers(d) : null;
    if (shared && shared.styles.length) return setView({ kind: "ready", answers: shared, shared: true });
    const saved = loadSaved();
    if (saved?.completed) return setView({ kind: "ready", answers: saved.answers, shared: false });
    if (saved && saved.answers.styles.length) return setView({ kind: "partial", step: saved.step });
    setView({ kind: "empty" });
  }, []);

  if (view.kind === "loading") return <div className="wrap min-h-[60vh] py-24" aria-busy="true" aria-label="Loading your results" />;
  if (view.kind === "empty" || view.kind === "partial") return <EmptyState partial={view.kind === "partial"} />;
  return <Report answers={view.answers} shared={view.shared} />;
}

function EmptyState({ partial }: { partial: boolean }) {
  return (
    <section className="wrap grid min-h-[70vh] items-center gap-12 py-20 lg:grid-cols-2">
      <div>
        <Eyebrow>Your Taste DNA</Eyebrow>
        <h1 className="display mt-5 text-5xl sm:text-6xl">{partial ? "You're part-way there." : "Your results will live here."}</h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
          {partial
            ? "Your answers are saved in this browser. Pick up where you left off — it only takes a couple more minutes."
            : "Answer eight visual questions and we'll reveal your personal style identity, signature palette and design principles. Free, no sign-up."}
        </p>
        <ButtonLink href="/discover" className="mt-10">
          {partial ? "Continue my Taste DNA" : "Discover my taste"} <ArrowRight className="size-4" aria-hidden />
        </ButtonLink>
      </div>
      <Photo photo={PHOTOS.japandi} sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-[4/5] max-h-[70vh] rounded-t-full rounded-b-[2rem]" />
    </section>
  );
}

function Report({ answers, shared }: { answers: Answers; shared: boolean }) {
  const p = useMemo(() => buildProfile(answers), [answers]);
  const primary = byId(STYLES, p.primaryStyle);
  const secondary = byId(STYLES, p.secondaryStyle);
  const swatches = [...p.palette.main, ...p.palette.accents];
  const mats = p.materials.map((m) => ({ ...byId(MATERIALS, m.id), inferred: m.inferred }));

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
            <span className="text-ink-soft">You&apos;re viewing someone&apos;s shared Taste DNA.</span>
            <Link href="/discover" className="font-medium text-clay underline underline-offset-4">
              Discover your own →
            </Link>
          </p>
        </div>
      )}

      {/* A. Identity */}
      <header className="wrap grid gap-12 pb-20 pt-12 sm:pt-16 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-7">
          <Eyebrow className="rise">{shared ? "A shared Taste DNA" : "Your Taste DNA"}</Eyebrow>
          <h1 className="display rise mt-6 text-[clamp(2.8rem,7.5vw,5.8rem)]" style={{ animationDelay: "80ms" }}>
            <span className="block text-[0.42em] tracking-normal text-ink-soft">{shared ? "Their aesthetic:" : "Your aesthetic:"}</span>
            <em>{p.title}</em>
          </h1>
          <p className="rise mt-5 text-lg text-ink-soft" style={{ animationDelay: "160ms" }}>
            {p.styleBlend}
          </p>
          <div className="rise mt-8 max-w-md space-y-3" style={{ animationDelay: "240ms" }}>
            {p.styleMatches.map((m) => (
              <div key={m.id}>
                <div className="flex justify-between text-sm">
                  <span>{m.name}</span>
                  <span className="tabular-nums text-ink-soft">{m.percent}%</span>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-line">
                  <div className="h-1 rounded-full bg-ink" style={{ width: `${m.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
          {!shared && <Actions answers={answers} title={p.title} blend={p.styleBlend} />}
        </div>
        <div className="relative lg:col-span-5">
          <Photo photo={primary.photo} preload sizes="(min-width: 1024px) 34vw, 92vw" className="settle mx-auto aspect-[4/5] max-w-md rounded-t-full rounded-b-[2rem]" />
          <Photo
            photo={secondary.photo}
            sizes="(min-width: 640px) 12rem, 36vw"
            className="absolute -bottom-6 left-0 aspect-square w-[36%] rounded-[1.25rem] border-[6px] border-ivory sm:left-4"
          />
        </div>
      </header>

      <section className="bg-paper py-20 sm:py-24">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>Your personal style identity</Eyebrow>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-soft">
              {p.personality.map((para, i) => (
                <p key={i} className={i === 0 ? "font-serif text-2xl leading-snug text-ink sm:text-[1.7rem]" : ""}>
                  {para}
                </p>
              ))}
            </div>
            {p.balancing.length > 0 && (
              <aside className="mt-10 rounded-2xl border border-line bg-ivory p-6">
                <p className="eyebrow">How we balanced your choices</p>
                <ul className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-ink-soft">
                  {p.balancing.map((n) => (
                    <li key={n} className="flex gap-3">
                      <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-clay" />
                      {n}
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
          <div className="lg:col-span-5">
            <Eyebrow>Your DNA at a glance</Eyebrow>
            <dl className="mt-6 space-y-7">
              <Meter label="Boldness" value={p.boldness} text={p.boldnessLabel} ends={["Quiet", "Bold"]} />
              <Meter label="Contrast" value={p.contrast.level} text={p.contrast.label} ends={["Soft", "Dramatic"]} />
              <Meter label="Decorative density" value={p.density.level} text={p.density.label} ends={["Pared-back", "Abundant"]} />
              <Meter label="Warmth" value={p.warmth.level + 3} text={p.warmth.label} ends={["Cool", "Warm"]} />
            </dl>
            <p className="mt-8 text-sm text-ink-soft">Feels like: {p.moods.map((m) => byId(MOODS, m).name).join(" · ")}</p>
          </div>
        </div>
      </section>

      {/* B. Palette */}
      <section className="wrap py-20 sm:py-28" aria-labelledby="palette">
        <div className="max-w-2xl">
          <Eyebrow>Your signature palette</Eyebrow>
          <h2 id="palette" className="display mt-4 text-4xl sm:text-5xl">
            Colours that feel like you — and work together.
          </h2>
        </div>
        <ul className={`mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 ${swatches.length > 4 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
          {swatches.map((s) => (
            <SwatchCard key={s.hex + s.role} s={s} />
          ))}
        </ul>
        <div className="mt-10" aria-hidden>
          <div className="flex h-5 overflow-hidden rounded-full">
            <span style={{ background: p.palette.main[0].hex, flex: 60 }} />
            <span style={{ background: p.palette.main[1].hex, flex: 30 }} />
            {[p.palette.main[2], ...p.palette.accents].map((s) => (
              <span key={s.hex} style={{ background: s.hex, flex: 10 / (1 + p.palette.accents.length) }} />
            ))}
          </div>
          <div className="mt-2 flex text-xs text-ink-soft">
            <span style={{ flex: 60 }}>≈60%</span>
            <span style={{ flex: 30 }}>≈30%</span>
            <span style={{ flex: 10 }}>≈10%</span>
          </div>
        </div>
        <div className="mt-10 grid gap-5 text-[0.98rem] leading-relaxed text-ink-soft md:grid-cols-2">
          {p.palette.explanation.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      </section>

      {/* C. Materials */}
      <section className="border-y border-line bg-sand/40 py-20 sm:py-28" aria-labelledby="materials">
        <div className="wrap">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
            <div>
              <Eyebrow>Your material story</Eyebrow>
              <h2 id="materials" className="display mt-4 text-4xl sm:text-5xl">
                Textures you&apos;ll want to touch.
              </h2>
            </div>
            <p className="text-[0.98rem] leading-relaxed text-ink-soft">{p.materialStory}</p>
          </div>
          <ul className={`mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 ${mats.length > 4 ? "lg:grid-cols-5" : ""}`}>
            {mats.map((m) => (
              <li key={m.id}>
                <Photo photo={m.photo} sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 46vw" className="aspect-[4/5] rounded-2xl" />
                <p className="mt-3 flex items-center gap-2 font-serif text-xl">
                  {m.name}
                  {m.inferred && <span className="rounded-full border border-line px-2 py-0.5 font-sans text-[0.6rem] uppercase tracking-[0.14em] text-ink-soft">Suggested</span>}
                </p>
                <p className="mt-1 text-sm leading-snug text-ink-soft">{m.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* D + E. Room personality & principles */}
      <section className="wrap grid gap-16 py-20 sm:py-28 lg:grid-cols-12" aria-labelledby="feel">
        <div className="lg:col-span-5">
          <Eyebrow>Your room personality</Eyebrow>
          <p id="feel" className="display mt-5 text-4xl sm:text-[2.8rem]">
            {p.roomFeeling.summary}
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {p.roomFeeling.traits.map((t) => (
              <div key={t.label} className="bg-paper p-5">
                <dt className="eyebrow">{t.label}</dt>
                <dd className="mt-2 font-serif text-xl leading-tight">{t.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-7">
          <Eyebrow>Your design principles</Eyebrow>
          <ol className="mt-6 divide-y divide-line border-y border-line">
            {p.principles.map((pr, i) => (
              <li key={pr.title} className="grid gap-2 py-7 sm:grid-cols-[4rem_1fr]">
                <span className="font-serif text-4xl text-clay/80">0{i + 1}</span>
                <div>
                  <h3 className="font-serif text-2xl">{pr.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{pr.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* F. Avoid */}
      <section className="bg-ink py-20 text-ivory sm:py-24" aria-labelledby="avoid">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-ivory/60!">What to avoid</p>
            <h2 id="avoid" className="display mt-4 text-4xl">
              Knowing what to leave out is half of good taste.
            </h2>
            {p.dislikedColours.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {p.dislikedColours.map((c) => {
                  const fam = COLOUR_FAMILIES.find((f) => f.id === c.id)!;
                  return (
                    <li key={c.id} className="relative flex size-10 overflow-hidden rounded-full border border-ivory/30" title={c.label}>
                      {fam.swatches.map((h) => (
                        <span key={h} className="flex-1" style={{ background: h }} />
                      ))}
                      <span aria-hidden className="absolute left-1/2 top-1/2 h-px w-12 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ivory" />
                      <span className="sr-only">{c.label} avoided</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-ivory/10 bg-ivory/10 sm:grid-cols-2 lg:col-span-8">
            {p.avoid.map((x) => (
              <li key={x} className="flex gap-4 bg-ink p-6 sm:last:odd:col-span-2 text-[0.95rem] leading-relaxed text-ivory/80">
                <X className="mt-1 size-4 shrink-0 text-[#d9a184]" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* G. Moodboard */}
      <section className="wrap py-20 sm:py-28" aria-labelledby="moodboard">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Eyebrow>Your personal moodboard</Eyebrow>
            <h2 id="moodboard" className="display mt-4 text-4xl sm:text-5xl">
              The feeling, gathered in one place.
            </h2>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-ink-soft md:text-right">Inspiration only — composed from our curated image library, not a design of your actual room.</p>
        </div>
        <div className="mt-12 grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[11rem] sm:gap-4 md:grid-cols-4">
          <Photo photo={primary.photo} sizes="(min-width: 768px) 50vw, 100vw" className="col-span-2 row-span-3 rounded-[1.5rem]" />
          <div className="row-span-1 flex flex-col overflow-hidden rounded-[1.5rem]">
            {p.palette.main.map((s) => (
              <span key={s.hex} className="flex-1" style={{ background: s.hex }} />
            ))}
          </div>
          <Photo photo={mats[0].photo} sizes="25vw" className="row-span-2 rounded-[1.5rem]" />
          <div className="flex flex-col justify-between rounded-[1.5rem] p-5" style={{ background: p.palette.accents[0]?.hex ?? p.palette.main[1].hex }}>
            <span className="font-serif text-2xl leading-tight" style={{ color: readableOn(p.palette.accents[0]?.hex ?? p.palette.main[1].hex) }}>
              {p.moods.map((m) => byId(MOODS, m).name).join(" & ")}
            </span>
          </div>
          <Photo photo={secondary.photo} sizes="25vw" className="row-span-2 rounded-[1.5rem]" />
          <Photo photo={(mats[1] ?? mats[0]).photo} sizes="25vw" className="row-span-2 rounded-[1.5rem]" />
          <div className="col-span-2 flex items-end rounded-[1.5rem] p-6" style={{ background: p.palette.main[0].hex }}>
            <p className="font-serif text-2xl italic leading-tight" style={{ color: p.palette.main[2].hex }}>
              {p.title}
            </p>
          </div>
        </div>
      </section>

      {/* H. Future transformation */}
      <section className="bg-paper py-20 sm:py-28" aria-labelledby="future">
        <div className="wrap grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative overflow-hidden rounded-[2rem]">
            <Photo photo={PHOTOS.emptyRoom} sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-[4/3]" imgClassName="scale-105 blur-[3px] grayscale-[35%]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/35 p-6 text-center text-ivory">
              <span className="flex size-14 items-center justify-center rounded-full border border-ivory/60 bg-ink/40">
                <Lock className="size-5" aria-hidden />
              </span>
              <p className="font-serif text-2xl">Your room, in {primary.name}</p>
              <span className="rounded-full bg-ivory/90 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-ink">AI Makeovers — Coming soon</span>
            </div>
            <div className="absolute bottom-4 left-4 flex gap-1.5" aria-hidden>
              {swatches.map((s) => (
                <span key={s.hex} className="size-6 rounded-full border-2 border-ivory" style={{ background: s.hex }} />
              ))}
            </div>
          </div>
          <div>
            <Eyebrow>Your future RoomReset</Eyebrow>
            <h2 id="future" className="display mt-4 text-4xl sm:text-5xl">
              Imagine this style in your actual room.
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

function Actions({ answers, title, blend }: { answers: Answers; title: string; blend: string }) {
  const [shareMsg, setShareMsg] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!confirmReset) return;
    const t = setTimeout(() => setConfirmReset(false), 5000);
    return () => clearTimeout(t);
  }, [confirmReset]);

  async function share() {
    const url = `${location.origin}/results?d=${encodeAnswers(answers)}`;
    const text = `My RoomReset Taste DNA: ${title} — ${blend}. Discover yours:`;
    try {
      if (navigator.share) return await navigator.share({ title: "My Taste DNA", text, url });
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShareMsg("Link copied — it shares your style, never your personal details.");
    } catch (e) {
      if ((e as Error).name !== "AbortError") setShareMsg("Couldn't share automatically. Copy the page address instead.");
    }
  }

  function reset() {
    if (!confirmReset) return setConfirmReset(true);
    clearSaved();
    location.assign("/discover");
  }

  return (
    <div className="rise mt-10" style={{ animationDelay: "320ms" }}>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={share} className={buttonClass("primary", "px-5")}>
          <Share2 className="size-4" aria-hidden /> Share my Taste DNA
        </button>
        <Link href="/discover?step=1" className={buttonClass("secondary", "px-5")}>
          <Pencil className="size-4" aria-hidden /> Edit answers
        </Link>
        <button type="button" onClick={reset} className={buttonClass("ghost", "text-ink-soft")}>
          <RotateCcw className="size-4" aria-hidden /> {confirmReset ? "Tap again to confirm" : "Reset preferences"}
        </button>
      </div>
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-ink-soft">
        {shareMsg || (confirmReset ? "This clears your saved answers from this browser." : "")}
      </p>
    </div>
  );
}

function Meter({ label, value, text, ends }: { label: string; value: number; text: string; ends: [string, string] }) {
  const pct = ((Math.min(5, Math.max(1, value)) - 1) / 4) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <dt className="text-sm">{label}</dt>
        <dd className="font-serif text-xl">{text}</dd>
      </div>
      <div className="relative mt-3 h-px bg-line" aria-hidden>
        <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" style={{ left: `${pct}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[0.7rem] text-ink-soft" aria-hidden>
        <span>{ends[0]}</span>
        <span>{ends[1]}</span>
      </div>
    </div>
  );
}

function SwatchCard({ s }: { s: Swatch }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(s.hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }
  return (
    <li className="overflow-hidden rounded-2xl border border-line bg-paper">
      <div className="aspect-[5/4] sm:aspect-[3/4]" style={{ background: s.hex }} />
      <div className="p-4">
        <p className="eyebrow">{s.role}</p>
        <p className="mt-1.5 font-serif text-xl leading-tight">{s.name}</p>
        <button type="button" onClick={copy} className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs text-ink-soft hover:text-ink" aria-label={`Copy ${s.hex}`}>
          {s.hex} {copied ? <Check className="size-3" aria-hidden /> : <Copy className="size-3" aria-hidden />}
        </button>
        <p className="mt-3 text-xs leading-snug text-ink-soft">{s.usage}</p>
      </div>
    </li>
  );
}

// Pick ink or ivory text, whichever reads better on a swatch.
function readableOn(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#26231f" : "#f7f3ec";
}
