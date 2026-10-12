// Advice content for the home plan. Every rule is a plain condition on the quiz answers, so it can be reviewed line by line.
// Prices are rough Indian market ranges, checked October 2026 — review before each launch.
import type { Answers, Budget, ColourId, FixtureKey, HomeSize, Member, MaterialId, MoodId, StyleId, Weights } from "./taste-data.ts";

export interface Ctx extends Answers {
  rent: boolean;
  own: boolean;
  small: boolean; // 1RK or 1BHK
  busy: boolean; // out of the house most weekdays
  hasHelp: boolean;
  has: (m: Member) => boolean;
  loves: (m: MaterialId) => boolean;
  fix: Record<FixtureKey, { id: string; hex: string } | null>; // null = not decided yet
  paint: boolean; // walls can take the palette colour
  people: number; // headcount: as given, or estimated from who lives here
  counted: boolean; // the person gave the number themselves
}

export type RoomId = "bedroom" | "kitchen" | "bathroom" | "living" | "balcony" | "parents" | "kids" | "study" | "guest";
export const ROOMS: { id: RoomId; name: string }[] = [
  { id: "bedroom", name: "Bedroom" },
  { id: "kitchen", name: "Kitchen" },
  { id: "bathroom", name: "Bathroom" },
  { id: "living", name: "Living room" },
  { id: "balcony", name: "Balcony" },
  { id: "parents", name: "Parents' room" },
  { id: "kids", name: "Kids' room" },
  { id: "study", name: "Study" },
  { id: "guest", name: "Guest room" },
];
// Advice that depends on the home decides its own room (e.g. the washer moves to the bathroom without a balcony).
export type Where = RoomId | ((c: Ctx) => RoomId);

// Bedrooms beyond your own, given to whoever needs them most. Flatmates take theirs first; their rooms are theirs to plan.
const EXTRA_BEDROOMS: Record<HomeSize, number> = { "1rk": 0, "1bhk": 0, "2bhk": 1, "3bhk": 2 };
export function extraRooms(c: Ctx): RoomId[] {
  const free = EXTRA_BEDROOMS[c.home ?? "2bhk"] - (c.has("flatmates") ? 1 : 0);
  const wanted = [c.has("elders") && "parents", c.has("kids") && "kids", (c.work === "wfh" || c.work === "hybrid") && "study", c.guests !== "never" && "guest", "study"].filter(Boolean) as RoomId[];
  return [...new Set(wanted)].slice(0, Math.max(0, free));
}
export const hasRoom = (c: Ctx, room: RoomId) => extraRooms(c).includes(room);
// A 1RK has one room for sleeping and living; no balcony means no balcony section.
export const roomsFor = (c: Ctx): RoomId[] => ["bedroom", "kitchen", "bathroom", ...(c.home === "1rk" ? [] : ["living" as const]), ...(c.balcony ? ["balcony" as const] : []), ...extraRooms(c)];

// ---------- Palettes ----------
// Colours are in role order: walls (≈60%), large pieces (≈30%), wood/depth, accent, accent.

export interface Palette {
  id: string;
  name: string;
  inspiredBy: string;
  colours: [ColourId, ColourId, ColourId, ColourId, ColourId];
  styles: Weights<StyleId>;
  moods: Weights<MoodId>;
  boldness: number; // 1–5
  temp: "warm" | "cool" | "neutral";
}

