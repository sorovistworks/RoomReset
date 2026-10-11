// Every photo is from Unsplash under the Unsplash License (free commercial use). Unsplash+ images are excluded.
export interface Photo {
  src: string;
  alt: string;
  credit: string;
}

const u = (id: string, alt: string, credit: string): Photo => ({
  src: `https://images.unsplash.com/photo-${id}`,
  alt,
  credit,
});

export const PHOTOS = {
  hero: u("1788927742310-12a1742fad41", "A leafy plant beside a wooden chair against a warm terracotta wall", "Vincent Yap"),
  heroDetail: u("1772797583328-f83bc3f94f80", "A light living room with natural wood shelving and soft daylight", "Puscas Adryan"),

  organicModern: u("1755696923122-11adb2a0bef8", "Sculptural cream seating and terracotta side tables in a soft neutral room", "Caroline Badran"),
  japandi: u("1512972972907-6d71529c5e92", "A low wooden bench and floor cushions beside a bright window", "Daniel Chen"),
  scandinavian: u("1583847268964-b28dc8f51f92", "A bright Scandinavian living room with a pale sofa and wooden accents", "Minh Pham"),
  warmMinimalist: u("1605774337664-7a846e9cdf17", "A soft grey sofa and round wooden coffee table in a calm, sparse room", "Katja Rooke"),
  moodyContemporary: u("1628752039723-35fd10d4ffcd", "A dark, atmospheric dining space lit by low black pendant lamps", "Rob Csaszar"),
  modernClassic: u("1654433012010-820c356ebfe6", "A carved stone fireplace and panelled sage walls with a round dining table", "Jeroen Maas"),
  bohemian: u("1622763853951-ded5a33cb724", "A plant-filled bohemian living room with rattan and layered textiles", "Lydia Mailloux"),
  midCentury: u("1618219908412-a29a1bb7b86e", "A black lounge chair, rattan sideboard and round mirror with indoor plants", "Spacejoy"),
  mediterranean: u("1788927783390-326c75c0265e", "A sunlit room with a daybed, arched window and warm plaster walls", "Vincent Yap"),
  eclectic: u("1775494112200-b74f880d8e91", "A green armchair in a colourful room with bold artwork", "Fujiphilm"),

  wood: u("1737094662085-7e0db16198e3", "Close-up of light natural wood grain", "Maria Kovalets"),
  linen: u("1615599521184-e8796c4ca465", "Softly creased grey linen bedding", "Frank R"),
  cotton: u("1582586131113-f9f71cda5265", "A neat stack of folded cotton textiles", "Zachary Keimig"),
  rattan: u("1750710606768-d69cad92080b", "Close-up of woven natural rattan fibres", "Valentin"),
  velvet: u("1640746791140-4ab07eb35c6d", "Rolls of jewel-toned velvet fabric", "Moonstarious Project"),
  stone: u("1737033991441-ca3904040511", "Close-up of textured grey stone", "Freddie"),
  glass: u("1748628719628-676266a150d9", "Two white flowers in a clear glass vase", "Yunshuo Qu"),
  metal: u("1485364103940-e8aff191ed1e", "A slim metal candlestick with a white candle", "Janko Ferlič"),
  ceramics: u("1660721671073-e139688fa3cf", "Handmade ceramic vases and bowls in terracotta and blue", "OMK"),
  woven: u("1617897210324-65a900d587fe", "A soft herringbone woven throw", "rocknwool"),

  bedroomStone: u("1790419683322-b08a7050c424", "A bedroom with a stone feature wall, round mirror and white linen", "Marie Dehayes"),
  livingNeutral: u("1600493504591-aa1849716b36", "A white and natural-wood living room with woven accents", "Collov Home Design"),
  diningSunlit: u("1772442364639-20fe5e5438a1", "Sunlight across a modern dining room with wooden chairs", "Tim Schmidbauer"),
  bedroomCalm: u("1686604585343-9da1b400c7a5", "A calm bedroom with a bedside table and lamp", "Priscilla Du Preez"),
  emptyRoom: u("1783125126731-b0999cb19aa4", "A bright, empty room with white walls and a wooden floor", "Salvo Media LLC"),

  lamp: u("1667312939978-64cf31718a6e", "A ceramic table lamp beside a stack of books", "Karolina Grabowska"),
  armchair: u("1763279934323-edb3735f6a6e", "A light upholstered armchair on a wooden floor", "Alina Bondar"),
  wickerChair: u("1758486561455-ebd0d3ba7423", "A woven wicker chair with slim metal legs", "Alina Bondar"),
  cushion: u("1615222599276-3d8149bc51ed", "A soft white throw pillow on a white sofa", "Kier in Sight Archives"),
} satisfies Record<string, Photo>;
