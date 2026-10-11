import {
  CHECKS,
  CHORES,
  COLOUR_USE,
  ESSENTIALS,
  FIXTURE_NOTES,
  MATERIAL_TIPS,
  PALETTE_LIBRARY,
  ROOMS,
  roomShares,
  TIPS,
  type Ctx,
  type Hand,
  type Palette,
  type RoomId,
  type Verdict,
} from "./home-data.ts";
import {
  BUDGETS,
  byId,
  CLIMATES,
  COLOURS,
  COOKING,
  FIXTURES,
  HOMES,
  NONE,
  MOODS,
  sanitizeAnswers,
  TENURES,
  UNDECIDED,
  WORKS,
  type Answers,
  type FixtureKey,
  type StyleId,
} from "./taste-data.ts";
import { luminance, primaryStyle } from "./taste-engine.ts";

export interface Item {
  name: string;
  cost: string;
  why: string;
}

export interface Chip {
  name: string;
  hex: string;
  why?: string;
}

export interface RankedPalette {
  palette: Palette;
  colours: { name: string; hex: string }[];
  room: string[]; // MiniRoom colours, shown with the person's own floor, doors and (fixed) walls
  why: string[];
  avoided: string[]; // colour names the person said they'd never want
}

export interface RoomPlan {
  id: RoomId;
  name: string;
  colourUse: string;
  materials: { name: string; why: string }[];
  buy: Record<Verdict, Item[]>;
  dos: string[];
  donts: string[];
}