export const PALETTE_LIBRARY: Palette[] = [
  { id: "white-teak", name: "Warm White & Teak", inspiredBy: "Chettinad mansions of Tamil Nadu", colours: ["warmIvory", "sand", "teak", "terracotta", "olive"], styles: { "organic-modern": 2, "warm-minimalist": 2, mediterranean: 1 }, moods: { cozy: 2, grounded: 2, calm: 1 }, boldness: 2, temp: "warm" },
  { id: "white-oak", name: "Soft White & Oak", inspiredBy: "Scandinavian apartments", colours: ["white", "dove", "oak", "sage", "charcoal"], styles: { scandinavian: 3, japandi: 2 }, moods: { airy: 3, calm: 2 }, boldness: 1, temp: "cool" },
  { id: "sage-cane", name: "Sage & Cane", inspiredBy: "Kerala verandahs", colours: ["paleSage", "sage", "warmWood", "cream", "moss"], styles: { "organic-modern": 2, japandi: 1, scandinavian: 1 }, moods: { calm: 3, grounded: 2 }, boldness: 2, temp: "neutral" },
  { id: "terracotta-indigo", name: "Terracotta & Indigo", inspiredBy: "Jaipur block prints", colours: ["cream", "sandstone", "terracotta", "indigo", "mustard"], styles: { bohemian: 3, mediterranean: 2, eclectic: 1 }, moods: { creative: 2, energised: 2, cozy: 1 }, boldness: 4, temp: "warm" },
  { id: "chalk-charcoal", name: "Chalk & Charcoal", inspiredBy: "modern city apartments", colours: ["chalk", "greige", "charcoal", "oak", "brass"], styles: { "warm-minimalist": 2, "modern-classic": 2, japandi: 1 }, moods: { calm: 2, luxurious: 1 }, boldness: 2, temp: "neutral" },
  { id: "peacock-brass", name: "Peacock & Brass", inspiredBy: "Rajasthani palace interiors", colours: ["warmIvory", "peacock", "espresso", "brass", "rust"], styles: { "moody-contemporary": 2, eclectic: 2, "modern-classic": 1 }, moods: { luxurious: 3, romantic: 1 }, boldness: 5, temp: "neutral" },
  { id: "haldi-ivory", name: "Turmeric & Ivory", inspiredBy: "marigold festival garlands", colours: ["ivory", "linen", "walnut", "haldi", "olive"], styles: { "mid-century": 2, bohemian: 2, eclectic: 1 }, moods: { energised: 3, creative: 1, cozy: 1 }, boldness: 4, temp: "warm" },
  { id: "mist-driftwood", name: "Mist & Driftwood", inspiredBy: "monsoon skies over the Konkan coast", colours: ["white", "mist", "taupe", "inkBlue", "sand"], styles: { scandinavian: 2, mediterranean: 1, "modern-classic": 1 }, moods: { airy: 2, calm: 2 }, boldness: 2, temp: "cool" },
  { id: "clay-olive", name: "Clay & Olive", inspiredBy: "the mud-walled bhungas of Kutch", colours: ["linen", "clay", "olive", "walnut", "cream"], styles: { "organic-modern": 3, bohemian: 1, mediterranean: 1 }, moods: { grounded: 3, cozy: 2 }, boldness: 3, temp: "warm" },
  { id: "forest-cream", name: "Forest & Cream", inspiredBy: "tea-estate bungalows in Munnar", colours: ["warmCream", "forest", "walnut", "brass", "rust"], styles: { "moody-contemporary": 2, "mid-century": 2, "modern-classic": 1 }, moods: { grounded: 2, luxurious: 2, cozy: 1 }, boldness: 4, temp: "warm" },
  { id: "greige-walnut", name: "Greige & Walnut", inspiredBy: "quiet hotel suites", colours: ["beige", "greige", "walnut", "taupe", "brass"], styles: { "warm-minimalist": 3, "modern-classic": 2 }, moods: { calm: 2, luxurious: 2 }, boldness: 1, temp: "neutral" },
  { id: "rose-sandstone", name: "Rose & Sandstone", inspiredBy: "Jaipur's Pink City", colours: ["paleBlush", "sandstone", "rose", "bronze", "sage"], styles: { mediterranean: 2, bohemian: 1, "modern-classic": 1 }, moods: { romantic: 3, cozy: 1 }, boldness: 3, temp: "warm" },
  { id: "ink-ochre", name: "Ink & Ochre", inspiredBy: "old Kolkata homes", colours: ["chalk", "inkBlue", "oak", "ochre", "rust"], styles: { "mid-century": 3, eclectic: 1, "moody-contemporary": 1 }, moods: { creative: 2, grounded: 1, energised: 1 }, boldness: 4, temp: "neutral" },
  { id: "charcoal-bronze", name: "Charcoal & Bronze", inspiredBy: "low-lit lounges", colours: ["charcoal", "taupe", "espresso", "bronze", "warmCream"], styles: { "moody-contemporary": 3, "modern-classic": 1 }, moods: { luxurious: 3, romantic: 1 }, boldness: 4, temp: "neutral" },
  { id: "coral-teal", name: "Coral & Teal", inspiredBy: "the streets of Puducherry", colours: ["warmCream", "coral", "walnut", "teal", "mustard"], styles: { eclectic: 3, "mid-century": 2, bohemian: 1 }, moods: { energised: 3, creative: 3 }, boldness: 5, temp: "warm" },
  { id: "linen-stone", name: "Linen & Stone", inspiredBy: "Japanese inns", colours: ["linen", "stone", "oak", "warmGrey", "moss"], styles: { japandi: 3, "warm-minimalist": 2, "organic-modern": 2 }, moods: { calm: 3, grounded: 1 }, boldness: 1, temp: "neutral" },
  { id: "lavender-dove", name: "Lavender & Dove", inspiredBy: "cherry-blossom season in Shillong", colours: ["white", "dove", "slate", "lavender", "blush"], styles: { scandinavian: 1, "modern-classic": 1 }, moods: { romantic: 2, calm: 2, airy: 1 }, boldness: 2, temp: "cool" },
  { id: "emerald-mustard", name: "Emerald & Mustard", inspiredBy: "Art Deco Mumbai", colours: ["warmIvory", "emerald", "walnut", "mustard", "burgundy"], styles: { eclectic: 2, "mid-century": 2, "moody-contemporary": 1 }, moods: { luxurious: 2, creative: 2, energised: 1 }, boldness: 5, temp: "warm" },
  { id: "sky-sand", name: "Sky & Sand", inspiredBy: "whitewashed homes of Diu", colours: ["white", "sky", "oak", "sand", "cobalt"], styles: { mediterranean: 3, scandinavian: 1 }, moods: { airy: 3, energised: 1 }, boldness: 3, temp: "cool" },
  { id: "plum-blush", name: "Plum & Blush", inspiredBy: "Banarasi silk", colours: ["paleBlush", "blush", "charcoal", "plum", "brass"], styles: { "modern-classic": 1, eclectic: 1, "moody-contemporary": 1 }, moods: { romantic: 3, luxurious: 2 }, boldness: 4, temp: "warm" },
  { id: "grey-blush", name: "Grey & Blush", inspiredBy: "soft city apartments", colours: ["dove", "softGrey", "walnut", "blush", "sage"], styles: { scandinavian: 1, "modern-classic": 1 }, moods: { romantic: 2, calm: 1 }, boldness: 2, temp: "neutral" },
  { id: "powder-oak", name: "Powder Blue & Oak", inspiredBy: "breezy seaside cottages", colours: ["white", "powderBlue", "oak", "dustyBlue", "sand"], styles: { scandinavian: 2, mediterranean: 1 }, moods: { airy: 3, calm: 1 }, boldness: 2, temp: "cool" },
  { id: "graphite-oak", name: "Graphite & Oak", inspiredBy: "the mill-compound lofts of Mumbai", colours: ["chalk", "greige", "graphite", "oak", "rust"], styles: { "moody-contemporary": 1, "mid-century": 1, "warm-minimalist": 1 }, moods: { grounded: 2, creative: 1 }, boldness: 3, temp: "neutral" },
  { id: "eucalyptus-linen", name: "Eucalyptus & Linen", inspiredBy: "eucalyptus groves of the Nilgiris", colours: ["linen", "eucalyptus", "oak", "sand", "pine"], styles: { "organic-modern": 2, japandi: 1, scandinavian: 1 }, moods: { calm: 2, grounded: 2 }, boldness: 2, temp: "neutral" },
  { id: "mauve-mushroom", name: "Mauve & Mushroom", inspiredBy: "dusk over Hyderabad's lakes", colours: ["warmIvory", "mushroom", "walnut", "mauve", "sage"], styles: { "modern-classic": 1, "organic-modern": 1 }, moods: { romantic: 2, calm: 1, cozy: 1 }, boldness: 2, temp: "neutral" },
  { id: "apricot-cream", name: "Apricot & Cream", inspiredBy: "mango season in Ratnagiri", colours: ["warmCream", "apricot", "oak", "terracotta", "sage"], styles: { mediterranean: 2, bohemian: 1, "organic-modern": 1 }, moods: { cozy: 2, energised: 1, romantic: 1 }, boldness: 3, temp: "warm" },
  { id: "jade-brass", name: "Jade & Brass", inspiredBy: "Sikkim's monasteries", colours: ["warmIvory", "jade", "walnut", "brass", "rust"], styles: { eclectic: 1, "moody-contemporary": 1, "mid-century": 1 }, moods: { grounded: 2, luxurious: 1, creative: 1 }, boldness: 4, temp: "neutral" },
  { id: "marigold-maroon", name: "Marigold & Maroon", inspiredBy: "temple festivals in Madurai", colours: ["cream", "marigold", "teak", "maroon", "olive"], styles: { bohemian: 2, eclectic: 2 }, moods: { energised: 2, cozy: 1, creative: 1 }, boldness: 5, temp: "warm" },
  { id: "denim-chalk", name: "Denim & Chalk", inspiredBy: "fishing boats at Malvan", colours: ["chalk", "denim", "oak", "sky", "rust"], styles: { mediterranean: 2, scandinavian: 1, "mid-century": 1 }, moods: { airy: 2, creative: 1 }, boldness: 3, temp: "cool" },
  { id: "limewash-clay", name: "Limewash & Clay", inspiredBy: "old Goan villas", colours: ["limewash", "sand", "clay", "olive", "charcoal"], styles: { mediterranean: 2, "organic-modern": 2 }, moods: { grounded: 2, calm: 1, airy: 1 }, boldness: 2, temp: "warm" },
  { id: "rani-emerald", name: "Rani Pink & Emerald", inspiredBy: "Rajasthani wedding colours", colours: ["warmIvory", "raniPink", "walnut", "emerald", "haldi"], styles: { eclectic: 3, bohemian: 1 }, moods: { energised: 2, creative: 2, romantic: 1 }, boldness: 5, temp: "warm" },
  { id: "sea-sand", name: "Sea & Sand", inspiredBy: "the beaches of Gokarna", colours: ["white", "sand", "warmWood", "sea", "coral"], styles: { mediterranean: 2, scandinavian: 1 }, moods: { airy: 2, energised: 1 }, boldness: 3, temp: "cool" },
  { id: "leaf-linen", name: "Leaf & Linen", inspiredBy: "coffee estates in Coorg", colours: ["linen", "leaf", "teak", "ochre", "stone"], styles: { "organic-modern": 2, bohemian: 1 }, moods: { grounded: 2, cozy: 1, calm: 1 }, boldness: 3, temp: "warm" },
  { id: "navy-camel", name: "Navy & Camel", inspiredBy: "old Bombay clubs", colours: ["ivory", "camel", "walnut", "navy", "brass"], styles: { "modern-classic": 3, "mid-century": 1 }, moods: { luxurious: 2, grounded: 1, calm: 1 }, boldness: 3, temp: "neutral" },
  { id: "aubergine-gold", name: "Aubergine & Gold", inspiredBy: "Mughal miniature paintings", colours: ["warmIvory", "aubergine", "espresso", "brass", "rose"], styles: { "moody-contemporary": 2, eclectic: 1, "modern-classic": 1 }, moods: { luxurious: 3, romantic: 2 }, boldness: 5, temp: "warm" },
  { id: "slate-moss", name: "Slate & Moss", inspiredBy: "misty Meghalaya forests", colours: ["dove", "slate", "oak", "moss", "stone"], styles: { japandi: 2, scandinavian: 1, "organic-modern": 1 }, moods: { calm: 2, grounded: 2 }, boldness: 2, temp: "cool" },
  { id: "oxblood-cream", name: "Oxblood & Cream", inspiredBy: "red-oxide floors of old Kolkata", colours: ["cream", "sand", "oxblood", "walnut", "olive"], styles: { "mid-century": 1, "modern-classic": 1, "moody-contemporary": 1, bohemian: 1 }, moods: { cozy: 2, grounded: 1, luxurious: 1 }, boldness: 4, temp: "warm" },
  { id: "mint-white", name: "Mint & White", inspiredBy: "Irani cafés", colours: ["white", "mint", "oak", "jade", "blush"], styles: { scandinavian: 2, "mid-century": 1 }, moods: { airy: 2, energised: 1, calm: 1 }, boldness: 3, temp: "cool" },
  { id: "sandstone-sage", name: "Sandstone & Sage", inspiredBy: "the boulders of Hampi", colours: ["warmIvory", "sandstone", "teak", "sage", "rust"], styles: { "organic-modern": 2, mediterranean: 2 }, moods: { grounded: 2, calm: 1, cozy: 1 }, boldness: 2, temp: "warm" },
  { id: "charcoal-mustard", name: "Charcoal & Mustard", inspiredBy: "Chandigarh's modernist buildings", colours: ["chalk", "softGrey", "charcoal", "mustard", "oak"], styles: { "mid-century": 2, "warm-minimalist": 1, "moody-contemporary": 1 }, moods: { creative: 2, grounded: 1 }, boldness: 3, temp: "neutral" },
  { id: "cobalt-white", name: "Cobalt & White", inspiredBy: "Jodhpur's Blue City", colours: ["white", "chalk", "teak", "cobalt", "saffron"], styles: { mediterranean: 3, eclectic: 1 }, moods: { energised: 2, airy: 1 }, boldness: 4, temp: "cool" },
  { id: "taupe-ivory", name: "Taupe & Ivory", inspiredBy: "the stillness of Ladakh's monasteries", colours: ["ivory", "taupe", "walnut", "stone", "moss"], styles: { "warm-minimalist": 2, japandi: 2 }, moods: { calm: 3 }, boldness: 1, temp: "neutral" },
  { id: "rust-denim", name: "Rust & Denim", inspiredBy: "vintage Bollywood posters", colours: ["warmCream", "rust", "walnut", "denim", "mustard"], styles: { "mid-century": 3, bohemian: 1 }, moods: { creative: 2, energised: 1, cozy: 1 }, boldness: 4, temp: "warm" },
  { id: "sage-blush", name: "Pale Sage & Blush", inspiredBy: "the rose gardens of Ooty", colours: ["paleSage", "paleBlush", "oak", "rose", "sage"], styles: { scandinavian: 1, "modern-classic": 1, mediterranean: 1 }, moods: { romantic: 2, calm: 2, airy: 1 }, boldness: 2, temp: "neutral" },
  { id: "espresso-cream", name: "Espresso & Cream", inspiredBy: "South Indian filter coffee", colours: ["cream", "camel", "espresso", "brass", "sage"], styles: { "warm-minimalist": 2, "modern-classic": 1, "mid-century": 1 }, moods: { cozy: 2, luxurious: 1, grounded: 1 }, boldness: 3, temp: "warm" },
  { id: "greige-sky", name: "Greige & Sky", inspiredBy: "mornings in Darjeeling", colours: ["chalk", "greige", "oak", "sky", "navy"], styles: { scandinavian: 2, "modern-classic": 1 }, moods: { calm: 2, airy: 2 }, boldness: 2, temp: "cool" },
  { id: "ochre-indigo", name: "Ochre & Indigo", inspiredBy: "ajrakh block prints", colours: ["linen", "ochre", "teak", "indigo", "rust"], styles: { bohemian: 2, "organic-modern": 1, eclectic: 1 }, moods: { creative: 2, grounded: 2 }, boldness: 4, temp: "warm" },
  { id: "mushroom-charcoal", name: "Mushroom & Charcoal", inspiredBy: "Lutyens' Delhi bungalows", colours: ["warmIvory", "mushroom", "charcoal", "bronze", "sage"], styles: { "modern-classic": 2, "moody-contemporary": 1, "warm-minimalist": 1 }, moods: { luxurious: 2, calm: 1 }, boldness: 2, temp: "neutral" },
  { id: "pine-ochre", name: "Pine & Ochre", inspiredBy: "Himalayan wooden cabins", colours: ["warmCream", "pine", "walnut", "ochre", "rust"], styles: { "organic-modern": 1, "mid-century": 1, "moody-contemporary": 1 }, moods: { cozy: 3, grounded: 2 }, boldness: 4, temp: "warm" },
  { id: "cream-teal", name: "Cream & Teal", inspiredBy: "Kerala houseboats", colours: ["cream", "sand", "teak", "teal", "mustard"], styles: { mediterranean: 1, bohemian: 1, "mid-century": 1 }, moods: { cozy: 1, energised: 1, creative: 1, airy: 1 }, boldness: 3, temp: "neutral" },
];

