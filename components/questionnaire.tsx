"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Baby,
  Bike,
  Briefcase,
  Check,
  ChefHat,
  CloudSun,
  CookingPot,
  Droplets,
  Flame,
  Heart,
  HeartHandshake,
  House,
  KeyRound,
  Laptop,
  Minus,
  MoonStar,
  Mountain,
  PawPrint,
  Plus,
  Sparkles,
  ThermometerSun,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { freshProgress, loadSaved, saveProgress, type Saved } from "@/lib/storage";
import { encodeAnswers, primaryStyle } from "@/lib/taste-engine";
import { QUIZ_PHOTO_SIZES } from "@/lib/photos";
import {
  BOLDNESS_LABELS,
  BUDGETS,
  budgetForAmount,
  CLIMATES,
  COLOUR_FAMILIES,
  COLOUR_PICKER_URL,
  COOKING,
  CHILD_AGES,
  EXISTING_ITEMS,
  FIXTURES,
  fixtureOptions,
  GUESTS,
  HELP_DUTIES,
  HELPS,
  HOMES,
  HOUSEHOLD_NEEDS,
  isPlausibleFixtureHex,
  isComplete,
  LIMITS,
  MATERIALS,
  MAX_PEOPLE,
  MEMBERS,
  minPeople,
  MOODS,
  normaliseHex,
  PET_TYPES,
  peopleCount,
  RENTAL_PERMISSIONS,
  STEP_COUNT,
  STYLES,
  TENURES,
  WORKS,
  type Answers,
  type ChoiceKey,
  type Option,
} from "@/lib/taste-data";
import { buttonClass, MiniRoom, Photo } from "./ui";

type ListKey = keyof typeof LIMITS;
type StepKey = ListKey | "boldness" | "home" | "fixtures" | Exclude<ChoiceKey, "tenure" | "home">;

const STEPS: { key: StepKey; title: string; hint: string; min?: number }[] = [
  { key: "styles", title: "Which rooms would you love to walk into?", hint: "Choose up to three. Trust your first instinct.", min: 1 },
  { key: "moods", title: "How should your home make you feel?", hint: "Choose up to two feelings.", min: 1 },
  { key: "avoidColours", title: "Which colours would you never want?", hint: "Optional. We'll keep these out of your palettes — choose up to six.", min: 0 },
  { key: "boldness", title: "How bold is your taste?", hint: "Slide until the room feels most like you." },
  { key: "materials", title: "Which textures attract you?", hint: "Choose what you'd love to touch every day — up to five.", min: 1 },
  { key: "home", title: "Tell us about your new home.", hint: "Unfurnished and ready to set up." },
  { key: "fixtures", title: "What's already in your flat?", hint: "Your palettes will work with what you can't change. Pick the closest match." },
  { key: "climate", title: "What's the weather like where you live?", hint: "It decides which materials survive — and which swell, rust or mould." },
  { key: "household", title: "Who lives with you?", hint: "Choose everyone who applies — or Only me.", min: 1 },
  { key: "work", title: "What do your weekdays look like?", hint: "So we know how much time the house really gets." },
  { key: "cooking", title: "How much do you cook?", hint: "This changes the whole kitchen." },
  { key: "help", title: "Do you have help at home?", hint: "We'll suggest what to hand over — to people or machines." },
  { key: "budget", title: "What's your total setup budget?", hint: "Furniture, appliances and finishing, for every room." },
];
const TASTE_STEPS = 5;

const ICONS: Record<string, LucideIcon> = {
  rent: KeyRound,
  own: House,
  humid: Droplets,
  north: ThermometerSun,
  "hot-dry": ThermometerSun,
  mild: CloudSun,
  hills: Mountain,
  "only-me": User,
  partner: Heart,
  kids: Baby,
  elders: HeartHandshake,
  pets: PawPrint,
  flatmates: Users,
  wfh: Laptop,
  hybrid: ArrowLeftRight,
  office: Briefcase,
  long: MoonStar,
  daily: Flame,
  light: CookingPot,
  rarely: Bike,
  none: User,
  maid: Sparkles,
  "maid-cook": ChefHat,
  "full-time": Users,
};

