import { PHOTOS, type Photo } from "./photos.ts";

export type StyleId =
  | "organic-modern"
  | "japandi"
  | "scandinavian"
  | "warm-minimalist"
  | "moody-contemporary"
  | "modern-classic"
  | "bohemian"
  | "mid-century"
  | "mediterranean"
  | "eclectic";
export type MoodId = "calm" | "cozy" | "luxurious" | "airy" | "creative" | "grounded" | "romantic" | "energised";
export type ColourFamily =
  | "white"
  | "beige"
  | "grey"
  | "black"
  | "brown"
  | "red"
  | "pink"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple";
export type MaterialId =
  | "wood"
  | "linen"
  | "cotton"
  | "rattan"
  | "velvet"
  | "stone"
  | "glass"
  | "metal"
  | "ceramics"
  | "woven";

export type Weights<K extends string> = Partial<Record<K, number>>;

// ---------- Colour library: every swatch the engine can choose from ----------

export interface Colour {
  name: string;
  hex: string;
  family: ColourFamily;
}

export const COLOURS = {
  cream: { name: "Cream", hex: "#F2E8D5", family: "beige" },
  camel: { name: "Camel", hex: "#C19A6B", family: "brown" },
  terracotta: { name: "Terracotta", hex: "#B86B4B", family: "orange" },
  olive: { name: "Olive", hex: "#6F7148", family: "green" },
  walnut: { name: "Walnut", hex: "#5C4033", family: "brown" },
  ivory: { name: "Ivory", hex: "#F6F1E7", family: "white" },
  sage: { name: "Sage", hex: "#B5BFA4", family: "green" },
  mist: { name: "Mist Blue", hex: "#C9D3D9", family: "blue" },
  stone: { name: "Stone", hex: "#D6CCBE", family: "beige" },
  softGrey: { name: "Soft Grey", hex: "#C8C6C1", family: "grey" },
  charcoal: { name: "Charcoal", hex: "#36393B", family: "black" },
  forest: { name: "Deep Forest", hex: "#2F4538", family: "green" },
  taupe: { name: "Taupe", hex: "#8B7D6F", family: "brown" },
  bronze: { name: "Bronze", hex: "#8C6A3F", family: "brown" },
  espresso: { name: "Espresso", hex: "#3B2A22", family: "brown" },
  coral: { name: "Coral", hex: "#E07A5F", family: "orange" },
  ochre: { name: "Ochre", hex: "#CC9A3B", family: "yellow" },
  teal: { name: "Teal", hex: "#2E7D7A", family: "blue" },
  lavender: { name: "Lavender", hex: "#B8A9C9", family: "purple" },
  warmCream: { name: "Warm Cream", hex: "#F3E7D3", family: "beige" },
  white: { name: "Soft White", hex: "#FAFAF7", family: "white" },
  beige: { name: "Beige", hex: "#E3D8C6", family: "beige" },
  greige: { name: "Greige", hex: "#B9B1A5", family: "grey" },
  warmWood: { name: "Warm Wood", hex: "#A87B51", family: "brown" },
  burgundy: { name: "Burgundy", hex: "#6E2233", family: "red" },
  emerald: { name: "Emerald", hex: "#1F5F4A", family: "green" },
  mustard: { name: "Mustard", hex: "#C99A2E", family: "yellow" },
  plum: { name: "Plum", hex: "#5B2E4F", family: "purple" },
  warmIvory: { name: "Warm Ivory", hex: "#F4ECDD", family: "white" },
  // Supporting tones used by styles and moods
  linen: { name: "Linen", hex: "#EAE2D4", family: "beige" },
  chalk: { name: "Chalk", hex: "#EFEDE8", family: "white" },
  sand: { name: "Sand", hex: "#DCCBB0", family: "beige" },
  oak: { name: "Oak", hex: "#B08A5E", family: "brown" },
  clay: { name: "Clay", hex: "#A65E44", family: "orange" },
  rust: { name: "Rust", hex: "#9C4A2E", family: "orange" },
  moss: { name: "Moss", hex: "#7A7F55", family: "green" },
  pine: { name: "Pine", hex: "#3E5641", family: "green" },
  blush: { name: "Blush", hex: "#E3C4B8", family: "pink" },
  rose: { name: "Dusty Rose", hex: "#C08081", family: "pink" },
  navy: { name: "Navy", hex: "#24324A", family: "blue" },
  inkBlue: { name: "Ink Blue", hex: "#2D3E50", family: "blue" },
  sky: { name: "Pale Sky", hex: "#A8C3D1", family: "blue" },
  cobalt: { name: "Cobalt", hex: "#2F52A0", family: "blue" },
  saffron: { name: "Saffron", hex: "#E0A03A", family: "yellow" },
  brass: { name: "Brass", hex: "#B08D57", family: "yellow" },
  warmGrey: { name: "Warm Grey", hex: "#A9A39A", family: "grey" },
  dove: { name: "Dove", hex: "#DAD6CF", family: "grey" },
  slate: { name: "Slate", hex: "#5E6870", family: "grey" },
  aubergine: { name: "Aubergine", hex: "#3F2A3B", family: "purple" },
  oxblood: { name: "Oxblood", hex: "#4A1C22", family: "red" },
  paleBlush: { name: "Pale Blush", hex: "#F3E3DC", family: "pink" },
  paleSage: { name: "Pale Sage", hex: "#E4E8DC", family: "green" },
  teak: { name: "Teak", hex: "#8A5A3B", family: "brown" },
  indigo: { name: "Indigo", hex: "#2E3A6B", family: "blue" },
  haldi: { name: "Haldi", hex: "#D9A21B", family: "yellow" },
  sandstone: { name: "Sandstone", hex: "#D8B48E", family: "beige" },
  peacock: { name: "Peacock", hex: "#1F6E73", family: "blue" },
  powderBlue: { name: "Powder Blue", hex: "#D6E4EC", family: "blue" },
  dustyBlue: { name: "Dusty Blue", hex: "#7C93A8", family: "blue" },
  denim: { name: "Denim", hex: "#4A6283", family: "blue" },
  sea: { name: "Sea", hex: "#3F7F8C", family: "blue" },
  graphite: { name: "Graphite", hex: "#4B4E52", family: "black" },
  mushroom: { name: "Mushroom", hex: "#BDB2A3", family: "grey" },
  eucalyptus: { name: "Eucalyptus", hex: "#8FA89A", family: "green" },
  jade: { name: "Jade", hex: "#4F8A73", family: "green" },
  leaf: { name: "Leaf", hex: "#5E7D4B", family: "green" },
  mint: { name: "Mint", hex: "#CFE3D4", family: "green" },
  mauve: { name: "Mauve", hex: "#A98B98", family: "purple" },
  apricot: { name: "Apricot", hex: "#E8B08A", family: "orange" },
  marigold: { name: "Marigold", hex: "#E39B2D", family: "orange" },
  maroon: { name: "Maroon", hex: "#7A2E2E", family: "red" },
  raniPink: { name: "Rani Pink", hex: "#C2416E", family: "pink" },
  limewash: { name: "Limewash", hex: "#ECE6DA", family: "white" },
} satisfies Record<string, Colour>;