export interface HomePlan {
  primaryStyle: StyleId;
  summary: string[];
  palettes: RankedPalette[];
  fixtureNotes: string[];
  finishes: (Chip & { label: string })[]; // suggestions for anything the owner hasn't chosen yet
  kitchen: { fridge: Chip; storage: Chip[] };
  rooms: RoomPlan[];
  chores: { task: string; hours: number; hand: Hand; why: string; help: string; machine?: { name: string; cost: string } }[];
  hoursFreed: number;
  choreHeadline: string;
  checks: string[];
  budget: { total: number; label: string; rooms: { id: RoomId; name: string; share: number; amount: number }[] };
}

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const distance = (a: string, b: string) => {
  const [x, y] = [rgb(a), rgb(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
};

// Warm/cool undertone of a fixed surface; near-greys count as cool only when they lean blue.
export function undertone(hex: string): "warm" | "cool" | "neutral" {
  const [r, g, b] = rgb(hex);
  if (Math.max(r, g, b) - Math.min(r, g, b) < 15) return b > r ? "cool" : "neutral";
  return r > b ? "warm" : "cool";
}

export function context(input: Answers): Ctx {
  const a = sanitizeAnswers(input);
  const fix = Object.fromEntries(
    FIXTURES.map((f) => {
      const pick = a.fixtures[f.key];
      if (!pick || pick.id === UNDECIDED || pick.id === NONE) return [f.key, null];
      return [f.key, { id: pick.id, hex: pick.hex ?? f.options.find((o) => o.id === pick.id)!.hex }];
    }),
  ) as Ctx["fix"];
  return {
    ...a,
    rent: a.tenure !== "own",
    own: a.tenure === "own",
    small: a.home === "1rk" || a.home === "1bhk",
    busy: a.work === "office" || a.work === "long",
    hasHelp: a.help !== null && a.help !== "none",
    has: (m) => a.household.includes(m),
    loves: (m) => a.materials.includes(m),
    fix,
    paint: a.tenure === "own" || a.repaint || fix.walls === null,
  };
}

const PICK_WEIGHT = [2, 1.6, 1.3];
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
const label = (list: { id: string; label: string }[], id: string | null) => list.find((o) => o.id === id)?.label;
const fixtureLabel = (key: FixtureKey, id: string) => FIXTURES.find((f) => f.key === key)!.options.find((o) => o.id === id)!.label.toLowerCase();

function rankPalettes(c: Ctx): RankedPalette[] {
  const hot = c.climate === "humid" || c.climate === "north";
  const fixed = (["floor", "doors", "counter", "cabinets", "walls"] as const).filter((k) => c.fix[k] && (k !== "walls" || !c.paint));
  const scored = PALETTE_LIBRARY.map((p, index) => {
    const reasons: [number, string][] = [];
    const colours = p.colours.map((id) => COLOURS[id]);
    const style = sum(c.styles.map((id, i) => (p.styles[id] ?? 0) * PICK_WEIGHT[i]));
    if (style >= 3) reasons.push([style, "Close to the rooms you picked"]);
    const moodHits = c.moods.filter((m) => p.moods[m]);
    const mood = sum(moodHits.map((m) => p.moods[m]! * 1.5));
    if (moodHits.length) reasons.push([mood, `Feels ${moodHits.map((m) => byId(MOODS, m).name.toLowerCase()).join(" and ")}`]);
    const bold = (2 - Math.abs(p.boldness - c.boldness)) * 1.2;
    if (bold >= 2) reasons.push([bold, "Right at your comfort level with colour"]);

    let climate = 0;
    if (hot) climate = p.temp === "cool" ? 1.5 : p.temp === "warm" ? -0.5 : 0;
    if (c.climate === "hills") climate = p.temp === "warm" ? 1.5 : p.temp === "cool" ? -1 : 0;
    if (climate > 0) reasons.push([climate, hot ? "Cool tones take the edge off hot summers" : "Warm tones make chilly evenings cosier"]);

    const darkBase = luminance(colours[0].hex) < 0.2;
    const space = c.small ? (darkBase ? -3 : 0.5) : 0;
    if (space > 0) reasons.push([space, `A light base keeps a compact ${byId(HOMES, c.home!).label} feeling bigger`]);

    // What's already in the flat: match undertones, echo the door wood, lift a dark floor.
    let fit = 0;
    for (const k of fixed) {
      const u = undertone(c.fix[k]!.hex);
      if (u === "neutral" || p.temp === "neutral") continue;
      fit += u === p.temp ? 0.8 : -2;
    }
    if (fit > 0 && c.fix.floor) reasons.push([fit + 2, `Works with your ${fixtureLabel("floor", c.fix.floor.id)}`]);
    if (c.fix.doors && c.fix.doors.id !== "white" && distance(colours[2].hex, c.fix.doors.hex) < 70) {
      fit += 1.5;
      reasons.push([3.5, "Its wood tone echoes your doors"]);
    }
    if (c.fix.floor && luminance(c.fix.floor.hex) < 0.12) {
      fit += darkBase ? -2.5 : 0.5;
      if (!darkBase) reasons.push([2.5, "Light enough to lift your dark floor"]);
    }

    const avoided = colours.filter((x) => c.avoidColours.includes(x.family)).map((x) => x.name);
    const why = reasons.sort((x, y) => y[0] - x[0]).slice(0, 2).map((r) => r[1]);
    const [base, second, depth, a1, a2] = colours.map((x) => x.hex);
    return {
      ranked: {
        palette: p,
        colours: colours.map(({ name, hex }) => ({ name, hex })),
        room: [c.paint ? base : c.fix.walls!.hex, depth, second, a1, a2, depth, c.fix.floor?.hex ?? "", c.fix.doors?.hex ?? ""],
        why: why.length ? why : ["An easy, balanced mix to live with"],
        avoided,
      },
      score: style + mood + bold + climate + space + fit,
      index,
    };
  }).sort((x, y) => x.ranked.avoided.length - y.ranked.avoided.length || y.score - x.score || x.index - y.index);

  // Keep the top five visibly different: skip near-copies of a palette already chosen.
  const similar = (x: RankedPalette, y: RankedPalette) => sum(x.colours.map((col, i) => distance(col.hex, y.colours[i].hex))) / 5 < 50;
  const picked: RankedPalette[] = [];
  for (const { ranked } of scored) if (picked.length < 5 && !picked.some((q) => similar(q, ranked))) picked.push(ranked);
  for (const { ranked } of scored) if (picked.length < 5 && !picked.includes(ranked)) picked.push(ranked);
  return picked.sort((x, y) => x.avoided.length - y.avoided.length);
}

const DOOR_FINISHES = FIXTURES.find((f) => f.key === "doors")!.options.filter((o) => o.id !== UNDECIDED);

// Finishes for anything an owner hasn't chosen yet, drawn from their top palette.
function suggestFinishes(c: Ctx, top: RankedPalette): HomePlan["finishes"] {
  const [base, , depth] = top.colours;
  const out: HomePlan["finishes"] = [];
  if (!c.fix.floor) {
    out.push(
      top.palette.temp === "warm"
        ? { label: "Floor", name: "Wood-look or beige vitrified tiles", hex: "#B89272", why: "Warm underfoot and forgiving of dust." }
        : top.palette.temp === "cool"
          ? { label: "Floor", name: "White or light grey vitrified tiles", hex: "#D9DADA", why: "Keeps cool colours crisp and the room bright." }
          : { label: "Floor", name: "Marble-look vitrified tiles", hex: "#E6E2DA", why: "A quiet, light base that suits a neutral palette." },
    );
  }
  if (!c.fix.doors) {
    const d = [...DOOR_FINISHES].sort((x, y) => distance(x.hex, depth.hex) - distance(y.hex, depth.hex))[0];
    out.push({ label: "Doors", name: d.label, hex: d.hex, why: `Closest to the ${depth.name} in your palette.` });
  }
  if (!c.fix.walls) out.push({ label: "Walls", name: base.name, hex: base.hex, why: "The 60% colour of your top palette." });
  if (!c.fix.cabinets && c.own) {
    const [, second, wood] = top.colours;
    out.push({ label: "Kitchen cabinets", name: `${second.name} uppers, ${wood.name} lowers`, hex: wood.hex, why: "Two-tone hides daily wear low down and keeps the top light." });
  }
  if (!c.fix.counter) {
    out.push(
      c.cooking === "daily"
        ? { label: "Kitchen counter", name: "Black granite", hex: "#1F1E1D", why: "Heat-proof and hides haldi and oil stains." }
        : { label: "Kitchen counter", name: "Light quartz", hex: "#E3DED5", why: "Brightens the kitchen and needs no sealing." },
    );
  }
  return out;
}

function kitchenColours(c: Ctx, top: RankedPalette, finishes: HomePlan["finishes"]): HomePlan["kitchen"] {
  const counter = c.fix.counter?.hex ?? finishes.find((f) => f.label === "Kitchen counter")!.hex;
  const cab = c.fix.cabinets;
  const dark = luminance(counter) < 0.1 || cab?.id === "dark" || (cab !== null && luminance(cab.hex) < 0.08);
  const [base, , , a1] = top.colours;
  const steel = { name: "Silver steel (inox)", hex: "#BFC2C4" };
  return {
    fridge:
      cab?.id === "dark"
        ? { name: "Black or graphite finish", hex: "#2E2F31", why: "Blends into dark cabinets instead of standing out as a big box." }
        : cab?.id === "white"
          ? { name: "White or silver", hex: "#EEF0F1", why: "Disappears against white cabinets, so a small kitchen feels bigger." }
          : cab?.id === "wood"
            ? { ...steel, why: "Steel sits well beside wood; black or white would look like an afterthought." }
            : cab?.id === "colour"
              ? { ...steel, why: "Neutral steel lets your coloured cabinets lead." }
              : cab?.id === "grey"
                ? { ...steel, why: "Steel and grey are a natural pair." }
                : dark
                  ? { name: "Black or graphite finish", hex: "#2E2F31", why: "Ties in with the dark counter and hides fingerprints." }
                  : top.palette.temp === "cool"
                    ? { name: "White or silver", hex: "#EEF0F1", why: "Keeps a light, cool kitchen seamless." }
                    : { ...steel, why: "Sits easily with warm wood and cream, and won't yellow like white trims." },
    storage: [
      { name: "Stainless steel", hex: "#C9CBCC", why: "Always works, and lasts." },
      { name: `Clear glass, ${a1.name} lids`, hex: a1.hex, why: "Your accent colour, in small doses." },
      dark ? { name: `${base.name} canisters`, hex: base.hex, why: "Light pieces stand out against the dark counter." } : { name: "Bamboo or wood lids", hex: "#B08A5E", why: "Warms up a light counter." },
    ],
  };
}

export function buildHomePlan(input: Answers): HomePlan {
  const c = context(input);
  const palettes = rankPalettes(c);
  const top = palettes[0];
  const names = top.colours.map((x) => x.name);
  const walls = c.paint ? `${names[0]} walls` : `Your walls stay as they are — ${names[0]} goes into rugs and throws`;
  const finishes = suggestFinishes(c, top);

  const rooms = ROOMS.map((r): RoomPlan => {
    const materials = MATERIAL_TIPS.map((m, i) => ({ m, i, up: Number(m.up?.(c) ?? false) }))
      .filter(({ m }) => m.room === r.id && (!m.when || m.when(c)))
      .sort((x, y) => y.up - x.up || x.i - y.i)
      .slice(0, 5)
      .map(({ m }) => ({ name: m.name, why: m.why }));
    const buy: Record<Verdict, Item[]> = { now: [], later: [], skip: [] };
    for (const e of ESSENTIALS) {
      const v = e.room === r.id ? e.verdict(c) : null;
      if (v) buy[v[0]].push({ name: e.name, cost: e.cost, why: v[1] });
    }
    const tips = TIPS.filter((t) => t.room === r.id && (!t.when || t.when(c)));
    return {
      ...r,
      colourUse: COLOUR_USE[r.id](names, c, walls),
      materials,
      buy,
      dos: tips.filter((t) => t.kind === "do").map((t) => t.text),
      donts: tips.filter((t) => t.kind === "dont").map((t) => t.text),
    };
  });

  const chores = CHORES.map((ch) => {
    const [hand, why] = ch.pick(c);
    return { task: ch.task, hours: ch.hours(c), hand, why, help: ch.help, machine: ch.machine };
  });
  const hoursFreed = sum(chores.filter((ch) => ch.hand !== "you").map((ch) => ch.hours));
  const choreHeadline =
    c.busy && !c.hasHelp
      ? `Your weekdays are full and there's no help yet. Machines and a little paid help can free about ${hoursFreed} hours a week.`
      : c.hasHelp
        ? `Your help covers the daily grind. Add the right machines and you get about ${hoursFreed} hours a week back.`
        : `You have time on your side, so keep the easy chores — here's where help pays off first.`;

  const budget = BUDGETS.find((b) => b.id === c.budget) ?? BUDGETS[1];
  const shares = roomShares(c);

  return {
    primaryStyle: primaryStyle(c),
    summary: [label(TENURES, c.tenure), label(HOMES, c.home), label(CLIMATES, c.climate), label(WORKS, c.work), label(COOKING, c.cooking)].filter((x) => x !== undefined),
    palettes,
    fixtureNotes: FIXTURE_NOTES.filter((n) => n.when(c)).map((n) => n.text),
    finishes,
    kitchen: kitchenColours(c, top, finishes),
    rooms,
    chores,
    hoursFreed,
    choreHeadline,
    checks: CHECKS.filter((x) => !x.when || x.when(c)).map((x) => x.text),
    budget: {
      total: budget.total,
      label: budget.label,
      rooms: ROOMS.map((r) => ({ ...r, share: shares[r.id], amount: Math.round((budget.total * shares[r.id]) / 100 / 1000) * 1000 })),
    },
  };
}
