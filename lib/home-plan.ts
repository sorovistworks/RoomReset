import {
  boldLook,
  BUDGET_TIPS,
  CHECKS,
  EXTRA_LOOK,
  MOOD_LOOK,
  roomsFor,
  STYLE_LOOK,
  type Where,
  CHORES,
  COLOUR_USE,
  ESSENTIALS,
  FIXTURE_NOTES,
  MATERIAL_TIPS,
  PALETTE_LIBRARY,
  ROOMS,
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
  peopleCount,
  minPeople,
  sanitizeAnswers,
  TENURES,
  UNDECIDED,
  WORKS,
  type Answers,
  type ColourFamily,
  type ColourId,
  type FixtureKey,
  type HelpDuty,
  type StyleId,
} from "./taste-data.ts";
import { luminance, primaryStyle } from "./taste-engine.ts";

export interface Item {
  name: string;
  cost: string;
  why: string;
  core?: boolean;
  quantity?: number;
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
  wallsFixed: boolean;
}

export interface RoomPlan {
  id: RoomId;
  name: string;
  colourUse: string;
  look: string[]; // what your taste means here: the pieces to look for, then how it should feel
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
  otherPurchases: Record<Verdict, Item[]>;
  constraints: string[];
  chores: { task: string; hours: number; hand: Hand; why: string; help: string; machine?: { name: string; cost: string } }[];
  hoursFreed: number;
  choreHeadline: string;
  checks: string[];
  budget: {
    total: number;
    label: string;
    rooms: { id: RoomId; name: string; share: number; amount: number }[];
    // What the buy-now and months-one-to-three lists add up to, and how the buy-now list sits against the budget.
    cost: Record<"now" | "later", [number, number]>;
    fit: "fits" | "stretch" | "over";
    minimum: [number, number];
    postpone: Item[]; // items moved from buy-now to later to respect the ceiling
    tips: { kind: "spend" | "save"; text: string }[];
  };
}

const UNIT = { k: 1_000, L: 100_000 } as const;
// "₹18k–45k", "₹60k–1.5L", "₹800–2k" → rupees. shortcut: "each" / "per window" prices count once; add a quantity field if that skews totals.
export function costRange(cost: string): [number, number] | null {
  const m = cost.match(/₹([\d.]+)(k|L)?–([\d.]+)(k|L)?/);
  if (!m) return null;
  return [Number(m[1]) * (m[2] ? UNIT[m[2] as keyof typeof UNIT] : 1), Number(m[3]) * (m[4] ? UNIT[m[4] as keyof typeof UNIT] : 1)];
}

const sumCost = (items: Item[]): [number, number] => {
  const [lo, hi] = items.reduce(([a, b], i) => {
    const r = costRange(i.cost);
    const quantity = Math.max(1, i.quantity ?? 1);
    return r ? [a + r[0] * quantity, b + r[1] * quantity] : [a, b];
  }, [0, 0]);
  return [Math.round(lo / 1000) * 1000, Math.round(hi / 1000) * 1000];
};

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

// Alone or with a partner, the estimate is exact; kids, parents or flatmates make it a guess unless counted.
const estimateExact = (c: Ctx) => (c.household.every((m) => m === "partner" || m === "pets") ? minPeople(c.household) : -1);