const CHOICE_LISTS: Record<Exclude<ChoiceKey, "tenure" | "home">, Option<string>[]> = { climate: CLIMATES, work: WORKS, cooking: COOKING, help: HELPS, budget: BUDGETS };

// "Only me" isn't a member: it's no other people (pets can still live with you) and a headcount of one.
const livesAlone = (a: Answers) => a.people === 1 && !a.household.some((m) => m !== "pets");
const ONLY_ME: Option<string> = { id: "only-me", label: "Only me", hint: "" };

function stepValid(key: StepKey, a: Answers): boolean {
  if (key === "boldness") return true;
  if (key === "home") return a.tenure !== null && a.home !== null && a.balcony !== null;
  if (key === "fixtures") return FIXTURES.every((f) => fixtureOptions(f, a.tenure === "own").some((o) => o.id === a.fixtures[f.key]?.id));
  if (key === "household") return (livesAlone(a) || a.household.some((m) => m !== "pets")) && (a.people === null || a.people >= minPeople(a.household));
  if (key === "help") return a.help !== null;
  if (key === "budget") return a.budget !== null;
  if (key in LIMITS) return (a[key as ListKey] as string[]).length >= (STEPS.find((s) => s.key === key)?.min ?? 0);
  return a[key as ChoiceKey] !== null;
}

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
    const stepParam = new URLSearchParams(location.search).get("step");
    // Finished visitors land on their plan; "Edit answers" passes ?step to reopen the quiz.
    if (saved.completed && !stepParam) return router.replace("/results");
    const q = Number(stepParam);
    if (Number.isInteger(q) && q >= 1 && q <= STEP_COUNT) saved.step = q - 1;
    if (saved.answers.schemaVersion === 1) saved.answers = { ...saved.answers, schemaVersion: 2 };
    setEditing(saved.completed);
    setS(saved);
  }, []);

  useEffect(() => {
    if (s && !editing && !saveProgress(s)) setNotice("This browser is blocking saved progress. Keep this tab open until you finish.");
  }, [s, editing]);

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
      const patch: Partial<Answers> = { [key]: list.filter((x) => x !== id) };
      if (key === "household" && id === "kids") patch.childAges = [];
      if (key === "household" && id === "pets") patch.petTypes = [];
      return set(patch);
    }
    if (list.length >= LIMITS[key]) return setNotice(`You can choose up to ${LIMITS[key]}. Deselect one to swap it.`);
    setNotice("");
    // Adding a person after "Only me" drops the headcount of one back to an estimate.
    set({ [key]: [...list, id], ...(key === "household" && id !== "pets" && livesAlone(a) ? { people: null } : {}) });
  }

  const isList = step.key in LIMITS;
  const count = isList ? (a[step.key as ListKey] as string[]).length : 0;
  const valid = stepValid(step.key, a);
  const last = s.step === STEPS.length - 1;
  const optional = step.min === 0;

  function go(delta: number) {
    setNotice("");
    if (delta > 0 && !valid)
      return setNotice(
        step.key === "home"
          ? "Choose rented or owned, the size, and whether there's a balcony."
          : step.key === "fixtures"
            ? "Choose an option for each surface to continue."
            : step.key === "household"
              ? "Choose who lives with you — or Only me."
              : step.key === "help"
                ? "Choose an option to continue."
                : step.key === "budget"
                  ? "Choose a budget to continue."
                  : isList
                    ? "Choose at least one option to continue."
                    : "Choose an option to continue.",
      );
    if (delta > 0 && last) {
      if (!isComplete(a)) {
        const first = STEPS.findIndex((candidate) => !stepValid(candidate.key, a));
        if (first >= 0) setS({ ...s!, step: first });
        return setNotice("One earlier answer still needs confirmation.");
      }
      const completed = { ...s!, completed: true, primaryStyle: primaryStyle(a) };
      const stored = saveProgress(completed);
      return router.push(stored ? "/results" : `/results#d=${encodeAnswers(a)}&local=1`);
    }
    setS({ ...s!, step: Math.min(STEPS.length - 1, Math.max(0, s!.step + delta)) });
  }

  const chosen = (key: ListKey, id: string) => (a[key] as string[]).includes(id);
  const optionState = (key: ListKey, id: string) => {
    const on = chosen(key, id);
    return { on, dim: !on && (a[key] as string[]).length >= LIMITS[key] };
  };

  return (
    <div>
      <div className="wrap min-h-[calc(100svh-9rem)] pb-16 pt-8 sm:pt-12">
        <Progress step={s.step} />
        {editing && (
          <p className="mt-6 rounded-2xl border border-line bg-paper px-5 py-3 text-sm text-ink-soft">
            You&apos;re editing your home plan. It updates when you finish —{" "}
            <Link href="/results" className="text-clay underline underline-offset-4">
              or go back to your plan
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
            {isList && !optional && (
              <p className="shrink-0 text-sm text-ink-soft" aria-live="polite">
                {count} of {LIMITS[step.key as ListKey]} selected
              </p>
            )}
          </div>

          <div className="mt-10">
            {step.key === "styles" && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                {STYLES.map((st, i) => {
                  const { on, dim } = optionState("styles", st.id);
                  const rank = a.styles.indexOf(st.id) + 1;
                  return (
                    <li key={st.id}>
                      <button type="button" aria-pressed={on} onClick={() => toggle("styles", st.id)} className={`group w-full text-left transition-opacity ${dim ? "opacity-45" : ""}`}>
                        <span className={`relative block overflow-hidden rounded-2xl ring-offset-4 ring-offset-ivory transition ${on ? "ring-2 ring-ink" : ""}`}>
                          <Photo photo={st.photo} sizes={QUIZ_PHOTO_SIZES} eager={i < 5} className="aspect-4/5" imgClassName="transition-transform duration-700 group-hover:scale-[1.04]" />
                          <Badge on={on} label={rank ? String(rank) : undefined} />
                        </span>
                        <span className="mt-3 block text-sm leading-snug text-ink-soft">{st.caption}</span>
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
                        className={`relative flex aspect-5/4 w-full flex-col justify-end overflow-hidden rounded-2xl p-5 text-left transition sm:aspect-4/3 sm:p-6 ${
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

            {step.key === "home" && (
              <div className="space-y-10">
                <Cards
                  label="Rented or owned"
                  options={TENURES}
                  isOn={(id) => a.tenure === id}
                  onPick={(id) => {
                    const tenure = id as Answers["tenure"];
                    if (tenure === a.tenure) return;
                    set({ tenure, fixtures: { floor: null, doors: null, walls: null, counter: null, cabinets: null }, rentalPermissions: [], repaint: false });
                  }}
                />
                <div>
                  <p className="eyebrow">Size</p>
                  <div role="radiogroup" aria-label="Home size" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
                    {HOMES.map((h) => {
                      const on = a.home === h.id;
                      return (
                        <button
                          key={h.id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => set({ home: h.id })}
                          className={`min-h-20 rounded-2xl border px-5 py-4 text-left transition ${on ? "border-ink bg-ink text-ivory" : "border-line bg-paper hover:border-ink/40"}`}
                        >
                          <span className="block font-serif text-3xl">{h.label}</span>
                          {h.hint && <span className={`block text-xs ${on ? "text-ivory/70" : "text-ink-soft"}`}>{h.hint}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <NumberPicker
                  label="How many bathrooms?"
                  hint="This stops the plan pricing one geyser while talking about several bathrooms."
                  value={a.bathrooms}
                  min={1}
                  max={10}
                  onChange={(bathrooms) => set({ bathrooms })}
                />
                <div>
                  <p id="balcony-label" className="eyebrow">Balcony</p>
                  <div role="radiogroup" aria-labelledby="balcony-label" className="mt-4 flex flex-wrap gap-3">
                    {([true, false] as const).map((value) => {
                      const on = a.balcony === value;
                      return (
                        <button
                          key={String(value)}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => set({ balcony: value })}
                          className={`min-h-12 rounded-full border px-6 text-sm transition ${on ? "border-ink bg-ink text-ivory" : "border-line bg-paper hover:border-ink/40"}`}
                        >
                          {value ? "Yes, there is a balcony" : "No balcony"}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {a.tenure === "rent" && (
                  <PillPicker
                    label="What has the landlord approved in writing?"
                    hint="Leave an item unselected unless it is genuinely permitted. The plan treats unselected work as off-limits."
                    options={RENTAL_PERMISSIONS}
                    values={a.rentalPermissions}
                    onChange={(rentalPermissions) => set({ rentalPermissions, repaint: rentalPermissions.includes("paint") })}
                  />
                )}
                <div>
                  <button
                    type="button"
                    aria-pressed={a.vastu}
                    onClick={() => set({ vastu: !a.vastu })}
                    className={`flex min-h-14 items-center gap-3 rounded-full border py-2 pl-3 pr-6 text-left text-sm transition ${a.vastu ? "border-ink bg-ink text-ivory" : "border-line bg-paper hover:border-ink/40"}`}
                  >
                    <span className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${a.vastu ? "border-ivory bg-ivory text-ink" : "border-line"}`}>
                      {a.vastu && <Check className="size-4" aria-hidden />}
                    </span>
                    Include Vastu tips <span className={a.vastu ? "text-ivory/70" : "text-ink-soft"}>— optional</span>
                  </button>
                </div>
              </div>
            )}

            {step.key === "fixtures" && <Fixtures a={a} set={set} />}

            {step.key === "household" && (
              <>
                <Cards
                  multi
                  label="Who lives with you"
                  options={[ONLY_ME, ...MEMBERS]}
                  isOn={(id) => (id === "only-me" ? livesAlone(a) : chosen("household", id))}
                  onPick={(id) => (id === "only-me" ? set({ household: a.household.filter((m) => m === "pets"), people: 1, childAges: [] }) : toggle("household", id))}
                />
                {!livesAlone(a) && <Headcount a={a} set={set} />}
                {a.household.includes("kids") && <PillPicker label="What age groups are the children?" hint="This changes bunk-bed, socket and storage advice." options={CHILD_AGES} values={a.childAges} onChange={(childAges) => set({ childAges })} />}
                {a.household.includes("pets") && <PillPicker label="Which pets live here?" hint="Plant and material advice is filtered for them." options={PET_TYPES} values={a.petTypes} onChange={(petTypes) => set({ petTypes })} />}
                <PillPicker label="Any needs the plan must respect?" hint="Optional. Choose needs, not age labels." options={HOUSEHOLD_NEEDS} values={a.householdNeeds} onChange={(householdNeeds) => set({ householdNeeds })} />
                <GuestsPicker a={a} set={set} />
              </>
            )}

            {step.key in CHOICE_LISTS && (
              <div className="space-y-8">
                <Cards
                  label={step.title}
                  options={CHOICE_LISTS[step.key as keyof typeof CHOICE_LISTS]}
                  isOn={(id) => a[step.key as ChoiceKey] === id}
                  onPick={(id) => {
                    if (step.key === "help") {
                      const help = id as Answers["help"];
                      const helpDuties = help === "maid" ? ["cleaning", "dishes"] as Answers["helpDuties"] : help === "maid-cook" ? ["cleaning", "dishes", "cooking"] as Answers["helpDuties"] : [];
                      return set({ help, helpDuties, helpLivesIn: help === "full-time" ? null : false });
                    }
                    if (step.key === "budget") {
                      const budget = id as Answers["budget"];
                      return set({ budget, budgetAmount: BUDGETS.find((b) => b.id === budget)!.total });
                    }
                    set({ [step.key]: id });
                  }}
                  marks={step.key === "budget" ? ["₹", "₹₹", "₹₹₹", "₹₹₹₹"] : undefined}
                />
                {step.key === "help" && a.help && a.help !== "none" && <HelpDetails a={a} set={set} />}
                {step.key === "budget" && a.budget && <BudgetAmount a={a} set={set} />}
              </div>
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
            {last ? "See my home plan" : optional && !count ? "Skip" : "Continue"}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

// Floor, doors, walls and counter: closest preset, plus an optional exact hex from a photo.
function Fixtures({ a, set }: { a: Answers; set: (patch: Partial<Answers>) => void }) {
  const own = a.tenure === "own";
  const pick = (key: keyof Answers["fixtures"], id: string) => set({ fixtures: { ...a.fixtures, [key]: { id } } });
  const setHex = (key: keyof Answers["fixtures"], hex: string | null) => {
    const current = a.fixtures[key];
    if (current) set({ fixtures: { ...a.fixtures, [key]: hex ? { id: current.id, hex } : { id: current.id } } });
  };
  return (
    <div className="space-y-10">
      <p className="max-w-2xl rounded-2xl border border-line bg-paper px-5 py-4 text-sm leading-relaxed text-ink-soft">
        Want it exact? Photograph the surface in daylight, open{" "}
        <a href={COLOUR_PICKER_URL} target="_blank" rel="noopener noreferrer" className="text-clay underline underline-offset-4">
          imagecolorpicker.com
        </a>{" "}
        (free), upload the photo, click the spot and paste the hex code (like #C8B49A) below the option you chose.
      </p>
      {FIXTURES.map((f) => {
        const current = a.fixtures[f.key];
        const options = fixtureOptions(f, own);
        return (
          <div key={f.key}>
            <p className="eyebrow">{f.label}</p>
            <div role="radiogroup" aria-label={f.label} className="mt-4 flex flex-wrap gap-3">
              {options.map((o) => {
                const on = current?.id === o.id;
                const dot = on && current?.hex ? current.hex : o.hex;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => pick(f.key, o.id)}
                    className={`inline-flex min-h-12 items-center gap-3 rounded-full border py-2 pl-2 pr-5 text-sm transition ${on ? "border-ink bg-ink text-ivory" : "border-line bg-paper hover:border-ink/40"}`}
                  >
                    {!o.hex ? (
                      <span className={`size-8 rounded-full border-2 border-dashed ${on ? "border-ivory/60" : "border-line"}`} />
                    ) : (
                      <span className="size-8 rounded-full border-2 border-black/10" style={{ background: dot }} />
                    )}
                    {o.label}
                  </button>
                );
              })}
            </div>
            {current && options.find((o) => o.id === current.id)?.hex && (
              <HexInput key={`${f.key}-${current.id}`} value={current.hex} expected={options.find((o) => o.id === current.id)!.hex} onChange={(hex) => setHex(f.key, hex)} />
            )}
            {f.key === "walls" && !own && (
              <button
                type="button"
                aria-pressed={a.repaint}
                onClick={() => {
                  const repaint = !a.repaint;
                  set({ repaint, rentalPermissions: repaint ? [...new Set([...a.rentalPermissions, "paint" as const])] : a.rentalPermissions.filter((p) => p !== "paint") });
                }}
                className={`mt-4 flex min-h-12 items-center gap-3 rounded-full border py-2 pl-3 pr-6 text-left text-sm transition ${a.repaint ? "border-ink bg-ink text-ivory" : "border-line bg-paper hover:border-ink/40"}`}
              >
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${a.repaint ? "border-ivory bg-ivory text-ink" : "border-line"}`}>
                  {a.repaint && <Check className="size-3.5" aria-hidden />}
                </span>
                My landlord lets me repaint
              </button>
            )}
          </div>
        );
      })}
      <InventoryPicker a={a} set={set} />
    </div>
  );
}

function HexInput({ value, expected, onChange }: { value?: string; expected: string; onChange: (hex: string | null) => void }) {
  const [text, setText] = useState(value ?? "");
  const hex = normaliseHex(text);
  const implausible = Boolean(hex && !isPlausibleFixtureHex(hex, expected));
  const bad = text.trim() !== "" && (!hex || implausible);
  return (
    <label className="mt-3 flex max-w-sm items-center gap-3 text-sm text-ink-soft">
      <span className="shrink-0">Exact colour (optional)</span>
      <span className="relative flex-1">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const h = normaliseHex(e.target.value);
            onChange(h && isPlausibleFixtureHex(h, expected) ? h : null);
          }}
          placeholder="#C8B49A"
          spellCheck={false}
          aria-invalid={bad}
          className={`min-h-11 w-full rounded-full border bg-paper pl-11 pr-4 font-mono text-sm uppercase outline-none focus:border-ink ${bad ? "border-clay" : "border-line"}`}
        />
        <span aria-hidden className="absolute left-2 top-1/2 size-7 -translate-y-1/2 rounded-full border border-black/10" style={{ background: hex ?? "transparent" }} />
      </span>
      {bad && <span className="text-xs text-clay">{implausible ? "Choose the closer surface option first." : "Use 6 hex digits, like #C8B49A."}</span>}
    </label>
  );
}

// Icon cards for single-choice (radio) or multi-choice (toggle) questions.
function Cards({
  label,
  options,
  isOn,
  onPick,
  multi,
  marks,
}: {
  label: string;
  options: Option<string>[];
  isOn: (id: string) => boolean;
  onPick: (id: string) => void;
  multi?: boolean;
  marks?: string[];
}) {
  return (
    <ul role={multi ? undefined : "radiogroup"} aria-label={label} className={`grid gap-3 sm:gap-4 ${options.length === 2 ? "sm:grid-cols-2" : options.length === 3 ? "sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
      {options.map((o, i) => {
        const on = isOn(o.id);
        const Icon = ICONS[o.id];
        return (
          <li key={o.id}>
            <button
              type="button"
              role={multi ? undefined : "radio"}
              aria-checked={multi ? undefined : on}
              aria-pressed={multi ? on : undefined}
              onClick={() => onPick(o.id)}
              className={`relative flex h-full min-h-36 w-full flex-col justify-between gap-6 rounded-2xl border p-5 text-left transition sm:p-6 ${
                on ? "border-ink bg-ink text-ivory" : "border-line bg-paper hover:border-ink/40"
              }`}
            >
              {marks ? (
                <span aria-hidden className={`font-serif text-3xl ${on ? "text-[#d9a184]" : "text-clay/70"}`}>
                  {marks[i]}
                </span>
              ) : (
                Icon && <Icon aria-hidden className={`size-7 ${on ? "text-[#d9a184]" : "text-clay/80"}`} strokeWidth={1.5} />
              )}
              <span>
                <span className="block font-serif text-2xl leading-tight">{o.label}</span>
                {o.hint && <span className={`mt-1 block text-sm ${on ? "text-ivory/70" : "text-ink-soft"}`}>{o.hint}</span>}
              </span>
              {multi && <Badge on={on} />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Badge({ on, label }: { on: boolean; label?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border text-sm font-medium transition ${
        on ? "border-ivory bg-ink text-ivory" : "border-white/80 bg-white/30 text-transparent"
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
        <span className="eyebrow">{step < TASTE_STEPS ? "Part 1 · Your taste" : "Part 2 · Your home & routine"}</span>
        <span>
          Question {step + 1} of {STEPS.length}
        </span>
      </div>
      <div
        className="mt-3 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${STEPS.length}, minmax(0, 1fr))` }}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={step + 1}
        aria-label="Questionnaire progress"
      >
        {STEPS.map((_, i) => (
          <span key={i} className={`h-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-ink" : "bg-line"} ${i === TASTE_STEPS ? "ml-1.5" : ""}`} />
        ))}
      </div>
    </div>
  );
}

function PillPicker<T extends string>({
  label,
  hint,
  options,
  values,
  onChange,
}: {
  label: string;
  hint: string;
  options: Option<T>[];
  values: T[];
  onChange: (values: T[]) => void;
}) {
  return (
    <div className="rounded-3xl border border-line bg-paper p-6 sm:p-7">
      <p className="font-serif text-2xl">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{hint}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {options.map((option) => {
          const on = values.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? values.filter((value) => value !== option.id) : [...values, option.id])}
              className={`min-h-11 rounded-full border px-5 text-left text-sm transition ${on ? "border-ink bg-ink text-ivory" : "border-line bg-ivory hover:border-ink/40"}`}
            >
              {option.label}{option.hint ? <span className={`ml-2 ${on ? "text-ivory/70" : "text-ink-soft"}`}>· {option.hint}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NumberPicker({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number | null; min: number; max: number; onChange: (value: number) => void }) {
  const n = value ?? min;
  const step = "flex size-12 items-center justify-center rounded-full border border-line bg-ivory transition-colors hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-line bg-paper p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div>
        <p className="font-serif text-2xl">{label}</p>
        <p className="mt-1 max-w-md text-sm leading-relaxed text-ink-soft">{hint}</p>
      </div>
      <div className="flex items-center gap-4 self-start sm:self-auto">
        <button type="button" onClick={() => onChange(Math.max(min, n - 1))} disabled={value === null || n <= min} aria-label={`${label}: one fewer`} className={step}>
          <Minus className="size-4" aria-hidden />
        </button>
        <output aria-live="polite" className="w-10 text-center font-serif text-4xl tabular-nums">{value ?? "—"}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value === null ? min : n + 1))} disabled={n >= max} aria-label={`${label}: one more`} className={step}>
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function InventoryPicker({ a, set }: { a: Answers; set: (patch: Partial<Answers>) => void }) {
  return (
    <div>
      <PillPicker
        label="What are you bringing to the new home?"
        hint="Select a category only when you have enough working units for this home. It will be removed from the shopping list."
        options={EXISTING_ITEMS}
        values={a.existingItems}
        onChange={(existingItems) => set({ existingItems, inventoryConfirmed: true })}
      />
      <button
        type="button"
        aria-pressed={a.inventoryConfirmed && a.existingItems.length === 0}
        onClick={() => set({ existingItems: [], inventoryConfirmed: true })}
        className={`mt-3 min-h-11 rounded-full border px-5 text-sm transition ${a.inventoryConfirmed && a.existingItems.length === 0 ? "border-ink bg-ink text-ivory" : "border-line bg-paper hover:border-ink/40"}`}
      >
        I&apos;m not bringing any of these
      </button>
    </div>
  );
}

function HelpDetails({ a, set }: { a: Answers; set: (patch: Partial<Answers>) => void }) {
  return (
    <div className="space-y-4">
      <PillPicker label="What work do they actually cover?" hint="The plan only credits time that is already delegated." options={HELP_DUTIES} values={a.helpDuties} onChange={(helpDuties) => set({ helpDuties })} />
      {a.help === "full-time" && (
        <div className="rounded-3xl border border-line bg-paper p-6 sm:p-7">
          <p id="live-in-label" className="font-serif text-2xl">Do they live in the home?</p>
          <div role="radiogroup" aria-labelledby="live-in-label" className="mt-5 flex gap-2">
            {([true, false] as const).map((value) => (
              <button key={String(value)} type="button" role="radio" aria-checked={a.helpLivesIn === value} onClick={() => set({ helpLivesIn: value })} className={`min-h-11 rounded-full border px-5 text-sm transition ${a.helpLivesIn === value ? "border-ink bg-ink text-ivory" : "border-line bg-ivory hover:border-ink/40"}`}>
                {value ? "Yes, live-in" : "No, full-day only"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetAmount({ a, set }: { a: Answers; set: (patch: Partial<Answers>) => void }) {
  return (
    <label className="block rounded-3xl border border-line bg-paper p-6 sm:p-7">
      <span className="font-serif text-2xl">What is the maximum you can spend now?</span>
      <span className="mt-1 block text-sm leading-relaxed text-ink-soft">We prefilled a number from the band. Change it to your real ceiling; the plan will postpone non-essential items to stay within it.</span>
      <span className="mt-5 flex max-w-sm items-center rounded-2xl border border-line bg-ivory px-4 focus-within:border-ink">
        <span className="font-serif text-2xl">₹</span>
        <input
          type="number"
          min={1000}
          max={100000000}
          step={5000}
          value={a.budgetAmount ?? ""}
          onChange={(event) => {
            const value = Number(event.target.value);
            const budgetAmount = Number.isFinite(value) && value >= 1000 ? Math.min(100000000, Math.round(value)) : null;
            set({ budgetAmount, ...(budgetAmount === null ? {} : { budget: budgetForAmount(budgetAmount) }) });
          }}
          className="min-h-14 w-full bg-transparent px-3 text-xl tabular-nums outline-none"
          aria-label="Maximum setup budget in rupees"
        />
      </span>
    </label>
  );
}

// Required because it can allocate a scarce bedroom or trigger guest furniture.
function GuestsPicker({ a, set }: { a: Answers; set: (patch: Partial<Answers>) => void }) {
  return (
    <div className="mt-4 rounded-3xl border border-line bg-paper p-6 sm:p-7">
      <p id="guests-label" className="font-serif text-2xl">
        Do family or friends stay over?
      </p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">This decides whether a sofa-bed or guest room is worth spending money on.</p>
      <div role="radiogroup" aria-labelledby="guests-label" className="mt-5 flex flex-wrap gap-2">
        {GUESTS.map((g) => {
          const on = a.guests === g.id;
          return (
            <button
              key={g.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => set({ guests: g.id })}
              className={`min-h-11 rounded-full border px-5 text-sm transition ${on ? "border-ink bg-ink text-ivory" : "border-line bg-ivory hover:border-ink/40"}`}
            >
              {g.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Sizes the fridge, washer, geyser and table. Starts from an estimate; can't go below the people already picked.
function Headcount({ a, set }: { a: Answers; set: (patch: Partial<Answers>) => void }) {
  const min = minPeople(a.household);
  const n = peopleCount(a);
  const change = (d: number) => set({ people: Math.min(MAX_PEOPLE, Math.max(min, n + d)) });
  const step = "flex size-12 items-center justify-center rounded-full border border-line bg-ivory transition-colors hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="mt-8 flex flex-col gap-5 rounded-3xl border border-line bg-paper p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div>
        <p id="people-label" className="font-serif text-2xl">
          How many people live here, including you?
        </p>
        <p className="mt-1 max-w-md text-sm leading-relaxed text-ink-soft">
          {a.people === null && n > 1 ? "Our guess from your picks. Adjust it so the fridge, washer and geyser are the right size, and count live-in help." : "The fridge, washer, geyser and dining table are sized for this. Count live-in help too."}
        </p>
      </div>
      <div role="group" aria-labelledby="people-label" className="flex items-center gap-4 self-start sm:self-auto">
        <button type="button" onClick={() => change(-1)} disabled={n <= min} aria-label="One person fewer" className={step}>
          <Minus className="size-4" aria-hidden />
        </button>
        <output aria-live="polite" className="w-10 text-center font-serif text-4xl tabular-nums">
          {n}
        </output>
        <button type="button" onClick={() => change(1)} disabled={n >= MAX_PEOPLE} aria-label="One person more" className={step}>
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
      {(a.people === null || a.people < min) && (
        <button type="button" onClick={() => set({ people: n })} className="min-h-11 self-start rounded-full border border-ink px-5 text-sm transition hover:bg-ink hover:text-ivory sm:self-auto">
          Confirm {n} {n === 1 ? "person" : "people"}
        </button>
      )}
    </div>
  );
}

function Boldness({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10">
      <MiniRoom colours={BOLD_ROOMS[value - 1]} className="aspect-16/10 rounded-3xl lg:aspect-4/3" />
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
          <div key={i} className="aspect-4/5 animate-pulse rounded-2xl bg-sand" />
        ))}
      </div>
    </div>
  );
}
