import { sanitizeAnswers, STYLES, type Answers, type StyleId } from "./taste-data.ts";

export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Style names are never shown; the ranking only steers palette choice and the waitlist invite.
export function scoreStyles(a: Answers): { id: StyleId; score: number }[] {
  const candidates = a.styles.length ? STYLES.filter((s) => a.styles.includes(s.id)) : STYLES;
  return candidates.map((s, index) => {
    let score = 0;
    const pick = a.styles.indexOf(s.id);
    if (pick >= 0) score += 10 - pick * 0.5;
    for (const m of a.moods) score += (s.moods[m] ?? 0) * 1.5;
    score += (2 - Math.abs(s.boldness - a.boldness)) * 1.2;
    score += a.materials.filter((m) => s.materials.includes(m)).length * 0.8;
    return { id: s.id, score, index };
  })
    .sort((x, y) => y.score - x.score || x.index - y.index)
    .map(({ id, score }) => ({ id, score }));
}

export const primaryStyle = (a: Answers): StyleId => scoreStyles(a)[0].id;

// Share links carry quiz answers only (no name or email), as base64url JSON.
export function encodeAnswers(a: Answers): string {
  return btoa(JSON.stringify(a)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeAnswers(s: string): Answers | null {
  try {
    return sanitizeAnswers(JSON.parse(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));
  } catch {
    return null;
  }
}
