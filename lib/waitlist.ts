import { z } from "zod";
import { SITE } from "./site.ts";
import { STYLES, type StyleId } from "./taste-data.ts";

const styleIds = STYLES.map((s) => s.id) as [StyleId, ...StyleId[]];
// Strip control characters and angle brackets from the only free-text field.
const clean = (s: string) => s.replace(/[\u0000-\u001F\u007F<>]/g, "").trim();

export const waitlistSchema = z.object({
  email: z
    .string({ error: "Please enter your email address." })
    .trim()
    .toLowerCase()
    .max(254, { error: "That email address is too long." })
    .pipe(z.email({ error: "Please enter a valid email address." })),
  firstName: z
    .string()
    .max(60, { error: "Please keep your first name under 60 characters." })
    .transform(clean)
    .optional()
    .transform((v) => v || undefined),
  styleId: z.enum(styleIds).optional(),
  source: z
    .string()
    .max(80)
    .regex(/^[\w.\-]*$/)
    .optional()
    .catch(undefined),
  consent: z.literal(true, { error: "Please confirm you'd like early-access emails." }),
  // Bot checks: the hidden field must stay empty, and humans take more than a moment to fill the form.
  company: z.string().max(0).optional(),
  elapsedMs: z.number().min(1500),
});

export type WaitlistEntry = z.infer<typeof waitlistSchema>;
export type InsertResult = "created" | "duplicate" | "not_configured" | "error";

export async function insertWaitlist(entry: WaitlistEntry, env: Record<string, string | undefined> = process.env): Promise<InsertResult> {
  const url = env.SUPABASE_URL;
  // Secret (service) key: the public key ships to browsers for country votes, so it has no waitlist access.
  const key = env.SUPABASE_SECRET_KEY;
  if (!url || !key) return "not_configured";

  const headers: Record<string, string> = { apikey: key, "Content-Type": "application/json", Prefer: "return=minimal" };
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`; // legacy JWT service_role keys; sb_secret_ keys use apikey only

  try {
    const res = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/waitlist`, {
      method: "POST",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        email: entry.email,
        first_name: entry.firstName ?? null,
        style_id: entry.styleId ?? null,
        source: entry.source ?? null,
        consent_at: new Date().toISOString(),
        policy_version: SITE.policyVersion,
      }),
    });
    if (res.status === 201 || res.status === 204) return "created";
    const body = await res.text();
    if (res.status === 409 || body.includes("23505")) return "duplicate";
    // Log only the error code: Postgres error details can echo the submitted email.
    console.error("waitlist insert failed", res.status, body.match(/"code":"(\w+)"/)?.[1] ?? "");
    return "error";
  } catch (e) {
    console.error("waitlist insert error", (e as Error).name);
    return "error";
  }
}


// shortcut: per-instance memory, so limits reset on redeploy and aren't shared across instances.
// Upgrade to Cloudflare rate-limiting rules, KV or Turnstile if abuse appears.
const hits = new Map<string, number[]>();
export function rateLimited(key: string, now = Date.now(), limit = 5, windowMs = 10 * 60_000): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  if (hits.size > 5000) hits.clear();
  hits.set(key, recent);
  return recent.length > limit;
}