export type ColourId = keyof typeof COLOURS;

export const COLOUR_FAMILIES: { id: ColourFamily; label: string; swatches: string[] }[] = [
  { id: "white", label: "Whites & ivory", swatches: ["#FAFAF7", "#F6F1E7"] },
  { id: "beige", label: "Beige, cream & sand", swatches: ["#E3D8C6", "#DCCBB0"] },
  { id: "grey", label: "Greys & greige", swatches: ["#C8C6C1", "#5E6870"] },
  { id: "black", label: "Black & charcoal", swatches: ["#36393B", "#1E1E1E"] },
  { id: "brown", label: "Browns & tan", swatches: ["#C19A6B", "#5C4033"] },
  { id: "red", label: "Reds & burgundy", swatches: ["#B03A3A", "#6E2233"] },
  { id: "pink", label: "Pinks & blush", swatches: ["#E3C4B8", "#C08081"] },
  { id: "orange", label: "Oranges & terracotta", swatches: ["#E07A5F", "#B86B4B"] },
  { id: "yellow", label: "Yellows & mustard", swatches: ["#E0A03A", "#C99A2E"] },
  { id: "green", label: "Greens & olive", swatches: ["#B5BFA4", "#2F4538"] },
  { id: "blue", label: "Blues & teal", swatches: ["#C9D3D9", "#2E7D7A"] },
  { id: "purple", label: "Purples & plum", swatches: ["#B8A9C9", "#5B2E4F"] },
];

// ---------- Q1: style references ----------

export interface Style {
  id: StyleId;
  name: string;
  photo: Photo;
  caption: string;
  materials: MaterialId[];
  moods: Weights<MoodId>;
  boldness: number; // 1–5
}