// How the #1 palette lands in each room; n = colour names in role order, w = what happens on the walls.
export const COLOUR_USE: Record<RoomId, (n: string[], c: Ctx, w: string) => string> = {
  bedroom: (n, c, w) =>
    c.home === "1rk"
      ? `${w}, ${n[1]} on the bed or sofa-cum-bed, ${n[2]} wood, with ${n[3]} and ${n[4]} in cushions, rug and art.`
      : `${w}, ${n[1]} bedding and curtains, ${n[2]} for the bed and side tables, ${n[3]} in cushions and a throw.`,
  kitchen: (n, c) => {
    const cab = c.fix.cabinets;
    if (!cab && c.own) return `${n[0]} or ${n[1]} upper shutters, ${n[2]} lower cabinets, and ${n[3]} in the backsplash.`;
    if (!cab) return `No cabinets to work around — steel racks, with ${n[3]} and ${n[4]} in jars, tea towels and a runner.`;
    const name = { white: "white", wood: "wood-finish", grey: "grey", dark: "dark", colour: "coloured" }[cab.id];
    return `Your ${name} cabinets stay — bring in ${n[3]} and ${n[4]} through jars, tea towels and a runner${c.own ? `, with ${n[3]} in the backsplash` : ""}.`;
  },
  bathroom: (n, c) => (c.own ? `${n[0]} or ${n[1]} wall tiles, ${n[1]} towels, and ${n[3]} in the mat and accessories.` : `Your tiles stay — ${n[1]} towels and shower curtain, with ${n[3]} in the mat and accessories.`),
  living: (n, _c, w) => `${w}, a ${n[1]} sofa, ${n[2]} wood tones, with ${n[3]} and ${n[4]} in cushions, rug and art.`,
  balcony: (n, c) => (hot(c) ? `${n[2]} furniture under ${n[1]} shade cloth or chik blinds, ${n[3]} planters and plenty of green.` : `${n[2]} furniture, ${n[3]} planters and plenty of green.`),
  parents: (n, _c, w) => `${w}, ${n[1]} bedding and ${n[2]} furniture, with a throw in ${n[3]} — warm, simple and easy to see in.`,
  kids: (n, _c, w) => `${w}, ${n[1]} bedding, with ${n[3]} and ${n[4]} in a rug, bins and art they choose.`,
  study: (n, _c, w) => `${w}, ${n[2]} desk and shelves, with ${n[3]} in a pinboard or chair cushion.`,
  guest: (n, _c, w) => `${w}, ${n[1]} bedding and ${n[3]} in one cushion or throw — calm for anyone who stays.`,
};

// Advice for working with the floor, doors, walls and counter that are already there.
export const FIXTURE_NOTES: { text: string; when: (c: Ctx) => boolean }[] = [
  { text: "Grey tiles lean cold — warm them with a cotton dhurrie and honey-toned wood.", when: (c) => c.fix.floor?.id === "grey-tiles" },
  { text: "Beige tiles lean yellow, so skip cool greys and icy whites that look dingy beside them.", when: (c) => c.fix.floor?.id === "beige-tiles" },
  { text: "Shiny white floors echo and glare — a large rug in each room softens both.", when: (c) => c.fix.floor?.id === "white-tiles" || c.fix.floor?.id === "marble" },
  { text: "A dark floor shows every speck of dust; mid-tone rugs hide it, and lighter furniture stops rooms feeling heavy.", when: (c) => c.fix.floor?.id === "dark-stone" },
  { text: "Don't try to match furniture to a wood-look floor — go clearly lighter or darker.", when: (c) => c.fix.floor?.id === "wood-look" },
  { text: "Repeat your doors' dark wood once or twice — a frame, a side table — so they look intentional.", when: (c) => c.fix.doors?.id === "walnut" },
  { text: "Honey-toned doors love brass handles, cream and soft greens.", when: (c) => c.fix.doors?.id === "teak" },
  { text: "White doors go with any wood tone — pick one and stay consistent.", when: (c) => c.fix.doors?.id === "white" },
  { text: "Your walls stay as they are, so the palette lives in curtains, bedding, the sofa and art.", when: (c) => !c.paint },
  { text: "Your walls already carry colour, so keep the rest of the palette quieter around them.", when: (c) => !c.paint && c.fix.walls?.id === "coloured" },
  { text: "Black granite darkens the kitchen — keep cabinets, containers and the backsplash light.", when: (c) => c.fix.counter?.id === "black-granite" },
  { text: "A light counter shows haldi and tea stains — wipe spills quickly; granite needs resealing every year or so, quartz doesn't.", when: (c) => c.fix.counter?.id === "light-stone" },
  { text: "White cabinets show haldi and oil — matte or anti-fingerprint shutters, wiped weekly, keep them white.", when: (c) => c.fix.cabinets?.id === "white" },
  { text: "Wood-finish cabinets run warm — steel and brass suit them better than chrome, and a light backsplash stops the kitchen feeling heavy.", when: (c) => c.fix.cabinets?.id === "wood" },
  { text: "Grey cabinets take both steel and wood — add warmth with a wooden chopping board or a pot of herbs.", when: (c) => c.fix.cabinets?.id === "grey" },
  { text: "Dark cabinets swallow light — add an under-cabinet LED strip and keep the counter area bright.", when: (c) => c.fix.cabinets?.id === "dark" },
  { text: "Your cabinets already have colour — let them lead and keep containers and the fridge neutral.", when: (c) => c.fix.cabinets?.id === "colour" },
  { text: "A black counter and dark cabinets together get gloomy — keep the walls, backsplash and containers light.", when: (c) => c.fix.counter?.id === "black-granite" && c.fix.cabinets?.id === "dark" },
];

// ---------- Materials, in priority order (first = most important) ----------

export interface MaterialTip {
  room: Where;
  name: string;
  why: string;
  when?: (c: Ctx) => boolean;
  up?: (c: Ctx) => boolean; // moves it to the top for this person
}

const hot = (c: Ctx) => c.climate === "humid" || c.climate === "north";
const tight = (c: Ctx) => c.budget === "tight";
// Pick by household size: one or two people, three or four, five or more.
const bySize = <T,>(c: Ctx, small: T, family: T, large: T): T => (c.people <= 2 ? small : c.people <= 4 ? family : large);

export const MATERIAL_TIPS: MaterialTip[] = [
  // Bedroom
  { room: "bedroom", name: "Cotton or cotton-linen bedding", why: "Breathes in Indian heat and survives weekly hot washes.", when: (c) => c.climate !== "hills", up: (c) => c.loves("cotton") || c.loves("linen") },
  { room: "bedroom", name: "Brushed cotton bedding and wool blankets", why: "Warm without the static of synthetics.", when: (c) => c.climate === "hills" || c.climate === "north" },
  { room: "bedroom", name: "BWR plywood wardrobes with matte laminate", why: "Holds up to humidity far better than particle board; matte hides fingerprints.", when: (c) => c.own },
  { room: "bedroom", name: "Knock-down engineered wood or metal furniture", why: "Dismantles flat for the next move — rentals rarely last forever.", when: (c) => c.rent },
  { room: "bedroom", name: "Solid sheesham or mango wood bed", why: "Lasts decades and ages well; choose kiln-dried wood so it doesn't warp.", when: (c) => c.own || c.loves("wood"), up: (c) => c.loves("wood") },
  { room: "bedroom", name: "Slim metal bed frame", why: "Strong, light and quick to dismantle for the next move.", when: (c) => c.loves("metal"), up: (c) => c.rent },
  { room: "bedroom", name: "Lined poly-cotton curtains", why: "Blocks heat and light, and machine-washes easily.", up: hot },
  { room: "bedroom", name: "Cane or rattan accents", why: "Light and breathable; keep them off damp walls in humid cities.", when: (c) => c.loves("rattan") },

  // Kitchen — own
  { room: "kitchen", name: "BWP plywood carcass", why: "Boiling-water-proof ply doesn't swell around the sink.", when: (c) => c.own, up: (c) => c.climate === "humid" },
  { room: "kitchen", name: "Quartz countertop", why: "Non-porous, so haldi and oil don't stain.", when: (c) => c.own && c.budget !== "tight", up: (c) => c.cooking === "daily" },
  { room: "kitchen", name: "Granite countertop", why: "Heat-proof and the classic value pick for Indian kitchens.", when: (c) => c.own },
  { room: "kitchen", name: "Matte laminate shutters", why: "Wipes clean of tadka splatter and hides fingerprints.", when: (c) => c.own, up: (c) => c.cooking === "daily" },
  { room: "kitchen", name: "HDHMR board for dry units", why: "Cheaper than BWP and termite-resistant; fine away from the sink.", when: (c) => c.own && (c.budget === "tight" || c.budget === "mid") },
  { room: "kitchen", name: "Acrylic or PU shutters", why: "High gloss looks sharp but shows every oil mark — best with light cooking.", when: (c) => c.own && c.cooking !== "daily" },
  { room: "kitchen", name: "SS 304 sink with drainboard", why: "Takes daily kadhai-scrubbing without rusting.", when: (c) => c.own },
  // Kitchen — rent
  { room: "kitchen", name: "Stainless steel racks and trolleys", why: "Rust-proof, steam-proof, and they move with you.", when: (c) => c.rent },
  { room: "kitchen", name: "Peel-off shelf and platform liners", why: "Protects the landlord's surfaces from oil — easier deposit back.", when: (c) => c.rent },
  { room: "kitchen", name: "Ceramic jars and serveware", why: "Handmade pieces on an open shelf bring your palette into the kitchen.", when: (c) => c.loves("ceramics"), up: () => true },
  { room: "kitchen", name: "Glass or steel storage jars", why: "See what's running low; no plastic smell near the stove.", up: (c) => c.loves("glass") },

  // Bathroom
  { room: "bathroom", name: "Anti-skid matte floor tiles", why: "Wet floors stay safe and water spots don't show.", when: (c) => c.own, up: (c) => c.has("elders") || c.has("kids") },
  { room: "bathroom", name: "PVC or WPC vanity", why: "Fully waterproof — MDF and particle board swell within a season.", when: (c) => c.own },
  { room: "bathroom", name: "Brass-bodied CP fittings", why: "Outlast zinc-alloy taps; check for the ISI mark.", when: (c) => c.own },
  { room: "bathroom", name: "Epoxy grout", why: "Stays clean and keeps damp out of the joints.", when: (c) => c.own, up: (c) => c.climate === "humid" },
  { room: "bathroom", name: "SS 304 or aluminium racks", why: "Iron rusts and plastic yellows in a wet room.", when: (c) => c.rent },
  { room: "bathroom", name: "Suction and adhesive hooks", why: "No holes in the landlord's tiles.", when: (c) => c.rent },
  { room: "bathroom", name: "Stone soap dish and tray", why: "Heavy enough not to slide, and it never rusts.", when: (c) => c.loves("stone") },
  { room: "bathroom", name: "Quick-dry cotton or microfibre towels", why: "Dry before they smell, even in the monsoon.", up: (c) => c.climate === "humid" },

  // Living room
  { room: "living", name: "Performance fabric with removable covers", why: "Wipes clean and the covers go in the machine.", up: (c) => c.has("pets") || c.has("kids") },
  { room: "living", name: "Cotton or linen upholstery", why: "Cool to sit on through Indian summers.", when: (c) => !c.has("pets"), up: (c) => c.loves("linen") || c.loves("cotton") },
  { room: "living", name: "Cotton dhurrie rugs", why: "Flat-woven and washable; no damp smell in the monsoon.", up: (c) => c.climate === "humid" },
  { room: "living", name: "Jute or sisal rug", why: "Natural texture that loves dry heat.", when: (c) => c.climate !== "humid" && !c.has("pets"), up: (c) => c.loves("woven") },
  { room: "living", name: "Engineered wood with real veneer", why: "Looks like solid wood, costs about half, and stays stable through the seasons." },
  { room: "living", name: "Solid sheesham", why: "Heirloom-grade wood for the one piece you'll keep forever.", up: (c) => c.loves("wood") },
  { room: "living", name: "Cane and rattan", why: "Light, airy and handmade — ideal for a chair or two.", when: (c) => c.loves("rattan") },
  { room: "living", name: "Stone or marble-top side table", why: "Cool to the touch and heat-proof for chai cups.", when: (c) => c.loves("stone"), up: () => true },
  { room: "living", name: "Black metal or brass accents", why: "A lamp base, side table or frames — metal sharpens soft fabrics.", when: (c) => c.loves("metal"), up: () => true },
  { room: "living", name: "Velvet, in cushions only", why: "Gives you the richness without a sticky sofa in summer.", when: (c) => c.loves("velvet") },

  // Balcony
  { room: "balcony", name: "Powder-coated aluminium or metal furniture", why: "Rust-proof through rain and sun." },
  { room: "balcony", name: "Interlocking WPC deck tiles", why: "Click together over existing tiles — no fixing, and they leave with you.", up: (c) => c.rent },
  { room: "balcony", name: "Terracotta planters", why: "They breathe and keep roots cool in the heat.", up: hot },
  { room: "balcony", name: "UV-stabilised fibre planters", why: "Light, won't crack, easy to move.", when: (c) => !c.loves("ceramics") },
  { room: "balcony", name: "Glazed ceramic planters", why: "Glaze stops water seeping through; Khurja or blue pottery adds colour.", when: (c) => c.loves("ceramics"), up: () => true },
  { room: "balcony", name: "Kota stone or terracotta floor tiles", why: "Cool underfoot in summer and they age well outdoors.", when: (c) => c.own && c.loves("stone") },
  { room: "balcony", name: "Bamboo chik blinds", why: "Cheap, traditional and they cut glare.", when: (c) => c.climate === "north" || c.climate === "humid" || c.climate === "mild", up: (c) => c.climate === "north" },
  // Extra rooms
  { room: "parents", name: "Cotton bedding and a quilted mattress protector", why: "Soft, breathable and easy to wash often." },
  { room: "parents", name: "Solid wood or metal furniture with rounded edges", why: "Steady to lean on, with nothing sharp to knock into." },
  { room: "parents", name: "Matte, anti-skid floor rugs with rubber backing", why: "Loose rugs are a fall risk; backed ones stay put." },
  { room: "kids", name: "Washable matte paint or wipeable laminates", why: "Crayon and fingerprints come off with a damp cloth." },
  { room: "kids", name: "Rounded-edge furniture", why: "Fewer bumps at toddler head height." },
  { room: "kids", name: "Cotton bedding and a waterproof mattress protector", why: "Accidents happen; the mattress survives." },
  { room: "study", name: "Matte desk top", why: "No glare from the window or the screen." },
  { room: "study", name: "Fabric pinboard or cork wall", why: "Softens echo on calls and holds what you're working on." },
  { room: "study", name: "Engineered wood with veneer for shelves", why: "Straight and stable under the weight of books." },
  { room: "guest", name: "Easy-care cotton bedding", why: "Washes between guests without fuss." },
  { room: "guest", name: "Wipeable mattress cover", why: "Keeps a once-in-a-while mattress fresh." },
  { room: "guest", name: "Foldable or stackable furniture", why: "The room goes back to work or storage when guests leave." },
];

