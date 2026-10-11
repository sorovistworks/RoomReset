"use client";

import { useState } from "react";

const BASE = [
  { id: "textiles", label: "Textiles", detail: "Rug, curtains, bedding, cushions", share: 30 },
  { id: "furniture", label: "Furniture & storage", detail: "One key piece, smart storage", share: 25 },
  { id: "lighting", label: "Lighting", detail: "Floor & table lamps, warm bulbs", share: 20 },
  { id: "decor", label: "Art & décor", detail: "Prints, mirror, ceramics", share: 15 },
  { id: "finishing", label: "Plants & finishing", detail: "Greenery, baskets, hardware", share: 10 },
];

const FOCUS = [
  { id: "textiles", label: "Make it cozier" },
  { id: "lighting", label: "Better lighting" },
  { id: "furniture", label: "More useful storage" },
];

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

// Moves 10 points to the focus area, taken proportionally from everything else.
export function allocate(budget: number, focus: string) {
  const rest = BASE.filter((b) => b.id !== focus).reduce((s, b) => s + b.share, 0);
  return BASE.map((b) => {
    const share = b.id === focus ? b.share + 10 : b.share - (10 * b.share) / rest;
    return { ...b, share, amount: Math.round((budget * share) / 100 / 100) * 100 };
  });
}

export function BudgetPlanner() {
  const [budget, setBudget] = useState(10000);
  const [focus, setFocus] = useState("textiles");
  const rows = allocate(budget, focus);

  return (
    <div className="grid gap-10 rounded-[2rem] border border-line bg-paper p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <label htmlFor="budget-amount" className="eyebrow">
          Your total budget
        </label>
        <p className="mt-3 font-serif text-5xl tabular-nums">{inr.format(budget)}</p>
        <input
          id="budget-amount"
          type="range"
          min={5000}
          max={150000}
          step={5000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          aria-valuetext={inr.format(budget)}
          className="rr-range mt-4 w-full"
        />
        <div className="flex justify-between text-xs text-ink-soft">
          <span>{inr.format(5000)}</span>
          <span>{inr.format(150000)}</span>
        </div>
        <fieldset className="mt-8">
          <legend className="eyebrow">Your priority</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {FOCUS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={focus === f.id}
                onClick={() => setFocus(f.id)}
                className={`min-h-11 rounded-full border px-4 text-sm transition ${focus === f.id ? "border-ink bg-ink text-ivory" : "border-line hover:border-ink/40"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="mt-8 text-xs leading-relaxed text-ink-soft">
          A simple guide based on common rental-makeover priorities. Personalised, room-specific budget plans arrive with AI makeovers.
        </p>
      </div>
      <ul className="space-y-5" aria-live="polite">
        {rows.map((r) => (
          <li key={r.id}>
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="font-medium">{r.label}</p>
                <p className="text-xs text-ink-soft">{r.detail}</p>
              </div>
              <p className="font-serif text-2xl tabular-nums">{inr.format(r.amount)}</p>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-sand">
              <div className="h-1.5 rounded-full bg-clay transition-[width] duration-500" style={{ width: `${r.share}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