export const STYLES: Style[] = [
  {
    id: "organic-modern",
    name: "Organic Modern",
    photo: PHOTOS.organicModern,
    caption: "Sculptural, soft, rooted in nature",
    materials: ["wood", "linen", "stone", "ceramics", "woven"],
    moods: { calm: 2, grounded: 3, cozy: 2, airy: 1 },
    boldness: 2,
  },
  {
    id: "japandi",
    name: "Japandi",
    photo: PHOTOS.japandi,
    caption: "Quiet craft, low lines, calm",
    materials: ["wood", "linen", "ceramics", "stone", "rattan"],
    moods: { calm: 3, grounded: 2, airy: 1 },
    boldness: 2,
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    photo: PHOTOS.scandinavian,
    caption: "Light, practical, gently cozy",
    materials: ["wood", "cotton", "linen", "woven", "ceramics"],
    moods: { airy: 3, calm: 2, cozy: 2 },
    boldness: 2,
  },
  {
    id: "warm-minimalist",
    name: "Warm Minimalist",
    photo: PHOTOS.warmMinimalist,
    caption: "Fewer things, warmer tones",
    materials: ["linen", "wood", "stone", "ceramics", "cotton"],
    moods: { calm: 3, cozy: 1, grounded: 1, airy: 1 },
    boldness: 1,
  },
  {
    id: "moody-contemporary",
    name: "Moody Contemporary",
    photo: PHOTOS.moodyContemporary,
    caption: "Deep tones, low light, drama",
    materials: ["velvet", "metal", "stone", "glass", "wood"],
    moods: { luxurious: 3, grounded: 1, romantic: 1, cozy: 1 },
    boldness: 4,
  },
  {
    id: "modern-classic",
    name: "Modern Classic",
    photo: PHOTOS.modernClassic,
    caption: "Timeless detail, edited for today",
    materials: ["stone", "metal", "velvet", "linen", "glass"],
    moods: { luxurious: 2, calm: 2, romantic: 2 },
    boldness: 2,
  },
  {
    id: "bohemian",
    name: "Bohemian",
    photo: PHOTOS.bohemian,
    caption: "Layered, plant-filled, well-travelled",
    materials: ["rattan", "woven", "cotton", "ceramics", "wood"],
    moods: { creative: 3, cozy: 3, romantic: 1, energised: 1 },
    boldness: 4,
  },
  {
    id: "mid-century",
    name: "Mid-Century Modern",
    photo: PHOTOS.midCentury,
    caption: "Iconic shapes, warm wood, optimism",
    materials: ["wood", "metal", "velvet", "glass", "woven"],
    moods: { creative: 2, grounded: 2, energised: 1, cozy: 1 },
    boldness: 3,
  },
  {
    id: "mediterranean",
    name: "Mediterranean",
    photo: PHOTOS.mediterranean,
    caption: "Sunlit plaster, arches, ease",
    materials: ["stone", "ceramics", "linen", "rattan", "wood"],
    moods: { airy: 2, romantic: 2, grounded: 2, energised: 1 },
    boldness: 3,
  },
  {
    id: "eclectic",
    name: "Colourful Eclectic",
    photo: PHOTOS.eclectic,
    caption: "Bold colour, art, personality",
    materials: ["velvet", "ceramics", "glass", "woven", "metal"],
    moods: { creative: 3, energised: 3, romantic: 1 },
    boldness: 5,
  },
];


// ---------- Q2: moods ----------

export interface Mood {
  id: MoodId;
  name: string;
  hint: string;
  tint: [string, string];
}

export const MOODS: Mood[] = [
  { id: "calm", name: "Calm", hint: "A quiet exhale", tint: ["#E4E8DC", "#B5BFA4"] },
  { id: "cozy", name: "Cozy", hint: "Wrapped in warmth", tint: ["#F2E8D5", "#C19A6B"] },
  { id: "luxurious", name: "Luxurious", hint: "Quietly indulgent", tint: ["#D9CBB4", "#8C6A3F"] },
  { id: "airy", name: "Airy", hint: "Light and open", tint: ["#FAFAF7", "#C9D3D9"] },
  { id: "creative", name: "Creative", hint: "Sparks ideas", tint: ["#F3E7D3", "#E07A5F"] },
  { id: "grounded", name: "Grounded", hint: "Steady and earthy", tint: ["#DCCBB0", "#6F7148"] },
  { id: "romantic", name: "Romantic", hint: "Soft and dreamy", tint: ["#F3E3DC", "#C08081"] },
  { id: "energised", name: "Energised", hint: "Lively momentum", tint: ["#F6E3B8", "#E0A03A"] },
];

