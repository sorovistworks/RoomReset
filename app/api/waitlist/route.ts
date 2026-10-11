import { insertWaitlist, rateLimited, waitlistSchema } from "@/lib/waitlist";

const json = (status: number, body: Record<string, unknown>) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (rateLimited(ip)) return json(429, { error: "Too many attempts. Please wait a few minutes and try again." });
  if (!req.headers.get("content-type")?.includes("application/json")) return json(415, { error: "Unsupported request." });

  const text = await req.text();
  if (text.length > 2000) return json(413, { error: "Request too large." });
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json(400, { error: "Invalid request." });
  }

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = String(issue.path[0] ?? "");
    if (field === "company" || field === "elapsedMs") return json(400, { error: "We couldn't verify this submission. Please try again." });
    return json(400, { error: issue.message, field });
  }

  switch (await insertWaitlist(parsed.data)) {
    case "created":
      return json(201, { status: "created" });
    case "duplicate":
      return json(200, { status: "duplicate" });
    case "not_configured":
      return json(503, { code: "not_configured", error: "Early-access sign-ups aren't open yet." });
    default:
      return json(502, { error: "We couldn't save your spot just now. Please try again in a minute." });
  }
}
