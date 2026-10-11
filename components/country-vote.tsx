"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Share2 } from "lucide-react";
import { castVote, COUNTRY_CODES, fetchTotals, guessCountry, summarise, votesEnabled, type Total } from "@/lib/country-votes";
import { buttonClass } from "./ui";

const KEY = "roomreset:country-vote";
const POLL_MS = 20_000;

export function CountryVote() {
  const names = useMemo(() => new Intl.DisplayNames(["en"], { type: "region" }), []);
  // Built after mount: country names differ between Node's and the browser's Intl data, which would break hydration.
  const [options, setOptions] = useState<(readonly [string, string])[]>([]);
  const [choice, setChoice] = useState("");
  const [voted, setVoted] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [totals, setTotals] = useState<Total[] | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "load-error">("idle");
  const [shareMsg, setShareMsg] = useState("");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {}
    setVoted(saved);
    setOptions(COUNTRY_CODES.filter((c) => c !== "IN").map((c) => [c, names.of(c) ?? c] as const).sort((a, b) => a[1].localeCompare(b[1])));
    setChoice(saved ?? guessCountry(navigator.languages ?? [navigator.language]));
  }, [names]);

  // The tally is revealed only after voting, so only voters poll it — while the tab is visible.
  useEffect(() => {
    if (!votesEnabled || !voted) return;
    const load = () => !document.hidden && fetchTotals().then(setTotals, () => setStatus((s) => (s === "idle" ? "load-error" : s)));
    load();
    const id = setInterval(load, POLL_MS);
    document.addEventListener("visibilitychange", load);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", load);
    };
  }, [voted]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!choice || status === "sending") return;
    setStatus("sending");
    try {
      setTotals(await castVote(choice));
      setVoted(choice);
      setEditing(false);
      setShareMsg("");
      setStatus("idle");
      try {
        localStorage.setItem(KEY, choice);
      } catch {}
    } catch {
      setStatus("error");
    }
  }

  const name = (c: string) => names.of(c) ?? c;
  const shareUrl = () => `${location.origin}${process.env.NEXT_PUBLIC_BASE_PATH}/#beyond`;

  async function share() {
    const text = `I voted to bring RoomReset to ${name(voted!)}. Add your vote so it gets here sooner:`;
    try {
      if (navigator.share) return await navigator.share({ title: "Bring RoomReset to my country", text, url: shareUrl() });
      await navigator.clipboard.writeText(`${text} ${shareUrl()}`);
      setShareMsg("Link copied. Paste it into WhatsApp, Instagram or an email.");
    } catch (e) {
      if ((e as Error).name !== "AbortError") setShareMsg(`Couldn't share automatically. Copy this link: ${shareUrl()}`);
    }
  }

  const s = summarise(totals ?? []);
  const max = Math.max(1, ...s.rows.map((r) => r.votes), s.others);

  return (
    <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
      {!voted || editing ? (
        <form onSubmit={submit} data-reveal className="self-start rounded-4xl border border-line bg-ivory p-7 sm:p-9">
          <label htmlFor="vote-country" className="font-serif text-2xl">
            Where do you live?
          </label>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">One vote per connection. You can change it any time.</p>
          <select
            id="vote-country"
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
            disabled={!votesEnabled}
            className="mt-6 min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-[0.95rem] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="" disabled>
              Choose your country
            </option>
            {options.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
          <button type="submit" disabled={!votesEnabled || !choice || status === "sending" || choice === voted} className={buttonClass("primary", "mt-4 w-full")}>
            {status === "sending" ? "Adding your vote…" : voted ? "Change my vote" : "Add my vote"}
          </button>
          <p aria-live="polite" className="mt-3 min-h-5 text-sm text-ink-soft">
            {!votesEnabled ? "Voting opens soon." : status === "error" ? "We couldn't save your vote just now. Please try again." : ""}
          </p>
        </form>
      ) : (
        <div className="self-start rounded-4xl border border-line bg-ivory p-7 sm:p-9">
          <p className="eyebrow">Your vote is in</p>
          <p className="mt-3 font-serif text-3xl leading-tight">
            Thanks. <span className="text-clay">{name(voted)}</span> is on the map.
          </p>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
            Every vote moves {name(voted)} up the list. Share it with friends there who are setting up a new home.
          </p>
          <button type="button" onClick={share} className={buttonClass("primary", "mt-6 w-full")}>
            <Share2 className="size-4" aria-hidden /> Share with friends
          </button>
          <button type="button" onClick={() => setEditing(true)} className={buttonClass("ghost", "mt-2 w-full justify-center text-ink-soft")}>
            Change my vote
          </button>
          <p aria-live="polite" className="mt-2 min-h-5 wrap-break-word text-sm text-ink-soft">
            {shareMsg}
          </p>
        </div>
      )}

      <figure className="min-w-0">
        <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <span className="eyebrow">Votes so far</span>
          {voted && s.total > 0 && (
            <span className="text-sm tabular-nums text-ink-soft">
              {s.total.toLocaleString("en-IN")} {s.total === 1 ? "vote" : "votes"} from {s.countries} {s.countries === 1 ? "country" : "countries"}
            </span>
          )}
        </figcaption>
        {!voted || s.total === 0 ? (
          <p className="mt-6 rounded-3xl border border-dashed border-line px-6 py-10 text-center text-ink-soft">
            {!votesEnabled
              ? "The tally appears here once voting opens."
              : !voted
                ? "Add your vote to see the live tally, and which countries are ahead."
                : status === "load-error"
                  ? "The tally couldn't load just now."
                  : "Loading the latest votes…"}
          </p>
        ) : (
          <ol className="mt-6 space-y-3">
            {[...s.rows.map((r) => ({ label: name(r.country), votes: r.votes, mine: r.country === voted })), ...(s.others ? [{ label: "Other countries", votes: s.others, mine: false }] : [])].map(
              (r) => (
                <li key={r.label} className="grid grid-cols-[minmax(0,9rem)_1fr_3rem] items-center gap-4 text-sm">
                  <span className={`truncate ${r.mine ? "font-medium text-ink" : "text-ink-soft"}`}>{r.label}</span>
                  <span aria-hidden className="h-3 overflow-hidden rounded-full bg-sand">
                    <span
                      className={`block h-full rounded-full transition-[width] duration-700 ease-soft ${r.mine ? "bg-clay" : "bg-ink/75"}`}
                      style={{ width: `${(r.votes / max) * 100}%` }}
                    />
                  </span>
                  <span className="text-right tabular-nums text-ink">{r.votes.toLocaleString("en-IN")}</span>
                </li>
              ),
            )}
          </ol>
        )}
      </figure>
    </div>
  );
}