// ---------- Q4: boldness ----------

export const BOLDNESS_LABELS = ["Quiet and understated", "Subtle", "Balanced", "Expressive", "Bold and characterful"] as const;

// ---------- Q5: materials ----------

export interface Material {
  id: MaterialId;
  name: string;
  photo: Photo;
}

export const MATERIALS: Material[] = [
  { id: "wood", name: "Wood", photo: PHOTOS.wood },
  { id: "linen", name: "Linen", photo: PHOTOS.linen },
  { id: "cotton", name: "Cotton", photo: PHOTOS.cotton },
  { id: "rattan", name: "Rattan & cane", photo: PHOTOS.rattan },
  { id: "velvet", name: "Velvet", photo: PHOTOS.velvet },
  { id: "stone", name: "Stone", photo: PHOTOS.stone },
  { id: "glass", name: "Glass", photo: PHOTOS.glass },
  { id: "metal", name: "Metal", photo: PHOTOS.metal },
  { id: "ceramics", name: "Ceramics", photo: PHOTOS.ceramics },
  { id: "woven", name: "Soft woven textiles", photo: PHOTOS.woven },
];

// ---------- Q6–Q12: your home and routine ----------

export type Tenure = "rent" | "own";
export type HomeSize = "1rk" | "1bhk" | "2bhk" | "3bhk";
export type Climate = "humid" | "north" | "mild" | "hills";
export type Member = "partner" | "kids" | "elders" | "pets" | "flatmates";
export type Work = "wfh" | "hybrid" | "office" | "long";
export type Cooking = "daily" | "light" | "rarely";
export type Help = "none" | "maid" | "maid-cook" | "full-time";
export type Budget = "tight" | "mid" | "high" | "premium";

export interface Option<T extends string> {
  id: T;
  label: string;
  hint: string;
}

export const TENURES: Option<Tenure>[] = [
  { id: "rent", label: "Renting", hint: "Deposit-safe, no-drill advice" },
  { id: "own", label: "My own flat", hint: "Includes modular and built-in work" },
];

export const HOMES: Option<HomeSize>[] = [
  { id: "1rk", label: "1RK", hint: "One room + kitchen" },
  { id: "1bhk", label: "1BHK", hint: "" },
  { id: "2bhk", label: "2BHK", hint: "" },
  { id: "3bhk", label: "3BHK+", hint: "" },
];

export const CLIMATES: Option<Climate>[] = [
  { id: "humid", label: "Humid & coastal", hint: "Mumbai, Chennai, Kolkata, Kochi" },
  { id: "north", label: "Hot summers, cold winters", hint: "Delhi, Jaipur, Lucknow, Ahmedabad" },
  { id: "mild", label: "Mild most of the year", hint: "Bengaluru, Pune, Hyderabad" },
  { id: "hills", label: "Cool & hilly", hint: "Dehradun, Shimla, Shillong" },
];

export const MEMBERS: Option<Member>[] = [
  { id: "partner", label: "Partner", hint: "" },
  { id: "kids", label: "Kids", hint: "" },
  { id: "elders", label: "Elderly parents", hint: "" },
  { id: "pets", label: "Pets", hint: "" },
  { id: "flatmates", label: "Flatmates", hint: "" },
];

export const WORKS: Option<Work>[] = [
  { id: "wfh", label: "Work from home", hint: "Home is the office" },
  { id: "hybrid", label: "Hybrid", hint: "A few days in, a few at home" },
  { id: "office", label: "Office, 9 to 6", hint: "Out most of the day" },
  { id: "long", label: "Long hours or shifts", hint: "Home is for sleeping" },
];

export const COOKING: Option<Cooking>[] = [
  { id: "daily", label: "Full meals daily", hint: "Tadka, rotis, the works" },
  { id: "light", label: "Light cooking", hint: "Breakfast, chai, the odd dal" },
  { id: "rarely", label: "Mostly order in", hint: "The kitchen is for reheating" },
];

export const HELPS: Option<Help>[] = [
  { id: "none", label: "No help yet", hint: "We do it ourselves" },
  { id: "maid", label: "Part-time maid", hint: "Cleaning and dishes" },
  { id: "maid-cook", label: "Maid and a cook", hint: "Cleaning, dishes and meals" },
  { id: "full-time", label: "Full-time help", hint: "Someone there all day" },
];

