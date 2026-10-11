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
export type PaletteId =
  | "warm-earthy"
  | "soft-airy"
  | "moody-elegant"
  | "playful-creative"
  | "clean-minimal"
  | "rich-expressive";
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
export type DislikeId =
  | "clutter"
  | "decoration"
  | "bright"
  | "dark"
  | "patterns"
  | "cold"
  | "minimalism"
  | "artificial";
export type StatementId = "quiet" | "warm" | "statement" | "elegant" | "creative" | "balanced";

type Weights<K extends string> = Partial<Record<K, number>>;

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
  noun: string; // used in the persona title, e.g. "The Serene Essentialist"
  photo: Photo;
  caption: string;
  essence: string;
  blend: string; // phrase used when this is the secondary style
  avoid: string;
  palette: ColourId[];
  materials: MaterialId[];
  moods: Weights<MoodId>;
  contrast: number; // 1–5
  density: number; // decorative density 1–5
  boldness: number; // 1–5
  warmth: number; // -2 cool … +2 warm
}

export const STYLES: Style[] = [
  {
    id: "organic-modern",
    name: "Organic Modern",
    noun: "Naturalist",
    photo: PHOTOS.organicModern,
    caption: "Sculptural, soft, rooted in nature",
    essence:
      "Organic Modern pairs clean, contemporary lines with the irregular beauty of natural materials — rounded forms, raw textures and colours borrowed from earth and clay.",
    blend: "the tactile, nature-led softness of Organic Modern",
    avoid: "Glossy surfaces and sharp synthetic finishes that break the natural mood.",
    palette: ["linen", "stone", "oak", "clay", "moss"],
    materials: ["wood", "linen", "stone", "ceramics", "woven"],
    moods: { calm: 2, grounded: 3, cozy: 2, airy: 1 },
    contrast: 2,
    density: 2,
    boldness: 2,
    warmth: 1,
  },
  {
    id: "japandi",
    name: "Japandi",
    noun: "Purist",
    photo: PHOTOS.japandi,
    caption: "Quiet craft, low lines, calm",
    essence:
      "Japandi blends Japanese restraint with Scandinavian comfort: low furniture, honest craftsmanship and a deliberate calm where every object has room to breathe.",
    blend: "the quiet craftsmanship of Japandi",
    avoid: "Heavy, ornate furniture and crowded surfaces.",
    palette: ["chalk", "stone", "oak", "charcoal", "moss"],
    materials: ["wood", "linen", "ceramics", "stone", "rattan"],
    moods: { calm: 3, grounded: 2, airy: 1 },
    contrast: 3,
    density: 1,
    boldness: 2,
    warmth: 0,
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    noun: "Nordic Modernist",
    photo: PHOTOS.scandinavian,
    caption: "Light, practical, gently cozy",
    essence:
      "Scandinavian design is built on light and ease — pale woods, soft whites and practical pieces that make everyday living feel effortless and warm.",
    blend: "the light-filled ease of Scandinavian design",
    avoid: "Dark, heavy drapery that blocks precious daylight.",
    palette: ["white", "dove", "oak", "sky", "sage"],
    materials: ["wood", "cotton", "linen", "woven", "ceramics"],
    moods: { airy: 3, calm: 2, cozy: 2 },
    contrast: 2,
    density: 2,
    boldness: 2,
    warmth: -0.5,
  },
  {
    id: "warm-minimalist",
    name: "Warm Minimalist",
    noun: "Essentialist",
    photo: PHOTOS.warmMinimalist,
    caption: "Fewer things, warmer tones",
    essence:
      "Warm Minimalism is restraint with a heartbeat: fewer, better things in soft, sun-warmed neutrals, so the room feels serene rather than sterile.",
    blend: "the soft restraint of Warm Minimalism",
    avoid: "Stark, cool whites that make a sparse room feel clinical.",
    palette: ["ivory", "sand", "camel", "warmGrey", "espresso"],
    materials: ["linen", "wood", "stone", "ceramics", "cotton"],
    moods: { calm: 3, cozy: 1, grounded: 1, airy: 1 },
    contrast: 2,
    density: 1,
    boldness: 1,
    warmth: 2,
  },
  {
    id: "moody-contemporary",
    name: "Moody Contemporary",
    noun: "Urbanist",
    photo: PHOTOS.moodyContemporary,
    caption: "Deep tones, low light, drama",
    essence:
      "Moody Contemporary embraces depth — saturated darks, pools of low light and rich surfaces that make a room feel enveloping and quietly dramatic.",
    blend: "the atmospheric depth of Moody Contemporary",
    avoid: "Flat overhead lighting that drains a deep palette of its richness.",
    palette: ["charcoal", "forest", "taupe", "bronze", "inkBlue"],
    materials: ["velvet", "metal", "stone", "glass", "wood"],
    moods: { luxurious: 3, grounded: 1, romantic: 1, cozy: 1 },
    contrast: 5,
    density: 2,
    boldness: 4,
    warmth: 0,
  },
  {
    id: "modern-classic",
    name: "Modern Classic",
    noun: "Classicist",
    photo: PHOTOS.modernClassic,
    caption: "Timeless detail, edited for today",
    essence:
      "Modern Classic borrows the proportion and detail of traditional rooms — mouldings, stone, symmetry — and edits them with a contemporary lightness.",
    blend: "the timeless proportion of Modern Classic",
    avoid: "Trend-led novelty pieces that date quickly.",
    palette: ["chalk", "greige", "navy", "brass", "sage"],
    materials: ["stone", "metal", "velvet", "linen", "glass"],
    moods: { luxurious: 2, calm: 2, romantic: 2 },
    contrast: 3,
    density: 3,
    boldness: 2,
    warmth: 0,
  },
  {
    id: "bohemian",
    name: "Bohemian",
    noun: "Free Spirit",
    photo: PHOTOS.bohemian,
    caption: "Layered, plant-filled, well-travelled",
    essence:
      "Bohemian rooms are collected rather than designed — layered textiles, plants, handmade pieces and souvenirs that make the space feel lived-in and free.",
    blend: "the layered, collected warmth of Bohemian style",
    avoid: "Mass-produced 'boho' décor without real texture or story.",
    palette: ["warmCream", "terracotta", "ochre", "rust", "pine"],
    materials: ["rattan", "woven", "cotton", "ceramics", "wood"],
    moods: { creative: 3, cozy: 3, romantic: 1, energised: 1 },
    contrast: 3,
    density: 5,
    boldness: 4,
    warmth: 2,
  },
  {
    id: "mid-century",
    name: "Mid-Century Modern",
    noun: "Modernist",
    photo: PHOTOS.midCentury,
    caption: "Iconic shapes, warm wood, optimism",
    essence:
      "Mid-Century Modern is optimistic and graphic — tapered legs, warm walnut, iconic silhouettes and confident pops of colour.",
    blend: "the graphic optimism of Mid-Century Modern",
    avoid: "Over-stuffed, bulky furniture that hides good silhouettes.",
    palette: ["warmCream", "walnut", "mustard", "teal", "rust"],
    materials: ["wood", "metal", "velvet", "glass", "woven"],
    moods: { creative: 2, grounded: 2, energised: 1, cozy: 1 },
    contrast: 3,
    density: 3,
    boldness: 3,
    warmth: 1,
  },
  {
    id: "mediterranean",
    name: "Mediterranean",
    noun: "Sun Seeker",
    photo: PHOTOS.mediterranean,
    caption: "Sunlit plaster, arches, ease",
    essence:
      "Mediterranean style is sun-washed and relaxed — limewashed walls, terracotta, rough linen and natural fibres that carry the ease of a long summer.",
    blend: "the sun-washed ease of the Mediterranean",
    avoid: "Glossy, synthetic finishes that fight the sun-baked texture.",
    palette: ["white", "sand", "terracotta", "cobalt", "olive"],
    materials: ["stone", "ceramics", "linen", "rattan", "wood"],
    moods: { airy: 2, romantic: 2, grounded: 2, energised: 1 },
    contrast: 3,
    density: 3,
    boldness: 3,
    warmth: 2,
  },
  {
    id: "eclectic",
    name: "Colourful Eclectic",
    noun: "Collector",
    photo: PHOTOS.eclectic,
    caption: "Bold colour, art, personality",
    essence:
      "Colourful Eclectic is fearless and personal — clashing-yet-coherent colour, art everywhere and pieces from every era, held together by a confident eye.",
    blend: "the fearless personality of Colourful Eclectic",
    avoid: "Playing it safe with all-beige everything.",
    palette: ["warmCream", "coral", "emerald", "saffron", "cobalt"],
    materials: ["velvet", "ceramics", "glass", "woven", "metal"],
    moods: { creative: 3, energised: 3, romantic: 1 },
    contrast: 4,
    density: 5,
    boldness: 5,
    warmth: 1,
  },
];

