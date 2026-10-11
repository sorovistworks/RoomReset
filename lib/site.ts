export const SITE = {
  name: "RoomReset",
  tagline: "Same room. More you.",
  description:
    "Discover your Taste DNA for free. Practical resources and renter-friendly styling ideas for Indian bedrooms, with personalised AI room makeovers coming soon.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  // shortcut: placeholder on a reserved .example domain until NEXT_PUBLIC_CONTACT_EMAIL is set for launch.
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@roomreset.example",
  policyVersion: "2026-10-11",
};

// Unreleased features stay off until they are genuinely built.
export const FEATURES = {
  aiMakeovers: false,
  roomPhotoUpload: false,
  shopTheLook: false,
  designRefinements: false,
  payments: false,
} as const;