// ---------- What to buy now, later, or skip ----------

export type Verdict = "now" | "later" | "skip";

export interface Essential {
  room: Where;
  name: string;
  cost: string | ((c: Ctx) => string); // a function when the right size depends on the household
  verdict: (c: Ctx) => [Verdict, string] | null; // null = not relevant for this home
  core?: true; // needed to sleep, eat, wash or stay safe from day one — never suggested for postponing
}

// Sized appliance and furniture prices re-checked 12 Oct 2026 against Indian listings (Smartprix, MySmartPrice, PriceDekho,
// Reliance Digital, Flipkart, Amazon.in); rental from Rentomojo/Furlenco; designer fees from 2026 Indian pricing guides.
// Room for two more at the table when people often stay over.
const seats = (c: Ctx) => {
  const n = c.people + (c.guests === "often" ? 2 : 0);
  return n <= 4 ? 4 : n <= 6 ? 6 : 8;
};
const dishwasherSize = (c: Ctx) => bySize(c, "An 8-place compact model is enough.", "Get 12 place settings for three or four people.", "Get 14 place settings — it'll run once a day.");
const sofaAdvice = (c: Ctx) =>
  [
    (c.has("pets") || c.has("kids")) && "Performance fabric with removable covers — it wipes clean.",
    c.has("elders") && "Firm seats at knee height with armrests are easier for your parents to get up from.",
    c.people >= 5
      ? "Seat everyone: a 3-seater plus two chairs, or an L-shape if the room is over 12 ft wide."
      : !(c.has("pets") || c.has("kids") || c.has("elders")) && "A 3-seater suits most flats; save the L-shape for rooms over 12 ft wide.",
  ]
    .filter(Boolean)
    .join(" ");