// ---------- Q2: moods ----------

export interface Mood {
  id: MoodId;
  name: string;
  adjective: string;
  hint: string;
  phrase: string;
  tint: [string, string];
  colours: ColourId[];
  shift: { boldness?: number; density?: number; contrast?: number; warmth?: number };
}

export const MOODS: Mood[] = [
  { id: "calm", name: "Calm", adjective: "Serene", hint: "A quiet exhale", phrase: "a quiet exhale at the end of the day", tint: ["#E4E8DC", "#B5BFA4"], colours: ["sage", "mist", "stone", "ivory"], shift: { boldness: -0.3, density: -0.3 } },
  { id: "cozy", name: "Cozy", adjective: "Cozy", hint: "Wrapped in warmth", phrase: "somewhere you sink into, wrapped in warmth", tint: ["#F2E8D5", "#C19A6B"], colours: ["camel", "terracotta", "walnut", "warmCream"], shift: { warmth: 1, density: 0.3 } },
  { id: "luxurious", name: "Luxurious", adjective: "Refined", hint: "Quietly indulgent", phrase: "quietly indulgent, with details that reward a second look", tint: ["#D9CBB4", "#8C6A3F"], colours: ["emerald", "bronze", "burgundy", "charcoal", "brass"], shift: { contrast: 0.5 } },
  { id: "airy", name: "Airy", adjective: "Airy", hint: "Light and open", phrase: "light, open and easy to breathe in", tint: ["#FAFAF7", "#C9D3D9"], colours: ["white", "mist", "sky", "sage"], shift: { contrast: -0.5, density: -0.3 } },
  { id: "creative", name: "Creative", adjective: "Creative", hint: "Sparks ideas", phrase: "a place that sparks ideas and shows who you are", tint: ["#F3E7D3", "#E07A5F"], colours: ["coral", "teal", "ochre", "cobalt"], shift: { boldness: 0.4, density: 0.4 } },
  { id: "grounded", name: "Grounded", adjective: "Grounded", hint: "Steady and earthy", phrase: "steady, earthy and reassuring", tint: ["#DCCBB0", "#6F7148"], colours: ["olive", "walnut", "moss", "clay"], shift: { warmth: 0.5 } },
  { id: "romantic", name: "Romantic", adjective: "Romantic", hint: "Soft and dreamy", phrase: "soft, flattering and a little dreamy", tint: ["#F3E3DC", "#C08081"], colours: ["blush", "rose", "plum", "warmIvory"], shift: { density: 0.2 } },
  { id: "energised", name: "Energised", adjective: "Vibrant", hint: "Lively momentum", phrase: "bright, lively and full of momentum", tint: ["#F6E3B8", "#E0A03A"], colours: ["mustard", "coral", "saffron", "teal"], shift: { boldness: 0.6 } },
];

