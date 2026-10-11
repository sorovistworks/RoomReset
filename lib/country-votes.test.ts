import { test } from "node:test";
import assert from "node:assert/strict";
import { COUNTRY_CODES, guessCountry, summarise } from "./country-votes.ts";

test("country list is the 249 ISO codes, unique", () => {
  assert.equal(COUNTRY_CODES.length, 249);
  assert.equal(new Set(COUNTRY_CODES).size, 249);
});

test("summarise keeps the top countries, buckets the rest and drops unknown codes and India", () => {
  const s = summarise(
    [
      { country: "US", votes: 9 },
      { country: "GB", votes: 4 },
      { country: "AE", votes: 4 },
      { country: "SG", votes: 1 },
      { country: "ZZ", votes: 50 },
      { country: "IN", votes: 7 },
      { country: "FR", votes: 0 },
    ],
    2,
  );
  assert.deepEqual(s.rows, [
    { country: "US", votes: 9 },
    { country: "AE", votes: 4 },
  ]);
  assert.equal(s.others, 5);
  assert.equal(s.total, 18);
  assert.equal(s.countries, 4);
});

test("guessCountry reads the region from browser languages and never suggests India", () => {
  assert.equal(guessCountry(["en-IN", "en-GB", "en"]), "GB");
  assert.equal(guessCountry(["fr", "de-de"]), "DE");
  assert.equal(guessCountry(["en", "hi-IN"]), "");
});