export const ESSENTIALS: Essential[] = [
  // Bedroom
  { room: "bedroom", name: "Bed with hydraulic storage", core: true, cost: "₹18k–45k", verdict: (c) => ["now", [c.rent ? "Pick a knock-down model that dismantles for the next move; the storage swallows quilts and suitcases." : "Indian flats run short of storage — this holds quilts, suitcases and off-season clothes.", c.has("partner") && "Queen (5×6.5 ft) is the right size for two.", c.has("elders") && !hasRoom(c, "parents") && "If your parents share it, choose one about 18–20 in high — low platform beds are hard on knees."].filter(Boolean).join(" ")] },
  { room: "bedroom", name: "Mattress", core: true, cost: "₹12k–35k", verdict: (c) => ["now", c.has("elders") && !hasRoom(c, "parents") ? "Go firmer and orthopaedic for elders' backs." : hot(c) ? "Latex or pocket-spring — memory foam sleeps hot in Indian summers." : "The one thing worth spending on; you use it eight hours a day."] },
  { room: "bedroom", name: "Built-in sliding wardrobe", cost: "₹60k–1.5L", verdict: (c) => (!c.own ? null : tight(c) ? ["later", "At this budget, start with a freestanding wardrobe and build in once the kitchen is done."] : ["now", `Get carpentry done before you move in — dust and workers are far easier in an empty flat.${c.has("partner") ? " Allow about 2 ft of hanging width per adult." : ""}`]) },
  { room: "bedroom", name: "Freestanding wardrobe", cost: "₹12k–35k", verdict: (c) => (c.rent ? ["now", ["Unfurnished rentals rarely have built-ins; this one moves with you.", c.has("partner") && "A 3-door gives you each your own side.", c.has("flatmates") && "Get one with a lock — flatmates come and go."].filter(Boolean).join(" ")] : tight(c) ? ["now", "Covers you until the built-in, then moves to a spare room."] : null) },
  { room: "bedroom", name: "BLDC ceiling fan", core: true, cost: "₹3k–6k each", verdict: (c) => (c.climate === "hills" ? ["skip", "Rarely needed in the hills — spend on heating instead."] : ["now", "Unfurnished flats often have bare fan points. BLDC fans use about half the power and pay off in two summers."]) },
  { room: "bedroom", name: "Split AC (1.5 ton, inverter)", cost: "₹35k–55k", verdict: (c) => (c.climate === "hills" ? null : c.climate === "mild" ? ["later", "Mild cities rarely need one — see how your first summer feels."] : ["now", `${c.rent ? "The outdoor unit needs drilling — get the landlord's OK in writing first." : c.work === "wfh" ? "Go 5-star inverter — you'll run it through the workday, so it pays back fastest." : "Go 3- or 5-star inverter; it pays back on the bill within a few summers."}${c.rent && c.work === "wfh" ? " Pick 5-star: you'll run it all day." : ""}`]) },
  { room: "bedroom", name: "Oil-filled room heater", cost: "₹7k–14k", verdict: (c) => (c.climate === "hills" ? ["now", "Warms evenly without drying the air or burning oxygen."] : c.climate === "north" ? ["later", "Buy before December, when prices climb."] : null) },
  { room: "bedroom", name: "Blackout curtains", cost: "₹1.5k–4k per window", verdict: (c) => ["now", c.work === "long" ? "Shift and late workers need real darkness to sleep in the day." : hot(c) ? "Lined curtains block afternoon heat as well as light." : "Privacy from day one — apartment windows often face the next building."] },
  { room: (c) => (hasRoom(c, "study") ? "study" : "bedroom"), name: "Work desk and ergonomic chair", cost: "₹12k–30k", verdict: (c) => (c.work === "wfh" ? ["now", `You spend 40+ hours a week here — the chair matters more than the desk.${c.has("partner") ? " If your partner works from home too, plan a second desk — two calls in one room don't work." : ""}`] : c.work === "hybrid" ? ["now", "Even two home days a week deserve a proper chair; a foldable desk clears away on office days."] : ["skip", "The dining table or a counter covers the odd laptop evening."]) },
  { room: "bedroom", name: "Bed and mattress for live-in help", cost: "₹10k–20k", verdict: (c) => (c.help === "full-time" ? ["now", "A metal single bed and a firm mattress — they deserve a proper bed, not a mat on the floor."] : null) },
  { room: "bedroom", name: "Dressing table", cost: "₹8k–20k", verdict: (c) => (c.small ? ["skip", "A mirror on the wardrobe door and one shelf inside does the same job in less space."] : null) },
  { room: "bedroom", name: "Bedside lamps", cost: "₹1.5k–5k", verdict: (c) => ["later", c.has("partner") ? "One on each side, so one of you can read while the other sleeps." : "Warm 2700K light at bed height beats the ceiling tube light at night."] },

  // Parents' room
  { room: "parents", name: "Bed for your parents", core: true, cost: "₹15k–40k", verdict: (c) => (hasRoom(c, "parents") ? ["now", "About 18–20 in high, so getting up is easy on knees — skip low platform beds."] : null) },
  { room: "parents", name: "Firm orthopaedic mattress", core: true, cost: "₹12k–30k", verdict: (c) => (hasRoom(c, "parents") ? ["now", "Firm support for older backs; 6–8 in thick keeps the bed at a good height."] : null) },
  { room: "parents", name: "Wardrobe for your parents", cost: "₹12k–35k", verdict: (c) => (hasRoom(c, "parents") ? ["now", "Shelves between knee and shoulder height — no step stool, no bending to the floor."] : null) },
  { room: "parents", name: "Motion-sensor night lights", core: true, cost: "₹500–1.5k", verdict: (c) => (hasRoom(c, "parents") ? ["now", "Bulb or plug-in lights between the bed and the bathroom that switch on by themselves."] : null) },
  { room: "parents", name: "Armchair with armrests", cost: "₹8k–20k", verdict: (c) => (hasRoom(c, "parents") ? ["later", "A firm chair to read or pray in, and to sit on while dressing."] : null) },

  // Kids' room (toys and homework live in the living room when the kids share your room)
  { room: "kids", name: "Single bed and mattress", core: true, cost: "₹14k–30k", verdict: (c) => (hasRoom(c, "kids") ? ["now", "A standard single (3×6.5 ft) they won't outgrow — skip themed car beds. Two sharing? A bunk bed runs ₹15k–45k."] : null) },
  { room: "kids", name: "Kids' wardrobe", cost: "₹12k–35k", verdict: (c) => (hasRoom(c, "kids") ? ["now", c.rent ? "Freestanding, held to the wall with an anti-tip strap (ask the landlord about the one screw)." : "Built in, with a low rail they can reach now and raise later."] : null) },
  { room: (c) => (hasRoom(c, "kids") ? "kids" : "living"), name: "Open toy storage with bins", cost: "₹2.5k–6k", verdict: (c) => (c.has("kids") ? ["now", "Low shelves and bins they can reach — tidying up becomes their job."] : null) },
  { room: (c) => (hasRoom(c, "kids") ? "kids" : "living"), name: "Study table and chair", cost: "₹3k–15k", verdict: (c) => (c.has("kids") ? ["later", "Buy when homework starts; a height-adjustable set grows with them."] : null) },

  // Study
  { room: "study", name: "Bookshelf", cost: "₹2.5k–8k", verdict: (c) => (hasRoom(c, "study") ? ["later", "Closed doors below hide cables and files; open shelves above for books."] : null) },
  { room: "study", name: "Daybed for guests", cost: "₹18k–40k", verdict: (c) => (!hasRoom(c, "study") || c.guests === "never" ? null : c.guests === "often" ? ["now", "Family stays often — the study doubles as their room."] : ["later", "Turns the study into a guest room when family visits."]) },

  // Guest room
  { room: "guest", name: "Folding bed with mattress", cost: "₹5k–10k", verdict: (c) => (hasRoom(c, "guest") && c.guests !== "often" ? ["later", "Guests come a few times a year; it folds away the rest of the time."] : null) },
  { room: "guest", name: "Guest bed and mattress", cost: "₹14k–30k", verdict: (c) => (hasRoom(c, "guest") && c.guests === "often" ? ["now", "People stay often, so a proper single or double bed earns its place over a folding one."] : null) },
  { room: "guest", name: "Hooks and a luggage stand", cost: "₹1k–3k", verdict: (c) => (hasRoom(c, "guest") ? ["later", "Somewhere for bags and towels, so guests don't live out of a suitcase on the floor."] : null) },

  // Kitchen
  { room: "kitchen", name: "Modular kitchen (BWP ply)", core: true, cost: "₹1.5L–4L", verdict: (c) => (!c.own ? null : tight(c) ? ["later", "A full modular kitchen won't fit this budget. Start with steel racks and a trolley, and make the kitchen its own project once you've saved for it."] : ["now", c.cooking === "rarely" ? "Keep it to a simple straight run with fewer drawers — that keeps the quote low." : "Book it early — design, making and fitting take 4–6 weeks."]) },
  { room: "kitchen", name: "Steel racks and a kitchen trolley", cost: "₹3k–10k", verdict: (c) => (c.rent ? ["now", "Rentals often have just a platform and sink — racks add storage without drilling."] : tight(c) ? ["now", "Storage for now; they move to the utility area once the modular kitchen goes in."] : null) },
  { room: "kitchen", name: "Auto-clean chimney (60 cm)", cost: "₹11k–20k", verdict: (c) => (c.cooking === "daily" ? ["now", c.rent ? "Daily tadka coats the walls in oil within months. It needs a duct hole — ask the landlord first." : "Daily tadka coats walls and shutters in oil within months; auto-clean spares you scrubbing filters."] : c.cooking === "light" ? ["later", "Start with an exhaust fan; add a chimney if the walls start feeling sticky."] : ["skip", "An exhaust fan handles occasional cooking."]) },
  { room: "kitchen", name: "Kitchen exhaust fan", cost: "₹1.5k–3k", verdict: (c) => (c.cooking === "daily" ? null : ["now", "Cheap, and it clears smells and steam."]) },
  { room: "kitchen", name: "Gas stove (3-burner)", core: true, cost: "₹4k–9k", verdict: (c) => (c.cooking === "rarely" ? ["skip", "An induction cooktop covers the odd meal — no cylinder to arrange."] : ["now", "Apply to transfer your gas connection before moving; it can take a week or two."]) },
  { room: "kitchen", name: "Second gas cylinder (DBC)", cost: "₹1.5k–2.5k deposit", verdict: (c) => (c.cooking === "daily" ? ["now", "Daily cooking empties a cylinder in about a month; a refundable second-cylinder deposit means no waiting for a refill."] : c.cooking === "light" ? ["later", "Worth adding if refills keep arriving late."] : null) },
  { room: "kitchen", name: "Induction cooktop", core: true, cost: "₹2.5k–5k", verdict: (c) => ["now", c.cooking === "rarely" ? "Your main cooktop — plug in and go." : "Backup for the days before the gas connection arrives, and when the cylinder runs out."] },
  { room: "kitchen", name: "Refrigerator", core: true, cost: (c) => bySize(c, "₹14k–30k", "₹25k–45k", "₹45k–75k"), verdict: (c) => ["now", `${bySize(c, "190–250 L is plenty for one or two; pick 3-star or better.", "250–350 L double door for three or four — it runs 24/7, so check the star rating.", "350–500 L for five or more: a large double door or convertible holds a week of sabzi and milk.")}${c.cooking === "daily" ? " Cooking daily, favour a bigger freezer for batch-cooked gravies, peas and paneer." : ""}`] },
  { room: "kitchen", name: "Water purifier", core: true, cost: "₹9k–20k", verdict: (c) => ["now", `Test the tap water's TDS first: under about 300, UV is enough — RO wastes water and strips minerals.${bySize(c, "", "", " Pick an 8–10 L tank so it keeps up with five or more.")}`] },
  { room: "kitchen", name: "Mixer grinder (750 W)", cost: "₹3k–7k", verdict: (c) => (c.cooking === "daily" ? ["now", "Chutneys, masalas, batter — an Indian kitchen staple."] : c.cooking === "light" ? ["later", "Buy it when you catch yourself wanting chutney."] : ["skip", "Rarely-used appliances eat counter space."]) },
  { room: "kitchen", name: "Microwave or OTG", cost: "₹6k–15k", verdict: (c) => (c.cooking === "rarely" || c.busy ? ["now", "Reheating leftovers and tiffin is part of your routine."] : ["later", "Useful, not urgent — the stove does most of it."]) },
  { room: "kitchen", name: "Dishwasher (with kadhai cycle)", cost: (c) => bySize(c, "₹20k–25k", "₹30k–40k", "₹40k–53k"), verdict: (c) => (c.cooking === "rarely" ? ["skip", "Not enough dishes to fill it."] : c.hasHelp ? ["skip", "Your help already does the bartan — it would sit idle."] : tight(c) ? ["later", "On this budget, part-time help for dishes (₹1.5k–3k a month) costs less than a dishwasher for the first year or two."] : c.busy || c.has("kids") ? ["now", `With daily cooking and no help, it gives back about an hour a day. ${dishwasherSize(c)}`] : ["later", `Try a month of doing dishes yourself; if it hurts, this is the fix. ${dishwasherSize(c)}`]) },
  { room: "kitchen", name: "Air fryer", cost: "₹4k–9k", verdict: (c) => (c.cooking === "rarely" ? ["later", "Quick snacks without much oil when you mostly order in."] : c.cooking === "light" ? ["skip", "Nice to have, not a necessity — an OTG covers most of it."] : null) },
  { room: "kitchen", name: "Modular add-ons (magic corner, tall unit)", cost: "₹15k–60k", verdict: (c) => (!c.own ? null : c.budget === "high" || c.budget === "premium" ? ["later", "Add them once you know how you actually use the kitchen."] : c.cooking === "daily" && !tight(c) ? ["later", "A tall pantry unit earns its place in a daily kitchen; skip the magic corner."] : ["skip", "Add-ons inflate modular quotes fast; plain shelves and baskets do most of the work."]) },

  // Bathroom
  { room: "bathroom", name: "Geyser", core: true, cost: (c) => bySize(c, "₹6k–10k", "₹8k–13k", "₹10k–15k"), verdict: (c) => (c.climate === "humid" ? ["later", "Coastal winters are mild — a 3 L instant geyser may be all you need."] : ["now", `${bySize(c, "15 L covers two showers back to back.", "25 L covers three or four showers back to back.", "35 L, or one per bathroom, so the last shower isn't cold.")} ${c.climate === "mild" ? "Mornings get cold in winter; 5-star models keep the bill down." : "Non-negotiable in winter; get a 5-star one with a timer."}`]) },
  { room: "bathroom", name: "Bathroom exhaust fan", cost: "₹1.5k–3k", verdict: (c) => ["now", c.climate === "humid" ? "Without one, monsoon damp turns grout black within a season." : "Stops damp and smells settling in."] },
  { room: "bathroom", name: "Anti-skid mats and grab bars", core: true, cost: "₹1k–4k", verdict: (c) => (c.has("elders") || c.has("kids") ? ["now", c.rent ? "Suction grab bars need no drilling; add anti-skid mats inside and outside the shower." : "Fix grab bars by the WC and shower — wet floors are the top fall risk at home."] : ["later", "An anti-skid mat outside the shower is enough for now."]) },
  { room: "bathroom", name: "Raised toilet seat", core: true, cost: "₹1.5k–3k", verdict: (c) => (c.has("elders") ? ["now", "Easier on knees and hips; clamp-on models need no fitting."] : null) },
  { room: "bathroom", name: "Shower curtain and tension rod", cost: "₹800–2k", verdict: (c) => (c.rent ? ["now", "Keeps the wet area separate without a single hole."] : null) },
  { room: "bathroom", name: "Glass shower partition", cost: "₹15k–35k", verdict: (c) => (c.rent ? ["skip", "A curtain does the same job and leaves with you."] : ["later", "Check water hardness first — hard water leaves white scale on glass every week."]) },
  { room: "bathroom", name: "Mirror cabinet or rack", cost: "₹2k–8k", verdict: (c) => ["now", c.rent ? "Over-the-door or freestanding — no drilling into tiles." : "PVC or aluminium, never MDF — it swells within a monsoon."] },
  { room: "bathroom", name: "Shower filter", cost: "₹1.5k–3k", verdict: () => ["later", "If your TDS is above 300, it saves your hair and fittings from scale."] },
  { room: "bathroom", name: "Bathtub", cost: "₹25k+", verdict: (c) => (c.own && (c.budget === "high" || c.budget === "premium") ? ["skip", "Rarely used in Indian homes, and it eats space and water."] : null) },

  // Living room
  { room: "living", name: "Sofa", cost: "₹20k–60k", verdict: (c) => (c.home !== "1rk" ? ["now", sofaAdvice(c)] : c.guests === "never" ? ["later", "A compact 2-seater or floor cushions, for when you want seating off the bed."] : ["skip", "Your bed is the sofa — a sofa-cum-bed saves the floor."]) },
  { room: "living", name: "Sofa-cum-bed", cost: "₹18k–40k", verdict: (c) =>
      c.guests === "never"
        ? c.small
          ? ["skip", "Nobody stays over, so the fold-out bed would go unused — a regular sofa sits better and costs less."]
          : null
        : c.home === "1rk"
          ? ["now", "Seating by day, a guest bed when family visits."]
          : c.home === "1bhk"
            ? c.guests === "often"
              ? ["now", "Family stays often — a sofa-cum-bed beats a mattress on the floor."]
              : ["later", "Handy when parents or friends stay over."]
            : c.guests === "often" && !hasRoom(c, "guest") && !hasRoom(c, "study")
              ? ["now", "Family stays often and there's no spare room for them — this is your guest bed."]
              : null },
  { room: "living", name: "Socket guards and corner protectors", core: true, cost: "₹250–1k", verdict: (c) => (c.has("kids") ? ["now", "Toddlers find sockets and table corners first — fit them before moving in."] : null) },
  { room: "living", name: "Closed shoe rack", cost: "₹2k–6k", verdict: (c) => ["now", `${c.vastu ? "Shoes come off at the door. Vastu: keep it to the south or west of the entrance, not the north-east." : "Shoes come off at the door — a closed rack keeps dust and smell in."}${c.people >= 3 ? " Pick 4+ shelves; shoes multiply fast with more people." : ""}`] },
  { room: "living", name: "Curtains (sheer + lined)", cost: "₹2k–6k per window", verdict: () => ["now", "Privacy and heat control from day one."] },
  { room: "living", name: "Inverter and battery", cost: "₹15k–22k", verdict: (c) => (c.work === "wfh" || c.work === "hybrid" ? ["now", "A power cut mid-call isn't an option; it keeps the Wi-Fi, fans and lights running."] : ["later", "Ask the neighbours how often power goes — over an hour a day, buy one."]) },
  { room: "living", name: "Dining table", cost: (c) => (seats(c) === 4 ? "₹12k–45k" : seats(c) === 6 ? "₹20k–75k" : "₹60k–1L"), verdict: (c) => (c.small ? ["skip", "A fold-down wall table or the kitchen counter frees the floor."] : c.has("kids") || c.has("elders") ? ["now", `A ${seats(c)}-seater, so everyone eats together${c.has("kids") ? " — rounded corners if the kids are small" : ""}.`] : ["later", `Live in the space a month first, then buy a ${seats(c)}-seater that fits.`]) },
  { room: "living", name: "Pooja unit", cost: "₹3k–15k", verdict: (c) => (c.vastu ? ["now", "Place it in the north-east corner."] : null) },
  { room: "living", name: "TV and stand", cost: "₹25k–60k", verdict: (c) => ["later", c.rent ? "A floor stand instead of a wall mount — no holes to explain at handover." : "Plan the wall, conduit and plug points before painting."] },
  { room: "living", name: "Rug", cost: "₹3k–12k", verdict: (c) => ["later", c.climate === "humid" ? "Cotton dhurrie, not jute — jute holds damp in the monsoon." : "Buy after the sofa so the size is right."] },
  { room: "living", name: "Centre table", cost: "₹5k–15k", verdict: (c) => (c.small ? ["skip", "Two nesting side tables do the job and tuck away."] : ["later", "Buy after the sofa so the proportions work."]) },

  // Balcony
  { room: (c) => (c.balcony ? "balcony" : "bathroom"), name: "Washing machine (fully automatic)", core: true, cost: (c) => bySize(c, "₹12k–30k", "₹16k–35k", "₹22k–50k"), verdict: (c) => ["now", `${bySize(c, "6–7 kg", "7–8 kg", "8–10 kg")} suits your household. ${tight(c) ? "A top-load fully automatic is fine on a tight budget." : c.climate === "humid" ? "Front-load spins clothes drier — it matters when monsoon laundry won't dry." : "Front-load is gentler on clothes and spins them drier."}`] },
  { room: (c) => (c.balcony ? "balcony" : "bathroom"), name: "Dryer", cost: "₹30k–55k", verdict: (c) => (!c.balcony ? [c.climate === "humid" ? "now" : "later", "With no balcony to dry clothes, a dryer (or a washer-dryer) stops damp laundry hanging indoors."] : c.climate === "humid" && c.busy ? ["later", "Monsoon laundry can take three days to dry — a dryer ends the damp smell."] : ["skip", "Sun and a drying stand do it for free."]) },
  { room: (c) => (c.balcony ? "balcony" : "bathroom"), name: "Clothes drying stand", cost: "₹1.5k–4k", verdict: (c) => ["now", !c.balcony ? "No balcony: a foldable stand by a window, or a ceiling pulley in the bathroom area, with the exhaust fan on." : c.rent ? "A foldable floor stand — ceiling pulley hangers need drilling." : "A ceiling pulley hanger keeps the floor free."] },
  { room: "balcony", name: "Bird net", cost: "₹1.5k–5k", verdict: () => ["now", "Pigeons move in fast. Nets are cheap; cleaning droppings is not."] },
  { room: "balcony", name: "Safety grill", core: true, cost: "₹8k–25k", verdict: (c) => (c.has("kids") || c.has("pets") ? ["now", c.rent ? "Ask the landlord — most agree to a child-safety grill." : "An invisible steel-wire grill keeps the view and keeps everyone safe."] : null) },
  { room: "balcony", name: "Outdoor blinds", cost: "₹2k–6k", verdict: (c) => (hot(c) ? ["now", "Afternoon sun on the balcony heats the whole flat; blinds stop it at the source."] : ["later", "Add if the balcony gets harsh afternoon sun."]) },
  { room: "balcony", name: "Plants and planters", cost: "₹1k–5k", verdict: (c) => ["later", c.has("pets") ? "Pick pet-safe plants: areca palm, spider plant, calathea." : c.busy ? "Start with hard-to-kill ones: snake plant, money plant, ZZ." : "Tulsi, curry leaves and mint pay you back in the kitchen."] },
  { room: "balcony", name: "Balcony seating", cost: "₹4k–12k", verdict: (c) => ["later", c.small ? "Two folding chairs that come out when you need them." : "A small bistro set turns it into the best spot for morning chai."] },
];

