// Fails when a Tailwind class has a shorter canonical spelling — the same check as the editor's
// "suggestCanonicalClasses" warning (e.g. `aspect-[4/3]` → `aspect-4/3`). Run with `--fix` to rewrite them.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { __unstable__loadDesignSystem } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";

const root = process.cwd();
const fix = process.argv.includes("--fix");
const cssFile = path.join(root, "app/globals.css");

const ds = await __unstable__loadDesignSystem(readFileSync(cssFile, "utf8"), { base: path.dirname(cssFile) });
const scanner = new Scanner({ sources: [{ base: root, pattern: "{app,components,lib}/**/*.{ts,tsx}", negated: false }] });
scanner.scan();

let total = 0;
for (const file of scanner.files.sort()) {
  let content = readFileSync(file, "utf8");
  const hits = scanner
    .getCandidatesWithPositions({ content, extension: path.extname(file).slice(1) })
    // Positions are character offsets; skip any that don't point at the candidate so --fix can never corrupt a file.
    .filter(({ candidate, position }) => content.startsWith(candidate, position) && ds.parseCandidate(candidate).length > 0)
    .map(({ candidate, position }) => ({ candidate, position, canonical: ds.canonicalizeCandidates([candidate], { rem: 16 })[0] }))
    .filter(({ candidate, canonical }) => canonical && canonical !== candidate)
    // The scanner can report the same span twice; keep one hit per position.
    .filter((h, i, all) => all.findIndex((o) => o.position === h.position) === i);
  if (!hits.length) continue;

  total += hits.length;
  const rel = path.relative(root, file).replaceAll("\\", "/");
  for (const { candidate, canonical, position } of hits) {
    console.log(`${rel}:${content.slice(0, position).split("\n").length}  ${candidate}  →  ${canonical}`);
  }
  if (fix) {
    for (const { candidate, canonical, position } of [...hits].sort((a, b) => b.position - a.position)) {
      content = content.slice(0, position) + canonical + content.slice(position + candidate.length);
    }
    writeFileSync(file, content);
  }
}

if (total && !fix) {
  console.error(`\n${total} Tailwind class(es) have a canonical form. Run \`npm run lint:classes -- --fix\` to rewrite them.`);
  process.exit(1);
}
console.log(total ? `Rewrote ${total} class(es).` : "Tailwind classes are canonical.");