export const BUDGETS: (Option<Budget> & { total: number })[] = [
  { id: "tight", label: "Under ₹1.5 lakh", hint: "Essentials first", total: 120000 },
  { id: "mid", label: "₹1.5–4 lakh", hint: "Comfortable", total: 275000 },
  { id: "high", label: "₹4–10 lakh", hint: "Well done, room by room", total: 700000 },
  { id: "premium", label: "₹10 lakh+", hint: "No corners cut", total: 1200000 },
];

// ---------- Q7: what's already in the flat ----------

export type FixtureKey = "floor" | "doors" | "walls" | "counter" | "cabinets";
export interface FixtureOption {
  id: string;
  label: string;
  hex: string; // typical colour, used unless the person enters their exact one
  ownerOnly?: boolean;
  rentOnly?: boolean;
}
export interface FixturePick {
  id: string;
  hex?: string; // exact colour from a photo, if given
}

export const UNDECIDED = "undecided";
export const NONE = "none";
export const COLOUR_PICKER_URL = "https://imagecolorpicker.com/";

export const FIXTURES: { key: FixtureKey; label: string; options: FixtureOption[] }[] = [
  {
    key: "floor",
    label: "Floor",
    options: [
      { id: "white-tiles", label: "White or ivory tiles", hex: "#EDEAE3" },
      { id: "beige-tiles", label: "Beige tiles", hex: "#D9C7A7" },
      { id: "grey-tiles", label: "Grey tiles", hex: "#A8AAAB" },
      { id: "wood-look", label: "Wood-look tiles or laminate", hex: "#A67B55" },
      { id: "marble", label: "White marble", hex: "#E6E2DA" },
      { id: "dark-stone", label: "Dark stone or granite", hex: "#3E3B39" },
      { id: UNDECIDED, label: "Not decided yet", hex: "", ownerOnly: true },
    ],
  },
  {
    key: "doors",
    label: "Doors",
    options: [
      { id: "teak", label: "Teak or honey wood", hex: "#9A6738" },
      { id: "walnut", label: "Dark walnut", hex: "#4A3326" },
      { id: "white", label: "White or light laminate", hex: "#EEEAE2" },
      { id: UNDECIDED, label: "Not decided yet", hex: "", ownerOnly: true },
    ],
  },
  {
    key: "walls",
    label: "Walls",
    options: [
      { id: "white", label: "White", hex: "#F5F4F0" },
      { id: "off-white", label: "Off-white or cream", hex: "#EFE7D6" },
      { id: "coloured", label: "Already coloured", hex: "#D8CFC2" },
      { id: UNDECIDED, label: "Not painted yet", hex: "", ownerOnly: true },
    ],
  },
  {
    key: "counter",
    label: "Kitchen counter",
    options: [
      { id: "black-granite", label: "Black granite", hex: "#1F1E1D" },
      { id: "light-stone", label: "Light granite or quartz", hex: "#D9D3C8" },
      { id: UNDECIDED, label: "Not fitted yet", hex: "", ownerOnly: true },
    ],
  },
  {
    key: "cabinets",
    label: "Kitchen cabinets",
    options: [
      { id: "white", label: "White or off-white", hex: "#F1EEE8" },
      { id: "wood", label: "Wood finish", hex: "#A97A50" },
      { id: "grey", label: "Grey", hex: "#8E9194" },
      { id: "dark", label: "Dark (black, navy, deep green)", hex: "#2C3034" },
      { id: "colour", label: "Another colour", hex: "#B8C4B0" },
      { id: NONE, label: "No cabinets, just a platform", hex: "", rentOnly: true },
      { id: UNDECIDED, label: "Not decided yet", hex: "", ownerOnly: true },
    ],
  },
];

// Options a renter or owner can see for one surface.
export const fixtureOptions = (f: (typeof FIXTURES)[number], own: boolean) => f.options.filter((o) => (own ? !o.rentOnly : !o.ownerOnly));

