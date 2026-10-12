import { test } from "node:test";
import assert from "node:assert/strict";
import { buildHomePlan, costRange } from "./home-plan.ts";
import { peopleCount, sanitizeAnswers, COLOURS, BUDGETS, FIXTURES, CLIMATES, COLOUR_FAMILIES, COOKING, EMPTY_ANSWERS, HELPS, HOMES, MATERIALS, MEMBERS, MOODS, STYLES, TENURES, WORKS, type Answers } from "./taste-data.ts";

const base: Answers = {
  styles: ["warm-minimalist", "japandi"],
  moods: ["calm", "cozy"],
  avoidColours: [],
  boldness: 2,
  materials: ["wood", "linen", "ceramics"],
  tenure: "rent",
  home: "2bhk",
  vastu: false,
  balcony: true,
  climate: "mild",
  household: ["partner"],
  people: null,
  guests: null,
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
  // 2BHK, working hybrid: the five core rooms plus the second bedroom as a study.
  assert.deepEqual(p.rooms.map((r) => r.id), ["bedroom", "kitchen", "bathroom", "living", "balcony", "study"]);
  for (const r of p.rooms) {
    assert.ok(r.materials.length >= 3, `${r.id} materials`);
    assert.ok(r.look.length >= 1, `${r.id} look`);
    assert.ok(r.buy.now.length + r.buy.later.length >= 1, `${r.id} has nothing to buy`);
    assert.ok(r.dos.length >= 1 && r.donts.length >= 1, `${r.id} tips`);
  }
  for (const r of p.rooms.slice(0, 5)) assert.ok(r.buy.now.length >= 1, `${r.id} has nothing to buy now`);
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
      balcony: r() > 0.25,
      climate: one(r, CLIMATES),
      household: pickSome(r, MEMBERS.map((m) => m.id), 3),
      people: r() < 0.5 ? null : 1 + Math.floor(r() * 8),
      guests: [null, "never", "sometimes", "often"][Math.floor(r() * 4)] as Answers["guests"],
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
    // Every home's rooms get a look, the budget split always adds up, and nothing lands in a room the home doesn't have.
    assert.equal(p.budget.rooms.reduce((t, r) => t + r.share, 0), 100);
    assert.ok(p.rooms.every((room) => room.look.length >= 1));
    assert.equal(p.rooms.some((room) => room.id === "balcony"), a.balcony);
    // Jute holds damp and snags on claws: humid homes and pet homes are never told to use it.
    if (a.climate === "humid" || a.household.includes("pets")) {
      const advice = [...p.fixtureNotes, ...p.rooms.flatMap((room) => [...room.look, ...room.materials.map((m) => m.name)])].join(" ");
      assert.doesNotMatch(advice, /jute/i, JSON.stringify(a));
    }
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

test("prices parse into rupee ranges", () => {
  assert.deepEqual(costRange("₹18k–45k"), [18000, 45000]);
  assert.deepEqual(costRange("₹60k–1.5L"), [60000, 150000]);
  assert.deepEqual(costRange("₹800–2k"), [800, 2000]);
  assert.deepEqual(costRange("₹3k–6k each"), [3000, 6000]);
  assert.equal(costRange("₹25k+"), null);
});

test("a tight budget never sends owners to big-ticket carpentry or machines first", () => {
  const p = buildHomePlan({ ...base, tenure: "own", budget: "tight", work: "office", help: "none", cooking: "daily" });
  assert.equal(verdictOf(p, "Modular kitchen (BWP ply)"), "later");
  assert.equal(verdictOf(p, "Steel racks and a kitchen trolley"), "now");
  assert.equal(verdictOf(p, "Built-in sliding wardrobe"), "later");
  assert.equal(verdictOf(p, "Freestanding wardrobe"), "now");
  assert.equal(verdictOf(p, "Dishwasher (with kadhai cycle)"), "later");
  assert.equal(p.chores.find((c) => c.task === "Dishes")!.hand, "help");
  assert.equal(p.chores.find((c) => c.task === "Sweeping and mopping")!.hand, "help");
  // A comfortable budget keeps the original advice.
  const mid = buildHomePlan({ ...base, tenure: "own", budget: "mid", work: "office", help: "none", cooking: "daily" });
  assert.equal(verdictOf(mid, "Modular kitchen (BWP ply)"), "now");
  assert.equal(verdictOf(mid, "Freestanding wardrobe"), undefined);
});

test("the budget check adds up the lists and only suggests postponing non-essentials", () => {
  for (const budget of ["tight", "mid", "high", "premium"] as const) {
    for (const tenure of ["rent", "own"] as const) {
      const b = buildHomePlan({ ...base, budget, tenure }).budget;
      assert.ok(b.cost.now[0] > 0 && b.cost.now[0] <= b.cost.now[1], `${budget}/${tenure} now range`);
      assert.equal(b.fit === "fits", b.cost.now[1] <= b.total);
      assert.equal(b.postpone.length > 0, b.fit !== "fits", `${budget}/${tenure} postpone only when it doesn't fit`);
      assert.ok(b.postpone.every((i) => !i.core));
      assert.ok(b.tips.length >= 2, `${budget}/${tenure} tips`);
      assert.equal(new Set(b.tips.map((t) => t.text)).size, b.tips.length);
    }
  }
  const tight = buildHomePlan({ ...base, budget: "tight" }).budget;
  assert.equal(tight.fit, "over");
  assert.ok(!tight.postpone.some((i) => i.name === "Mattress" || i.name === "Refrigerator"));
  // Each band gets its own strategy, not the same list relabelled.
  const tipsFor = (budget: "tight" | "premium", tenure: "rent" | "own") => buildHomePlan({ ...base, budget, tenure }).budget.tips.map((t) => t.text).join();
  assert.notEqual(tipsFor("tight", "own"), tipsFor("premium", "own"));
  assert.notEqual(tipsFor("premium", "rent"), tipsFor("premium", "own"));
});

test("who lives with you sizes the appliances, the table and the chores", () => {
  const plan = (household: Answers["household"]) => buildHomePlan({ ...base, household, home: "3bhk", work: "wfh", help: "none", cooking: "daily", climate: "north" });
  const item = (p: ReturnType<typeof buildHomePlan>, name: string) => p.rooms.flatMap((r) => [...r.buy.now, ...r.buy.later, ...r.buy.skip]).find((i) => i.name === name)!;
  const alone = plan([]), family = plan(["partner", "kids"]), joint = plan(["partner", "kids", "elders"]);
  assert.match(item(alone, "Refrigerator").why, /190–250 L/);
  assert.match(item(family, "Refrigerator").why, /250–350 L/);
  assert.match(item(joint, "Refrigerator").why, /350–500 L/);
  assert.ok(costRange(item(joint, "Refrigerator").cost)![0] > costRange(item(alone, "Refrigerator").cost)![1] - 1);
  assert.match(item(alone, "Washing machine (fully automatic)").why, /^6–7 kg/);
  assert.match(item(joint, "Washing machine (fully automatic)").why, /^8–10 kg/);
  assert.match(item(joint, "Dining table").why, /6-seater/);
  assert.ok(joint.chores.find((c) => c.task === "Laundry")!.hours > alone.chores.find((c) => c.task === "Laundry")!.hours);
  assert.ok(alone.summary.includes("Just you") && plan(["partner"]).summary.includes("2 people") && joint.summary.includes("About 6 people"));
});

test("each household member brings advice of their own", () => {
  const p = (household: Answers["household"]) => buildHomePlan({ ...base, household });
  const names = (plan: ReturnType<typeof buildHomePlan>) => all(plan);
  const text = (plan: ReturnType<typeof buildHomePlan>) => [...plan.rooms.flatMap((r) => [...r.dos, ...r.donts, ...r.buy.now.map((i) => i.why), ...r.buy.later.map((i) => i.why)]), ...plan.checks].join(" ");
  assert.ok(names(p(["kids"])).includes("Socket guards and corner protectors") && !names(p([])).includes("Socket guards and corner protectors"));
  assert.ok(names(p(["elders"])).includes("Raised toilet seat"));
  assert.match(text(p(["elders"])), /lift works/);
  assert.match(text(p(["flatmates"])), /fridge shelf/);
  assert.match(text(p(["flatmates"])), /with a lock/);
  assert.match(text(p(["partner"])), /One on each side/);
  assert.ok(!p(["pets"]).rooms[3].materials.some((m) => m.name === "Jute or sisal rug"));
  // Nobody gets advice for people who don't live with them.
  assert.doesNotMatch(text(p([])), /flatmate|your parents|Queen \(5×6\.5 ft\)|kids are small/);
});

test("the headcount is validated, respects who you picked, and drives the sizes", () => {
  // Untrusted input: only whole numbers from 1 to 12 survive; old saves without it fall back to an estimate.
  for (const bad of [0, -2, 13, 2.5, "4", null]) assert.equal(sanitizeAnswers({ ...base, people: bad }).people, null);
  assert.equal(sanitizeAnswers({ ...base, people: 5 }).people, 5);
  const { people: _drop, ...old } = base;
  assert.equal(sanitizeAnswers(old).people, null);
  // Never fewer people than the household implies; pets aren't people.
  assert.equal(peopleCount({ household: ["partner", "kids"], people: 1 }), 3);
  assert.equal(peopleCount({ household: ["partner", "kids"], people: null }), 4);
  assert.equal(peopleCount({ household: ["pets"], people: null }), 1);
  assert.equal(peopleCount({ household: [], people: 3 }), 3); // relatives the list doesn't name
  // A given count is used as-is and shown without "About".
  const counted = buildHomePlan({ ...base, household: ["partner", "kids"], people: 3 });
  assert.ok(counted.summary.includes("3 people"));
  assert.ok(buildHomePlan({ ...base, household: ["partner", "kids"], people: null }).summary.includes("About 4 people"));
  const big = buildHomePlan({ ...base, household: [], people: 6 });
  const fridge = big.rooms.flatMap((r) => r.buy.now).find((i) => i.name === "Refrigerator")!;
  assert.match(fridge.why, /350–500 L/);
});

test("weekdays, cooking and help each add their own advice, and only when they apply", () => {
  const p = (extra: Partial<Answers>) => buildHomePlan({ ...base, ...extra });
  const text = (plan: ReturnType<typeof buildHomePlan>) =>
    [...plan.rooms.flatMap((r) => [...r.dos, ...r.donts, ...(["now", "later", "skip"] as const).flatMap((v) => r.buy[v].map((i) => `${i.name}: ${i.why}`))]), ...plan.checks, ...plan.chores.map((c) => c.why)].join(" | ");

  // Help: live-in help gets a bed, a place to sleep agreed upfront, and laundry; any help gets police verification.
  const liveIn = p({ help: "full-time" });
  assert.equal(verdictOf(liveIn, "Bed and mattress for live-in help"), "now");
  assert.match(text(liveIn), /where live-in help will sleep/);
  assert.equal(liveIn.chores.find((c) => c.task === "Laundry")!.hand, "help");
  assert.match(text(p({ help: "maid" })), /police-verified/);
  assert.doesNotMatch(text(p({ help: "none" })), /police-verified|live-in|utility cupboard|your cook/);
  assert.match(text(p({ help: "maid-cook" })), /weekly menu/);

  // Cooking: a second cylinder for daily cooks, later for light cooks, never for those who order in.
  assert.equal(verdictOf(p({ cooking: "daily" }), "Second gas cylinder (DBC)"), "now");
  assert.equal(verdictOf(p({ cooking: "light" }), "Second gas cylinder (DBC)"), "later");
  assert.equal(verdictOf(p({ cooking: "rarely" }), "Second gas cylinder (DBC)"), undefined);
  assert.equal(verdictOf(p({ tenure: "own", cooking: "daily", budget: "mid" }), "Modular add-ons (magic corner, tall unit)"), "later");

  // Weekdays: shift workers get sleep advice, home workers get call acoustics and an all-day AC note.
  assert.match(text(p({ work: "long" })), /white-noise/);
  assert.doesNotMatch(text(p({ work: "office" })), /white-noise|echo on calls/);
  assert.match(text(p({ work: "wfh" })), /echo on calls/);
  assert.match(text(p({ work: "hybrid" })), /foldable desk/);
  assert.match(text(p({ tenure: "own", work: "wfh", climate: "north" })), /run it through the workday/);
});

test("the rooms follow the home: one room in a 1RK, no balcony section without one, extra bedrooms for whoever needs them", () => {
  const ids = (extra: Partial<Answers>) => buildHomePlan({ ...base, ...extra }).rooms.map((r) => r.id);
  const oneRoom = buildHomePlan({ ...base, home: "1rk" });
  assert.deepEqual(oneRoom.rooms.map((r) => r.id), ["bedroom", "kitchen", "bathroom", "balcony"]);
  assert.equal(oneRoom.rooms[0].name, "Your room");
  assert.ok(oneRoom.rooms[0].buy.now.some((i) => i.name === "Sofa-cum-bed")); // living-room advice folds in

  const noBalcony = buildHomePlan({ ...base, balcony: false });
  assert.ok(!noBalcony.rooms.some((r) => r.id === "balcony"));
  const bathroom = noBalcony.rooms.find((r) => r.id === "bathroom")!;
  assert.ok(bathroom.buy.now.some((i) => i.name === "Washing machine (fully automatic)"));
  assert.ok(!all(noBalcony).includes("Bird net"));
  assert.notEqual(verdictOf(noBalcony, "Dryer"), "skip");

  assert.deepEqual(ids({ home: "3bhk", household: ["partner", "kids", "elders"] }).slice(5), ["parents", "kids"]);
  assert.deepEqual(ids({ home: "2bhk", household: ["flatmates"] }).slice(5), []); // the second room is theirs
  assert.deepEqual(ids({ home: "2bhk", household: [], work: "office" }).slice(5), ["guest"]);
  assert.deepEqual(ids({ home: "1bhk", household: ["kids"] }).slice(4), ["balcony"]); // no spare room in a 1BHK

  // The parents' bed advice moves to their room when they have one.
  const parents = buildHomePlan({ ...base, home: "3bhk", household: ["partner", "elders"] });
  assert.ok(parents.rooms.find((r) => r.id === "parents")!.buy.now.some((i) => i.name === "Bed for your parents"));
  assert.doesNotMatch(parents.rooms[0].buy.now.find((i) => i.name === "Bed with hydraulic storage")!.why, /parents/);
});

test("taste reaches the furniture: style sets the look, moods and boldness shape the main room, and every texture counts", () => {
  const plan = (extra: Partial<Answers>) => buildHomePlan({ ...base, ...extra });
  const living = (p: ReturnType<typeof buildHomePlan>) => p.rooms.find((r) => r.id === "living")!;
  const japandi = plan({ styles: ["japandi"], moods: ["calm"], boldness: 1 });
  const boho = plan({ styles: ["bohemian"], moods: ["energised"], boldness: 5 });
  for (const id of ["bedroom", "living", "kitchen", "bathroom", "balcony"] as const)
    assert.notEqual(japandi.rooms.find((r) => r.id === id)!.look[0], boho.rooms.find((r) => r.id === id)!.look[0], `${id} look`);
  assert.match(living(japandi).look.join(" "), /Closed storage/);
  assert.match(living(boho).look.join(" "), /Two patterns per room/);
  // Each texture someone loves changes their plan somewhere.
  const materialsOf = (p: ReturnType<typeof buildHomePlan>) => p.rooms.flatMap((r) => r.materials.map((m) => m.name)).join("|");
  for (const m of MATERIALS.map((x) => x.id)) {
    const others = MATERIALS.map((x) => x.id).filter((x) => x !== m).slice(0, 1);
    assert.notEqual(materialsOf(plan({ materials: [m] })), materialsOf(plan({ materials: others })), `${m} changes nothing`);
  }
});

test("filler only appears where it's tempting, and renters aren't sold a solid-wood bed they didn't ask for", () => {
  const plan = (extra: Partial<Answers>) => buildHomePlan({ ...base, ...extra });
  assert.equal(verdictOf(plan({ home: "2bhk" }), "Dressing table"), undefined);
  assert.equal(verdictOf(plan({ home: "1bhk" }), "Dressing table"), "skip");
  assert.equal(verdictOf(plan({ tenure: "rent", budget: "mid" }), "Bathtub"), undefined);
  assert.equal(verdictOf(plan({ tenure: "own", budget: "premium" }), "Bathtub"), "skip");
  assert.equal(verdictOf(plan({ cooking: "daily" }), "Air fryer"), undefined);
  assert.equal(verdictOf(plan({ cooking: "rarely" }), "Air fryer"), "later");
  const bedroomMaterials = (extra: Partial<Answers>) => plan(extra).rooms[0].materials.map((m) => m.name);
  assert.ok(!bedroomMaterials({ tenure: "rent", materials: ["linen"] }).includes("Solid sheesham or mango wood bed"));
  assert.ok(bedroomMaterials({ tenure: "rent", materials: ["wood"] }).includes("Solid sheesham or mango wood bed"));
});

test("how often people stay over decides the guest furniture", () => {
  const plan = (guests: Answers["guests"], extra: Partial<Answers> = {}) => buildHomePlan({ ...base, household: [], work: "office", guests, ...extra });
  // Nobody visits: no sofa-cum-bed, no guest room, no guest beds anywhere.
  for (const home of ["1rk", "1bhk", "2bhk", "3bhk"] as const) {
    const p = plan("never", { home });
    assert.notEqual(verdictOf(p, "Sofa-cum-bed"), "now", home);
    assert.notEqual(verdictOf(p, "Sofa-cum-bed"), "later", home);
    assert.ok(!p.rooms.some((r) => r.id === "guest"), `${home} guest room`);
    assert.ok(!all(p).some((n) => /Folding bed|Guest bed|Daybed/.test(n)), `${home} guest beds`);
  }
  assert.equal(verdictOf(plan("never", { home: "1rk" }), "Sofa"), "later"); // seating off the bed instead
  // Visitors often: buy the sofa-cum-bed now, a proper guest bed, and two more seats at the table.
  assert.equal(verdictOf(plan("often", { home: "1bhk" }), "Sofa-cum-bed"), "now");
  assert.equal(verdictOf(plan("sometimes", { home: "1bhk" }), "Sofa-cum-bed"), "later");
  assert.equal(verdictOf(plan(null, { home: "1bhk" }), "Sofa-cum-bed"), "later"); // unanswered keeps the old advice
  assert.equal(verdictOf(plan("often", { home: "2bhk" }), "Guest bed and mattress"), "now");
  assert.equal(verdictOf(plan("often", { home: "2bhk" }), "Folding bed with mattress"), undefined);
  assert.equal(verdictOf(plan("often", { home: "2bhk", household: ["kids"] }), "Sofa-cum-bed"), "now"); // spare room taken
  const table = (guests: Answers["guests"]) => plan(guests, { home: "2bhk", household: ["partner"], people: 4 }).rooms.flatMap((r) => r.buy.later).find((i) => i.name === "Dining table")!.why;
  assert.match(table("sometimes"), /4-seater/);
  assert.match(table("often"), /6-seater/);
  // Old saves and share links without the answer stay valid.
  assert.equal(sanitizeAnswers({ ...base, guests: "weekly" }).guests, null);
});
