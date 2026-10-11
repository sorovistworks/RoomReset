import { test } from "node:test";
import assert from "node:assert/strict";
import { buildHomePlan } from "./home-plan.ts";
import { COLOURS, BUDGETS, FIXTURES, CLIMATES, COLOUR_FAMILIES, COOKING, EMPTY_ANSWERS, HELPS, HOMES, MATERIALS, MEMBERS, MOODS, STYLES, TENURES, WORKS, type Answers } from "./taste-data.ts";

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

const all = (plan: ReturnType<typeof buildHomePlan>) => plan.rooms.flatMap((r) => [...r.buy.now, ...r.buy.later, ...r.buy.skip].map((i) => i.name));
const verdictOf = (plan: ReturnType<typeof buildHomePlan>, name: string) =>
  plan.rooms.flatMap((r) => (["now", "later", "skip"] as const).filter((v) => r.buy[v].some((i) => i.name === name)))[0];

test("a typical home gets five palettes and every room is filled in", () => {
  const p = buildHomePlan(base);
  assert.equal(p.palettes.length, 5);
  assert.equal(p.rooms.length, 5);
  for (const r of p.rooms) {
    assert.ok(r.materials.length >= 3, `${r.id} materials`);
    assert.ok(r.buy.now.length >= 1, `${r.id} has nothing to buy now`);
    assert.ok(r.dos.length >= 1 && r.donts.length >= 1, `${r.id} tips`);
  }
  assert.equal(p.budget.rooms.reduce((s, r) => s + r.share, 0), 100);
});

test("renters and owners are sent down different paths", () => {
  const rent = all(buildHomePlan({ ...base, tenure: "rent" }));
  const own = all(buildHomePlan({ ...base, tenure: "own" }));
  assert.ok(!rent.includes("Modular kitchen (BWP ply)") && own.includes("Modular kitchen (BWP ply)"));
  assert.ok(rent.includes("Shower curtain and tension rod") && !own.includes("Shower curtain and tension rod"));
  assert.ok(buildHomePlan({ ...base, tenure: "own" }).rooms[1].materials.some((m) => m.name === "BWP plywood carcass"));
});

test("busy households without help are pointed at machines and a cook", () => {
  const p = buildHomePlan({ ...base, work: "long", help: "none", cooking: "daily", household: ["kids"] });
  assert.equal(verdictOf(p, "Dishwasher (with kadhai cycle)"), "now");
  assert.equal(p.chores.find((c) => c.task === "Cooking")!.hand, "help");
  assert.match(p.choreHeadline, /no help yet/);
  assert.equal(verdictOf(buildHomePlan({ ...base, help: "maid" }), "Dishwasher (with kadhai cycle)"), "skip");
});

test("climate changes the advice", () => {
  assert.equal(verdictOf(buildHomePlan({ ...base, climate: "hills" }), "Oil-filled room heater"), "now");
  assert.equal(verdictOf(buildHomePlan({ ...base, climate: "humid" }), "Oil-filled room heater"), undefined);
  assert.ok(buildHomePlan({ ...base, climate: "humid" }).rooms[3].donts.some((t) => t.includes("velvet")));
});

test("vastu tips only appear when asked for", () => {
  const tips = (vastu: boolean) => buildHomePlan({ ...base, vastu }).rooms.flatMap((r) => [...r.dos, ...r.donts]).filter((t) => t.startsWith("Vastu"));
  assert.equal(tips(false).length, 0);
  assert.ok(tips(true).length >= 4);
});

function rng(seed: number) {
  return () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
}
const pickSome = <T,>(r: () => number, list: T[], max: number, min = 0) => [...list].sort(() => r() - 0.5).slice(0, min + Math.floor(r() * (max - min + 1)));
const one = <T extends { id: string }>(r: () => number, list: T[]) => list[Math.floor(r() * list.length)].id as never;

