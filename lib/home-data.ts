// Advice content for the home plan. Every rule is a plain condition on the quiz answers, so it can be reviewed line by line.
// Prices are illustrative Indian market ranges, not live quotes; verify them before launch and purchase.
import type { Answers, Budget, ColourId, ExistingItem, FixtureKey, HelpDuty, HomeSize, HouseholdNeed, Member, MaterialId, MoodId, StyleId, Weights } from "./taste-data.ts";

export interface Ctx extends Answers {
  rent: boolean;
  own: boolean;
  small: boolean; // 1RK or 1BHK
  busy: boolean; // weekdays are work-led; location is not treated as spare time
  hasHelp: boolean;
  has: (m: Member) => boolean;
  loves: (m: MaterialId) => boolean;
  fix: Record<FixtureKey, { id: string; hex: string } | null>; // null = not decided yet
  paint: boolean; // walls can take the palette colour
  people: number; // headcount: as given, or estimated from who lives here
  counted: boolean; // the person gave the number themselves
  allowDrill: boolean;
  allowAdhesive: boolean;
  allowExterior: boolean;
  owns: (item: ExistingItem) => boolean;
  needs: (need: HouseholdNeed) => boolean;
  helpDoes: (duty: HelpDuty) => boolean;
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
const EXTRA_BEDROOMS: Record<HomeSize, number> = { "1rk": 0, "1bhk": 0, "2bhk": 1, "3bhk": 2, "4bhk": 3, "5bhk": 4, "6bhk-plus": 5 };
const bedroomCount = (c: Ctx) => 1 + EXTRA_BEDROOMS[c.home ?? "2bhk"];
export function extraRooms(c: Ctx): RoomId[] {
  const free = EXTRA_BEDROOMS[c.home ?? "2bhk"] - (c.has("flatmates") ? 1 : 0);
  const wanted = [c.has("elders") && "parents", c.has("kids") && "kids", (c.work === "wfh" || c.work === "hybrid") && "study", (c.guests === "sometimes" || c.guests === "often") && "guest"].filter(Boolean) as RoomId[];
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
  balcony: (n, c) => (hot(c) ? `${n[2]} furniture under ${n[1]} shade cloth or chik blinds, with ${n[3]} planters.` : `${n[2]} furniture with ${n[3]} planters.`),
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

const hot = (c: Ctx) => c.climate === "humid" || c.climate === "north" || c.climate === "hot-dry";
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
  { room: "kitchen", name: "BWP plywood carcass", why: "Boiling-water-resistant ply is the safer specification around the sink; verify the board grade and edge sealing in the quote.", when: (c) => c.own && !c.fix.cabinets, up: (c) => c.climate === "humid" },
  { room: "kitchen", name: "Quartz countertop", why: "A low-porosity surface is easier to clean after haldi and oil; check the maker's heat and stain warranty.", when: (c) => c.own && !c.fix.counter && c.budget !== "tight", up: (c) => c.cooking === "daily" },
  { room: "kitchen", name: "Granite countertop", why: "A durable value option; confirm sealing and stain care for the exact slab.", when: (c) => c.own && !c.fix.counter },
  { room: "kitchen", name: "Matte laminate shutters", why: "Wipes clean of tadka splatter and hides fingerprints.", when: (c) => c.own && !c.fix.cabinets, up: (c) => c.cooking === "daily" },
  { room: "kitchen", name: "HDHMR board for dry units", why: "Cheaper than BWP and suitable for dry units when every edge is sealed; keep it away from the sink.", when: (c) => c.own && !c.fix.cabinets && (c.budget === "tight" || c.budget === "mid") },
  { room: "kitchen", name: "Acrylic or PU shutters", why: "High gloss looks sharp but shows every oil mark — best with light cooking.", when: (c) => c.own && !c.fix.cabinets && c.cooking !== "daily" },
  { room: "kitchen", name: "SS 304 sink with drainboard", why: "Takes daily kadhai-scrubbing without rusting.", when: (c) => c.own },
  // Kitchen — rent
  { room: "kitchen", name: "Stainless steel racks and trolleys", why: "They tolerate kitchen moisture and move with you; check the grade and load rating.", when: (c) => c.rent && !c.fix.cabinets },
  { room: "kitchen", name: "Peel-off shelf and platform liners", why: "Protects the landlord's surfaces from oil — easier deposit back.", when: (c) => c.rent },
  { room: "kitchen", name: "Ceramic jars and serveware", why: "Handmade pieces on an open shelf bring your palette into the kitchen.", when: (c) => c.loves("ceramics"), up: () => true },
  { room: "kitchen", name: "Glass or steel storage jars", why: "See what's running low; no plastic smell near the stove.", up: (c) => c.loves("glass") },

  // Bathroom
  { room: "bathroom", name: "Slip-resistant matte floor tiles", why: "A documented wet-area slip rating reduces risk; the floor still needs drainage and regular cleaning.", when: (c) => c.own, up: (c) => c.needs("mobility") || c.needs("wheelchair") },
  { room: "bathroom", name: "PVC, WPC or metal vanity", why: "Choose a wet-area-rated product with sealed joints; MDF and particle board are poor choices where they can stay damp.", when: (c) => c.own },
  { room: "bathroom", name: "Brass-bodied CP fittings", why: "Check the applicable certification, cartridge warranty and service network rather than judging from finish alone.", when: (c) => c.own },
  { room: "bathroom", name: "Epoxy grout", why: "Stays clean and keeps damp out of the joints.", when: (c) => c.own, up: (c) => c.climate === "humid" },
  { room: "bathroom", name: "SS 304 or aluminium racks", why: "Iron rusts and plastic yellows in a wet room.", when: (c) => c.rent },
  { room: "bathroom", name: "Over-door or freestanding storage", why: "Adds storage without tile drilling; use adhesive hooks only where the written permission and product surface limits allow them.", when: (c) => c.rent },
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
  { room: "living", name: "Velvet, in removable cushions only", why: "Gives you the richness without committing to a heat-trapping sofa; skip it if it aggravates allergies.", when: (c) => c.loves("velvet") && !c.needs("respiratory"), up: () => true },

  // Balcony
  { room: "balcony", name: "Powder-coated aluminium or outdoor-rated metal furniture", why: "More corrosion-resistant than untreated steel; inspect chips and the maker's outdoor-use rating." },
  { room: "balcony", name: "Interlocking WPC deck tiles", why: "Click together over existing tiles — no fixing, and they leave with you.", up: (c) => c.rent },
  { room: "balcony", name: "Terracotta planters", why: "They breathe and keep roots cool in the heat.", up: hot },
  { room: "balcony", name: "UV-stabilised fibre planters", why: "Light, won't crack, easy to move.", when: (c) => !c.loves("ceramics") },
  { room: "balcony", name: "Glazed ceramic planters", why: "Glaze stops water seeping through; Khurja or blue pottery adds colour.", when: (c) => c.loves("ceramics"), up: () => true },
  { room: "balcony", name: "Kota stone or terracotta floor tiles", why: "Cool underfoot in summer and they age well outdoors.", when: (c) => c.own && c.loves("stone") },
  { room: "balcony", name: "Bamboo chik blinds", why: "Cheap, traditional and they cut glare.", when: (c) => c.climate === "north" || c.climate === "humid" || c.climate === "mild", up: (c) => c.climate === "north" },
  // Extra rooms
  { room: "parents", name: "Cotton bedding and a quilted mattress protector", why: "Soft, breathable and easy to wash often." },
  { room: "parents", name: "Solid wood or metal furniture with rounded edges", why: "Steady to lean on, with nothing sharp to knock into." },
  { room: "parents", name: "High-contrast, slip-resistant floor treatment", why: "Keep the walking route clear; avoid loose rugs and have any necessary floor covering securely fitted." },
  { room: "kids", name: "Washable matte paint or wipeable removable panels", why: "Crayon and fingerprints come off with a damp cloth without violating the rental agreement.", when: (c) => c.own || c.paint || c.allowAdhesive },
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
  item?: ExistingItem; // suppresses a duplicate purchase when the person is bringing one
  quantity?: number | ((c: Ctx) => number);
}

// Sized appliance and furniture prices are deliberately broad and must be replaced with current written quotes before purchase.
// Room for two more at the table when people often stay over.
const seats = (c: Ctx) => {
  const n = c.people + (c.guests === "often" ? 2 : 0);
  return n <= 4 ? 4 : n <= 6 ? 6 : n <= 8 ? 8 : n <= 10 ? 10 : n <= 12 ? 12 : n;
};
const dishwasherSize = (c: Ctx) => bySize(c, "An 8-place compact model is enough.", "Get 12 place settings for three or four people.", c.people <= 8 ? "Get 14–15 place settings — it'll run once a day." : "A domestic dishwasher may need two cycles; compare two units against a larger commercial machine and available plumbing.");
const sofaAdvice = (c: Ctx) =>
  [
    (c.has("pets") || c.has("kids")) && "Performance fabric with removable covers — it wipes clean.",
    c.has("elders") && "Firm seats at knee height with armrests are easier for your parents to get up from.",
    c.people >= 5
      ? `Plan ${c.people} real seats only after measuring the room and 90 cm walking paths; use a sofa plus movable chairs rather than assuming one L-shape will fit.`
      : !(c.has("pets") || c.has("kids") || c.has("elders")) && "A 3-seater suits most flats; save the L-shape for rooms over 12 ft wide.",
  ]
    .filter(Boolean)
    .join(" ");

export const ESSENTIALS: Essential[] = [
  // Bedroom
  { room: "bedroom", name: "Bed with storage", item: "bed", core: true, cost: "₹18k–45k", verdict: (c) => ["now", [c.rent ? "Pick a knock-down model that dismantles for the next move; measure the lift, room and open-lid clearance before choosing hydraulic storage." : "Measure the room and walking clearance before choosing hydraulic storage; drawers can work better where the lid cannot open.", c.has("partner") && "A queen can suit two adults if it leaves usable circulation."].filter(Boolean).join(" ")] },
  { room: "bedroom", name: "Mattress", item: "mattress", core: true, cost: "₹12k–35k", verdict: (c) => ["now", hot(c) ? "Try the mattress in person and use the maker's exchange period; breathable constructions usually sleep cooler than dense foam." : "Comfort and support are individual — try it in person and use a meaningful exchange period rather than relying on an ‘orthopaedic’ label."] },
  { room: "bedroom", name: "Built-in sliding wardrobe", item: "wardrobe", cost: "₹60k–1.5L", verdict: (c) => (!c.own ? null : tight(c) ? ["later", "At this budget, start with a freestanding wardrobe and build in once the essentials fit."] : ["now", `Get carpentry done before you move in — dust and workers are far easier in an empty flat.${c.has("partner") ? " Allow about 2 ft of hanging width per adult." : ""}`]) },
  { room: "bedroom", name: "Freestanding wardrobe", item: "wardrobe", cost: "₹12k–35k", verdict: (c) => (c.rent ? ["now", ["Use a freestanding model that moves with you.", c.has("partner") && "A 3-door gives you each your own side.", c.has("flatmates") && "Get one with a lock — flatmates come and go."].filter(Boolean).join(" ")] : tight(c) ? ["now", "Covers you until the built-in, then moves to a spare room."] : null) },
  { room: "bedroom", name: "BLDC ceiling fan", item: "fan", core: true, cost: "₹3k–6k each", quantity: (c) => bedroomCount(c) + (c.home === "1rk" ? 0 : 1), verdict: (c) => (c.climate === "hills" ? ["later", "Audit each bedroom and the living room for an existing safe fan point before buying; cool climates may not need every unit."] : ["now", "This allowance covers the bedrooms and living room. Confirm every fan point is safe and empty; subtract working fans you already have before ordering."]) },
  { room: "bedroom", name: "Room AC after a load calculation", item: "ac", cost: "₹30k–65k", verdict: (c) => (c.climate === "hills" ? null : c.rent && (!c.allowDrill || !c.allowExterior) ? ["skip", "A split AC needs wall and exterior work that your current permissions do not fully allow. Revisit this only with written approval and a qualified installer."] : c.climate === "mild" ? ["later", "See how the room performs through a hot week first; size any unit from floor area, ceiling height, sun, insulation and occupancy."] : ["now", `${c.work === "wfh" ? "Efficiency matters because it may run through the workday. " : ""}Do not choose tonnage from the city alone: have the installer calculate the room's cooling load, then confirm the electrical circuit and outdoor-unit location.`]) },
  { room: "bedroom", name: "Oil-filled room heater", item: "heater", cost: "₹7k–14k", verdict: (c) => (c.climate === "hills" ? ["now", "Use a thermostatic, tip-over-protected model on a suitable wall outlet, clear of bedding and children or pets; heating still lowers relative humidity."] : c.climate === "north" ? ["later", "If the room needs one in winter, choose tip-over and overheat protection and keep it clear of fabrics."] : null) },
  { room: "bedroom", name: "Blackout curtains", cost: "₹1.5k–4k per window", verdict: (c) => ["now", c.work === "long" ? "Shift and late workers need real darkness to sleep in the day." : hot(c) ? "Lined curtains block afternoon heat as well as light." : "Privacy from day one — apartment windows often face the next building."] },
  { room: (c) => (hasRoom(c, "study") ? "study" : "bedroom"), name: "Work desk and ergonomic chair", item: "desk", cost: "₹12k–30k", verdict: (c) => (c.work === "wfh" ? ["now", `If you spend full working days here, fit and adjustability matter more than the desk's style.${c.has("partner") ? " If your partner also works from home, verify whether a second workstation is needed." : ""}`] : c.work === "hybrid" ? ["now", "Even two home days a week deserve a supportive chair; a foldable desk clears away on office days."] : ["skip", "The dining table or a counter covers the odd laptop evening."]) },
  { room: "bedroom", name: "Private bed and mattress for live-in help", core: true, cost: "₹10k–20k", verdict: (c) => (c.helpLivesIn ? ["now", "Provide a proper private sleeping arrangement and agree access, hours and a weekly day off before move-in."] : null) },
  { room: "bedroom", name: "Dressing table", cost: "₹8k–20k", verdict: (c) => (c.small ? ["skip", "A mirror on the wardrobe door and one shelf inside does the same job in less space."] : null) },
  { room: "bedroom", name: "Bedside lamps", cost: "₹1.5k–5k", verdict: (c) => ["later", c.has("partner") ? "One on each side, so one of you can read while the other sleeps." : "Warm 2700K light at bed height beats the ceiling tube light at night."] },

  // Parents' room
  { room: "parents", name: "Bed for your parents", core: true, cost: "₹15k–40k", verdict: (c) => (hasRoom(c, "parents") ? ["now", "Have the sleeper test the bed height, edge support and transfer clearance; do not prescribe height from age alone."] : null) },
  { room: "parents", name: "Mattress chosen for the sleeper", core: true, cost: "₹12k–30k", verdict: (c) => (hasRoom(c, "parents") ? ["now", "Have the person try the support and edge stability themselves; ‘orthopaedic’ is a marketing label, not a universal firmness prescription."] : null) },
  { room: "parents", name: "Wardrobe for your parents", cost: "₹12k–35k", verdict: (c) => (hasRoom(c, "parents") ? ["now", "Shelves between knee and shoulder height — no step stool, no bending to the floor."] : null) },
  { room: "parents", name: "Motion-sensor night lights", core: true, cost: "₹500–1.5k", verdict: (c) => (hasRoom(c, "parents") ? ["now", "Bulb or plug-in lights between the bed and the bathroom that switch on by themselves."] : null) },
  { room: "parents", name: "Armchair with armrests", cost: "₹8k–20k", verdict: (c) => (hasRoom(c, "parents") ? ["later", "A firm chair to read or pray in, and to sit on while dressing."] : null) },

  // Kids' room (toys and homework live in the living room when the kids share your room)
  { room: "kids", name: "Age-appropriate bed and mattress", core: true, cost: "₹14k–30k", verdict: (c) => (hasRoom(c, "kids") ? ["now", c.childAges.some((age) => age === "under6" || age === "unknown") ? "Use a low single or trundle bed; do not choose an upper bunk until you have confirmed that every intended sleeper meets the maker's minimum age. Anchor nearby tall furniture." : "A standard single or trundle is easier to inspect and make safe. If considering bunks, verify guardrails, mattress fit, ceiling clearance and the maker's age limit."] : null) },
  { room: "bedroom", name: "Separate sleeping place for children", core: true, cost: "₹8k–30k", verdict: (c) => (c.has("kids") && !hasRoom(c, "kids") ? ["now", c.childAges.some((age) => age === "under6" || age === "unknown") ? "The current room plan has no dedicated kids' room. Measure for a low single or trundle; do not choose an upper bunk until every intended sleeper's age is known and permitted by the maker." : "The current room plan has no dedicated kids' room. Measure for a separate single, trundle or other proper sleeping place before buying more furniture."] : null) },
  { room: "bedroom", name: "Separate sleeping place for older household members", core: true, cost: "₹15k–40k", verdict: (c) => (c.has("elders") && !hasRoom(c, "parents") ? ["now", "The room allocation has no separate parents' room. Confirm a private, accessible sleeping arrangement with clear circulation; do not assume they will share the main bed."] : null) },
  { room: "kids", name: "Kids' wardrobe", cost: "₹12k–35k", verdict: (c) => (hasRoom(c, "kids") ? ["now", c.rent ? "Choose stable, low storage or get written permission for the maker-specified anti-tip fixing; do not improvise the anchor." : "Built in or maker-anchored, with a low rail they can reach now and raise later."] : null) },
  { room: (c) => (hasRoom(c, "kids") ? "kids" : "living"), name: "Low storage with bins", cost: "₹2.5k–6k", verdict: (c) => (c.childAges.includes("under6") || c.childAges.includes("6to12") || c.childAges.includes("unknown") ? ["now", "Use stable, low storage for toys and daily things; anchor anything climbable."] : null) },
  { room: (c) => (hasRoom(c, "kids") ? "kids" : "living"), name: "Age-adjustable study desk and chair", cost: "₹3k–15k", verdict: (c) => (c.childAges.some((age) => age === "6to12" || age === "teen" || age === "unknown") ? ["later", "Fit the desk and chair to the child's current height and screen or homework use; do not buy from age alone."] : null) },

  // Study
  { room: "study", name: "Bookshelf", cost: "₹2.5k–8k", verdict: (c) => (hasRoom(c, "study") ? ["later", "Closed doors below hide cables and files; open shelves above for books."] : null) },
  { room: "study", name: "Daybed for guests", cost: "₹18k–40k", verdict: (c) => (!hasRoom(c, "study") || c.guests === "never" ? null : c.guests === "often" ? ["now", "Family stays often — the study doubles as their room."] : ["later", "Turns the study into a guest room when family visits."]) },

  // Guest room
  { room: "guest", name: "Folding bed with mattress", cost: "₹5k–10k", verdict: (c) => (hasRoom(c, "guest") && c.guests !== "often" ? ["later", "Guests come a few times a year; it folds away the rest of the time."] : null) },
  { room: "guest", name: "Guest bed and mattress", cost: "₹14k–30k", verdict: (c) => (hasRoom(c, "guest") && c.guests === "often" ? ["now", "People stay often, so a proper single or double bed earns its place over a folding one."] : null) },
  { room: "guest", name: "Hooks and a luggage stand", cost: "₹1k–3k", verdict: (c) => (hasRoom(c, "guest") ? ["later", "Somewhere for bags and towels, so guests don't live out of a suitcase on the floor."] : null) },

  // Kitchen
  { room: "kitchen", name: "Modular kitchen (BWP ply)", cost: "₹1.5L–4L", verdict: (c) => (!c.own || c.fix.cabinets ? null : tight(c) ? ["later", "A full modular kitchen will not fit this ceiling alongside the core appliances. Use temporary storage and price it as a separate project."] : ["now", c.cooking === "rarely" ? "Keep it to a simple straight run with fewer drawers, and compare its quote with your total ceiling before ordering." : "Book it only after a measured layout and written BOQ; design, making and fitting commonly take several weeks."]) },
  { room: "kitchen", name: "Steel racks and a kitchen trolley", cost: "₹3k–10k", verdict: (c) => (c.rent && !c.fix.cabinets ? ["now", "The flat has no cabinets, so freestanding racks add storage without drilling."] : c.own && !c.fix.cabinets && tight(c) ? ["now", "Storage for now; they can move to a utility area if a fitted kitchen is added later."] : null) },
  { room: "kitchen", name: "Kitchen ventilation", cost: "₹2k–20k", verdict: (c) => (c.cooking === "daily" ? c.rent && (!c.allowDrill || !c.allowExterior) ? ["now", "Your rental permissions do not cover all wall and exterior work a new duct may require. Use an existing safe exhaust provision, or get written approval before choosing any wall-mounted or ducted unit."] : ["now", "Choose an exhaust fan or chimney only after checking the existing opening, duct route, make-up air and mounting permission."] : c.cooking === "light" ? ["later", "Use an existing safe exhaust provision first; add more ventilation only if steam and oil are not clearing."] : ["skip", "Occasional reheating does not justify permanent ventilation work unless the room already has a poor-air problem."]) },
  { room: "kitchen", name: "Kitchen exhaust fan", cost: "₹1.5k–3k", verdict: (c) => (c.cooking === "daily" ? null : c.rent && (!c.allowDrill || !c.allowExterior) ? ["skip", "A new exterior-discharge fan is outside the current wall or exterior permissions. Use an existing safe provision or obtain written approval."] : ["now", "Choose one only after confirming a safe exterior discharge route, opening size, make-up air and electrical point."]) },
  { room: "kitchen", name: "Gas stove (3-burner)", item: "stove", core: true, cost: "₹4k–9k", verdict: (c) => (c.cooking === "rarely" ? ["skip", "An induction cooktop covers the odd meal — no cylinder to arrange."] : ["now", "Apply to transfer your gas connection before moving and confirm the supplier's current lead time and installation requirements."]) },
  { room: "kitchen", name: "Second gas cylinder (DBC)", cost: "₹1.5k–2.5k deposit", verdict: (c) => (c.cooking === "daily" ? ["now", "Daily cooking can make refill timing disruptive; compare an authorised second-cylinder connection with your actual consumption and the supplier's current rules."] : c.cooking === "light" ? ["later", "Worth considering only if your real refill pattern makes it useful and the supplier permits it."] : null) },
  { room: "kitchen", name: "Induction cooktop", item: "induction", core: true, cost: "₹2.5k–5k", verdict: (c) => ["now", c.cooking === "rarely" ? "Your main cooktop — plug in and go." : "Backup for the days before the gas connection arrives, and when the cylinder runs out."] },
  { room: "kitchen", name: "Refrigerator", item: "fridge", core: true, cost: (c) => bySize(c, "₹14k–30k", "₹25k–45k", c.people <= 8 ? "₹45k–90k" : "₹70k–1.5L"), verdict: (c) => ["now", `${bySize(c, "190–250 L is usually enough for one or two; check the current star label.", "250–350 L usually suits three or four; check the current star label.", c.people <= 8 ? "Compare 400–600 L models against your actual weekly food storage." : "For nine or more people, measure the kitchen and compare one very large unit with two smaller units; a generic family-size fridge is not enough.")}${c.cooking === "daily" ? " Daily cooking may justify more freezer space." : ""}`] },
  { room: "kitchen", name: "Water test and matched treatment", item: "purifier", core: true, cost: "₹500–20k", verdict: () => ["now", "Get the supplier or an accredited lab report for microbial and chemical contaminants, and test hardness separately. Choose a certified treatment system for those results; TDS alone cannot decide RO versus UV or prove that water is safe."] },
  { room: "kitchen", name: "Mixer grinder (750 W)", item: "mixer", cost: "₹3k–7k", verdict: (c) => (c.cooking === "daily" ? ["now", "Chutneys, masalas, batter — an Indian kitchen staple."] : c.cooking === "light" ? ["later", "Buy it when you catch yourself wanting chutney."] : ["skip", "Rarely-used appliances eat counter space."]) },
  { room: "kitchen", name: "Microwave or OTG", item: "microwave", cost: "₹6k–15k", verdict: (c) => (c.cooking === "rarely" || c.busy ? ["now", "Reheating leftovers and tiffin is part of your routine."] : ["later", "Useful, not urgent — the stove does most of it."]) },
  { room: "kitchen", name: "Dishwasher (with kadhai cycle)", item: "dishwasher", cost: (c) => bySize(c, "₹20k–25k", "₹30k–40k", "₹40k–53k"), verdict: (c) => (c.cooking === "rarely" ? ["skip", "Not enough dishes to fill it."] : c.helpDoes("dishes") ? ["skip", "Dishes are already in the duties you selected, so compare the machine with the existing arrangement before buying."] : tight(c) ? ["later", "At this ceiling, compare the machine's purchase, plumbing and running cost with local dishwashing help before committing."] : c.busy || c.has("kids") ? ["now", `It can cut hands-on washing, though loading, unloading and unsuitable cookware remain. ${dishwasherSize(c)}`] : ["later", `Try a month of doing dishes yourself; if the load is material, compare this with paid help. ${dishwasherSize(c)}`]) },
  { room: "kitchen", name: "Air fryer", cost: "₹4k–9k", verdict: (c) => (c.cooking === "rarely" ? ["later", "Quick snacks without much oil when you mostly order in."] : c.cooking === "light" ? ["skip", "Nice to have, not a necessity — an OTG covers most of it."] : null) },
  { room: "kitchen", name: "Modular add-ons (magic corner, tall unit)", cost: "₹15k–60k", verdict: (c) => (!c.own ? null : c.budget === "high" || c.budget === "premium" ? ["later", "Add them once you know how you actually use the kitchen."] : c.cooking === "daily" && !tight(c) ? ["later", "A tall pantry unit earns its place in a daily kitchen; skip the magic corner."] : ["skip", "Add-ons inflate modular quotes fast; plain shelves and baskets do most of the work."]) },

  // Bathroom
  { room: "bathroom", name: "Geyser after a demand and circuit check", item: "geyser", core: true, cost: (c) => bySize(c, "₹6k–10k", "₹8k–13k", "₹10k–20k"), quantity: (c) => Math.max(1, c.bathrooms ?? 1), verdict: (c) => (c.climate === "humid" ? ["later", "Confirm whether hot water is needed, then size storage from simultaneous demand and the available electrical circuit rather than assuming a 3 L unit."] : ["now", `There ${c.bathrooms === 1 ? "is one bathroom" : `are ${c.bathrooms ?? "multiple"} bathrooms`}; confirm which need hot water, simultaneous use, mounting position, earthing and RCD/RCCB protection before choosing capacity.`]) },
  { room: "bathroom", name: "Bathroom exhaust fan", cost: "₹1.5k–3k", verdict: (c) => (c.rent && (!c.allowDrill || !c.allowExterior) ? ["later", "Use an existing safe exhaust opening; new wall or exterior work needs written permission."] : ["now", c.climate === "humid" ? "Confirm a safe exterior discharge route so monsoon moisture does not settle on grout." : "Confirm a safe exterior discharge route so damp and smells do not recirculate."]) },
  { room: "bathroom", name: "Wet-area slip and support assessment", core: true, cost: "₹1k–8k", verdict: (c) => (c.needs("mobility") || c.needs("wheelchair") ? ["now", c.rent && !c.allowDrill ? "Do not use a suction rail for body-weight support. Ask an occupational therapist or accessibility professional about a properly fitted toilet frame or a structurally fixed bar with written permission." : "Have the user's transfer and reach assessed, then fix a rated grab bar into suitable structure; suction rails are not body-weight support."] : ["later", "Check wet-area slip resistance and drainage; avoid loose mats in circulation and add support equipment only for an identified balance or transfer need."]) },
  { room: "bathroom", name: "Raised toilet seat", cost: "₹1.5k–3k", verdict: (c) => (c.needs("mobility") ? ["later", "Only buy after checking the user's height, toilet dimensions, stability and transfer technique; a fitted toilet frame may be safer."] : null) },
  { room: "bathroom", name: "Shower curtain and tension rod", cost: "₹800–2k", verdict: (c) => (c.rent ? ["now", "Keeps the wet area separate without a single hole."] : null) },
  { room: "bathroom", name: "Glass shower partition", cost: "₹15k–35k", verdict: (c) => (c.rent ? ["skip", "A curtain does the same job and leaves with you."] : ["later", "Check water hardness first — hard water leaves white scale on glass every week."]) },
  { room: "bathroom", name: "Mirror cabinet or rack", cost: "₹2k–8k", verdict: (c) => ["now", c.rent ? "Over-the-door or freestanding — no drilling into tiles." : "PVC or aluminium, never MDF — it swells within a monsoon."] },
  { room: "bathroom", name: "Generic shower filter", cost: "₹1.5k–3k", verdict: () => ["skip", "Do not buy from a TDS reading alone. Test hardness and the specific contaminant first; many shower filters do not soften water or solve scale."] },
  { room: "bathroom", name: "Bathtub", cost: "₹25k+", verdict: (c) => (c.own && (c.budget === "high" || c.budget === "premium") ? ["skip", "Rarely used in Indian homes, and it eats space and water."] : null) },

  // Living room
  { room: "living", name: "Sofa", item: "sofa", cost: "₹20k–60k", verdict: (c) => (c.home === "1bhk" && c.guests === "often" ? ["skip", "Choose the sofa-bed below instead of paying for two competing sofas."] : c.home !== "1rk" ? ["now", sofaAdvice(c)] : ["later", "Measure the single room after the bed is placed; add compact seating only if a 90 cm route remains clear."]) },
  { room: "living", name: "Sofa-cum-bed", item: "sofa", cost: "₹18k–40k", verdict: (c) =>
      c.guests === "never"
        ? c.small
          ? ["skip", "Nobody stays over, so the fold-out bed would go unused — a regular sofa sits better and costs less."]
          : null
        : c.home === "1rk"
          ? ["later", "Do not buy this alongside the main bed by default. Add it only after measuring the room and confirming that occasional guests justify the lost floor space."]
          : c.home === "1bhk"
            ? c.guests === "often"
              ? ["now", "Family stays often — a sofa-cum-bed beats a mattress on the floor."]
              : ["later", "Handy when parents or friends stay over."]
            : c.guests === "often" && !hasRoom(c, "guest") && !hasRoom(c, "study")
              ? ["now", "Family stays often and there's no spare room for them — this is your guest bed."]
              : null },
  { room: "living", name: "Age-appropriate childproofing", core: true, cost: "₹250–3k", verdict: (c) => (c.childAges.includes("under6") ? ["now", "Cover reachable unused sockets, secure blind cords, gate dangerous edges and anchor climbable furniture before moving in."] : null) },
  { room: "living", name: "Closed shoe rack", cost: "₹2k–6k", verdict: (c) => ["now", `${c.vastu ? "Shoes come off at the door. Vastu: keep it to the south or west of the entrance, not the north-east." : "Shoes come off at the door — a closed rack keeps dust and smell in."}${c.people >= 3 ? " Pick 4+ shelves; shoes multiply fast with more people." : ""}`] },
  { room: "living", name: "Curtains (sheer + lined)", cost: "₹2k–6k per window", verdict: () => ["now", "Privacy and heat control from day one."] },
  { room: "living", name: "Inverter and battery", item: "inverter", cost: "₹15k–22k", verdict: (c) => (c.work === "wfh" || c.work === "hybrid" ? ["now", "Size it from the essential load and real outage duration; use a qualified installer and the maker's ventilation and battery-location requirements."] : ["later", "Check the building's actual outage pattern, then size backup only for the loads that must stay on."]) },
  { room: "living", name: "Dining table", item: "dining", cost: (c) => (seats(c) === 4 ? "₹12k–45k" : seats(c) === 6 ? "₹20k–75k" : seats(c) === 8 ? "₹40k–1L" : seats(c) <= 12 ? "₹60k–1.5L" : "₹1L–3L"), verdict: (c) => (c.small ? ["skip", c.rent && !c.allowDrill ? "Use a freestanding drop-leaf table or the kitchen counter; a wall-mounted table conflicts with your no-drill restriction." : "A measured drop-leaf table or the kitchen counter frees the floor."] : c.has("kids") || c.has("elders") ? ["now", `You need ${c.people} everyday places; plan up to ${seats(c)} seats across one or more measured tables while preserving circulation${c.childAges.includes("under6") ? " and avoiding sharp corners" : ""}.`] : ["later", `Live in the space a month, measure it, then plan up to ${seats(c)} seats across one or more tables without blocking circulation.`]) },
  { room: "living", name: "Pooja unit", cost: "₹3k–15k", verdict: (c) => (c.vastu ? ["now", "Place it in the north-east corner."] : null) },
  { room: "living", name: "TV and stand", item: "tv", cost: "₹25k–60k", verdict: (c) => ["later", c.rent && !c.allowDrill ? "Use a stable floor stand and anti-tip restraint that does not violate the lease." : "Plan the viewing distance, safe anchoring and plug points before buying."] },
  { room: "living", name: "Rug", cost: "₹3k–12k", verdict: (c) => ["later", c.climate === "humid" ? "Cotton dhurrie, not jute — jute holds damp in the monsoon." : "Buy after the sofa so the size is right."] },
  { room: "living", name: "Centre table", cost: "₹5k–15k", verdict: (c) => (c.small ? ["skip", "Two nesting side tables do the job and tuck away."] : ["later", "Buy after the sofa so the proportions work."]) },

  // Balcony
  { room: (c) => (c.balcony ? "balcony" : "bathroom"), name: "Washing machine after an installation check", item: "washer", core: true, cost: (c) => bySize(c, "₹12k–30k", "₹16k–35k", c.people <= 8 ? "₹22k–55k" : "₹35k–80k"), verdict: (c) => ["now", `${bySize(c, "6–7 kg", "7–8 kg", c.people <= 8 ? "9–12 kg" : "A 10–12 kg machine may still need multiple cycles")} is a starting point. Place it only where the manufacturer permits and where a plumber/electrician confirms water, drainage, ventilation, weather protection and a protected socket; no balcony does not automatically make the bathroom safe.`] },
  { room: (c) => (c.balcony ? "balcony" : "bathroom"), name: "Dryer", item: "dryer", cost: "₹30k–55k", verdict: (c) => (!c.balcony ? ["later", "First verify a ventilated, manufacturer-approved installation point and whether indoor drying is actually a problem."] : c.climate === "humid" && c.busy ? ["later", "Consider it after one monsoon, once you know drying time and have a safe power and ventilation plan."] : ["skip", "A drying stand may cover the need without another appliance."]) },
  { room: (c) => (c.balcony ? "balcony" : "bathroom"), name: "Clothes drying stand", cost: "₹1.5k–4k", verdict: (c) => ["now", !c.balcony ? "Use a freestanding rack in a ventilated dry area; do not assume a wet bathroom is suitable for laundry appliances or permanent ceiling hardware." : c.rent && !c.allowDrill ? "Use a foldable floor stand; permanent pulley hangers are outside your permissions." : "Choose a floor stand first; add a rated pulley only after checking the fixing point."] },
  { room: "balcony", name: "Bird deterrence", cost: "₹1.5k–5k", verdict: (c) => (c.rent && !c.allowExterior ? ["later", "Exterior netting is outside the permissions you selected. Ask the landlord and society, and preserve fire and rescue access before installing anything."] : ["later", "Install only if pigeons are a real problem, with society approval, a suitable fire-rated system and emergency access preserved."]) },
  { room: "balcony", name: "Balcony safety barrier assessment", core: true, cost: "₹2k–25k", verdict: (c) => (c.childAges.some((age) => age === "under6" || age === "6to12" || age === "unknown") || c.petTypes.some((pet) => pet === "cat" || pet === "dog" || pet === "other") ? ["now", c.rent && !c.allowExterior ? "The current permissions do not allow exterior work. Keep climbable furniture away from the edge and obtain landlord/society approval for a professionally assessed barrier." : "Have the railing gaps, climbability, fixings, fire egress and society rules assessed before choosing a barrier; ‘invisible’ wire is not automatically suitable."] : null) },
  { room: "balcony", name: "Outdoor shade", cost: "₹2k–6k", verdict: (c) => (hot(c) ? c.rent && !c.allowExterior ? ["later", "Exterior blinds are outside the current permissions; use movable indoor shading until written approval exists."] : ["now", "Choose outdoor-rated shade only after checking wind load, drainage, fixing points and society rules."] : ["later", "Add only after observing harsh afternoon sun and checking the fixing rules."]) },
  { room: "balcony", name: "Plants and planters", cost: "₹1k–5k", verdict: (c) => ["later", c.has("pets") ? "Choose from a species-specific veterinary poison-control source and verify the botanical name; a plant safe for a dog or cat may not be safe for a bird or small pet." : c.childAges.includes("under6") ? "Use non-toxic plants in stable, inaccessible pots; avoid relying on ambiguous common names." : "Choose plants for the actual light and watering routine; keep saucers drained."] },
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
  { room: "kitchen", kind: "do", text: "Fit alarms in suitable locations under the maker's guidance—often a smoke alarm in adjoining circulation and, where appropriate, a heat alarm for the kitchen. Know the LPG/electric shut-off, keep exits clear, and place a correctly rated serviced extinguisher near the exit—never behind the stove. Never use water on burning oil." },
  { room: "kitchen", kind: "do", text: "Agree a weekly menu and keep a shopping list on the fridge — it saves daily calls with your cook.", when: (c) => c.helpDoes("cooking") },
  { room: "kitchen", kind: "do", text: "Give each flatmate a fridge shelf and a labelled bin — it heads off most kitchen arguments.", when: (c) => c.has("flatmates") },
  { room: "kitchen", kind: "do", text: "Vastu: cook facing east, with the stove in the south-east.", when: (c) => c.vastu },
  { room: "kitchen", kind: "dont", text: "Don't use MDF or particle board anywhere near the sink.", when: (c) => c.own },
  { room: "kitchen", kind: "dont", text: "Don't choose high-gloss shutters — every oil mark shows.", when: (c) => c.own && c.cooking === "daily" },
  { room: "kitchen", kind: "dont", text: "Don't pay for every accessory in the modular catalogue; most go unused.", when: (c) => c.own },
  { room: "kitchen", kind: "dont", text: "Don't put the fridge right next to the stove — the heat makes it work harder." },
  { room: "kitchen", kind: "dont", text: "Vastu: don't put the sink and stove side by side.", when: (c) => c.vastu },

  { room: "bathroom", kind: "do", text: "Check the floor slopes to the drain before you move in — standing water starts most leaks." },
  { room: "bathroom", kind: "do", text: "Keep the exhaust on for 15 minutes after a shower.", when: (c) => c.climate === "humid" },
  { room: "bathroom", kind: "do", text: "Add a plug-in night light on the way from bedroom to bathroom.", when: (c) => c.childAges.some((age) => age === "under6" || age === "6to12" || age === "unknown") || c.needs("low-vision") || (c.has("elders") && !hasRoom(c, "parents")) },
  { room: "bathroom", kind: "do", text: "Use over-the-door or freestanding storage instead of drilling tiles; use adhesive hooks only if that exact work is permitted and the surface is suitable.", when: (c) => c.rent },
  { room: "bathroom", kind: "do", text: "Keep a dry zone for towels and clothes, away from the shower." },
  { room: "bathroom", kind: "dont", text: "Don't use wooden or MDF cabinets — they swell within a monsoon." },
  { room: "bathroom", kind: "dont", text: "Don't choose glossy floor tiles; they're slippery when wet.", when: (c) => c.own },
  { room: "bathroom", kind: "dont", text: "Vastu: keep the bathroom door closed and the WC lid down.", when: (c) => c.vastu },

  { room: "living", kind: "do", text: "Measure the lift and stairwell before buying the sofa." },
  { room: "living", kind: "do", text: "Leave about 90 cm walking paths around furniture." },
  { room: "living", kind: "do", text: "Use three light sources — ceiling, a floor lamp and a table lamp." },
  { room: "living", kind: "do", text: "Anchor tall shelves and the TV with a rated anti-tip system; renters need the landlord's written approval or a professionally assessed non-permanent alternative.", when: (c) => c.has("kids") || c.has("pets") },
  { room: "living", kind: "do", text: "Put a do-not-disturb note on the door and send deliveries to the security desk during your sleep hours.", when: (c) => c.work === "long" },
  { room: "living", kind: "do", text: "Use even, glare-controlled lighting and clear contrast at switches, handles and level changes; test it with the person who will use the space.", when: (c) => c.needs("low-vision") },
  { room: "living", kind: "do", text: "Agree how the electricity bill splits before anyone buys an AC — cooling can materially change the bill.", when: (c) => c.has("flatmates") },
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
  { room: "kids", kind: "do", text: "Anchor wardrobes and bookshelves with a rated system; in a rental, get written drilling approval or replace the piece with stable low storage.", when: (c) => c.own || c.allowDrill },
  { room: "kids", kind: "dont", text: "Don't put the bed under a window or beside a shelf they can climb." },
  { room: "study", kind: "do", text: "Keep a plain wall or shelf behind you for calls, and the router within reach." },
  { room: "study", kind: "dont", text: "Don't sit with your back to the door — it's distracting and looks odd on calls." },
  { room: "guest", kind: "do", text: "Keep half the wardrobe empty and a spare set of towels and bedding ready." },
  { room: "guest", kind: "dont", text: "Don't let it become a junk room — give storage a home in the loft or under the bed." },
  { room: "balcony", kind: "do", text: "If pigeons are a real problem, agree any net with the society and preserve fire and rescue access; use a suitable outdoor-rated system.", when: (c) => c.own || c.allowExterior },
  { room: "balcony", kind: "do", text: "Put pots on stands so water drains instead of staining the floor." },
  { room: "balcony", kind: "do", text: "Keep mops, buckets, brooms and cleaners in one utility cupboard, so your help's time goes on cleaning, not hunting.", when: (c) => c.hasHelp },
  { room: "balcony", kind: "do", text: "If you use self-watering pots, choose sealed reservoirs and check them before travel; no system guarantees two unattended weeks for every plant.", when: (c) => c.busy },
  { room: "balcony", kind: "do", text: "Vastu: tall plants to the south-west, tulsi to the north or east.", when: (c) => c.vastu },
  { room: "balcony", kind: "dont", text: "Don't leave water standing in saucers — it breeds dengue mosquitoes.", when: (c) => c.climate !== "hills" },
  { room: "balcony", kind: "dont", text: "Don't keep stools or stackable furniture near the railing — children can climb them.", when: (c) => c.childAges.some((age) => age === "under6" || age === "6to12" || age === "unknown") },
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
  savedFraction: Partial<Record<Hand, number>>;
}

// Dishes, laundry and cooking grow with the household; the base figures are for three or four people.
const scale = (c: Ctx, hours: number) => Math.round(hours * (c.people === 1 ? 0.6 : Math.min(3, 0.6 + c.people * 0.2)) * 2) / 2;

export const CHORES: Chore[] = [
  {
    task: "Sweeping and mopping",
    hours: () => 5,
    help: "₹1.5k–3.5k a month",
    machine: { name: "Robot vacuum-mop", cost: "₹15k–35k" },
    pick: (c) => (c.helpDoes("cleaning") ? ["help", "Already covered — agree what ‘cleaning’ includes and how often deep cleaning happens."] : (c.busy || c.has("pets")) && tight(c) ? ["help", "Compare a part-time cleaner with a robot's purchase and maintenance cost."] : c.busy || c.has("pets") ? ["machine", c.has("pets") ? "Runs frequently for pet hair and dust, but edges and deep cleaning still need a person." : "Handles routine floor dust; you still do edges and periodic deep cleaning."] : ["you", "Keep it yourself if the routine is manageable; add help only when the time cost is real."]),
    savedFraction: { help: 1, machine: 0.65 },
  },
  {
    task: "Dishes",
    hours: (c) => scale(c, c.cooking === "daily" ? 6 : c.cooking === "light" ? 3 : 1),
    help: "₹1.5k–3k a month",
    machine: { name: "Dishwasher with kadhai cycle", cost: "₹20k–53k" },
    pick: (c) => (c.cooking === "rarely" ? ["you", "A few plates — not worth outsourcing."] : c.helpDoes("dishes") ? ["help", "Dishes are already in the agreed duties."] : c.busy && !tight(c) ? ["machine", "A dishwasher cuts hands-on washing, but loading, unloading and unsuitable cookware remain."] : ["help", "Usually the first recurring job worth pricing locally."]),
    savedFraction: { help: 1, machine: 0.75 },
  },
  {
    task: "Laundry",
    hours: (c) => scale(c, 3),
    help: "Not usually a maid's job",
    machine: { name: "Fully automatic washer", cost: "₹12k–50k" },
    pick: (c) => (c.helpDoes("laundry") ? ["help", "Laundry is already in the agreed duties."] : ["machine", c.climate === "humid" && c.busy ? "The washer handles the cycle; drying and folding still need a plan in the monsoon." : "The washer handles the cycle; loading, drying and folding remain."]),
    savedFraction: { help: 0.9, machine: 0.55 },
  },
  {
    task: "Ironing",
    hours: () => 2,
    help: "Local istriwala, ₹10–20 a piece",
    pick: (c) => (c.helpDoes("ironing") ? ["help", "Ironing is already in the agreed duties."] : c.busy || c.work === "hybrid" || c.work === "wfh" ? ["local", "Price the neighbourhood istriwala against your weekly volume."] : ["you", "Keep it yourself if the weekly volume is small."]),
    savedFraction: { help: 1, local: 0.9 },
  },
  {
    task: "Cooking",
    hours: (c) => scale(c, c.cooking === "daily" ? 10 : c.cooking === "light" ? 4 : 1),
    help: "Cook, ₹4k–9k a month for two meals",
    machine: { name: "Electric pressure cooker", cost: "₹5k–10k" },
    pick: (c) => (c.helpDoes("cooking") ? ["help", "Cooking is already in the agreed duties."] : c.cooking === "daily" && c.busy ? ["help", "If the budget supports it, price a cook against the time daily meals consume."] : ["machine", "An electric pressure cooker makes some staples hands-off; it does not replace all cooking."]),
    savedFraction: { help: 1, machine: 0.25 },
  },
  {
    task: "Bathroom cleaning",
    hours: () => 1.5,
    help: "Usually part of the maid's weekly work",
    pick: (c) => (c.helpDoes("cleaning") ? ["help", "Agree the frequency and products explicitly."] : ["you", "Use a long-handled brush and ventilate; add paid cleaning if the physical load is unsuitable."]),
    savedFraction: { help: 1 },
  },
];

// ---------- Before you move in (India home checks) ----------

export const CHECKS: { text: string; when?: (c: Ctx) => boolean }[] = [
  { text: "Photograph every wall, tile and fitting with timestamps — it's your deposit evidence.", when: (c) => c.rent },
  { text: "Do not drill, repaint, use permanent adhesive or alter the exterior unless that exact work is approved in writing by the landlord and, where relevant, the society.", when: (c) => c.rent },
  { text: "Book the modular kitchen and wardrobes about six weeks ahead — finish carpentry before you move in.", when: (c) => c.own },
  { text: "Deep-clean before furniture arrives. Use pest treatment only for evidence of infestation, with a licensed operator who accounts for children, pets, pregnancy, respiratory conditions, ventilation and re-entry time." },
  { text: "Get the building or water supplier's current laboratory report, or test for the actual microbial and chemical risks plus hardness. TDS alone cannot choose a safe treatment system." },
  { text: "Have a qualified electrician check earthing, the distribution board, correctly rated circuits and RCD/RCCB protection — especially for the geyser, AC, washer and every wet-area installation." },
  { text: "Fit mosquito mesh on the windows; in rentals use a removable system compatible with the permissions and frame.", when: (c) => c.climate !== "hills" },
  { text: "Check walls for damp patches and leaks before you sign — the monsoon only makes them worse.", when: (c) => c.climate === "humid" },
  { text: "Check that windows seal properly — drafts cost more in heating than any curtain can fix.", when: (c) => c.climate === "hills" },
  { text: "Ask the neighbours how long power cuts last.", when: (c) => c.work !== "wfh" && c.work !== "hybrid" },
  { text: "Book broadband before moving — you'll need it on day one.", when: (c) => c.work === "wfh" || c.work === "hybrid" },
  { text: "Apply to transfer your gas connection before moving and confirm the supplier's current lead time.", when: (c) => c.cooking !== "rarely" },
  { text: "For a bird household, keep cages away from cooking fumes and aerosols, never run a ceiling fan while the bird is loose, secure windows and verify cookware and household products with an avian veterinarian.", when: (c) => c.petTypes.includes("bird") },
  { text: "Fix a griha pravesh date and do the puja before the furniture moves in.", when: (c) => c.vastu },
  { text: "Follow the current local verification and employment requirements for household help, and handle identity documents securely.", when: (c) => c.hasHelp },
  { text: "Decide where live-in help will sleep and bathe before you sign, and agree privacy, hours and a weekly day off.", when: (c) => c.helpLivesIn === true },
  { text: "Check the lift works, or that your parents' room is on the entry floor — stairs decide how comfortably they can stay.", when: (c) => c.has("elders") },
  { text: "Agree in writing who owns the shared fridge, washer and purifier, and how they're split when someone moves out.", when: (c) => c.has("flatmates") },
];

// ---------- Where to spend and where to save, by budget band ----------
// Strategy only: item-level advice already lives in ESSENTIALS and MATERIAL_TIPS, so nothing here repeats it.

const band = (...bands: Budget[]) => (c: Ctx) => bands.includes(c.budget ?? "mid");

export const BUDGET_TIPS: { kind: "spend" | "save"; text: string; when: (c: Ctx) => boolean }[] = [
  { kind: "save", text: "Buy the fridge, washer and AC in a festive sale (Diwali, Republic Day), but check the price a month earlier — the headline 'up to 75% off' covers only a few models.", when: band("tight", "mid", "high") },
  { kind: "save", text: "Buy appliances new and furniture second-hand: appliances need a warranty, but a solid wood bed or table rarely fails. Check used wood for termite dust and sofas for bed bugs.", when: band("tight") },
  { kind: "save", text: "If you might move within a year, compare the full rental contract cost with used furniture and resale value before renting a sofa or bed; do not rent a mattress.", when: (c) => c.rent && band("tight")(c) },
  { kind: "spend", text: "Prioritise the mattress or seating you use daily, after subtracting everything you already own; use modular or flat-pack storage where durability is less critical.", when: band("mid") },
  { kind: "save", text: "Keep about 10% aside for what nobody budgets for: extension boards, curtain rods, hooks, bulbs and a basic toolkit.", when: () => true },
  { kind: "spend", text: "Get three quotes for carpentry and ask each for the board brand, thickness and hardware make in writing — that's where quotes quietly differ.", when: (c) => c.own && !tight(c) },
  { kind: "save", text: "Ask for a written BOQ (bill of quantities), a small contract-defined deposit and milestone payments tied to inspected work.", when: (c) => c.own && !tight(c) },
  { kind: "spend", text: "Prioritise a safe layered-lighting and switch plan before painting; decorative fittings come after the electrical layout and load checks.", when: (c) => c.own && band("high", "premium")(c) },
  { kind: "spend", text: "In a rental, put the money into what moves with you — sofa, mattress, rugs, lamps and art — not into the landlord's walls.", when: (c) => c.rent && band("high", "premium")(c) },
  { kind: "spend", text: "Spend on what you touch every day — soft-close hinges, solid-brass handles, good upholstery — rather than showpieces.", when: (c) => c.own && band("premium")(c) },
  { kind: "spend", text: "If you hire a designer, compare scope, fee basis, procurement commissions, drawings, site visits and liability in writing; a high budget does not make the service automatically worthwhile.", when: (c) => c.own && band("premium")(c) },
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
    balcony: "Low cane or teak seating, a flat-woven outdoor rug and large plants chosen for the actual light and household.",
  },
  japandi: {
    bedroom: "A plain wooden bed with clean lines, linen bedding and a paper lantern — one quiet print, nothing more.",
    living: "A low, slim-armed sofa, a round wooden coffee table and a single branch in a stoneware vase.",
    kitchen: "Closed, handle-less storage and one wooden tray for daily oils and spices — nothing else on the counter.",
    bathroom: "A wooden bath mat, a stoneware tumbler and towels in one muted colour.",
    balcony: "A simple bench with a supportive seat, bamboo-toned screens where permitted and one pet-safe plant chosen for the actual light.",
  },
  scandinavian: {
    bedroom: "A light oak or white bed, a knitted throw and a simple clip-on reading lamp.",
    living: "A light grey or beige sofa on tapered legs, a white or oak coffee table and a soft wool throw.",
    kitchen: "White or pale wood with black or brass handles, and a row of matching glass jars.",
    bathroom: "White towels with one stripe, a wooden towel ladder and a small green plant.",
    balcony: "Foldable light-toned or wooden bistro chairs, outdoor-rated lights only where a protected socket exists, and herbs in plain pots.",
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
    balcony: "Deep-toned wicker seating, matching planters and outdoor-rated warm lights only where a protected socket exists.",
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
    bathroom: "A woven basket for towels, printed towels and a pet-safe plant only if daylight and ventilation suit it.",
    balcony: "Layered cushions on supportive seating, a freestanding swing only if the floor area and load rating allow it, and pet-safe plants at varied heights.",
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
    balcony: "Painted chairs, mismatched planters and outdoor-rated lights only where a protected socket exists.",
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
  romantic: "Soft curves, dimmable warm light and one tactile focal piece in the room.",
  energised: "Bright daylight, colourful objects on an open shelf and one bold accent piece you see first.",
};

export const boldLook = (boldness: number) =>
  boldness <= 2
    ? "Keep pattern to one cushion or throw per room."
    : boldness === 3
      ? "One patterned piece per room — a rug or curtains — with the rest plain."
      : "Two patterns per room, one large and one small, both in your palette's colours.";