export const HEX = /^#[0-9A-F]{6}$/;
export const normaliseHex = (v: string) => {
  const h = "#" + v.trim().replace(/^#/, "").toUpperCase();
  return HEX.test(h) ? h : null;
};

// ---------- Answers ----------

export interface Answers {
  styles: StyleId[];
  moods: MoodId[];
  avoidColours: ColourFamily[];
  boldness: number;
  materials: MaterialId[];
  tenure: Tenure | null;
  home: HomeSize | null;
  vastu: boolean;
  balcony: boolean;
  climate: Climate | null;
  household: Member[];
  people: number | null; // headcount including you; null = not given, so we estimate
  work: Work | null;
  cooking: Cooking | null;
  help: Help | null;
  budget: Budget | null;
  fixtures: Record<FixtureKey, FixturePick | null>;
  repaint: boolean;
}

export const STEP_COUNT = 13;

// Headcount. Each person-type you pick means at least one more person (pets don't count).
export const MAX_PEOPLE = 12;
export const minPeople = (household: Member[]) => 1 + household.filter((m) => m !== "pets").length;
// With no count given, kids, parents and flatmates are assumed to come in twos.
export const estimatePeople = (household: Member[]) =>
  1 + (household.includes("partner") ? 1 : 0) + 2 * household.filter((m) => m === "kids" || m === "elders" || m === "flatmates").length;
export const peopleCount = (a: Pick<Answers, "household" | "people">) => Math.max(a.people ?? estimatePeople(a.household), minPeople(a.household));
export const LIMITS = { styles: 3, moods: 2, avoidColours: 6, materials: 5, household: 5 } as const;

export const EMPTY_ANSWERS: Answers = {
  styles: [],
  moods: [],
  avoidColours: [],
  boldness: 3,
  materials: [],
  tenure: null,
  home: null,
  vastu: false,
  balcony: true,
  climate: null,
  household: [],
  people: null,
  work: null,
  cooking: null,
  help: null,
  budget: null,
  fixtures: { floor: null, doors: null, walls: null, counter: null, cabinets: null },
  repaint: false,
};

const ids = <T extends { id: string }>(list: T[]) => new Set(list.map((x) => x.id));
const VALID = {
  styles: ids(STYLES),
  moods: ids(MOODS),
  avoidColours: ids(COLOUR_FAMILIES),
  materials: ids(MATERIALS),
  household: ids(MEMBERS),
};
const CHOICES = { tenure: ids(TENURES), home: ids(HOMES), climate: ids(CLIMATES), work: ids(WORKS), cooking: ids(COOKING), help: ids(HELPS), budget: ids(BUDGETS) };
export type ChoiceKey = keyof typeof CHOICES;

// Answers arrive from localStorage or share links, so treat them as untrusted.
export function sanitizeAnswers(raw: unknown): Answers {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const list = <K extends keyof typeof LIMITS>(key: K) =>
    (Array.isArray(r[key]) ? [...new Set(r[key] as unknown[])] : [])
      .filter((v): v is string => typeof v === "string" && VALID[key].has(v))
      .slice(0, LIMITS[key]) as never;
  const one = (key: ChoiceKey) => (typeof r[key] === "string" && CHOICES[key].has(r[key]) ? r[key] : null) as never;
  const b = Number(r.boldness);
  return {
    styles: list("styles"),
    moods: list("moods"),
    avoidColours: list("avoidColours"),
    boldness: Number.isFinite(b) ? Math.min(5, Math.max(1, Math.round(b))) : 3,
    materials: list("materials"),
    tenure: one("tenure"),
    home: one("home"),
    vastu: r.vastu === true,
    balcony: r.balcony !== false,
    climate: one("climate"),
    household: list("household"),
    people: Number.isInteger(r.people) && (r.people as number) >= 1 && (r.people as number) <= MAX_PEOPLE ? (r.people as number) : null,
    work: one("work"),
    cooking: one("cooking"),
    help: one("help"),
    budget: one("budget"),
    fixtures: sanitizeFixtures(r.fixtures),
    repaint: r.repaint === true,
  };
}

function sanitizeFixtures(raw: unknown): Answers["fixtures"] {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, { id?: unknown; hex?: unknown } | undefined>;
  const out = { ...EMPTY_ANSWERS.fixtures };
  for (const f of FIXTURES) {
    const v = r[f.key];
    if (!v || typeof v.id !== "string" || !f.options.some((o) => o.id === v.id)) continue;
    const hex = typeof v.hex === "string" ? normaliseHex(v.hex) : null;
    out[f.key] = hex && v.id !== UNDECIDED && v.id !== NONE ? { id: v.id, hex } : { id: v.id };
  }
  return out;
}

export function isComplete(a: Answers): boolean {
  return (
    a.styles.length > 0 &&
    a.moods.length > 0 &&
    a.materials.length > 0 &&
    (Object.keys(CHOICES) as ChoiceKey[]).every((k) => a[k] !== null) &&
    FIXTURES.every((f) => a.fixtures[f.key] !== null)
  );
}

export const byId = <T extends { id: string }>(list: T[], id: string): T => list.find((x) => x.id === id)!;