export function context(input: Answers): Ctx {
  const a = sanitizeAnswers(input);
  const fix = Object.fromEntries(
    FIXTURES.map((f) => {
      const pick = a.fixtures[f.key];
      if (!pick || pick.id === UNDECIDED || pick.id === NONE) return [f.key, null];
      return [f.key, { id: pick.id, hex: pick.hex ?? f.options.find((o) => o.id === pick.id)!.hex }];
    }),
  ) as Ctx["fix"];
  // Unanswered help duties default to what that kind of help usually covers.
  const duties: HelpDuty[] = a.helpDuties.length || a.help === null || a.help === "none" ? a.helpDuties : a.help === "maid" ? ["cleaning", "dishes"] : ["cleaning", "dishes", "cooking"];
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
    paint: a.tenure === "own" || a.rentalPermissions.includes("paint") || a.repaint || fix.walls === null,
    people: peopleCount(a),
    counted: a.people !== null,
    allowDrill: a.tenure === "own" || a.rentalPermissions.includes("drill"),
    allowAdhesive: a.tenure === "own" || a.rentalPermissions.includes("adhesive"),
    allowExterior: a.tenure === "own" || a.rentalPermissions.includes("exterior"),
    owns: (item) => a.existingItems.includes(item),
    needs: (need) => a.householdNeeds.includes(need),
    helpDoes: (duty) => duties.includes(duty),
    bathrooms: a.bathrooms ?? (a.home === "1rk" || a.home === "1bhk" ? 1 : 2),
    guests: a.guests ?? "sometimes",
    childAges: a.household.includes("kids") && !a.childAges.length ? ["unknown"] : a.childAges,
    petTypes: a.household.includes("pets") && !a.petTypes.length ? ["other"] : a.petTypes,
    helpDuties: duties,
    helpLivesIn: a.helpLivesIn ?? false,
  };
}

const PICK_WEIGHT = [2, 1.6, 1.3];
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
const label = (list: { id: string; label: string }[], id: string | null) => list.find((o) => o.id === id)?.label;
const fixtureLabel = (key: FixtureKey, id: string) => FIXTURES.find((f) => f.key === key)!.options.find((o) => o.id === id)!.label.toLowerCase();

function withoutAvoidedColours(palette: Palette, avoided: ColourFamily[]): Palette {
  if (!avoided.length) return palette;
  const used = new Set<ColourId>();
  let changed = false;
  const colours = palette.colours.map((id) => {
    const original = COLOURS[id];
    if (!avoided.includes(original.family) && !used.has(id)) {
      used.add(id);
      return id;
    }
    changed = true;
    const replacement = (Object.entries(COLOURS) as [ColourId, (typeof COLOURS)[ColourId]][])
      .filter(([candidate, colour]) => !avoided.includes(colour.family) && !used.has(candidate))
      .sort(([, a], [, b]) => distance(original.hex, a.hex) - distance(original.hex, b.hex) || Math.abs(luminance(original.hex) - luminance(a.hex)) - Math.abs(luminance(original.hex) - luminance(b.hex)))[0]?.[0];
    const safe = replacement ?? (Object.keys(COLOURS) as ColourId[]).find((candidate) => !avoided.includes(COLOURS[candidate].family))!;
    used.add(safe);
    return safe;
  }) as Palette["colours"];
  return changed ? { ...palette, id: `${palette.id}-adjusted`, name: `${palette.name} · adjusted`, colours } : palette;
}

