import { test } from "node:test";
import assert from "node:assert/strict";
import { insertWaitlist, rateLimited, waitlistSchema } from "./waitlist.ts";

const valid = { email: "  Ada@Example.COM ", firstName: "Ada<b>", consent: true, company: "", elapsedMs: 4000, styleId: "japandi" };
const env = { SUPABASE_URL: "https://demo.supabase.co/", SUPABASE_SECRET_KEY: "sb_secret_test" };

test("schema normalises and sanitises input", () => {
  const r = waitlistSchema.parse(valid);
  assert.equal(r.email, "ada@example.com");
  assert.equal(r.firstName, "Adab");
  assert.equal(waitlistSchema.parse({ ...valid, firstName: "  " }).firstName, undefined);
  assert.equal(waitlistSchema.parse({ ...valid, source: "bad source!" }).source, undefined);
});

test("schema rejects invalid email, missing consent and bots", () => {
  assert.equal(waitlistSchema.safeParse({ ...valid, email: "not-an-email" }).success, false);
  assert.equal(waitlistSchema.safeParse({ ...valid, consent: false }).success, false);
  assert.equal(waitlistSchema.safeParse({ ...valid, company: "spam inc" }).success, false);
  assert.equal(waitlistSchema.safeParse({ ...valid, elapsedMs: 300 }).success, false);
  assert.equal(waitlistSchema.safeParse({ ...valid, styleId: "unknown" }).success, false);
});

function mockFetch(status: number, body = "") {
  const calls: { url: string; init: RequestInit }[] = [];
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(body || null, { status });
  }) as typeof fetch;
  return calls;
}

test("insert maps Supabase responses to honest outcomes", async () => {
  const entry = waitlistSchema.parse(valid);
  assert.equal(await insertWaitlist(entry, {}), "not_configured");

  const calls = mockFetch(201);
  assert.equal(await insertWaitlist(entry, env), "created");
  assert.equal(calls[0].url, "https://demo.supabase.co/rest/v1/waitlist");
  const headers = calls[0].init.headers as Record<string, string>;
  assert.equal(headers.Authorization, undefined);
  assert.equal(JSON.parse(String(calls[0].init.body)).email, "ada@example.com");

  mockFetch(409, '{"code":"23505"}');
  assert.equal(await insertWaitlist(entry, env), "duplicate");
  mockFetch(500, "boom");
  assert.equal(await insertWaitlist(entry, env), "error");
  globalThis.fetch = (async () => {
    throw new TypeError("network down");
  }) as typeof fetch;
  assert.equal(await insertWaitlist(entry, env), "error");
});

test("rate limiter blocks after five attempts per window", () => {
  const t = 1_000_000;
  for (let i = 0; i < 5; i++) assert.equal(rateLimited("1.2.3.4", t + i), false);
  assert.equal(rateLimited("1.2.3.4", t + 10), true);
  assert.equal(rateLimited("1.2.3.4", t + 11 * 60_000), false);
});
