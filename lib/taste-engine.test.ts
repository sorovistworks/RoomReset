import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeAnswers, encodeAnswers, primaryStyle } from "./taste-engine.ts";
import { EMPTY_ANSWERS, isComplete, sanitizeAnswers, type Answers } from "./taste-data.ts";

const base: Answers = {
  styles: ["warm-minimalist", "japandi"],
  moods: ["calm", "cozy"],
  avoidColours: [],
  boldness: 2,
  materials: ["wood", "linen", "ceramics"],
  tenure: "rent",
  home: "2bhk",
  vastu: false,
  climate: "mild",
  household: ["partner"],
  work: "hybrid",
  cooking: "light",
  help: "maid",
  budget: "mid",
  fixtures: { floor: { id: "white-tiles" }, doors: { id: "teak" }, walls: { id: "white" }, counter: { id: "black-granite" }, cabinets: { id: "white" } },
  repaint: false,
};

test("the strongest visual pick leads the hidden style ranking", () => {
  assert.equal(primaryStyle(base), "warm-minimalist");
  assert.equal(primaryStyle(base), primaryStyle(structuredClone(base)));
});

test("sanitizeAnswers drops unknown ids and enforces limits", () => {
  const a = sanitizeAnswers({ styles: ["japandi", "nope", "eclectic", "bohemian", "mid-century"], boldness: 99, climate: "<script>", moods: "calm", vastu: "yes", household: ["kids", "kids", "aliens"] });
  assert.deepEqual(a.styles, ["japandi", "eclectic", "bohemian"]);
  assert.equal(a.boldness, 5);
  assert.equal(a.climate, null);
  assert.equal(a.vastu, false);
  assert.deepEqual(a.moods, []);
  assert.deepEqual(a.household, ["kids"]);
  assert.deepEqual(sanitizeAnswers(null), EMPTY_ANSWERS);
});

test("completion needs every single-choice life answer, but household is optional", () => {
  assert.ok(isComplete({ ...base, household: [] }));
  assert.ok(!isComplete({ ...base, budget: null }));
  assert.ok(!isComplete({ ...base, fixtures: { ...base.fixtures, counter: null } }));
  assert.ok(!isComplete(EMPTY_ANSWERS));
});

test("fixture picks keep only known ids and valid hex codes", () => {
  const a = sanitizeAnswers({ fixtures: { floor: { id: "grey-tiles", hex: "b0b2b4" }, doors: { id: "teak", hex: "red" }, walls: { id: "nope" }, counter: { id: "undecided", hex: "#000000" } } });
  assert.deepEqual(a.fixtures, { floor: { id: "grey-tiles", hex: "#B0B2B4" }, doors: { id: "teak" }, walls: null, counter: { id: "undecided" }, cabinets: null });
});

test("share encoding round-trips and rejects garbage", () => {
  assert.deepEqual(decodeAnswers(encodeAnswers(base)), base);
  assert.equal(decodeAnswers("%%%not-base64"), null);
});
