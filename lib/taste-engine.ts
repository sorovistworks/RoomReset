import {
  BOLDNESS_LABELS,
  byId,
  COLOUR_FAMILIES,
  COLOURS,
  DISLIKES,
  MATERIALS,
  MOODS,
  PALETTES,
  sanitizeAnswers,
  STATEMENTS,
  STYLES,
  type Answers,
  type ColourFamily,
  type MaterialId,
  type MoodId,
  type Style,
  type StyleId,
} from "./taste-data.ts";

// ---------- Colour maths ----------

type RGB = [number, number, number];
const hexToRgb = (hex: string): RGB => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgbToHex = (rgb: number[]) =>
  "#" + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("").toUpperCase();

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function chroma(hex: string): number {
  const c = hexToRgb(hex);
  return (Math.max(...c) - Math.min(...c)) / 255;
}

function hue(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d === 0) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

const mix = (a: string, b: string, t: number) => {
  const [x, y] = [hexToRgb(a), hexToRgb(b)];
  return rgbToHex(x.map((v, i) => v + (y[i] - v) * t));
};

const hueGap = (a: string, b: string) => {
  const d = Math.abs(hue(a) - hue(b));
  return d > 180 ? 360 - d : d;
};

const rgbDistance = (a: string, b: string) => {
  const [x, y] = [hexToRgb(a), hexToRgb(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
};

// +1 warm (reds → yellows), -1 cool (teals → violets), 0 neutral
const warmthOf = (hex: string) => {
  if (chroma(hex) < 0.06) return 0;
  const h = hue(hex);
  return h <= 70 || h >= 330 ? 1 : h >= 160 && h <= 280 ? -1 : 0;
};

// Reduce saturation while keeping lightness, by pulling toward a grey of equal channel average.
function mute(hex: string, cap: number): string {
  const rgb = hexToRgb(hex);
  const avg = (rgb[0] + rgb[1] + rgb[2]) / 3;
  const grey = rgbToHex([avg, avg, avg]);
  let out = hex;
  for (let t = 0.1; chroma(out) > cap && t <= 0.9; t += 0.1) out = mix(hex, grey, t);
  return out;
}

type Harmony = "neutral" | "analogous" | "complementary" | "triadic" | "contrasting";
function harmony(a: string, b: string): Harmony {
  if (chroma(a) < 0.12 || chroma(b) < 0.12) return "neutral";
  const gap = hueGap(a, b);
  if (gap <= 40) return "analogous";
  if (gap >= 150) return "complementary";
  if (gap >= 105 && gap <= 135) return "triadic";
  return "contrasting";
}

// ---------- Profile types ----------

export type Role = "Foundation" | "Secondary" | "Depth" | "Light" | "Accent";

export interface Swatch {
  name: string;
  hex: string;
  family: ColourFamily;
  role: Role;
  usage: string;
}

export interface TasteProfile {
  title: string;
  styleBlend: string;
  primaryStyle: StyleId;
  secondaryStyle: StyleId;
  styleMatches: { id: StyleId; name: string; percent: number }[];
  moods: MoodId[];
  palette: { main: Swatch[]; accents: Swatch[]; explanation: string[] };
  dislikedColours: { id: ColourFamily; label: string }[];
  materials: { id: MaterialId; inferred: boolean }[];
  materialStory: string;
  boldness: number;
  boldnessLabel: string;
  contrast: { level: number; label: string };
  density: { level: number; label: string };
  warmth: { level: number; label: string };
  personality: string[];
  roomFeeling: { summary: string; traits: { label: string; value: string }[] };
  principles: { title: string; body: string }[];
  avoid: string[];
  balancing: string[];
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round1 = (v: number) => Math.round(v * 10) / 10;
const level = (v: number) => clamp(Math.round(v), 1, 5);
const sum = (xs: (number | undefined)[]) => xs.reduce<number>((s, x) => s + (x ?? 0), 0);
const listJoin = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);
const lower = (s: string) => s.toLowerCase();

// ---------- 1. Style scoring ----------

function scoreStyles(a: Answers) {
  return STYLES.map((s, index) => {
    let score = 0;
    const pick = a.styles.indexOf(s.id);
    if (pick >= 0) score += 10 - pick * 0.5; // explicit visual choices dominate
    for (const m of a.moods) score += (s.moods[m] ?? 0) * 1.5;
    a.palettes.forEach((p, i) => (score += (byId(PALETTES, p).styles[s.id] ?? 0) * (i === 0 ? 1.5 : 1.2)));
    score += (2 - Math.abs(s.boldness - a.boldness)) * 1.2;
    score += a.materials.filter((m) => s.materials.includes(m)).length * 0.8;
    for (const d of a.dislikes) score += byId(DISLIKES, d).styles[s.id] ?? 0;
    if (a.statement) score += (byId(STATEMENTS, a.statement).styles[s.id] ?? 0) * 2;
    return { style: s, score, index };
  }).sort((x, y) => y.score - x.score || x.index - y.index);
}

// ---------- 2. Traits ----------

function computeTraits(a: Answers, primary: Style, secondary: Style) {
  const blend = (k: "boldness" | "density" | "contrast" | "warmth") => primary[k] * 0.65 + secondary[k] * 0.35;
  const moods = a.moods.map((m) => byId(MOODS, m).shift);
  const st = a.statement ? byId(STATEMENTS, a.statement).shift : {};
  const has = (d: string) => a.dislikes.includes(d as never);
  const paletteBold = a.palettes.length ? sum(a.palettes.map((p) => byId(PALETTES, p).boldness)) / a.palettes.length : a.boldness;

  // The slider is the user's explicit answer, so it carries the most weight.
  const boldness = a.boldness * 0.6 + blend("boldness") * 0.25 + paletteBold * 0.15 + sum(moods.map((m) => m.boldness)) + (st.boldness ?? 0) - (has("bright") ? 0.4 : 0);
  const density = blend("density") + sum(moods.map((m) => m.density)) + (st.density ?? 0) + sum(a.dislikes.map((d) => byId(DISLIKES, d).density)) + (a.boldness - 3) * 0.2;
  const contrast = blend("contrast") + sum(moods.map((m) => m.contrast)) + (a.boldness - 3) * 0.3 - (has("dark") ? 0.7 : 0);
  const warmth = blend("warmth") + sum(moods.map((m) => m.warmth)) + (st.warmth ?? 0) + (has("cold") ? 1 : 0);

  return {
    boldness: round1(clamp(boldness, 1, 5)),
    density: round1(clamp(density, 1, 5)),
    contrast: round1(clamp(contrast, 1, 5)),
    warmth: round1(clamp(warmth, -2, 2)),
  };
}
type Traits = ReturnType<typeof computeTraits>;

// ---------- 3. Palette ----------

interface Candidate {
  id: string;
  name: string;
  hex: string;
  family: ColourFamily;
  score: number;
}

const USAGE: Record<string, string> = {
  FoundationLight: "≈60% · walls, rugs and large textiles",
  FoundationDark: "≈60% · a feature wall, sofa or curtains",
  Secondary: "≈30% · larger furniture, bedding and curtains",
  Depth: "Grounding · frames, lamp bases and a side table",
  Light: "Relief · bedding, lampshades and ceramics",
  Accent: "≈10% · cushions, art and one statement piece",
};

function buildPalette(a: Answers, primary: Style, secondary: Style, t: Traits) {
  const avoid = new Set(a.avoidColours);
  const cold = a.dislikes.includes("cold");
  const bright = a.dislikes.includes("bright");
  const scores = new Map<string, number>();
  const add = (id: string, n: number) => scores.set(id, (scores.get(id) ?? 0) + n);
  a.palettes.forEach((p, i) => byId(PALETTES, p).colours.forEach((c) => add(c, i === 0 ? 4 : 3)));
  a.styles.forEach((s) => byId(STYLES, s).palette.forEach((c) => add(c, 1.5)));
  primary.palette.forEach((c) => add(c, 2));
  secondary.palette.forEach((c) => add(c, 1));
  a.moods.forEach((m) => byId(MOODS, m).colours.forEach((c) => add(c, 1.5)));

  // Hard constraint: disliked families never enter the pool.
  const pool: Candidate[] = Object.entries(COLOURS)
    .filter(([, c]) => !avoid.has(c.family))
    .map(([id, c]) => {
      const w = warmthOf(c.hex);
      return { id, ...c, score: (scores.get(id) ?? 0) + w * t.warmth * 0.4 - (cold && w < 0 ? 1.5 : 0) };
    })
    .sort((x, y) => y.score - x.score);

  const used: Candidate[] = [];
  const free = (c: Candidate) => !used.some((u) => u.id === c.id || rgbDistance(u.hex, c.hex) < 40);
  const best = (list: Candidate[], bonus: (c: Candidate) => number = () => 0) =>
    list.filter(free).map((c) => ({ c, s: c.score + bonus(c) })).sort((x, y) => y.s - x.s)[0]?.c;
  const source = pool[0] ?? { id: "x", ...COLOURS.warmGrey, score: 0 };
  const derived = (hex: string, name: string, family: ColourFamily): Candidate => ({ id: `derived-${name}`, name, hex, family, score: 0 });

  const darkScheme =
    !a.dislikes.includes("dark") && (primary.id === "moody-contemporary" || (a.palettes[0] === "moody-elegant" && t.contrast >= 3.5));
  const minRatio = t.contrast >= 3.5 ? 7 : 4.5;

  const pickLight = (against?: Candidate) =>
    best(
      pool.filter((c) => luminance(c.hex) >= 0.6 && (!against || contrastRatio(c.hex, against.hex) >= minRatio)),
      (c) => (luminance(c.hex) - 0.6) * 5 + (cold && warmthOf(c.hex) < 0 ? -2 : 0),
    ) ?? derived(mix(source.hex, "#FFFFFF", 0.86), `Pale ${source.name}`, source.family);

  const pickDark = (against: Candidate) => {
    const found = best(
      pool.filter((c) => contrastRatio(c.hex, against.hex) >= minRatio),
      // Softer darks for people who prefer gentle contrast; near-black for drama.
      (c) =>
        (t.contrast < 2.5 && luminance(c.hex) >= 0.07 ? 1 : 0) +
        (t.contrast >= 4 && luminance(c.hex) < 0.05 ? 0.5 : 0) +
        (t.boldness < 3.5 && chroma(c.hex) < 0.2 ? 1 : 0), // quieter profiles get a neutral anchor
    );
    if (found) return found;
    // Nothing allowed is dark enough: deepen the user's own top colour until it reads clearly.
    let hex = source.hex;
    for (let k = 0.5; contrastRatio(hex, against.hex) < minRatio && k <= 1; k += 0.05) hex = mix(source.hex, "#141414", k);
    return derived(hex, `Deep ${source.name}`, source.family);
  };

  let foundation: Candidate, contrastTone: Candidate;
  if (darkScheme) {
    foundation = best(pool.filter((c) => luminance(c.hex) <= 0.08)) ?? derived(mix(source.hex, "#141414", 0.75), `Deep ${source.name}`, source.family);
    used.push(foundation);
    contrastTone = pickLight(foundation);
  } else {
    foundation = pickLight();
    used.push(foundation);
    contrastTone = pickDark(foundation);
  }
  used.push(contrastTone);

  const [lo, hi] = darkScheme ? [0.06, 0.4] : [0.1, 0.58];
  const secondaryTone =
    best(
      pool.filter((c) => {
        const l = luminance(c.hex);
        return l >= lo && l <= hi && contrastRatio(c.hex, foundation.hex) >= 1.25;
      }),
      (c) => (t.boldness <= 2.5 && chroma(c.hex) > 0.3 ? -2 : 0),
    ) ?? derived(mix(foundation.hex, contrastTone.hex, 0.4), `Mid ${foundation.name}`, foundation.family);
  used.push(secondaryTone);

  // Accents: count and intensity follow boldness; harmony with the secondary tone is rewarded.
  const accentCount = t.boldness >= 2.75 ? 2 : 1;
  const cap = bright ? 0.35 : [0.3, 0.4, 0.55, 0.7, 1][level(t.boldness) - 1];
  const accents: { c: Candidate; muted: boolean }[] = [];
  for (let i = 0; i < accentCount; i++) {
    const anchor = accents[0]?.c ?? secondaryTone;
    const pick = best(
      pool.filter((c) => chroma(c.hex) >= 0.12),
      (c) => ({ analogous: 0.8, complementary: 1, triadic: 0.6, neutral: 0, contrasting: chroma(c.hex) > 0.25 ? -1 : 0 })[harmony(c.hex, anchor.hex)],
    );
    if (!pick) break;
    used.push(pick);
    const hex = chroma(pick.hex) > cap ? mute(pick.hex, cap) : pick.hex;
    accents.push({ c: hex === pick.hex ? pick : { ...pick, hex, name: `Soft ${pick.name}` }, muted: hex !== pick.hex });
  }

  const sw = (c: Candidate, role: Role, usage: string): Swatch => ({ name: c.name, hex: c.hex, family: c.family, role, usage });
  const main = [
    sw(foundation, "Foundation", darkScheme ? USAGE.FoundationDark : USAGE.FoundationLight),
    sw(secondaryTone, "Secondary", USAGE.Secondary),
    sw(contrastTone, darkScheme ? "Light" : "Depth", darkScheme ? USAGE.Light : USAGE.Depth),
  ];
  const accentSwatches = accents.map(({ c }) => sw(c, "Accent", USAGE.Accent));

  // Explanations are generated from the actual swatches chosen.
  const [F, S, D] = main;
  const A = accentSwatches[0];
  const explanation = [
    `Use ${F.name} for roughly 60% of the room, let ${S.name} carry about 30% through larger furniture and textiles, and keep ${A ? A.name : D.name} as the final 10% spark. Treat it as a starting point, not a rule.`,
  ];
  if (A) {
    const h = harmony(A.hex, S.hex);
    explanation.push(
      {
        neutral: `Because ${S.name} is a quiet neutral, ${A.name} can shine without competing.`,
        analogous: `${S.name} and ${A.name} sit close together on the colour wheel, so the room feels effortlessly cohesive.`,
        complementary: `${A.name} sits opposite ${S.name} on the colour wheel — a gentle complementary contrast that makes both feel richer.`,
        triadic: `${A.name} and ${S.name} form a balanced triad, giving lively variety without clashing.`,
        contrasting: `${A.name} is a deliberate point of difference against ${S.name}; it works best in small, repeated doses.`,
      }[h],
    );
  }
  const ratio = contrastRatio(F.hex, D.hex);
  explanation.push(
    `${D.name} against ${F.name} gives a ${ratio.toFixed(1)}:1 contrast — ${ratio >= 7 ? "crisp enough to define edges and frame the room" : "soft but clear, so the room stays calm and readable"}.`,
  );
  const mutedNames = accents.filter((x) => x.muted).map((x) => x.c.name);
  if (mutedNames.length) {
    explanation.push(
      `${listJoin(mutedNames)} ${mutedNames.length > 1 ? "have" : "has"} been softened to match ${bright ? "your dislike of bright colours" : "your preferred level of boldness"}.`,
    );
  }

  return { main, accents: accentSwatches, explanation, darkScheme };
}

// ---------- 4. Words ----------

const BOLDNESS_SENTENCES = [
  "Your taste is quietly confident: nothing shouts, and everything belongs.",
  "You like subtlety — colour and character arrive gently, in layers.",
  "You sit in a balanced middle: calm foundations with a few well-placed moments of personality.",
  "You enjoy expression — confident colour and pieces with a point of view.",
  "You're drawn to character and boldness; your room should be unmistakably yours.",
];

const DENSITY_LABELS = ["Pared-back", "Restrained", "Curated", "Layered", "Abundant"];
const CONTRAST_LABELS = ["Soft", "Gentle", "Balanced", "Defined", "Dramatic"];

const LIGHT_BY_MOOD: Record<MoodId, string> = {
  calm: "Soft, natural daylight",
  cozy: "Warm, low pools of light",
  luxurious: "Layered and atmospheric",
  airy: "Bright and diffused",
  creative: "Bright, with focused task light",
  grounded: "Warm and steady",
  romantic: "Candle-soft and flattering",
  energised: "Bright and sunny",
};

function rankMaterials(a: Answers, primary: Style, secondary: Style) {
  const natural = a.dislikes.includes("artificial");
  const score = (id: MaterialId) =>
    (primary.materials.includes(id) ? 2 : 0) + (secondary.materials.includes(id) ? 1 : 0) + (natural && byId(MATERIALS, id).natural ? 1 : 0);
  const chosen = [...a.materials].sort((x, y) => score(y) - score(x)).map((id) => ({ id, inferred: false }));
  // Fewer than four picked: suggest from the primary style so the story feels complete.
  const extra = primary.materials
    .filter((m) => !a.materials.includes(m) && !(natural && !byId(MATERIALS, m).natural))
    .slice(0, Math.max(0, 4 - chosen.length))
    .map((id) => ({ id, inferred: true }));
  return [...chosen, ...extra].slice(0, 5);
}

function materialStory(a: Answers, mats: { id: MaterialId; inferred: boolean }[]) {
  const picked = mats.some((m) => !m.inferred) ? mats.filter((m) => !m.inferred) : mats;
  const names = picked.map((m) => lower(byId(MATERIALS, m.id).name));
  const naturals = mats.filter((m) => byId(MATERIALS, m.id).natural);
  const crafted = mats.filter((m) => !byId(MATERIALS, m.id).natural);
  const parts = [`Your material story starts with ${listJoin(names.slice(0, 3))}.`];
  if (naturals.length && crafted.length) {
    parts.push(
      `The interplay of ${lower(byId(MATERIALS, naturals[0].id).name)} and ${lower(byId(MATERIALS, crafted[0].id).name)} keeps the room from feeling either too rustic or too polished.`,
    );
  } else if (naturals.length >= 2) {
    parts.push("It's an honest, natural mix — vary the scale of texture, like a chunky knit beside fine linen, to keep it interesting.");
  } else {
    parts.push("These refined surfaces love light — place them where they can catch a lamp or a window.");
  }
  if (a.dislikes.includes("artificial")) parts.push("Because you prefer authentic materials, choose solid wood, real linen and handmade ceramics over veneers and plastic.");
  if (a.dislikes.includes("cold") && a.materials.some((m) => m === "metal" || m === "glass")) parts.push("Keep metals warm: aged brass and bronze rather than chrome.");
  return parts.join(" ");
}

function balancingNotes(a: Answers) {
  const notes: string[] = [];
  const picked = a.styles.map((s) => byId(STYLES, s));
  if (picked.length) {
    const avgBold = sum(picked.map((s) => s.boldness)) / picked.length;
    if (a.boldness - avgBold <= -2)
      notes.push(`You're drawn to characterful rooms like ${listJoin(picked.map((s) => s.name))}, but want a quieter everyday feel — so personality comes through shape, texture and one statement piece rather than lots of colour.`);
    if (a.boldness - avgBold >= 2)
      notes.push(`You admire calm, restrained spaces like ${listJoin(picked.map((s) => s.name))}, yet want more energy than they usually give — expect a serene base with confident accents.`);
  }
  const has = (d: string) => a.dislikes.includes(d as never);
  const chose = (s: StyleId) => a.styles.includes(s);
  if (has("dark") && chose("moody-contemporary"))
    notes.push("You picked moody interiors but dislike dark spaces — we keep the drama in accents, textures and lighting rather than on the walls.");
  const minimal = picked.filter((s) => ["warm-minimalist", "japandi"].includes(s.id));
  if (has("minimalism") && minimal.length)
    notes.push(`You chose ${listJoin(minimal.map((s) => s.name))} but find strict minimalism cold — so we add more texture, softness and personal pieces than a textbook version.`);
  const maximal = picked.filter((s) => ["bohemian", "eclectic"].includes(s.id));
  if (maximal.length && (has("clutter") || has("patterns") || has("decoration")))
    notes.push(`You love the energy of ${listJoin(maximal.map((s) => s.name))} but not the visual noise — think curated maximalism: grouped collections, breathing room and one pattern per zone.`);
  if (has("bright") && (chose("eclectic") || a.palettes.some((p) => p === "playful-creative" || p === "rich-expressive")))
    notes.push("You enjoy colourful rooms but not bright colours — so we translate that personality into deeper, softer versions of the same hues.");
  if (has("bright") && a.boldness >= 4)
    notes.push("You want boldness without brightness — confidence comes from depth, contrast and scale instead of saturation.");
  if (has("cold") && a.materials.some((m) => m === "metal" || m === "glass"))
    notes.push("You like metal and glass but not cold rooms — choose brass, bronze and ribbed or smoked glass over chrome.");

  const removed = new Map<string, Set<string>>();
  for (const p of a.palettes.map((id) => byId(PALETTES, id))) {
    for (const c of p.colours) {
      const fam = COLOURS[c].family;
      if (a.avoidColours.includes(fam)) {
        if (!removed.has(p.name)) removed.set(p.name, new Set());
        removed.get(p.name)!.add(lower(COLOURS[c].name));
      }
    }
  }
  for (const [palette, cols] of removed) notes.push(`We removed ${listJoin([...cols])} from your ${palette} direction, as you asked.`);

  if (a.palettes.length === 2) {
    const [p1, p2] = a.palettes.map((id) => byId(PALETTES, id));
    if (Math.abs(p1.boldness - p2.boldness) >= 3)
      notes.push(`${p1.name} and ${p2.name} pull in different directions, so ${p1.name} sets the foundation and ${p2.name} supplies the accents.`);
  }
  return notes;
}

interface Ctx {
  a: Answers;
  t: Traits;
  primary: Style;
  F: Swatch;
  S: Swatch;
  D: Swatch;
  A?: Swatch;
  mats: string[];
}

const PRINCIPLES: { when: (c: Ctx) => number; title: string; body: (c: Ctx) => string }[] = [
  { when: (c) => (c.t.density <= 2 ? 3 : 0), title: "Edit, then edit again", body: (c) => `Keep about two-thirds of every surface clear. In a ${c.primary.name} room, empty space is part of the design, not a gap to fill.` },
  { when: (c) => (c.t.density >= 3.8 ? 3 : 0), title: "Collect with intention", body: () => "Group objects in odd numbers on trays and shelves, so your favourite things read as a story rather than clutter." },
  { when: (c) => (c.t.boldness >= 3.8 ? 3.2 : 0), title: "Let one piece lead", body: (c) => `Choose one hero — an armchair or artwork in ${c.A?.name ?? c.D.name}, or a sculptural lamp — and let everything else support it.` },
  { when: (c) => (c.t.boldness <= 2.4 && c.mats.length >= 2 ? 3 : 0), title: "Colour through texture", body: (c) => `Instead of strong colour, build interest with ${c.mats[0]} and ${c.mats[1]}. Touchable surfaces make a quiet palette feel rich.` },
  { when: (c) => (c.a.moods.some((m) => m === "cozy" || m === "romantic") ? 2.8 : 0), title: "Layer warm light", body: () => "Use three light sources at different heights with warm 2700K bulbs, and switch off the ceiling light in the evening." },
  { when: (c) => (c.a.moods.some((m) => m === "airy" || m === "calm") ? 2.6 : 0), title: "Protect the light", body: (c) => `Keep window treatments sheer and pale — ${c.F.name} or lighter — and hang them high and wide to make the room feel taller.` },
  { when: (c) => (c.a.moods.includes("grounded") ? 2.5 : 0), title: "Stay low and earthy", body: (c) => `Low-slung seating, a natural-fibre rug and ${c.S.name} textiles keep the room feeling rooted.` },
  { when: (c) => (c.a.moods.some((m) => m === "creative" || m === "energised") ? 2.7 : 0), title: "Make colour movable", body: (c) => `Bring ${c.A?.name ?? c.S.name} in through cushions, prints and ceramics — easy to change when inspiration shifts, and kind to rental walls.` },
  { when: (c) => (c.a.moods.includes("luxurious") ? 2.7 : 0), title: "Invest in touch", body: () => "Spend on what you touch every day — a velvet cushion, heavy linen, a weighty ceramic lamp. Luxury is felt before it's seen." },
  { when: (c) => (c.t.contrast >= 3.8 ? 2.4 : 0), title: "Anchor with depth", body: (c) => `Use ${c.D.name} in a few deliberate places — a frame, a side table, a lamp base — to give the eye somewhere to rest.` },
  { when: (c) => (c.t.contrast <= 2.2 ? 2.2 : 0), title: "Keep transitions soft", body: (c) => `Stay within a close tonal range around ${c.F.name} and ${c.S.name}, and skip hard black accents so the room flows.` },
  { when: (c) => (c.a.statement === "creative" || c.a.statement === "statement" ? 2.3 : 0), title: "Give your story a stage", body: () => "Dedicate one wall shelf or picture ledge to the things you love, and rotate them — it keeps the room personal without clutter." },
  { when: () => 2, title: "Follow your palette ratio", body: (c) => `Roughly 60% ${c.F.name}, 30% ${c.S.name} and 10% ${c.A?.name ?? c.D.name} — a useful starting point, never a strict rule.` },
  { when: () => 1.9, title: "Rental-friendly first", body: () => "Change the room without changing the walls: rugs, lighting, textiles and leaning art do most of the work." },
];

// ---------- Public API ----------

export function buildProfile(input: Answers): TasteProfile {
  const a = sanitizeAnswers(input);
  const ranked = scoreStyles(a);
  const primary = ranked[0].style;
  const secondary = ranked[1].style;
  const t = computeTraits(a, primary, secondary);
  const palette = buildPalette(a, primary, secondary, t);
  const mats = rankMaterials(a, primary, secondary);
  const matNames = mats.map((m) => lower(byId(MATERIALS, m.id).name));
  const pickedNames = mats.filter((m) => !m.inferred).map((m) => lower(byId(MATERIALS, m.id).name));
  const moods = a.moods.map((m) => byId(MOODS, m));

  // Match percentages from the top three positive scores.
  const top = ranked.slice(0, 3).filter((r) => r.score > 0);
  const total = sum(top.map((r) => r.score)) || 1;
  const styleMatches = top.map((r) => ({ id: r.style.id, name: r.style.name, percent: Math.round((r.score / total) * 100) }));
  if (styleMatches.length) styleMatches[0].percent += 100 - sum(styleMatches.map((m) => m.percent));

  const b = level(t.boldness);
  const adjective = moods[0]?.adjective ?? ["Quiet", "Subtle", "Balanced", "Expressive", "Bold"][b - 1];
  const [F, S, D] = palette.main;
  const ctx: Ctx = { a, t, primary, F, S, D, A: palette.accents[0], mats: matNames };

  const statement = a.statement ? byId(STATEMENTS, a.statement) : null;
  const moodLine = moods.length
    ? `You want a room that feels ${listJoin(moods.map((m) => lower(m.name)))} — ${moods[0].phrase}.`
    : "You want a room that simply feels like yours.";
  const personality = [
    `${primary.essence} There's also a thread of ${secondary.blend} running through your answers.`,
    `${moodLine} ${BOLDNESS_SENTENCES[b - 1]}`,
    `Texturally, you gravitate to ${listJoin((pickedNames.length ? pickedNames : matNames).slice(0, 3))}.${statement ? " " + statement.sentence : ""}`,
  ];

  const principles = PRINCIPLES.map((p, i) => ({ p, s: p.when(ctx), i }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s || x.i - y.i)
    .slice(0, 3)
    .map(({ p }) => ({ title: p.title, body: p.body(ctx) }));

  const dislikedColours = a.avoidColours.map((id) => ({ id, label: COLOUR_FAMILIES.find((f) => f.id === id)!.label }));
  const avoid = [
    ...(dislikedColours.length ? [`${listJoin(dislikedColours.map((f) => f.label))} — removed from your palette entirely.`] : []),
    ...a.dislikes.map((d) => byId(DISLIKES, d).avoid),
    primary.avoid,
    ...(t.boldness <= 2 ? ["Strong feature walls and high-gloss finishes that fight a quiet palette."] : []),
    ...(t.density <= 2 && !a.dislikes.includes("clutter") ? ["Matching furniture sets and filler décor bought just to fill space."] : []),
  ].slice(0, 6);

  const pace = t.density < 2.5 ? "Still and spacious" : t.density < 3.6 ? "Relaxed and balanced" : "Lively and collected";
  const texture = t.density < 2 ? "Few, tactile surfaces" : t.density < 3.5 ? "Gently layered" : "Richly layered";

  return {
    title: `The ${adjective} ${primary.noun}`,
    styleBlend: `${primary.name} with ${secondary.name} undertones`,
    primaryStyle: primary.id,
    secondaryStyle: secondary.id,
    styleMatches,
    moods: a.moods,
    palette: { main: palette.main, accents: palette.accents, explanation: palette.explanation },
    dislikedColours,
    materials: mats,
    materialStory: materialStory(a, mats),
    boldness: t.boldness,
    boldnessLabel: BOLDNESS_LABELS[b - 1],
    contrast: { level: t.contrast, label: CONTRAST_LABELS[level(t.contrast) - 1] },
    density: { level: t.density, label: DENSITY_LABELS[level(t.density) - 1] },
    warmth: { level: t.warmth, label: t.warmth < -0.5 ? "Cool" : t.warmth < 0.5 ? "Neutral" : t.warmth < 1.3 ? "Warm" : "Sun-warmed" },
    personality,
    roomFeeling: {
      summary: moods.length
        ? `A ${listJoin(moods.map((m) => lower(m.name)))} room — ${moods[0].phrase}.`
        : "A room that feels considered, comfortable and completely yours.",
      traits: [
        { label: "Light", value: moods[0] ? LIGHT_BY_MOOD[moods[0].id] : "Soft, natural daylight" },
        { label: "Texture", value: texture },
        { label: "Colour", value: BOLDNESS_LABELS[b - 1] },
        { label: "Pace", value: pace },
      ],
    },
    principles,
    avoid,
    balancing: balancingNotes(a),
  };
}

// Share links carry only aesthetic answers (no personal data), as base64url JSON.
export function encodeAnswers(a: Answers): string {
  return btoa(JSON.stringify(a)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeAnswers(s: string): Answers | null {
  try {
    return sanitizeAnswers(JSON.parse(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));
  } catch {
    return null;
  }
}