// ---------- Dos and don'ts ----------

export interface Tip {
  room: Where;
  kind: "do" | "dont";
  text: string;
  when?: (c: Ctx) => boolean;
}

export const TIPS: Tip[] = [
  { room: "bedroom", kind: "do", text: "Put the bed head against a solid wall, not under a window." },
  { room: "bedroom", kind: "do", text: "Use warm 2700K bulbs here; save the cool white light for the kitchen." },
  { room: (c) => (hasRoom(c, "study") ? "study" : "bedroom"), kind: "do", text: "Put the desk where daylight falls from the side, not behind the screen.", when: (c) => c.work === "wfh" || c.work === "hybrid" },
  { room: (c) => (hasRoom(c, "study") ? "study" : "bedroom"), kind: "do", text: "Soft things stop echo on calls — a rug, curtains and a fabric headboard behind you.", when: (c) => c.work === "wfh" || c.work === "hybrid" },
  { room: "bedroom", kind: "do", text: "A white-noise fan or app masks daytime traffic and doorbells while you sleep.", when: (c) => c.work === "long" },
  { room: "bedroom", kind: "do", text: "Run the AC on dry mode in the monsoon — it pulls out damp without freezing the room.", when: (c) => c.climate === "humid" },
  { room: "bedroom", kind: "do", text: "Vastu: sleep with your head to the south or east.", when: (c) => c.vastu },
  { room: "bedroom", kind: "dont", text: "Don't squeeze a king bed (6×6.5 ft) into a 10×10 room — a queen (5×6.5 ft) leaves room to walk.", when: (c) => c.small },
  { room: "bedroom", kind: "dont", text: "Don't put wardrobes or upholstered headboards against damp outer walls.", when: (c) => c.climate === "humid" },
  { room: "bedroom", kind: "dont", text: "Don't buy a dresser, study table and wardrobe in week one — buy the next piece when you miss it." },
  { room: "bedroom", kind: "dont", text: "Don't put your bed against the kitchen or living-room wall — daytime noise travels through.", when: (c) => c.work === "long" },
  { room: "bedroom", kind: "dont", text: "Don't hammer in curtain nails — use existing brackets or tension rods.", when: (c) => c.rent },
  { room: "bedroom", kind: "dont", text: "Vastu: avoid a mirror facing the bed.", when: (c) => c.vastu },

  { room: "kitchen", kind: "do", text: "Keep the stove, sink and fridge within a few steps of each other." },
  { room: "kitchen", kind: "do", text: "Put the masala drawer right beside the stove, at hip height.", when: (c) => c.cooking === "daily" },
  { room: "kitchen", kind: "do", text: "Ask for edge-banding on every board edge — that's where water gets in.", when: (c) => c.own },
  { room: "kitchen", kind: "do", text: "Line the shelves and platform before unpacking.", when: (c) => c.rent },
  { room: "kitchen", kind: "do", text: "Keep a 2 kg ABC fire extinguisher near the kitchen door." },
  { room: "kitchen", kind: "do", text: "Agree a weekly menu and keep a shopping list on the fridge — it saves daily calls with your cook.", when: (c) => c.help === "maid-cook" || c.help === "full-time" },
  { room: "kitchen", kind: "do", text: "Give each flatmate a fridge shelf and a labelled bin — it heads off most kitchen arguments.", when: (c) => c.has("flatmates") },
  { room: "kitchen", kind: "do", text: "Vastu: cook facing east, with the stove in the south-east.", when: (c) => c.vastu },
  { room: "kitchen", kind: "dont", text: "Don't use MDF or particle board anywhere near the sink.", when: (c) => c.own },
  { room: "kitchen", kind: "dont", text: "Don't choose high-gloss shutters — every oil mark shows.", when: (c) => c.own && c.cooking === "daily" },
  { room: "kitchen", kind: "dont", text: "Don't pay for every accessory in the modular catalogue; most go unused.", when: (c) => c.own },
  { room: "kitchen", kind: "dont", text: "Don't put the fridge right next to the stove — the heat makes it work harder." },
  { room: "kitchen", kind: "dont", text: "Vastu: don't put the sink and stove side by side.", when: (c) => c.vastu },

  { room: "bathroom", kind: "do", text: "Check the floor slopes to the drain before you move in — standing water starts most leaks." },
  { room: "bathroom", kind: "do", text: "Keep the exhaust on for 15 minutes after a shower.", when: (c) => c.climate === "humid" },
  { room: "bathroom", kind: "do", text: "Add a plug-in night light on the way from bedroom to bathroom.", when: (c) => c.has("kids") || (c.has("elders") && !hasRoom(c, "parents")) },
  { room: "bathroom", kind: "do", text: "Use over-the-door racks and adhesive hooks instead of drilling tiles.", when: (c) => c.rent },
  { room: "bathroom", kind: "do", text: "Keep a dry zone for towels and clothes, away from the shower." },
  { room: "bathroom", kind: "dont", text: "Don't use wooden or MDF cabinets — they swell within a monsoon." },
  { room: "bathroom", kind: "dont", text: "Don't choose glossy floor tiles; they're slippery when wet.", when: (c) => c.own },
  { room: "bathroom", kind: "dont", text: "Vastu: keep the bathroom door closed and the WC lid down.", when: (c) => c.vastu },

  { room: "living", kind: "do", text: "Measure the lift and stairwell before buying the sofa." },
  { room: "living", kind: "do", text: "Leave about 90 cm walking paths around furniture." },
  { room: "living", kind: "do", text: "Use three light sources — ceiling, a floor lamp and a table lamp." },
  { room: "living", kind: "do", text: "Anchor tall shelves and the TV with anti-tip straps.", when: (c) => c.has("kids") || c.has("pets") },
  { room: "living", kind: "do", text: "Put a do-not-disturb note on the door and send deliveries to the security desk during your sleep hours.", when: (c) => c.work === "long" },
  { room: "living", kind: "do", text: "Put brighter bulbs in passages and by the door — older eyes need about twice the light.", when: (c) => c.has("elders") },
  { room: "living", kind: "do", text: "Agree how the electricity bill splits before anyone buys an AC — one can double the bill.", when: (c) => c.has("flatmates") },
  { room: "living", kind: "do", text: "Vastu: keep heavy furniture along the south and west walls.", when: (c) => c.vastu },
  { room: "living", kind: "dont", text: "Don't buy a matching 3+1+1 sofa set — it swallows an Indian living room." },
  { room: "living", kind: "dont", text: "Don't use velvet or leather sofas — they turn sticky and mould in the monsoon.", when: (c) => c.climate === "humid" },
  { room: "living", kind: "dont", text: "Don't paint without written permission; rugs, curtains and leaning art do the work instead.", when: (c) => c.rent },
  { room: "living", kind: "dont", text: "Don't furnish it all in month one — live in it, then fill the gaps." },
  { room: "living", kind: "dont", text: "Don't lay a jute or loop-pile rug with pets — claws catch and pull the weave.", when: (c) => c.has("pets") },

  { room: "parents", kind: "do", text: "Keep a clear, lit path from the bed to the bathroom — no rugs or wires on the way." },
  { room: "parents", kind: "do", text: "Put photos and the things they use daily at eye level." },
  { room: "parents", kind: "dont", text: "Don't choose a low platform bed or a sofa without arms for this room." },
  { room: "kids", kind: "do", text: "Keep big pieces neutral and let them choose the bedding, a lamp or a poster — the room grows with them." },
  { room: "kids", kind: "do", text: "Anchor the wardrobe and bookshelf to the wall.", when: (c) => c.own },
  { room: "kids", kind: "dont", text: "Don't put the bed under a window or beside a shelf they can climb." },
  { room: "study", kind: "do", text: "Keep a plain wall or shelf behind you for calls, and the router within reach." },
  { room: "study", kind: "dont", text: "Don't sit with your back to the door — it's distracting and looks odd on calls." },
  { room: "guest", kind: "do", text: "Keep half the wardrobe empty and a spare set of towels and bedding ready." },
  { room: "guest", kind: "dont", text: "Don't let it become a junk room — give storage a home in the loft or under the bed." },
  { room: "balcony", kind: "do", text: "Install the bird net before the first nest." },
  { room: "balcony", kind: "do", text: "Put pots on stands so water drains instead of staining the floor." },
  { room: "balcony", kind: "do", text: "Keep mops, buckets, brooms and cleaners in one utility cupboard, so your help's time goes on cleaning, not hunting.", when: (c) => c.hasHelp },
  { room: "balcony", kind: "do", text: "Use self-watering pots — two weeks away is fine.", when: (c) => c.busy },
  { room: "balcony", kind: "do", text: "Vastu: tall plants to the south-west, tulsi to the north or east.", when: (c) => c.vastu },
  { room: "balcony", kind: "dont", text: "Don't leave water standing in saucers — it breeds dengue mosquitoes.", when: (c) => c.climate !== "hills" },
  { room: "balcony", kind: "dont", text: "Don't keep stools or stackable furniture near the railing — kids climb.", when: (c) => c.has("kids") },
  { room: "balcony", kind: "dont", text: "Don't load it with heavy stone planters; balconies have weight limits." },
];

