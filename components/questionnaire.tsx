"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { freshProgress, loadSaved, saveProgress, type Saved } from "@/lib/storage";
import { buildProfile } from "@/lib/taste-engine";
import {
  BOLDNESS_LABELS,
  COLOUR_FAMILIES,
  COLOURS,
  DISLIKES,
  LIMITS,
  MATERIALS,
  MOODS,
  PALETTES,
  STATEMENTS,
  STYLES,
  type Answers,
} from "@/lib/taste-data";
import { buttonClass, Photo } from "./ui";

type ListKey = keyof typeof LIMITS;

const STEPS: { key: keyof Answers; title: string; hint: string; min?: number }[] = [
  { key: "styles", title: "Which interiors feel like you?", hint: "Choose up to three rooms you'd love to walk into. Trust your first instinct.", min: 1 },
  { key: "moods", title: "How should your room make you feel?", hint: "Choose up to two feelings.", min: 1 },
  { key: "palettes", title: "What colours feel like you?", hint: "Choose up to two palette directions.", min: 1 },
  { key: "avoidColours", title: "Which colours would you never want?", hint: "Optional. We'll never put these in your palette — choose up to six.", min: 0 },
  { key: "boldness", title: "How bold is your taste?", hint: "Slide until the room feels most like you." },
  { key: "materials", title: "Which textures attract you?", hint: "Choose the materials you'd love to touch every day — up to five.", min: 1 },
  { key: "dislikes", title: "What do you dislike in a room?", hint: "Optional. Choose any that apply — these help us know what to leave out." },
  { key: "statement", title: "Which statement describes you?", hint: "Pick the one that sounds most like you." },
];

// Mini-room colours for each boldness level (wall, rug, sofa, cushion, art, lamp).
const BOLD_ROOMS = [
  ["#F2EDE4", "#E7DFD2", "#E2D9CB", "#D8CDBB", "#E9E2D6", "#CFC4B3"],
  ["#EFE7DA", "#E0D3BF", "#D6C6AE", "#B5BFA4", "#C9D3D9", "#B8A58A"],
  ["#EDE3D3", "#D8C7AC", "#B89A74", "#B86B4B", "#6F7148", "#8C6A3F"],
  ["#E6D8C3", "#C9A57B", "#2F4538", "#CC9A3B", "#B86B4B", "#3B2A22"],
  ["#1F5F4A", "#F3E7D3", "#E07A5F", "#C99A2E", "#5B2E4F", "#F3E7D3"],
];

