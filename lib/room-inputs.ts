// The inputs a future makeover request will need. The coming-soon preview renders from this list today;
// the real (upload-enabled) form should reuse it once FEATURES.roomPhotoUpload is switched on.
export type RoomInput =
  | { id: string; label: string; hint: string; kind: "photo" }
  | { id: string; label: string; hint: string; kind: "text"; placeholder: string }
  | { id: string; label: string; hint: string; kind: "choice"; options: string[] };

export const ROOM_INPUTS: RoomInput[] = [
  { id: "photo", label: "Room photograph", hint: "A wide shot in daylight, taken from a corner.", kind: "photo" },
  { id: "dimensions", label: "Room dimensions", hint: "Approximate is fine.", kind: "text", placeholder: "e.g. 3.6 m × 3.0 m" },
  { id: "budget", label: "Budget", hint: "What you'd like to spend in total.", kind: "text", placeholder: "e.g. ₹25,000" },
  { id: "furniture", label: "Existing furniture", hint: "What's already in the room.", kind: "text", placeholder: "Bed, desk, wardrobe…" },
  { id: "keep", label: "Furniture to keep", hint: "We'll design around these pieces.", kind: "text", placeholder: "The desk and the rug" },
  { id: "aesthetic", label: "Preferred aesthetic", hint: "Pulled from your Taste DNA automatically.", kind: "choice", options: ["Use my Taste DNA"] },
  { id: "landlord", label: "Landlord restrictions", hint: "So every suggestion stays deposit-safe.", kind: "choice", options: ["No painting", "No drilling", "No adhesive hooks", "No furniture changes"] },
  { id: "lighting", label: "Lighting conditions", hint: "How much natural light the room gets.", kind: "choice", options: ["Bright", "Some daylight", "Mostly artificial"] },
  { id: "goals", label: "Functional goals", hint: "What the room needs to do for you.", kind: "choice", options: ["Work from home", "Better sleep", "More storage", "Host friends"] },
];
