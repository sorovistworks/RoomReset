// "Bring RoomReset to my country" votes. The browser calls two Supabase functions with the public key
// (supabase/migrations/002_country_votes.sql); it can't read or write the votes table itself.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const votesEnabled = Boolean(SUPABASE_URL && PUBLIC_KEY);

// ISO 3166-1 alpha-2. Names come from Intl.DisplayNames, so no translations are bundled.
export const COUNTRY_CODES = (
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI " +
  "CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ " +
  "GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS " +
  "LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG " +
  "PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK " +
  "TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW"
).split(" ");
const VOTABLE = new Set(COUNTRY_CODES.filter((c) => c !== "IN"));

export type Total = { country: string; votes: number };

// Top countries plus an "others" bucket; ignores codes the UI can't name (the API accepts any two letters).
export function summarise(totals: Total[], top = 6) {
  const valid = totals.filter((t) => VOTABLE.has(t.country) && t.votes > 0).sort((a, b) => b.votes - a.votes || a.country.localeCompare(b.country));
  const others = valid.slice(top).reduce((n, t) => n + t.votes, 0);
  return { rows: valid.slice(0, top), others, total: valid.reduce((n, t) => n + t.votes, 0), countries: valid.length };
}

// Pre-select the visitor's likely country from their browser language (en-GB → GB). India gets no default.
export function guessCountry(languages: readonly string[]) {
  for (const lang of languages) {
    const region = lang.split("-")[1]?.toUpperCase();
    if (region && VOTABLE.has(region)) return region;
  }
  return "";
}

async function rpc(fn: string, body: object): Promise<Total[]> {
  const headers: Record<string, string> = { apikey: PUBLIC_KEY!, "Content-Type": "application/json" };
  if (PUBLIC_KEY!.startsWith("eyJ")) headers.Authorization = `Bearer ${PUBLIC_KEY}`; // legacy JWT anon keys
  const res = await fetch(`${SUPABASE_URL!.replace(/\/+$/, "")}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${fn} failed (${res.status})`);
  return ((await res.json()) as { country: string; votes: number | string }[]).map((r) => ({ country: r.country, votes: Number(r.votes) }));
}

export const fetchTotals = () => rpc("country_vote_totals", {});
export const castVote = (country: string) => rpc("vote_country", { p_country: country });
