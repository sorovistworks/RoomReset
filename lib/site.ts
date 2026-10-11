export const SITE = {
  name: "RoomReset",
  tagline: "Your room. Your taste. A whole new feeling.",
  description:
    "Discover your personal interior-design Taste DNA in three minutes — free, no sign-up. Soon: rental-friendly AI room makeovers that feel completely you.",
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
