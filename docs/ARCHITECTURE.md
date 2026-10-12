# RoomReset architecture

## Today (pre-launch)

| Piece | Where | Notes |
| --- | --- | --- |
| Pages | `app/` | All pages are statically rendered. The questionnaire and results are client components. |
| Questionnaire data | `lib/taste-data.ts` | Taste, home, household, permissions, inventory and budget options; schema migration, sanitising and completion checks. |
| Taste scoring | `lib/taste-engine.ts` | Deterministic selected-style ranking and fragment-based share encoding. No network calls. |
| Home-plan engine | `lib/home-plan.ts` + `lib/home-data.ts` | Deterministic palettes, hard colour exclusions, room rules, safety constraints, inventory suppression and exact-ceiling budget rebalancing. |
| Local persistence | `lib/storage.ts` | `localStorage` key `roomreset:taste:v1`. A deliberate share action puts the full answer payload in a URL fragment; joining the waitlist sends only the style id. |
| Waitlist | `app/api/waitlist/route.ts` → `lib/waitlist.ts` | Zod validation, honeypot + timing check, per-instance rate limit, Supabase REST insert (no SDK). |
| Feature flags | `lib/site.ts` → `FEATURES` | Every unreleased capability is `false`. Gate future routes and UI with these flags. |
| Future room inputs | `lib/room-inputs.ts` | Drives the disabled preview on `/coming-soon`; reuse it for the real form. |

## Future integration points

Add each piece only when the feature is actually built.

1. **User accounts.** Supabase Auth. Move saved Taste DNA from `localStorage` into a `profiles` table (answers JSON plus `primary_style`). On first sign-in, import the local answers so anonymous users keep their results.
2. **Room photo storage.** A private Supabase Storage bucket with per-user RLS. Upload through signed URLs. Strip EXIF/GPS on upload and set a retention period. Update `/privacy` before collecting any photos.
3. **AI image editing.** Add a server-only adapter (`lib/makeover/provider.ts`) behind `FEATURES.aiMakeovers`. Input: the room photo URL, the `TasteProfile` (palette hexes, materials, density, avoid list) and the `ROOM_INPUTS` answers. Build prompts from the profile; never send emails or names. Run jobs asynchronously in a queue and store results under the user's projects.
4. **Saved makeover projects.** A `projects` table (user, room inputs, source image, generated images, refinement history).
5. **AI refinements.** Append a refinement to a project ("make it cozier"), re-run the adapter with the delta, and keep a version history.
6. **Product catalogue and recommendations.** A `products` table (category, price, colours as hex, materials, retailer URL, availability timestamp). Match products to the sanitised answers by colour distance, material overlap, inventory and permission constraints.
7. **Budget shopping lists.** Extend `allocate()` in `components/budget-planner.tsx` with real catalogue prices per category.
8. **Payments (Razorpay).** Server-side order creation and webhook signature verification only. Keep the secret key server-side, and gate everything behind `FEATURES.payments`.

## Data the future makeover pipeline will need

- Sanitised `Answers` plus the deterministic `HomePlan` from `buildHomePlan(answers)`.
- Room inputs: photo, dimensions, budget, furniture to keep, landlord restrictions, lighting, goals (see `ROOM_INPUTS`).
- Consent records for photo processing, kept separate from waitlist marketing consent.
