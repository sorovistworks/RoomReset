# Habitaste

**Your room. Your taste. A whole new feeling.**

This is the pre-launch site for Habitaste. Visitors get a free, working **Taste DNA** questionnaire and a personalised design report, plus an early-access waitlist. AI makeovers, shopping, refinements and personalised plans appear as clearly labelled *Coming soon* previews.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · lucide-react · Zod · Supabase REST for the waitlist. No AI APIs, no payments, no auth.

## Routes

| Route | What it does |
| --- | --- |
| `/` | Landing page |
| `/discover` | 13-step visual questionnaire. Progress is saved in `localStorage`; `?step=N` jumps to a question. |
| `/results` | Personalised home report. `#d=…` opens a read-only shared plan; legacy `?d=…` links remain readable. |
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
| `SUPABASE_SECRET_KEY` | For the waitlist | Secret / service_role key. **Server-only — never add a `NEXT_PUBLIC_` prefix.** |
| `NEXT_PUBLIC_SUPABASE_URL` | For country votes | Same project URL. Public by design. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | For country votes | Publishable / anon key. Public by design: it can only call the two vote functions. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Before launch | Shown on contact/privacy/terms. Falls back to the placeholder `hello@habitaste.example`. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL for metadata and OpenGraph |

If the Supabase variables are missing, the form says so honestly and nothing is saved. The API returns `503 not_configured`.

## Supabase waitlist setup

1. Create a Supabase project.
2. In the SQL Editor, run [`001_waitlist.sql`](supabase/migrations/001_waitlist.sql), then [`002_country_votes.sql`](supabase/migrations/002_country_votes.sql).
3. Copy the project URL and **secret** key into `SUPABASE_URL` / `SUPABASE_SECRET_KEY` (server only), and the URL and **publishable** key into the two `NEXT_PUBLIC_SUPABASE_*` variables.
4. Review sign-ups in **Table Editor → waitlist** and votes in **country_votes**.

The public key can't touch the `waitlist` table at all; only the server, with the secret key, writes to it. Duplicate emails return "You're already on the list".

### Country votes on the GitHub Pages preview

Add two repository variables (**Settings → Secrets and variables → Actions → Variables**): `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`, then re-run the Pages workflow. Until then the vote section says "Voting opens soon". Each internet connection gets one vote (stored as a salted hash, never the IP), so people sharing a connection share a vote.

## Deploying

The output is standard Next.js: static pages plus one route handler. It works on Vercel, Netlify, or Cloudflare via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). Images use a custom loader that resizes through Unsplash's CDN, so no Next image server is needed.

## Notes

- **Taste and planning engine:** deterministic rules rank palettes, exclude disliked colour families from generated palettes and finishes, enforce tenure permissions, remove owned items, and rebalance non-essential purchases against the exact budget ceiling. Safety-critical unknowns are surfaced as constraints rather than guessed.
- **Imagery:** Unsplash License photos (no Unsplash+ images). Credits are listed at `/terms#image-credits`.
- **Rate limiting:** in memory and per instance, so it isn't shared between servers. Add Cloudflare rate-limiting rules or Turnstile if spam appears.
- **Future work:** see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