// ---------- Q3: palette directions ----------

export interface PaletteDirection {
  id: PaletteId;
  name: string;
  description: string;
  colours: ColourId[];
  styles: Weights<StyleId>;
  boldness: number;
}

export const PALETTES: PaletteDirection[] = [
  { id: "warm-earthy", name: "Warm & Earthy", description: "Sun-baked, grounded, welcoming", colours: ["cream", "camel", "terracotta", "olive", "walnut"], styles: { "organic-modern": 3, bohemian: 2, mediterranean: 2, "warm-minimalist": 1, "mid-century": 1 }, boldness: 3 },
  { id: "soft-airy", name: "Soft & Airy", description: "Light, restful, breathable", colours: ["ivory", "sage", "mist", "stone", "softGrey"], styles: { scandinavian: 3, japandi: 2, "organic-modern": 1, "warm-minimalist": 1, "modern-classic": 1 }, boldness: 2 },
  { id: "moody-elegant", name: "Moody & Elegant", description: "Deep, enveloping, refined", colours: ["charcoal", "forest", "taupe", "bronze", "espresso"], styles: { "moody-contemporary": 3, "modern-classic": 2, "mid-century": 1 }, boldness: 3 },
  { id: "playful-creative", name: "Playful & Creative", description: "Joyful, curious, expressive", colours: ["coral", "ochre", "teal", "lavender", "warmCream"], styles: { eclectic: 3, bohemian: 2, "mid-century": 2 }, boldness: 4 },
  { id: "clean-minimal", name: "Clean & Minimal", description: "Pared-back, calm, precise", colours: ["white", "beige", "greige", "warmWood", "charcoal"], styles: { "warm-minimalist": 3, japandi: 3, scandinavian: 2 }, boldness: 1 },
  { id: "rich-expressive", name: "Rich & Expressive", description: "Jewel tones, depth, drama", colours: ["burgundy", "emerald", "mustard", "plum", "warmIvory"], styles: { eclectic: 2, "moody-contemporary": 2, "modern-classic": 1, bohemian: 1 }, boldness: 5 },
];

