import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeAnswers, encodeAnswers, primaryStyle } from "./taste-engine.ts";
import { EMPTY_ANSWERS, isComplete, sanitizeAnswers, type Answers } from "./taste-data.ts";

const base: Answers = {
  ...EMPTY_ANSWERS,
  styles: ["warm-minimalist", "japandi"],
  moods: ["calm", "cozy"],
  avoidColours: [],
  boldness: 2,
  materials: ["wood", "linen", "ceramics"],
  tenure: "rent",
  home: "2bhk",
  vastu: false,
  balcony: true,
  bathrooms: 2,
  climate: "mild",
  household: ["partner"],
  people: 2,
  guests: "sometimes",
  work: "hybrid",
  cooking: "light",
  help: "maid",
  helpLivesIn: false,
  helpDuties: ["cleaning", "dishes"],
  budget: "mid",
  budgetAmount: 275000,
  fixtures: { floor: { id: "white-tiles" }, doors: { id: "teak" }, walls: { id: "white" }, counter: { id: "black-granite" }, cabinets: { id: "white" } },
  repaint: false,
  inventoryConfirmed: true,
};

test("the strongest visual pick leads the hidden style ranking", () => {
  assert.equal(primaryStyle(base), "warm-minimalist");
  assert.equal(primaryStyle(base), primaryStyle(structuredClone(base)));
  assert.equal(primaryStyle({ ...base, styles: ["japandi"], moods: ["energised"], materials: ["velvet", "metal"] }), "japandi");
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

test("completion needs every single-choice life answer; household follow-ups are optional", () => {
  assert.ok(isComplete({ ...base, household: [] }));
  // Optional follow-ups fall back to sensible defaults in the plan.
  assert.ok(isComplete({ ...base, people: null, guests: null, bathrooms: null, inventoryConfirmed: false, budgetAmount: null }));
  assert.ok(!isComplete({ ...base, household: ["partner", "kids"], people: 1 })); // fewer people than picked
  assert.ok(!isComplete({ ...base, balcony: null }));
  assert.ok(!isComplete({ ...base, budget: null }));
  assert.ok(!isComplete({ ...base, fixtures: { ...base.fixtures, counter: null } }));
  assert.ok(!isComplete(EMPTY_ANSWERS));
});

test("fixture picks keep only known ids and valid hex codes", () => {
  const a = sanitizeAnswers({ fixtures: { floor: { id: "grey-tiles", hex: "b0b2b4" }, doors: { id: "teak", hex: "red" }, walls: { id: "nope" }, counter: { id: "undecided", hex: "#000000" } } });
  assert.deepEqual(a.fixtures, { floor: { id: "grey-tiles", hex: "#B0B2B4" }, doors: { id: "teak" }, walls: null, counter: { id: "undecided" }, cabinets: null });
});

test("sanitizing resolves cross-answer contradictions", () => {
  assert.equal(sanitizeAnswers({ ...base, budget: "premium", budgetAmount: 120000 }).budget, "tight");
  assert.equal(sanitizeAnswers({ ...base, tenure: "rent", fixtures: { ...base.fixtures, counter: { id: "undecided" } } }).fixtures.counter, null);
  assert.equal(sanitizeAnswers({ ...base, tenure: "own", fixtures: { ...base.fixtures, cabinets: { id: "none" } } }).fixtures.cabinets, null);
  assert.deepEqual(sanitizeAnswers({ ...base, fixtures: { ...base.fixtures, walls: { id: "white", hex: "#000000" } } }).fixtures.walls, { id: "white" });
  assert.deepEqual(sanitizeAnswers({ ...base, household: [], childAges: ["under6"], petTypes: ["bird"] }).childAges, []);
  assert.deepEqual(sanitizeAnswers({ ...base, household: [], childAges: ["under6"], petTypes: ["bird"] }).petTypes, []);
});

test("legacy completed answers remain readable but retain their migration marker", () => {
  const legacy = sanitizeAnswers({
    styles: base.styles,
    moods: base.moods,
    avoidColours: [],
    boldness: base.boldness,
    materials: base.materials,
    tenure: base.tenure,
    home: base.home,
    climate: base.climate,
    household: base.household,
    work: base.work,
    cooking: base.cooking,
    help: base.help,
    budget: base.budget,
    fixtures: base.fixtures,
  });
  assert.equal(legacy.schemaVersion, 1);
  assert.ok(isComplete(legacy));
});

test("share encoding round-trips and rejects garbage", () => {
  assert.deepEqual(decodeAnswers(encodeAnswers(base)), base);
  assert.equal(decodeAnswers("%%%not-base64"), null);
});