// ---------- Chores: hand to help, machines, or keep ----------

export type Hand = "help" | "machine" | "local" | "you";

export interface Chore {
  task: string;
  hours: (c: Ctx) => number; // per week, a typical 2BHK
  help: string; // what a person costs
  machine?: { name: string; cost: string };
  pick: (c: Ctx) => [Hand, string];
}

// Dishes, laundry and cooking grow with the household; the base figures are for three or four people.
const scale = (c: Ctx, hours: number) => Math.round(hours * (c.people === 1 ? 0.6 : bySize(c, 0.8, 1, 1.4)) * 2) / 2;

export const CHORES: Chore[] = [
  {
    task: "Sweeping and mopping",
    hours: () => 5,
    help: "₹1.5k–3.5k a month",
    machine: { name: "Robot vacuum-mop", cost: "₹15k–35k" },
    pick: (c) => (c.hasHelp ? ["help", "Already covered — ask for a weekly deep clean too."] : (c.busy || c.has("pets")) && tight(c) ? ["help", "A part-time maid costs less than a robot vacuum to start; add the robot later."] : c.busy || c.has("pets") ? ["machine", c.has("pets") ? "Runs daily for pet hair and dust while you're out." : "Runs every day while you're at work; you do a quick weekend pass."] : ["you", "Fifteen minutes a day — or add a maid later."]),
  },
  {
    task: "Dishes",
    hours: (c) => scale(c, c.cooking === "daily" ? 6 : c.cooking === "light" ? 3 : 1),
    help: "₹1.5k–3k a month",
    machine: { name: "Dishwasher with kadhai cycle", cost: "₹20k–53k" },
    pick: (c) => (c.cooking === "rarely" ? ["you", "A few plates — not worth outsourcing."] : c.hasHelp ? ["help", "Your help covers the bartan."] : c.busy && !tight(c) ? ["machine", "Load it at night, unload in the morning."] : ["help", "Usually the first job worth handing over."]),
  },
  {
    task: "Laundry",
    hours: (c) => scale(c, 3),
    help: "Not usually a maid's job",
    machine: { name: "Fully automatic washer", cost: "₹12k–50k" },
    pick: (c) => (c.help === "full-time" ? ["help", "Your help can run the machine and hang the clothes."] : ["machine", c.climate === "humid" && c.busy ? "Front-load, plus a dryer in the monsoon." : "Load at night, hang in the morning."]),
  },
  {
    task: "Ironing",
    hours: () => 2,
    help: "Local istriwala, ₹10–20 a piece",
    pick: (c) => (c.help === "full-time" ? ["help", "Your help can take it on."] : c.busy || c.work === "hybrid" ? ["local", "Hand it to the neighbourhood istriwala."] : ["you", "A steam iron and an hour on Sunday."]),
  },
  {
    task: "Cooking",
    hours: (c) => scale(c, c.cooking === "daily" ? 10 : c.cooking === "light" ? 4 : 1),
    help: "Cook, ₹4k–9k a month for two meals",
    machine: { name: "Electric pressure cooker", cost: "₹5k–10k" },
    pick: (c) => (c.help === "maid-cook" || c.help === "full-time" ? ["help", "Your cook has it covered."] : c.cooking === "daily" && c.busy ? ["help", "Hire a cook: home food every day, and two hours of your evening back."] : ["machine", "An electric pressure cooker makes dal and rice hands-off."]),
  },
  {
    task: "Bathroom cleaning",
    hours: () => 1.5,
    help: "Usually part of the maid's weekly work",
    pick: (c) => (c.hasHelp ? ["help", "Ask for it twice a week."] : ["you", "Twenty minutes, twice a week, with a long-handled brush."]),
  },
];

// ---------- Before you move in (India home checks) ----------

export const CHECKS: { text: string; when?: (c: Ctx) => boolean }[] = [
  { text: "Photograph every wall, tile and fitting with timestamps — it's your deposit evidence.", when: (c) => c.rent },
  { text: "Get written permission for any drilling: curtain rods, AC, chimney, geyser.", when: (c) => c.rent },
  { text: "Book the modular kitchen and wardrobes about six weeks ahead — finish carpentry before you move in.", when: (c) => c.own },
  { text: "Deep clean and pest control (cockroach and termite) before the furniture arrives — about ₹2k–5k." },
  { text: "Test the tap water's TDS with a ₹200 meter — it decides RO vs UV, and whether you need a softener." },
  { text: "Have an electrician check the earthing, the MCB board, and 15 A points for the geyser, AC and washer." },
  { text: "Fit mosquito mesh on the windows (velcro mesh works in rentals).", when: (c) => c.climate !== "hills" },
  { text: "Check walls for damp patches and leaks before you sign — the monsoon only makes them worse.", when: (c) => c.climate === "humid" },
  { text: "Check that windows seal properly — drafts cost more in heating than any curtain can fix.", when: (c) => c.climate === "hills" },
  { text: "Ask the neighbours how long power cuts last.", when: (c) => c.work !== "wfh" && c.work !== "hybrid" },
  { text: "Book broadband before moving — you'll need it on day one.", when: (c) => c.work === "wfh" || c.work === "hybrid" },
  { text: "Apply to transfer your gas connection a week or two before moving.", when: (c) => c.cooking !== "rarely" },
  { text: "Fix a griha pravesh date and do the puja before the furniture moves in.", when: (c) => c.vastu },
  { text: "Get your help police-verified through your state police's citizen portal; most cities now offer it online.", when: (c) => c.hasHelp },
  { text: "Decide where live-in help will sleep and bathe before you sign — most 2BHKs have no servant room — and agree hours and a weekly day off.", when: (c) => c.help === "full-time" },
  { text: "Check the lift works, or that your parents' room is on the entry floor — stairs decide how comfortably they can stay.", when: (c) => c.has("elders") },
  { text: "Agree in writing who owns the shared fridge, washer and purifier, and how they're split when someone moves out.", when: (c) => c.has("flatmates") },
];