// ---------- Q5: boldness ----------

export const BOLDNESS_LABELS = ["Quiet and understated", "Subtle", "Balanced", "Expressive", "Bold and characterful"] as const;

// ---------- Q6: materials ----------

export interface Material {
  id: MaterialId;
  name: string;
  photo: Photo;
  note: string;
  natural: boolean;
}

export const MATERIALS: Material[] = [
  { id: "wood", name: "Wood", photo: PHOTOS.wood, note: "Warm grain that brings instant life and ages gracefully.", natural: true },
  { id: "linen", name: "Linen", photo: PHOTOS.linen, note: "Relaxed, breathable and beautifully imperfect.", natural: true },
  { id: "cotton", name: "Cotton", photo: PHOTOS.cotton, note: "Soft, washable comfort for everyday living.", natural: true },
  { id: "rattan", name: "Rattan", photo: PHOTOS.rattan, note: "Light, airy texture with a handcrafted feel.", natural: true },
  { id: "velvet", name: "Velvet", photo: PHOTOS.velvet, note: "Depth, softness and a quiet sense of luxury.", natural: false },
  { id: "stone", name: "Stone", photo: PHOTOS.stone, note: "Cool, grounding and reassuringly timeless.", natural: true },
  { id: "glass", name: "Glass", photo: PHOTOS.glass, note: "Catches light and keeps a room feeling open.", natural: false },
  { id: "metal", name: "Metal", photo: PHOTOS.metal, note: "A fine line and a soft glint — brass warms, black steel sharpens.", natural: false },
  { id: "ceramics", name: "Ceramics", photo: PHOTOS.ceramics, note: "Handmade forms that add soul to shelves and tables.", natural: true },
  { id: "woven", name: "Soft woven textiles", photo: PHOTOS.woven, note: "Throws, rugs and baskets that layer warmth underfoot and on hand.", natural: true },
];

// ---------- Q7: room dislikes ----------

export interface Dislike {
  id: DislikeId;
  label: string;
  styles: Weights<StyleId>;
  density?: number;
  avoid: string;
}

export const DISLIKES: Dislike[] = [
  { id: "clutter", label: "Too much clutter", styles: { bohemian: -2, eclectic: -2 }, density: -1, avoid: "Crowded open shelving — give everyday things closed storage." },
  { id: "decoration", label: "Excessive decoration", styles: { "modern-classic": -1, bohemian: -1.5, eclectic: -1.5 }, density: -1, avoid: "Ornate trims and decorative extras that don't earn their place." },
  { id: "bright", label: "Bright colours", styles: { eclectic: -3, bohemian: -1, "mid-century": -0.5 }, avoid: "Saturated, high-gloss colour — your accents are deliberately softened." },
  { id: "dark", label: "Dark spaces", styles: { "moody-contemporary": -4, "modern-classic": -0.5 }, avoid: "Dark walls and heavy curtains that swallow daylight." },
  { id: "patterns", label: "Too many patterns", styles: { bohemian: -2, eclectic: -2, mediterranean: -1 }, density: -0.5, avoid: "Competing prints — keep to one tonal pattern per zone." },
  { id: "cold", label: "Cold-looking rooms", styles: { scandinavian: -1, "moody-contemporary": -1, "modern-classic": -0.5 }, avoid: "Chrome, cool-white bulbs and blue-grey walls that chill a room." },
  { id: "minimalism", label: "Excessive minimalism", styles: { "warm-minimalist": -2.5, japandi: -2, scandinavian: -1 }, density: 1, avoid: "Bare, gallery-like rooms with nothing personal on show." },
  { id: "artificial", label: "Artificial-looking materials", styles: {}, avoid: "Glossy laminates, plastic finishes and faux plants." },
];