export function Questionnaire() {
  const router = useRouter();
  const [s, setS] = useState<Saved | null>(null);
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const saved = loadSaved() ?? freshProgress();
    const q = Number(new URLSearchParams(location.search).get("step"));
    if (Number.isInteger(q) && q >= 1 && q <= 8) saved.step = q - 1;
    setEditing(saved.completed);
    setS(saved);
  }, []);

  useEffect(() => {
    if (s) saveProgress(s);
  }, [s]);

  // Move focus to the new question for keyboard and screen-reader users.
  useEffect(() => {
    if (!s) return;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [s?.step]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!s) return <Skeleton />;

  const a = s.answers;
  const step = STEPS[s.step];
  const set = (patch: Partial<Answers>) => setS({ ...s, answers: { ...a, ...patch }, completed: false });

  function toggle(key: ListKey, id: string) {
    const list = a[key] as string[];
    if (list.includes(id)) {
      setNotice("");
      return set({ [key]: list.filter((x) => x !== id) });
    }
    if (list.length >= LIMITS[key]) return setNotice(`You can choose up to ${LIMITS[key]}. Deselect one to swap it.`);
    setNotice("");
    set({ [key]: [...list, id] });
  }

  const count = Array.isArray(a[step.key]) ? (a[step.key] as string[]).length : 0;
  const valid = step.key === "statement" ? a.statement !== null : step.min ? count >= step.min : true;
  const last = s.step === STEPS.length - 1;

  function go(delta: number) {
    setNotice("");
    if (delta > 0 && !valid) return setNotice(step.min === 1 ? "Choose at least one option to continue." : "Choose an option to continue.");
    if (delta > 0 && last) {
      const primaryStyle = buildProfile(a).primaryStyle;
      saveProgress({ ...s!, completed: true, primaryStyle });
      return router.push("/results");
    }
    setS({ ...s!, step: Math.min(STEPS.length - 1, Math.max(0, s!.step + delta)) });
  }

  const chosen = (key: ListKey, id: string) => (a[key] as string[]).includes(id);
  const atMax = (key: ListKey) => (a[key] as string[]).length >= LIMITS[key];
  const optionState = (key: ListKey, id: string) => {
    const on = chosen(key, id);
    return { on, dim: !on && atMax(key) };
  };

  return (
    <div>
    <div className="wrap min-h-[calc(100svh-9rem)] pb-16 pt-8 sm:pt-12">
      <Progress step={s.step} />
      {editing && (
        <p className="mt-6 rounded-2xl border border-line bg-paper px-5 py-3 text-sm text-ink-soft">
          You&apos;re editing your Taste DNA. Your results update when you finish —{" "}
          <Link href="/results" className="text-clay underline underline-offset-4">
            or go back to your results
          </Link>
          .
        </p>
      )}

      <div key={s.step} className="fade">
        <div className="mt-10 flex flex-col justify-between gap-4 sm:mt-14 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h1 ref={heading} tabIndex={-1} className="display text-[2.4rem] outline-none sm:text-6xl">
              {step.title}
            </h1>
            <p className="mt-4 text-ink-soft sm:text-lg">{step.hint}</p>
          </div>
          {step.key in LIMITS && step.key !== "dislikes" && (
            <p className="shrink-0 text-sm text-ink-soft" aria-live="polite">
              {count} of {LIMITS[step.key as ListKey]} selected
            </p>
          )}
        </div>

        <div className="mt-10">
          {step.key === "styles" && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {STYLES.map((st) => {
                const { on, dim } = optionState("styles", st.id);
                const rank = a.styles.indexOf(st.id) + 1;
                return (
                  <li key={st.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle("styles", st.id)}
                      className={`group w-full text-left transition-opacity ${dim ? "opacity-45" : ""}`}
                    >
                      <span className={`relative block overflow-hidden rounded-2xl ring-offset-4 ring-offset-ivory transition ${on ? "ring-2 ring-ink" : ""}`}>
                        <Photo photo={st.photo} sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 46vw" className="aspect-[4/5]" imgClassName="transition-transform duration-700 group-hover:scale-[1.04]" />
                        <Badge on={on} label={rank ? String(rank) : undefined} />
                      </span>
                      <span className="mt-3 block font-serif text-xl leading-tight">{st.name}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{st.caption}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {step.key === "moods" && (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {MOODS.map((m) => {
                const { on, dim } = optionState("moods", m.id);
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle("moods", m.id)}
                      className={`relative flex aspect-[5/4] w-full flex-col justify-end overflow-hidden rounded-2xl p-5 text-left transition sm:aspect-[4/3] sm:p-6 ${
                        on ? "ring-2 ring-ink ring-offset-4 ring-offset-ivory" : ""
                      } ${dim ? "opacity-45" : ""}`}
                      style={{ background: `linear-gradient(150deg, ${m.tint[0]} 20%, ${m.tint[1]} 130%)` }}
                    >
                      <span className="font-serif text-3xl text-ink sm:text-4xl">{m.name}</span>
                      <span className="mt-1 text-sm text-ink/70">{m.hint}</span>
                      <Badge on={on} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {step.key === "palettes" && (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PALETTES.map((p) => {
                const { on, dim } = optionState("palettes", p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle("palettes", p.id)}
                      className={`relative w-full rounded-2xl border bg-paper p-4 text-left transition ${on ? "border-ink ring-1 ring-ink" : "border-line hover:border-ink/40"} ${
                        dim ? "opacity-45" : ""
                      }`}
                    >
                      <span className="flex h-28 overflow-hidden rounded-xl">
                        {p.colours.map((c) => (
                          <span key={c} className="flex-1" style={{ background: COLOURS[c].hex }} />
                        ))}
                      </span>
                      <span className="mt-4 block font-serif text-2xl">{p.name}</span>
                      <span className="block text-sm text-ink-soft">{p.description}</span>
                      <span className="mt-3 grid grid-cols-5 gap-1 text-[0.62rem] leading-tight text-ink-soft">
                        {p.colours.map((c) => (
                          <span key={c}>
                            <span className="block truncate">{COLOURS[c].name}</span>
                            <span className="font-mono opacity-80">{COLOURS[c].hex}</span>
                          </span>
                        ))}
                      </span>
                      <Badge on={on} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {step.key === "avoidColours" && (
            <ul className="flex flex-wrap gap-3">
              {COLOUR_FAMILIES.map((f) => {
                const { on, dim } = optionState("avoidColours", f.id);
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle("avoidColours", f.id)}
                      className={`inline-flex min-h-12 items-center gap-3 rounded-full border py-2 pl-2 pr-5 text-sm transition ${
                        on ? "border-ink bg-ink text-ivory" : "border-line bg-paper hover:border-ink/40"
                      } ${dim ? "opacity-45" : ""}`}
                    >
                      <span className="relative flex">
                        {f.swatches.map((c, i) => (
                          <span key={c} className={`size-7 rounded-full border-2 ${on ? "border-ink" : "border-paper"} ${i ? "-ml-2.5" : ""}`} style={{ background: c }} />
                        ))}
                        {on && <X className="absolute inset-0 m-auto size-4 text-ivory drop-shadow" aria-hidden />}
                      </span>
                      {f.label}
                      <span className="sr-only">{on ? "(avoided)" : ""}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {step.key === "boldness" && <Boldness value={a.boldness} onChange={(b) => set({ boldness: b })} />}

          {step.key === "materials" && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {MATERIALS.map((m) => {
                const { on, dim } = optionState("materials", m.id);
                return (
                  <li key={m.id}>
                    <button type="button" aria-pressed={on} onClick={() => toggle("materials", m.id)} className={`group w-full text-left transition-opacity ${dim ? "opacity-45" : ""}`}>
                      <span className={`relative block overflow-hidden rounded-2xl ring-offset-4 ring-offset-ivory ${on ? "ring-2 ring-ink" : ""}`}>
                        <Photo photo={m.photo} sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 46vw" className="aspect-square" imgClassName="transition-transform duration-700 group-hover:scale-[1.05]" />
                        <Badge on={on} />
                      </span>
                      <span className="mt-3 block font-serif text-xl leading-tight">{m.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {step.key === "dislikes" && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {DISLIKES.map((d) => {
                const on = chosen("dislikes", d.id);
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle("dislikes", d.id)}
                      className={`flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl border px-6 py-4 text-left transition ${
                        on ? "border-ink bg-ink text-ivory" : "border-line bg-paper hover:border-ink/40"
                      }`}
                    >
                      <span className="font-serif text-2xl">{d.label}</span>
                      <span className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${on ? "border-ivory bg-ivory text-ink" : "border-line"}`}>
                        {on && <Check className="size-4" aria-hidden />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {step.key === "statement" && (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Statements">
              {STATEMENTS.map((st) => {
                const on = a.statement === st.id;
                return (
                  <li key={st.id}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => set({ statement: st.id })}
                      className={`relative flex min-h-40 w-full flex-col justify-between rounded-2xl border p-6 text-left transition ${
                        on ? "border-ink bg-ink text-ivory" : "border-line bg-paper hover:border-ink/40"
                      }`}
                    >
                      <span aria-hidden className={`font-serif text-5xl leading-none ${on ? "text-[#d9a184]" : "text-clay/60"}`}>
                        &ldquo;
                      </span>
                      <span className="font-serif text-[1.65rem] italic leading-snug">{st.quote}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

    </div>
      {/* Sticky step controls */}
      <div className="sticky bottom-0 z-30 border-t border-line bg-ivory/95 pb-[env(safe-area-inset-bottom)]">
        <div className="wrap flex items-center justify-between gap-3 py-3 sm:py-4">
          <button type="button" onClick={() => go(-1)} disabled={s.step === 0} className={buttonClass("secondary", "px-5 disabled:invisible")}>
            <ArrowLeft className="size-4" aria-hidden /> <span className="hidden sm:inline">Back</span>
          </button>
          <p aria-live="polite" className="min-w-0 flex-1 text-center text-xs text-clay sm:text-sm">
            {notice}
          </p>
          <button type="button" onClick={() => go(1)} aria-disabled={!valid} className={buttonClass("primary", `px-6 ${valid ? "" : "opacity-50"}`)}>
            {last ? "Reveal my Taste DNA" : step.min === 0 || step.key === "dislikes" ? (count ? "Continue" : "Skip") : "Continue"}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function Badge({ on, label }: { on: boolean; label?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border text-sm font-medium transition ${
        on ? "border-ink bg-ink text-ivory" : "border-white/80 bg-white/30 text-transparent"
      }`}
    >
      {on && (label ?? <Check className="size-4" />)}
    </span>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-ink-soft">
        <span className="eyebrow">Taste DNA</span>
        <span>
          Question {step + 1} of {STEPS.length}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-8 gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={8} aria-valuenow={step + 1} aria-label="Questionnaire progress">
        {STEPS.map((_, i) => (
          <span key={i} className={`h-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-ink" : "bg-line"}`} />
        ))}
      </div>
    </div>
  );
}

function Boldness({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [wall, rug, sofa, cushion, art, lamp] = BOLD_ROOMS[value - 1];
  const t = "transition-colors duration-700";
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10">
      {/* Illustrative CSS room that changes with the slider */}
      <div className={`relative aspect-[16/10] overflow-hidden rounded-3xl lg:aspect-[4/3] ${t}`} style={{ background: wall }} aria-hidden>
        <div className="absolute inset-x-0 bottom-0 h-[22%] bg-black/[0.06]" />
        <div className={`absolute left-[14%] top-[16%] h-[30%] w-[22%] rounded-sm border-[6px] border-paper ${t}`} style={{ background: art }} />
        <div className="absolute right-[16%] top-[30%] h-[44%] w-[2px] bg-black/30" />
        <div className={`absolute right-[11%] top-[24%] h-[10%] w-[11%] rounded-t-full ${t}`} style={{ background: lamp }} />
        <div className={`absolute bottom-[8%] left-1/2 h-[10%] w-[78%] -translate-x-1/2 rounded-[50%] ${t}`} style={{ background: rug }} />
        <div className={`absolute bottom-[15%] left-[12%] h-[26%] w-[58%] rounded-t-[2.5rem] rounded-b-xl ${t}`} style={{ background: sofa }} />
        <div className={`absolute bottom-[29%] left-[18%] h-[14%] w-[12%] rotate-[-8deg] rounded-xl ${t}`} style={{ background: cushion }} />
        <div className={`absolute bottom-[29%] left-[46%] h-[13%] w-[11%] rotate-[6deg] rounded-xl ${t}`} style={{ background: art }} />
      </div>
      <div>
        <p className="font-serif text-4xl sm:text-5xl" aria-live="polite">
          {BOLDNESS_LABELS[value - 1]}
        </p>
        <p className="mt-2 text-sm text-ink-soft">Level {value} of 5</p>
        <label className="mt-4 block lg:mt-8">
          <span className="sr-only">Boldness, from quiet to bold</span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-valuetext={BOLDNESS_LABELS[value - 1]}
            className="rr-range w-full"
          />
        </label>
        <div className="mt-2 grid grid-cols-5 gap-1 text-center text-[0.7rem] leading-tight text-ink-soft">
          {BOLDNESS_LABELS.map((l, i) => (
            <button key={l} type="button" onClick={() => onChange(i + 1)} className={`rounded-lg px-1 py-2 hover:bg-sand ${value === i + 1 ? "font-medium text-ink" : ""}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="wrap pb-36 pt-8 sm:pt-12" aria-busy="true" aria-label="Loading questionnaire">
      <div className="h-4 w-full rounded bg-sand" />
      <div className="mt-14 h-14 w-3/4 max-w-xl rounded-lg bg-sand" />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-sand" />
        ))}
      </div>
    </div>
  );
}