// ---------- Where to spend and where to save, by budget band ----------
// Strategy only: item-level advice already lives in ESSENTIALS and MATERIAL_TIPS, so nothing here repeats it.

const band = (...bands: Budget[]) => (c: Ctx) => bands.includes(c.budget ?? "mid");

export const BUDGET_TIPS: { kind: "spend" | "save"; text: string; when: (c: Ctx) => boolean }[] = [
  { kind: "save", text: "Buy the fridge, washer and AC in a festive sale (Diwali, Republic Day), but check the price a month earlier — the headline 'up to 75% off' covers only a few models.", when: band("tight", "mid", "high") },
  { kind: "save", text: "Buy appliances new and furniture second-hand: appliances need a warranty, but a solid wood bed or table rarely fails. Check used wood for termite dust and sofas for bed bugs.", when: band("tight") },
  { kind: "save", text: "If you might move within a year, rent the sofa and bed (about ₹300–1,600 a month each; longer plans cost less) and buy once you're settled.", when: (c) => c.rent && band("tight", "mid")(c) },
  { kind: "spend", text: "Buy new what you sit or sleep on — mattress, sofa, dining chairs — and go flat-pack for storage you only open.", when: band("mid") },
  { kind: "save", text: "Keep about 10% aside for what nobody budgets for: extension boards, curtain rods, hooks, bulbs and a basic toolkit.", when: () => true },
  { kind: "spend", text: "Get three quotes for carpentry and ask each for the board brand, thickness and hardware make in writing — that's where quotes quietly differ.", when: (c) => c.own && !tight(c) },
  { kind: "save", text: "Ask for a written BOQ (bill of quantities) and tie payments to milestones, with no more than 30% upfront.", when: (c) => c.own && !tight(c) },
  { kind: "spend", text: "Put 10–15% into lighting — profile lights, wall washers and dimmers change a room more than any furniture. Wire them before painting.", when: (c) => c.own && band("high", "premium")(c) },
  { kind: "spend", text: "In a rental, put the money into what moves with you — sofa, mattress, rugs, lamps and art — not into the landlord's walls.", when: (c) => c.rent && band("high", "premium")(c) },
  { kind: "spend", text: "Spend on what you touch every day — soft-close hinges, solid-brass handles, good upholstery — rather than showpieces.", when: (c) => c.own && band("premium")(c) },
  { kind: "spend", text: "A designer usually charges 8–15% of the project. At this budget that often pays back in avoided mistakes and a faster finish.", when: (c) => c.own && band("premium")(c) },
];

// ---------- Budget split by room (percent) ----------

const SHARE_EXTRA: Partial<Record<RoomId, number>> = { parents: 12, kids: 12, study: 6, guest: 5 };
export function roomShares(c: Ctx, rooms: RoomId[]): Partial<Record<RoomId, number>> {
  const base: Partial<Record<RoomId, number>> = c.own
    ? { bedroom: 25, kitchen: 40, bathroom: 8, living: 20, balcony: 7 }
    : { bedroom: 30, kitchen: 25, bathroom: 8, living: 25, balcony: 12 }; // the washing machine sits on the balcony
  if (!rooms.includes("living")) base.bedroom! += base.living!; // 1RK: one room
  if (!rooms.includes("balcony")) base.bathroom! += base.balcony!; // the washer moves indoors
  const weights = rooms.map((id) => base[id] ?? SHARE_EXTRA[id] ?? 0);
  const total = weights.reduce((s, w) => s + w, 0);
  // Largest-remainder rounding, so the shares always add up to exactly 100.
  const exact = weights.map((w) => (w * 100) / total);
  const shares = exact.map(Math.floor);
  const order = exact.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]);
  const missing = 100 - shares.reduce((s, x) => s + x, 0);
  for (let k = 0; k < missing; k++) shares[order[k][1]]++;
  return Object.fromEntries(rooms.map((id, i) => [id, shares[i]]));
}

// ---------- The look: what your taste means for each room ----------
// Keyed by the top-scoring style (never named to the user), then by room. Phrased as pieces to look for.

type LookRoom = "bedroom" | "living" | "kitchen" | "bathroom" | "balcony";
export const STYLE_LOOK: Record<StyleId, Record<LookRoom, string>> = {
  "organic-modern": {
    bedroom: "A low upholstered bed in oatmeal fabric, a curved wooden side table and one paper or linen pendant.",
    living: "A deep sofa with rounded arms, a chunky wooden or stone coffee table, and one sculptural vase with dried grass.",
    kitchen: "Open wooden shelves with handmade bowls, and one trailing plant above the counter.",
    bathroom: "A teak or bamboo stool, cotton waffle towels and a stone soap dish.",
    balcony: "Low cane or teak seating, a flat-woven outdoor rug and big terracotta pots of areca palm.",
  },
  japandi: {
    bedroom: "A plain wooden bed with clean lines, linen bedding and a paper lantern — one quiet print, nothing more.",
    living: "A low, slim-armed sofa, a round wooden coffee table and a single branch in a stoneware vase.",
    kitchen: "Closed, handle-less storage and one wooden tray for daily oils and spices — nothing else on the counter.",
    bathroom: "A wooden bath mat, a stoneware tumbler and towels in one muted colour.",
    balcony: "A low bench or floor cushion, bamboo screens and one bonsai or snake plant.",
  },
  scandinavian: {
    bedroom: "A light oak or white bed, a knitted throw and a simple clip-on reading lamp.",
    living: "A light grey or beige sofa on tapered legs, a white or oak coffee table and a soft wool throw.",
    kitchen: "White or pale wood with black or brass handles, and a row of matching glass jars.",
    bathroom: "White towels with one stripe, a wooden towel ladder and a small green plant.",
    balcony: "Foldable white or wooden bistro chairs, string lights and herbs in plain pots.",
  },
  "warm-minimalist": {
    bedroom: "A clean-lined bed with a fabric headboard, matching side tables and one warm lamp each side.",
    living: "A boxy sofa in cream or sand, one large rug and almost no décor — one framed print, one plant.",
    kitchen: "Closed storage, a counter kept to three things and warm under-cabinet lighting.",
    bathroom: "Matching sand-coloured towels, a stone tray for daily things and hidden storage for the rest.",
    balcony: "Two simple chairs, one big plant and nothing else.",
  },
  "moody-contemporary": {
    bedroom: "A dark upholstered bed, deep-coloured bedding and low, warm lamps — no overhead light at night.",
    living: "A charcoal or deep-green sofa, a smoked-glass or black metal table and pools of lamp light instead of ceiling light.",
    kitchen: "Dark containers or lower cabinets, black or brass taps and one warm pendant over the counter.",
    bathroom: "Charcoal towels, a black metal shelf and a bronze or brass mirror frame.",
    balcony: "Dark wicker seating, black planters and warm fairy lights.",
  },
  "modern-classic": {
    bedroom: "A tufted or panelled headboard, crisp white bedding with a piped edge and a pair of matching lamps.",
    living: "A tailored sofa on turned legs, a pair of armchairs facing it and framed art hung in a neat grid.",
    kitchen: "Shaker-style shutters, brass handles and a marble-look backsplash.",
    bathroom: "White towels with a woven border, a framed mirror and brass accessories.",
    balcony: "A pair of wrought-iron chairs, a small round table and clipped plants in matching pots.",
  },
  bohemian: {
    bedroom: "A cane or wooden bed, layered block-print quilts and a macramé or textile hanging.",
    living: "A low sofa piled with mismatched cushions, layered cotton dhurries, cane chairs and plenty of plants.",
    kitchen: "Open shelves of mixed ceramics, a hanging basket for onions and a printed runner.",
    bathroom: "A woven basket for towels, printed towels and a trailing money plant.",
    balcony: "Floor cushions, a hanging chair if the ceiling allows, and plants at every height.",
  },
  "mid-century": {
    bedroom: "A wooden bed on tapered legs, a teak bedside table and a globe or mushroom lamp.",
    living: "A sofa on tapered wooden legs, a teak sideboard and a sunburst mirror or graphic print.",
    kitchen: "Wood-grain shutters, mustard or teal accessories and a retro wall clock.",
    bathroom: "Teal or mustard towels, a round mirror and a teak stool.",
    balcony: "A pair of cane-and-metal chairs and planters on wooden stands.",
  },
  mediterranean: {
    bedroom: "A whitewashed or rattan bed, linen bedding in white and terracotta, and an arched mirror.",
    living: "A linen-slipcovered sofa, a rustic wooden table and terracotta or blue pottery on open shelves.",
    kitchen: "A patterned tile backsplash (tile decals in rentals), terracotta jars and open wooden shelves.",
    bathroom: "Blue-and-white towels, a terracotta pot by the basin and a woven bath mat.",
    balcony: "Blue or terracotta pots, a mosaic side table and bougainvillea if you get sun.",
  },
  eclectic: {
    bedroom: "A bold headboard, bedding in two prints and a wall of art in mixed frames.",
    living: "A colourful sofa, one vintage find, art hung salon-style and one bold rug to tie it together.",
    kitchen: "Mismatched mugs on hooks, colourful canisters and a print leaning on the counter.",
    bathroom: "Patterned towels, a framed print and a bold coloured mat.",
    balcony: "Painted chairs, mismatched planters and string lights.",
  },
};

// Rooms planned for someone else get their own brief instead of your style.
export const EXTRA_LOOK: Partial<Record<RoomId, string>> = {
  parents: "Your palette, simplified: sturdy furniture, bright and warm light, and their photos at eye level.",
  kids: "Neutral big pieces and one thing they choose — bedding, a lamp or a poster — in a colour they love.",
  study: "A matte desk, a lamp that lights the page rather than the screen, and a calm wall behind you for calls.",
  guest: "Your palette's lightest colours, plain bedding and one plant — calm for anyone who stays.",
};

// How you want to feel shapes storage, light and display, not just colour.
export const MOOD_LOOK: Record<MoodId, string> = {
  calm: "Closed storage and clear surfaces — keep any shelf to three objects.",
  cozy: "Layer textiles: a throw on the sofa, a rug underfoot and lamps at 2700K or warmer.",
  luxurious: "Fewer, better pieces: one statement light, silk or velvet cushions and brass details.",
  airy: "Sheer curtains, furniture on raised legs and a large mirror opposite a window.",
  creative: "A leaning picture ledge or pinboard for what you're collecting — easy to change, no drilling.",
  grounded: "Natural textures low down: a cotton dhurrie, wooden stools and plants on the floor.",
  romantic: "Soft curves, dimmable warm light and a fabric headboard or canopy.",
  energised: "Bright daylight, colourful objects on an open shelf and one bold accent piece you see first.",
};

export const boldLook = (boldness: number) =>
  boldness <= 2
    ? "Keep pattern to one cushion or throw per room."
    : boldness === 3
      ? "One patterned piece per room — a rug or curtains — with the rest plain."
      : "Two patterns per room, one large and one small, both in your palette's colours.";