// ---------- Q8: statements ----------

export interface Statement {
  id: StatementId;
  quote: string;
  styles: Weights<StyleId>;
  shift: { boldness?: number; density?: number; warmth?: number };
  sentence: string;
}

export const STATEMENTS: Statement[] = [
  { id: "quiet", quote: "I love quiet, simple spaces.", styles: { japandi: 2, "warm-minimalist": 2, scandinavian: 1 }, shift: { density: -0.5, boldness: -0.3 }, sentence: "Simplicity matters to you, so every object should earn its place." },
  { id: "warm", quote: "I want my room to feel warm and inviting.", styles: { "organic-modern": 2, bohemian: 1, "warm-minimalist": 1, mediterranean: 1 }, shift: { warmth: 1 }, sentence: "Above all you want a welcome — a room that feels warm the moment you walk in." },
  { id: "statement", quote: "I love statement pieces and personality.", styles: { eclectic: 2, "mid-century": 1.5, "moody-contemporary": 1 }, shift: { boldness: 0.5 }, sentence: "You'd rather own one remarkable piece than ten forgettable ones." },
  { id: "elegant", quote: "I want elegance without unnecessary luxury.", styles: { "modern-classic": 2, "warm-minimalist": 1, "moody-contemporary": 1 }, shift: { density: -0.2 }, sentence: "You value elegance that feels effortless rather than expensive." },
  { id: "creative", quote: "I love a creative space that reflects my interests.", styles: { eclectic: 2, bohemian: 2 }, shift: { density: 0.5 }, sentence: "Your room should tell your story — your interests deserve display space." },
  { id: "balanced", quote: "I want everything to feel balanced and intentional.", styles: { japandi: 1, "organic-modern": 1, "mid-century": 1, "modern-classic": 1, scandinavian: 1 }, shift: {}, sentence: "Balance and intention guide you: nothing random, nothing overdone." },
];

// ---------- Answers ----------

export interface Answers {
  styles: StyleId[];
  moods: MoodId[];
  palettes: PaletteId[];
  avoidColours: ColourFamily[];
  boldness: number;
  materials: MaterialId[];
  dislikes: DislikeId[];
  statement: StatementId | null;
}

export const LIMITS = { styles: 3, moods: 2, palettes: 2, avoidColours: 6, materials: 5, dislikes: 8 } as const;

export const EMPTY_ANSWERS: Answers = {
  styles: [],
  moods: [],
  palettes: [],
  avoidColours: [],
  boldness: 3,
  materials: [],
  dislikes: [],
  statement: null,
};

const ids = <T extends { id: string }>(list: T[]) => new Set(list.map((x) => x.id));
const VALID = {
  styles: ids(STYLES),
  moods: ids(MOODS),
  palettes: ids(PALETTES),
  avoidColours: ids(COLOUR_FAMILIES),
  materials: ids(MATERIALS),
  dislikes: ids(DISLIKES),
  statement: ids(STATEMENTS),
};

// Answers arrive from localStorage or share links, so treat them as untrusted.
export function sanitizeAnswers(raw: unknown): Answers {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const list = <K extends keyof typeof LIMITS>(key: K) =>
    (Array.isArray(r[key]) ? [...new Set(r[key] as unknown[])] : [])
      .filter((v): v is string => typeof v === "string" && VALID[key].has(v))
      .slice(0, LIMITS[key]) as never;
  const b = Number(r.boldness);
  return {
    styles: list("styles"),
    moods: list("moods"),
    palettes: list("palettes"),
    avoidColours: list("avoidColours"),
    boldness: Number.isFinite(b) ? Math.min(5, Math.max(1, Math.round(b))) : 3,
    materials: list("materials"),
    dislikes: list("dislikes"),
    statement: typeof r.statement === "string" && VALID.statement.has(r.statement) ? (r.statement as StatementId) : null,
  };
}

export function isComplete(a: Answers): boolean {
  return a.styles.length > 0 && a.moods.length > 0 && a.palettes.length > 0 && a.materials.length > 0 && a.statement !== null;
}

export const byId = <T extends { id: string }>(list: T[], id: string): T => list.find((x) => x.id === id)!;
