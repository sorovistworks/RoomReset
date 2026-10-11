import { test } from "node:test";
import assert from "node:assert/strict";
import { buildProfile, chroma, contrastRatio, decodeAnswers, encodeAnswers } from "./taste-engine.ts";
import {
  COLOUR_FAMILIES,
  DISLIKES,
  EMPTY_ANSWERS,
  MATERIALS,
  MOODS,
  PALETTES,
  sanitizeAnswers,
  STATEMENTS,
  STYLES,
  type Answers,
} from "./taste-data.ts";

const base: Answers = {
  styles: ["warm-minimalist", "japandi"],
  moods: ["calm", "cozy"],
  palettes: ["warm-earthy"],
  avoidColours: [],
  boldness: 2,
  materials: ["wood", "linen", "ceramics"],
  dislikes: ["clutter"],
  statement: "quiet",
};

const swatches = (a: Answers) => {
  const p = buildProfile(a).palette;
  return [...p.main, ...p.accents];
};

test("typical answers produce a coherent, matching profile", () => {
  const p = buildProfile(base);
  assert.equal(p.primaryStyle, "warm-minimalist");
  assert.equal(p.title, "The Serene Essentialist");
  assert.equal(p.palette.main.length, 3);
  assert.ok(p.palette.accents.length >= 1);
  for (const s of swatches(base)) assert.match(s.hex, /^#[0-9A-F]{6}$/);
  assert.equal(p.principles.length, 3);
  assert.equal(p.styleMatches.reduce((s, m) => s + m.percent, 0), 100);
});

test("scoring is deterministic", () => {
  assert.deepEqual(buildProfile(base), buildProfile(structuredClone(base)));
});

// Small seeded PRNG so the sweep is reproducible.
function rng(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
}
const pickSome = <T,>(r: () => number, list: T[], max: number, min = 0) => {
  const n = min + Math.floor(r() * (max - min + 1));
  return [...list].sort(() => r() - 0.5).slice(0, n);
};

test("disliked colour families never appear and depth stays readable (500 random profiles)", () => {
  const r = rng(42);
  for (let i = 0; i < 500; i++) {
    const a: Answers = {
      styles: pickSome(r, STYLES.map((s) => s.id), 3, 1),
      moods: pickSome(r, MOODS.map((m) => m.id), 2, 1),
      palettes: pickSome(r, PALETTES.map((p) => p.id), 2, 1),
      avoidColours: pickSome(r, COLOUR_FAMILIES.map((f) => f.id), 6),
      boldness: 1 + Math.floor(r() * 5),
      materials: pickSome(r, MATERIALS.map((m) => m.id), 5, 1),
      dislikes: pickSome(r, DISLIKES.map((d) => d.id), 4),
      statement: pickSome(r, STATEMENTS.map((s) => s.id), 1, 1)[0],
    };
    const p = buildProfile(a);
    for (const s of [...p.palette.main, ...p.palette.accents]) {
      assert.ok(!a.avoidColours.includes(s.family), `${s.name} (${s.family}) leaked into ${JSON.stringify(a)}`);
    }
    const [f, , d] = p.palette.main;
    assert.ok(contrastRatio(f.hex, d.hex) >= 4.5, `low contrast ${f.hex}/${d.hex} for ${JSON.stringify(a)}`);
    if (a.dislikes.includes("bright")) for (const s of p.palette.accents) assert.ok(chroma(s.hex) <= 0.36, `${s.hex} too bright`);
  }
});

test("disliking dark spaces overrides an inferred moody preference and explains why", () => {
  const p = buildProfile({ ...base, styles: ["moody-contemporary", "modern-classic"], palettes: ["moody-elegant"], dislikes: ["dark"] });
  assert.notEqual(p.primaryStyle, "moody-contemporary");
  assert.ok(p.balancing.some((n) => n.includes("dislike dark spaces")));
  assert.equal(p.palette.main[0].role, "Foundation");
  assert.notEqual(p.palette.main[2].role, "Light"); // stays a light scheme
});

test("moody choices without the dark dislike produce a dark foundation", () => {
  const p = buildProfile({ ...base, styles: ["moody-contemporary"], palettes: ["moody-elegant"], boldness: 4, statement: "statement", dislikes: [] });
  assert.equal(p.primaryStyle, "moody-contemporary");
  assert.equal(p.palette.main[2].role, "Light");
});

test("avoided colours from a chosen palette are reported", () => {
  const p = buildProfile({ ...base, avoidColours: ["orange", "brown"] });
  assert.ok(p.balancing.some((n) => n.includes("removed") && n.includes("terracotta")));
});

test("empty or partial answers never throw", () => {
  const p = buildProfile(EMPTY_ANSWERS);
  assert.equal(p.palette.main.length, 3);
  assert.ok(p.title.startsWith("The "));
});

test("sanitizeAnswers drops unknown ids and enforces limits", () => {
  const a = sanitizeAnswers({ styles: ["japandi", "nope", "eclectic", "bohemian", "mid-century"], boldness: 99, statement: "<script>", moods: "calm" });
  assert.deepEqual(a.styles, ["japandi", "eclectic", "bohemian"]);
  assert.equal(a.boldness, 5);
  assert.equal(a.statement, null);
  assert.deepEqual(a.moods, []);
  assert.deepEqual(sanitizeAnswers(null), EMPTY_ANSWERS);
});

test("share encoding round-trips and rejects garbage", () => {
  assert.deepEqual(decodeAnswers(encodeAnswers(base)), base);
  assert.equal(decodeAnswers("%%%not-base64"), null);
});
