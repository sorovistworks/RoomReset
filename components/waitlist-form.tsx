"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Check, LoaderCircle } from "lucide-react";
import { loadSaved, readSource } from "@/lib/storage";
import type { StyleId } from "@/lib/taste-data";
import { buttonClass } from "./ui";

type State =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "done"; duplicate: boolean; name?: string }
  | { kind: "error"; message: string; field?: string }
  | { kind: "unconfigured" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistForm({ tone = "light", styleId }: { tone?: "light" | "dark"; styleId?: StyleId }) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [savedStyle, setSavedStyle] = useState<StyleId | undefined>(styleId);
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = Date.now();
    if (!styleId) setSavedStyle(loadSaved()?.primaryStyle);
  }, [styleId]);

  const dark = tone === "dark";
  const field = `w-full min-h-12 rounded-full border px-5 text-[0.95rem] outline-none transition-colors ${
    dark ? "border-ivory/25 bg-ivory/5 text-ivory placeholder:text-ivory/50 focus:border-ivory" : "border-line bg-paper placeholder:text-ink-soft/70 focus:border-ink"
  }`;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const firstName = String(f.get("firstName") ?? "").trim();
    if (!EMAIL.test(email)) return setState({ kind: "error", field: "email", message: "Please enter a valid email address." });
    if (!f.get("consent")) return setState({ kind: "error", field: "consent", message: "Please confirm you'd like early-access emails." });

    setState({ kind: "submitting" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          styleId: savedStyle,
          source: readSource(),
          consent: true,
          company: String(f.get("company") ?? ""),
          elapsedMs: Date.now() - mountedAt.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return setState({ kind: "done", duplicate: data.status === "duplicate", name: firstName || undefined });
      if (data.code === "not_configured") return setState({ kind: "unconfigured" });
      setState({ kind: "error", field: data.field, message: data.error ?? "Something went wrong. Please try again." });
    } catch {
      setState({ kind: "error", message: "We couldn't reach the server. Check your connection and try again." });
    }
  }

  if (state.kind === "done") {
    return (
      <div role="status" className={`rounded-3xl border p-8 fade ${dark ? "border-ivory/20 bg-ivory/5" : "border-line bg-paper"}`}>
        <span className={`flex size-11 items-center justify-center rounded-full ${dark ? "bg-ivory text-ink" : "bg-ink text-ivory"}`}>
          <Check className="size-5" aria-hidden />
        </span>
        <p className="display mt-5 text-3xl">
          {state.duplicate ? "You're already on the list" : `You're on the list${state.name ? `, ${state.name}` : ""}.`}
        </p>
        <p className={`mt-3 text-[0.95rem] leading-relaxed ${dark ? "text-ivory/75" : "text-ink-soft"}`}>
          {state.duplicate
            ? "Good news — this email is already registered for early access. There's nothing more you need to do."
            : "We'll email you when RoomReset AI Makeovers are ready to try. Your Taste DNA stays saved in this browser in the meantime."}
        </p>
      </div>
    );
  }

  const busy = state.kind === "submitting";
  const err = state.kind === "error" ? state : null;

  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-describedby="waitlist-status">
      <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
        <label className="block">
          <span className="sr-only">First name (optional)</span>
          <input name="firstName" autoComplete="given-name" maxLength={60} placeholder="First name (optional)" className={field} />
        </label>
        <label className="block">
          <span className="sr-only">Email address</span>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="Email address"
            aria-invalid={err?.field === "email" || undefined}
            className={field}
          />
        </label>
      </div>
      {/* Honeypot: hidden from people and assistive tech, tempting to bots */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label>
          Company <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className={`flex items-start gap-3 text-sm leading-relaxed ${dark ? "text-ivory/80" : "text-ink-soft"}`}>
        <input name="consent" type="checkbox" className="mt-1 size-4 shrink-0 accent-clay" aria-invalid={err?.field === "consent" || undefined} />
        <span>
          Email me when early access opens. I can unsubscribe at any time — see the{" "}
          <Link href="/privacy" className="underline underline-offset-4">
            privacy policy
          </Link>
          .
        </span>
      </label>
      {savedStyle && (
        <p className={`text-xs ${dark ? "text-ivory/65" : "text-ink-soft"}`}>A style tag from your Taste DNA will be saved with your sign-up so we can tailor your invite.</p>
      )}
      <button type="submit" disabled={busy} className={buttonClass(dark ? "light" : "primary", "w-full sm:w-auto")}>
        {busy ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden /> Saving your spot…
          </>
        ) : (
          "Join early access"
        )}
      </button>
      <div id="waitlist-status" aria-live="polite" className="min-h-5 text-sm">
        {err && <p className={dark ? "text-[#f2b8a0]" : "text-clay"}>{err.message}</p>}
        {state.kind === "unconfigured" && (
          <p className={dark ? "text-ivory/80" : "text-ink-soft"}>
            {process.env.NODE_ENV === "development"
              ? "Dev setup: the waitlist isn't connected. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env.local (see README). Nothing was saved."
              : "Early-access sign-ups open very soon — nothing was saved yet. Please check back shortly."}
          </p>
        )}
      </div>
    </form>
  );
}
