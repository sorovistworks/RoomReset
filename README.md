# RoomReset

**Your room. Your taste. A whole new feeling.**

This is the pre-launch site for RoomReset. Visitors get a free, working **Taste DNA** questionnaire and a personalised design report, plus an early-access waitlist. AI makeovers, shopping, refinements and personalised plans appear as clearly labelled *Coming soon* previews.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · lucide-react · Zod · Supabase REST for the waitlist. No AI APIs, no payments, no auth.

## Routes

| Route | What it does |
| --- | --- |
| `/` | Landing page |
| `/discover` | 8-step visual questionnaire. Progress is saved in `localStorage`; `?step=N` jumps to a question. |
| `/results` | Personalised Taste DNA report. `?d=…` opens a read-only shared profile. |
| `/coming-soon` | Honest previews of future features, plus a working budget guide |
| `/privacy`, `/terms`, `/contact` | Legal and support pages |
| `/api/waitlist` | `POST` only. Validates the sign-up and inserts it into Supabase. |

## Run locally

```bash
npm install
cp .env.example .env.local   # optional: only needed for the waitlist
npm run dev                  # http://localhost:3000
```

```bash
npm test          # engine + waitlist unit tests (Node's built-in test runner)
npm run typecheck
npm run build && npm start
```

## Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | For the waitlist | e.g. `https://xyz.supabase.co` |
| `SUPABASE_ANON_KEY` | For the waitlist | Anon or publishable key. **Server-only — never add a `NEXT_PUBLIC_` prefix.** |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Before launch | Shown on contact/privacy/terms. Falls back to the placeholder `hello@roomreset.example`. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL for metadata and OpenGraph |

If the Supabase variables are missing, the form says so honestly and nothing is saved. The API returns `503 not_configured`.

## Supabase waitlist setup

1. Create a Supabase project.
2. In the SQL Editor, run [`supabase/migrations/001_waitlist.sql`](supabase/migrations/001_waitlist.sql).
3. Copy the project URL and anon/publishable key into `.env.local` (and into your host's environment settings).
4. Review sign-ups in **Table Editor → waitlist**.

The table allows insert-only access with that key (RLS has no select policy), so submitted emails can't be read publicly. Duplicate emails return "You're already on the list".

## Deploying

The output is standard Next.js: static pages plus one route handler. It works on Vercel, Netlify, or Cloudflare via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). Images use a custom loader that resizes through Unsplash's CDN, so no Next image server is needed.

## Notes

- **Taste DNA engine:** `lib/taste-engine.ts` is deterministic weighted scoring. Disliked colour families are hard exclusions, the Depth tone always reaches at least 4.5:1 contrast with the Foundation, accents are softened to match boldness, and conflicting answers produce explicit "how we balanced your choices" notes.
- **Imagery:** Unsplash License photos (no Unsplash+ images). Credits are listed at `/terms#image-credits`.
- **Rate limiting:** in memory and per instance, so it isn't shared between servers. Add Cloudflare rate-limiting rules or Turnstile if spam appears.
- **Future work:** see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
