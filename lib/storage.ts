import { EMPTY_ANSWERS, isComplete, sanitizeAnswers, STYLES, type Answers, type StyleId } from "./taste-data";

// Browser-only, non-sensitive aesthetic preferences. Only the style id leaves the browser, and only on waitlist sign-up.
const KEY = "roomreset:taste:v1";
const SOURCE_KEY = "roomreset:source";

export interface Saved {
  answers: Answers;
  step: number;
  completed: boolean;
  primaryStyle?: StyleId;
}

export function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    const answers = sanitizeAnswers(p?.answers);
    const step = Number.isInteger(p?.step) ? Math.min(7, Math.max(0, p.step)) : 0;
    const primaryStyle = STYLES.some((st) => st.id === p?.primaryStyle) ? (p.primaryStyle as StyleId) : undefined;
    return { answers, step, completed: Boolean(p?.completed) && isComplete(answers), primaryStyle };
  } catch {
    return null;
  }
}

export function saveProgress(s: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Private mode or full storage: the questionnaire still works for this visit.
  }
}

export function clearSaved() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export const freshProgress = (): Saved => ({ answers: { ...EMPTY_ANSWERS }, step: 0, completed: false });

// First-touch campaign source (utm_source / ref), kept for this browsing session only.
export function rememberSource() {
  try {
    if (sessionStorage.getItem(SOURCE_KEY)) return;
    const q = new URLSearchParams(location.search);
    const src = q.get("utm_source") || q.get("ref");
    if (src) sessionStorage.setItem(SOURCE_KEY, src.slice(0, 80));
  } catch {}
}

export function readSource(): string | undefined {
  try {
    return sessionStorage.getItem(SOURCE_KEY) || undefined;
  } catch {
    return undefined;
  }
}