function rankPalettes(c: Ctx): RankedPalette[] {
  const hot = c.climate === "humid" || c.climate === "north" || c.climate === "hot-dry";
  const fixed = (["floor", "doors", "counter", "cabinets", "walls"] as const).filter((k) => c.fix[k] && (k !== "walls" || !c.paint));
  const scored = PALETTE_LIBRARY.map((source, index) => {
    const p = withoutAvoidedColours(source, c.avoidColours);
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

    const why = reasons.sort((x, y) => y[0] - x[0]).slice(0, 2).map((r) => r[1]);
    const [base, second, depth, a1, a2] = colours.map((x) => x.hex);
    return {
      ranked: {
        palette: p,
        colours: colours.map(({ name, hex }) => ({ name, hex })),
        room: [c.paint ? base : c.fix.walls?.hex ?? base, depth, second, a1, a2, depth, c.fix.floor?.hex ?? "", c.fix.doors?.hex ?? ""],
        why: why.length ? why : ["An easy, balanced mix to live with"],
        avoided: [],
        wallsFixed: !c.paint,
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
const nearestFamily = (hex: string) =>
  (Object.values(COLOURS) as (typeof COLOURS)[ColourId][]).sort((a, b) => distance(hex, a.hex) - distance(hex, b.hex))[0].family;
const allowedHex = (c: Ctx, hex: string) => !c.avoidColours.includes(nearestFamily(hex));

// Finishes for anything an owner hasn't chosen yet, drawn from their top palette.
function suggestFinishes(c: Ctx, top: RankedPalette): HomePlan["finishes"] {
  const [base, , depth] = top.colours;
  const out: HomePlan["finishes"] = [];
  if (!c.fix.floor) {
    const floors = [
      { temp: "warm", name: "Wood-look or beige vitrified tiles", hex: "#B89272", why: "Warm underfoot and forgiving of dust." },
      { temp: "cool", name: "White or light grey vitrified tiles", hex: "#D9DADA", why: "Keeps cool colours crisp and the room bright." },
      { temp: "neutral", name: "Marble-look vitrified tiles", hex: "#E6E2DA", why: "A quiet, light base that suits a neutral palette." },
    ];
    const floor = [...floors].sort((x, y) => Number(y.temp === top.palette.temp) - Number(x.temp === top.palette.temp)).find((f) => allowedHex(c, f.hex)) ?? floors[2];
    out.push({ label: "Floor", name: floor.name, hex: floor.hex, why: `${floor.why} Choose a matte, anti-skid finish.` });
  }
  if (!c.fix.doors) {
    const d = [...DOOR_FINISHES].filter((candidate) => allowedHex(c, candidate.hex)).sort((x, y) => distance(x.hex, depth.hex) - distance(y.hex, depth.hex))[0];
    out.push(d ? { label: "Doors", name: d.label, hex: d.hex, why: `Closest to the ${depth.name} in your palette without using a colour family you excluded.` } : { label: "Doors", name: `${depth.name} laminate`, hex: depth.hex, why: "Uses an allowed depth colour from your palette." });
  }
  if (!c.fix.walls) out.push({ label: "Walls", name: base.name, hex: base.hex, why: "The 60% colour of your top palette." });
  if (!c.fix.cabinets && c.own) {
    const [, second, wood] = top.colours;
    out.push({ label: "Kitchen cabinets", name: `${second.name} uppers, ${wood.name} lowers`, hex: wood.hex, why: "Two-tone hides daily wear low down and keeps the top light." });
  }
  if (!c.fix.counter) {
    const granite = { label: "Kitchen counter", name: "Black granite", hex: "#1F1E1D", why: "Heat-proof and hides haldi and oil stains." };
    const quartz = { label: "Kitchen counter", name: "Light quartz", hex: "#E3DED5", why: "Brightens the kitchen and needs no sealing." };
    const first = c.cooking === "daily" ? granite : quartz;
    const second = first === granite ? quartz : granite;
    out.push(allowedHex(c, first.hex) ? first : allowedHex(c, second.hex) ? second : { label: "Kitchen counter", name: `Granite or quartz in ${top.colours[2].name.toLowerCase()}`, hex: top.colours[2].hex, why: "A shade from your palette, outside the colours you excluded." });
  }
  return out;
}

function kitchenColours(c: Ctx, top: RankedPalette, finishes: HomePlan["finishes"]): HomePlan["kitchen"] {
  const counter = c.fix.counter?.hex ?? finishes.find((f) => f.label === "Kitchen counter")!.hex;
  const cab = c.fix.cabinets;
  const dark = luminance(counter) < 0.1 || cab?.id === "dark" || (cab !== null && luminance(cab.hex) < 0.08);
  const [base, , , a1] = top.colours;
  const steel = { name: "Silver steel (inox)", hex: "#BFC2C4" };
  const rawFridge =
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
                    : { ...steel, why: "Sits easily with warm wood and light finishes." };
  const fridge = allowedHex(c, rawFridge.hex)
    ? rawFridge
    : { name: `${top.colours[1].name} or another finish outside your excluded colours`, hex: top.colours[1].hex, why: "Your colour exclusions override the usual appliance-matching rule; check actual manufacturer swatches." };
  return {
    fridge,
    storage: [
      allowedHex(c, "#C9CBCC") ? { name: "Stainless steel", hex: "#C9CBCC", why: "Always works, and lasts." } : { name: `${top.colours[2].name} containers`, hex: top.colours[2].hex, why: "A depth tone from your palette, outside the colours you excluded." },
      { name: `Clear glass, ${a1.name} lids`, hex: a1.hex, why: "Your accent colour, in small doses." },
      dark
        ? { name: `${base.name} canisters`, hex: base.hex, why: "Light pieces stand out against the dark counter." }
        : allowedHex(c, "#B08A5E")
          ? { name: "Bamboo or wood lids", hex: "#B08A5E", why: "Warms up a light counter." }
          : { name: `${top.colours[1].name} lids`, hex: top.colours[1].hex, why: "Uses an allowed palette tone instead of a colour family you excluded." },
    ],
  };
}

const COLOUR_WORDS: Record<ColourFamily, RegExp> = {
  white: /\b(white|ivory|chalk|limewash)\b/gi,
  beige: /\b(beige|cream|sand(?:-coloured)?|oatmeal|taupe)\b/gi,
  grey: /\b(grey|greige|slate|silver)\b/gi,
  black: /\b(black|charcoal|graphite)\b/gi,
  brown: /\b(brown|camel|espresso)\b/gi,
  red: /\b(red|burgundy|maroon|oxblood)\b/gi,
  pink: /\b(pink|blush|rose)\b/gi,
  orange: /\b(orange|terracotta|rust|coral|apricot)\b/gi,
  yellow: /\b(yellow|mustard|ochre|saffron|gold)\b/gi,
  green: /\b(green|sage|olive|forest|moss|jade|eucalyptus|mint)\b/gi,
  blue: /\b(blue|teal|navy|indigo|cobalt|denim)\b/gi,
  purple: /\b(purple|plum|lavender|mauve|aubergine)\b/gi,
};

const capitalise = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function constrainedText(text: string, c: Ctx, swap: string): string {
  let safe = text;
  for (const family of c.avoidColours) safe = safe.replace(COLOUR_WORDS[family], swap);
  if (c.has("pets")) safe = safe.replace(/\b(snake plant|money plant|pothos|ZZ plant)\b/gi, "pet-safe plant");
  if (c.needs("respiratory"))
    safe = safe
      .replace(/\b(wool throw|velvet cushions|dried grass)\b/gi, "washable low-dust textile")
      .replace(/\b(upholstered bed|upholstered headboard)\b/gi, "wipeable bed")
      .replace(/\b(a large rug|layered cotton dhurries|one bold rug)\b/gi, "a washable low-pile rug only if tolerated");
  if (c.needs("low-vision")) safe = safe.replace(/low, warm lamps — no overhead light at night/gi, "layered, glare-controlled light with a clearly lit route at night");
  if (c.rent && !c.allowDrill)
    safe = safe
      .replace(/open (wooden )?shelves/gi, "freestanding shelves")
      .replace(/art hung salon-style/gi, "art on freestanding ledges")
      .replace(/a wall of art in mixed frames/gi, "a grouped display on a freestanding ledge")
      .replace(/a macramé or textile hanging/gi, "a removable textile draped over a rail")
      .replace(/mugs on hooks/gi, "mugs on a countertop stand")
      .replace(/a hanging basket/gi, "a countertop basket")
      .replace(/retro wall clock/gi, "retro shelf clock");
  return safe;
}

const MATERIAL_WORDS: Record<string, RegExp> = {
  wood: /wood|ply|veneer|laminate/i,
  linen: /linen/i,
  cotton: /cotton/i,
  rattan: /rattan|cane/i,
  velvet: /velvet/i,
  stone: /stone|granite|quartz|marble/i,
  glass: /glass/i,
  metal: /metal|steel|aluminium|brass/i,
  ceramics: /ceramic|stoneware|terracotta/i,
  woven: /woven|rug|dhurrie|jute|sisal/i,
};

export function buildHomePlan(input: Answers): HomePlan {
  const c = context(input);
  const palettes = rankPalettes(c);
  const top = palettes[0];
  // An excluded colour named in advice becomes a colour from your own top palette.
  const swap = top.colours[1].name.toLowerCase();
  const names = top.colours.map((x) => x.name);
  const walls = c.paint ? `${names[0]} walls` : `Your walls stay as they are — ${names[0]} goes into rugs and throws`;
  const finishes = suggestFinishes(c, top);

  // Where advice lands in this home: a 1RK folds the living room into its one room; no balcony drops balcony-only advice.
  const at = (where: Where): RoomId | null => {
    const room = typeof where === "function" ? where(c) : where;
    return room === "living" && c.home === "1rk" ? "bedroom" : room === "balcony" && !c.balcony ? null : room;
  };
  const style = primaryStyle(c);
  const look = (id: RoomId): string[] => {
    const main = id === "living" || (id === "bedroom" && c.home === "1rk"); // where the mood and pattern advice lives
    let piece = EXTRA_LOOK[id] ?? STYLE_LOOK[style][id as keyof (typeof STYLE_LOOK)[typeof style]];
    if ((c.needs("mobility") || c.needs("wheelchair")) && main)
      piece = "Keep the selected style, but use a stable sofa with a tested seat height, supportive arms, firm edges and a clear transfer and circulation zone.";
    if ((c.needs("mobility") || c.needs("wheelchair")) && id === "balcony")
      piece = "Use supportive chairs with arms, a level non-slip route and no floor cushions or low benches; preserve turning and transfer space.";
    const access = c.needs("low-vision")
      ? ["Keep circulation predictable and use tested contrast at furniture edges, handles, switches and level changes without creating glare."]
      : [];
    const moods = c.moods.includes("calm") && c.moods.includes("energised")
      ? ["Keep most storage closed and surfaces clear, then concentrate colour and display in one intentional, well-lit focal zone."]
      : c.moods.map((m) => MOOD_LOOK[m]);
    return [piece, ...access, ...(main ? [...moods, boldLook(c.boldness)] : [])].filter(Boolean).map((line) => capitalise(constrainedText(line, c, swap)));
  };

  const rooms = roomsFor(c).map((id): RoomPlan => {
    const r = { id, name: id === "bedroom" && c.home === "1rk" ? "Your room" : ROOMS.find((x) => x.id === id)!.name };
    const materials = MATERIAL_TIPS.map((m, i) => ({ m, i, up: Number(m.up?.(c) ?? false) + c.materials.filter((material) => MATERIAL_WORDS[material].test(m.name)).length * 2 }))
      .filter(({ m }) => at(m.room) === r.id && (!m.when || m.when(c)))
      .filter(({ m }) => !c.needs("respiratory") || !/wool|jute|sisal|velvet|upholstered headboard|dried grass/i.test(`${m.name} ${m.why}`))
      .sort((x, y) => y.up - x.up || x.i - y.i)
      .slice(0, 5)
      .map(({ m }) => ({ name: capitalise(constrainedText(m.name, c, swap)), why: capitalise(constrainedText(m.why, c, swap)) }));
    const buy: Record<Verdict, Item[]> = { now: [], later: [], skip: [] };
    for (const e of ESSENTIALS) {
      const v = at(e.room) === r.id ? e.item && c.owns(e.item) ? ["skip", "You said you are bringing this. Inspect it, measure the destination and replace it only if it is unsafe or no longer suitable."] as const : e.verdict(c) : null;
      if (v) buy[v[0]].push({ name: e.name, cost: typeof e.cost === "function" ? e.cost(c) : e.cost, why: v[1], core: typeof e.core === "function" ? e.core(c) : e.core, quantity: typeof e.quantity === "function" ? e.quantity(c) : e.quantity });
    }
    const tips = TIPS.filter((t) => at(t.room) === r.id && (!t.when || t.when(c)));
    return {
      ...r,
      colourUse: COLOUR_USE[r.id](names, c, walls),
      look: look(r.id),
      materials,
      buy,
      dos: tips.filter((t) => t.kind === "do").map((t) => t.text),
      donts: tips.filter((t) => t.kind === "dont").map((t) => t.text),
    };
  });

  const chores = CHORES.map((ch) => {
    const [hand, why] = ch.pick(c);
    const hours = ch.hours(c);
    return { task: ch.task, hours, hand, why, help: ch.help, machine: ch.machine, saved: hours * (ch.savedFraction[hand] ?? 0) };
  });
  const hoursFreed = Math.round(sum(chores.map((ch) => ch.saved)) * 2) / 2;
  const choreHeadline =
    c.busy && !c.hasHelp
      ? `Your weekdays are work-led and there's no help yet. The specific hand-offs below could free about ${hoursFreed} hours a week.`
      : c.hasHelp
        ? `Only the duties you selected are credited. Together with useful machines, they could free about ${hoursFreed} hours a week.`
        : `Keep the chores you do not mind; the estimates below show where paid help or a machine changes the most hands-on time.`;

  const represented = (machine: string) => {
    const allNames = rooms.flatMap((r) => [...r.buy.now, ...r.buy.later, ...r.buy.skip]).map((item) => item.name.toLowerCase());
    const term = machine.toLowerCase();
    if (term.includes("washer")) return allNames.some((name) => name.includes("washing machine"));
    if (term.includes("dishwasher")) return allNames.some((name) => name.includes("dishwasher"));
    return allNames.some((name) => name.includes(term));
  };
  const otherPurchases: Record<Verdict, Item[]> = { now: [], later: [], skip: [] };
  for (const chore of chores) {
    if (chore.hand !== "machine" || !chore.machine || represented(chore.machine.name)) continue;
    otherPurchases.later.push({ name: chore.machine.name, cost: chore.machine.cost, why: chore.why });
  }

  const band = BUDGETS.find((b) => b.id === c.budget) ?? BUDGETS[1];
  const total = c.budgetAmount ?? band.total;
  const allNow = () => [...rooms.flatMap((r) => r.buy.now), ...otherPurchases.now];
  const minimum = sumCost(allNow().filter((item) => item.core));
  const movable = [
    ...rooms.flatMap((room) => room.buy.now.filter((item) => !item.core && costRange(item.cost)).map((item) => ({ item, from: room.buy.now, to: room.buy.later }))),
    ...otherPurchases.now.filter((item) => !item.core && costRange(item.cost)).map((item) => ({ item, from: otherPurchases.now, to: otherPurchases.later })),
  ].sort((a, b) => costRange(b.item.cost)![1] * (b.item.quantity ?? 1) - costRange(a.item.cost)![1] * (a.item.quantity ?? 1));
  const postpone: Item[] = [];
  for (const candidate of movable) {
    if (sumCost(allNow())[1] <= total) break;
    const index = candidate.from.indexOf(candidate.item);
    if (index < 0) continue;
    candidate.from.splice(index, 1);
    candidate.to.push(candidate.item);
    postpone.push(candidate.item);
  }
  const cost = {
    now: sumCost(allNow()),
    later: sumCost([...rooms.flatMap((r) => r.buy.later), ...otherPurchases.later]),
  };
  const fit = cost.now[1] <= total ? "fits" : cost.now[0] <= total ? "stretch" : "over";

  const extraRoom = (item: Item): RoomId => /pressure cooker/i.test(item.name) ? "kitchen" : "living";
  const roomWeights = rooms.map((room) => {
    const range = sumCost([
      ...room.buy.now,
      ...room.buy.later,
      ...otherPurchases.now.filter((item) => extraRoom(item) === room.id),
      ...otherPurchases.later.filter((item) => extraRoom(item) === room.id),
    ]);
    return (range[0] + range[1]) / 2;
  });
  const normalizedWeights = sum(roomWeights) ? roomWeights : roomWeights.map(() => 1);
  const weightTotal = sum(normalizedWeights);
  const exactShares = normalizedWeights.map((weight) => (weight * 100) / weightTotal);
  const shares = exactShares.map(Math.floor);
  const remainderOrder = exactShares.map((value, index) => ({ index, remainder: value - Math.floor(value) })).sort((a, b) => b.remainder - a.remainder);
  const missingShares = 100 - sum(shares);
  for (let i = 0; i < missingShares; i++) shares[remainderOrder[i % remainderOrder.length].index]++;
  const amounts = shares.map((share) => Math.floor((total * share) / 100 / 1000) * 1000);
  if (amounts.length) amounts[amounts.length - 1] += total - sum(amounts);

  const bedroomCapacity = c.home === "1rk" || c.home === "1bhk" ? 1 : Number(c.home?.[0] ?? 2);
  const unassignedBedrooms = Math.max(0, bedroomCapacity - 1 - (c.has("flatmates") ? 1 : 0) - rooms.filter((room) => ["parents", "kids", "study", "guest"].includes(room.id)).length);
  const undescribedPeople = Math.max(0, c.people - minPeople(c.household));
  const constraints = [
    c.schemaVersion === 1 && "This plan came from the earlier questionnaire. Edit it once to confirm the new safety, inventory and budget fields.",
    c.people > bedroomCapacity * 2 && `${c.people} people in ${label(HOMES, c.home)} needs an explicit sleeping and privacy plan; the quiz cannot prove that this occupancy is workable.`,
    c.counted && undescribedPeople > 0 && `The headcount includes ${undescribedPeople} ${undescribedPeople === 1 ? "person" : "people"} beyond the household roles selected. Confirm their sleeping, storage and accessibility needs separately.`,
    c.has("flatmates") && "The quiz does not know how many bedrooms the flatmates occupy; confirm every person's room before ordering furniture.",
    c.home === "6bhk-plus" && "For 6BHK and larger homes, the report models the main bedroom plus four role-based rooms; map every additional bedroom separately before buying.",
    unassignedBedrooms > 0 && `${unassignedBedrooms} ${unassignedBedrooms === 1 ? "bedroom is" : "bedrooms are"} not assigned a role by your answers, so the report intentionally leaves them unfurnished rather than inventing a use.`,
    (c.bathrooms ?? 1) > 1 && `The bathroom section is one shared template for ${c.bathrooms} bathrooms. Measure and safety-check each wet area separately before repeating any purchase.`,
    !c.balcony && "No balcony does not make the bathroom a safe laundry zone. Confirm a manufacturer-approved water, drain, ventilation and protected-power point.",
    (c.needs("mobility") || c.needs("wheelchair")) && "Accessibility dimensions and support locations need an in-person occupational-therapy or accessibility assessment.",
    c.needs("low-vision") && "Lighting and contrast need to be tested in the actual rooms with the person who will use them; this palette is not a low-vision assessment.",
    c.needs("respiratory") && "Asthma and allergy triggers are individual. Verify textiles, plants, cleaning products and finish emissions against the person's clinician-led plan before buying.",
    fit === "over" && `Even the remaining buy-now essentials exceed the ₹${Math.round(total).toLocaleString("en-IN")} ceiling. Do not order from this plan until the scope or budget changes.`,
  ].filter(Boolean) as string[];

  return {
    primaryStyle: primaryStyle(c),
    summary: [label(TENURES, c.tenure), label(HOMES, c.home), c.people === 1 ? "Just you" : c.counted || c.people === estimateExact(c) ? `${c.people} people` : `About ${c.people} people`, label(CLIMATES, c.climate), label(WORKS, c.work), label(COOKING, c.cooking)].filter((x) => x !== undefined),
    palettes,
    fixtureNotes: FIXTURE_NOTES.filter((n) => n.when(c)).map((n) => n.text),
    finishes,
    kitchen: kitchenColours(c, top, finishes),
    rooms,
    otherPurchases,
    constraints,
    chores,
    hoursFreed,
    choreHeadline,
    checks: CHECKS.filter((x) => !x.when || x.when(c)).map((x) => x.text),
    budget: {
      total,
      label: band.label,
      rooms: rooms.map(({ id, name }, index) => ({ id, name, share: shares[index], amount: amounts[index] })),
      cost,
      fit,
      minimum,
      postpone,
      tips: BUDGET_TIPS.filter((t) => t.when(c)).map(({ kind, text }) => ({ kind, text })),
    },
  };
}