test("avoided colours never outrank clean palettes, and nothing throws (500 random homes)", () => {
  const r = rng(42);
  for (let i = 0; i < 500; i++) {
    const a: Answers = {
      styles: pickSome(r, STYLES.map((s) => s.id), 3, 1),
      moods: pickSome(r, MOODS.map((m) => m.id), 2, 1),
      avoidColours: pickSome(r, COLOUR_FAMILIES.map((f) => f.id), 6),
      boldness: 1 + Math.floor(r() * 5),
      materials: pickSome(r, MATERIALS.map((m) => m.id), 5, 1),
      tenure: one(r, TENURES),
      home: one(r, HOMES),
      vastu: r() > 0.5,
      climate: one(r, CLIMATES),
      household: pickSome(r, MEMBERS.map((m) => m.id), 3),
      work: one(r, WORKS),
      cooking: one(r, COOKING),
      help: one(r, HELPS),
      budget: one(r, BUDGETS),
      fixtures: Object.fromEntries(FIXTURES.map((f) => [f.key, { id: one(r, f.options), ...(r() > 0.7 ? { hex: "#" + Math.floor(r() * 0xffffff).toString(16).padStart(6, "0").toUpperCase() } : {}) }])) as unknown as Answers["fixtures"],
      repaint: r() > 0.5,
    };
    const p = buildHomePlan(a);
    const flags = p.palettes.map((x) => x.avoided.length > 0);
    assert.deepEqual(flags, [...flags].sort((x, y) => Number(x) - Number(y)), `avoided palette ranked first for ${JSON.stringify(a)}`);
    for (const x of p.palettes) {
      const leaked = x.colours.filter((c) => a.avoidColours.includes(Object.values(COLOURS).find((k) => k.hex === c.hex)!.family));
      assert.equal(leaked.length, x.avoided.length);
    }
    for (const room of p.rooms) for (const item of [...room.buy.now, ...room.buy.later, ...room.buy.skip]) assert.ok(item.why.length > 10);
  }
});

const fx = (f: Partial<Answers["fixtures"]>) => ({ ...base, fixtures: { ...base.fixtures, ...f } });

test("the top five are never near-copies of each other", () => {
  for (const a of [base, fx({ floor: { id: "grey-tiles" } }), { ...base, styles: ["japandi", "scandinavian", "warm-minimalist"] as Answers["styles"], moods: ["calm"] as Answers["moods"], boldness: 1 }]) {
    const p = buildHomePlan(a).palettes;
    for (let i = 0; i < p.length; i++)
      for (let j = i + 1; j < p.length; j++) {
        const d = p[i].colours.reduce((s, c, k) => s + Math.hypot(...[0, 2, 4].map((o) => parseInt(c.hex.slice(1 + o, 3 + o), 16) - parseInt(p[j].colours[k].hex.slice(1 + o, 3 + o), 16))), 0) / 5;
        assert.ok(d >= 50, `${p[i].palette.name} ~ ${p[j].palette.name}`);
      }
  }
});

test("a dark floor never gets a dark-walled palette, and dark doors get echoed", () => {
  const p = buildHomePlan(fx({ floor: { id: "dark-stone" }, doors: { id: "walnut" } }));
  for (const x of p.palettes) assert.ok(!["Charcoal & Bronze"].includes(x.palette.name));
  assert.ok(p.palettes.some((x) => x.why.includes("Its wood tone echoes your doors")));
});

test("renters' fixed walls show in the preview unless they can repaint", () => {
  const exact = fx({ walls: { id: "coloured", hex: "#C9D8C5" } });
  assert.equal(buildHomePlan(exact).palettes[0].room[0], "#C9D8C5");
  assert.ok(buildHomePlan(exact).rooms[0].colourUse.includes("walls stay as they are"));
  const p = buildHomePlan({ ...exact, repaint: true });
  assert.equal(p.palettes[0].room[0], p.palettes[0].colours[0].hex);
});

test("owners who haven't decided get finishes, and the kitchen follows the counter", () => {
  const own = buildHomePlan({ ...base, tenure: "own", cooking: "daily", fixtures: { floor: { id: "undecided" }, doors: { id: "undecided" }, walls: { id: "undecided" }, counter: { id: "undecided" }, cabinets: { id: "undecided" } } });
  assert.deepEqual(own.finishes.map((f) => f.label), ["Floor", "Doors", "Walls", "Kitchen cabinets", "Kitchen counter"]);
  assert.equal(own.kitchen.fridge.name, "Black or graphite finish"); // daily cooking → black granite suggested
  assert.equal(buildHomePlan(fx({ counter: { id: "light-stone" } })).kitchen.fridge.name === "Black or graphite finish", false);
  assert.equal(buildHomePlan(base).finishes.length, 0);
});

test("the modular kitchen colour steers the fridge and the kitchen advice", () => {
  const dark = buildHomePlan(fx({ cabinets: { id: "dark" }, counter: { id: "light-stone" } }));
  assert.equal(dark.kitchen.fridge.name, "Black or graphite finish");
  assert.ok(dark.fixtureNotes.some((n) => n.includes("under-cabinet LED")));
  const white = buildHomePlan(fx({ cabinets: { id: "white" } }));
  assert.equal(white.kitchen.fridge.name, "White or silver");
  assert.match(white.rooms[1].colourUse, /Your white cabinets stay/);
  assert.match(buildHomePlan(fx({ cabinets: { id: "none" } })).rooms[1].colourUse, /No cabinets/);
});

test("empty answers never throw", () => {
  assert.equal(buildHomePlan(EMPTY_ANSWERS).palettes.length, 5);
});
