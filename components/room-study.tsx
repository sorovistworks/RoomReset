import { Eyebrow } from "./ui";

const CHANGES = [
  { n: 1, x: 19, y: 12, before: "One harsh light", after: "A softer evening light", detail: "A plug-in lamp adds a warm pool of light. The existing tube light stays for tasks.", label: "Lighting" },
  { n: 2, x: 66, y: 63, before: "Prints competing", after: "One connected palette", detail: "Cotton bedding and curtains share terracotta tones. There is still room for a block print.", label: "Textiles" },
  { n: 3, x: 21, y: 69, before: "Chair doing laundry duty", after: "A seat you can use", detail: "Put away the laundry and free up the chair. Keep the desk, chair and bed you already have.", label: "Everyday clutter" },
  { n: 4, x: 70, y: 20, before: "Loose boxes on top", after: "Storage with a home", detail: "Closed fabric boxes group the odds and ends. Keep the almirah doors and walking route clear.", label: "Storage" },
] as const;

// Pre-compressed local assets: no external image host, image API or client JS needed.
export function RoomImage({ state, sizes, preload = false }: { state: "before" | "after"; sizes: string; preload?: boolean }) {
  return (
    <picture>
      <source type="image/webp" srcSet={`/images/rental-${state}-640.webp 640w, /images/rental-${state}-1280.webp 1280w`} sizes={sizes} />
      {/* Native picture keeps the existing Unsplash custom loader out of local assets. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/images/rental-${state}-1280.webp`} width={1280} height={853}
        alt={state === "before"
          ? "AI concept of a lived-in Indian rental bedroom: tiled floor, ceiling fan, barred window, steel almirah, floral bedding, desk and plastic chair with laundry."
          : "AI styling concept of the same room, keeping its furniture and tiled floor, with coordinated terracotta cotton prints, a warm desk lamp and organized storage."}
        loading={preload ? "eager" : "lazy"} fetchPriority={preload ? "high" : "auto"} decoding="async" className="block aspect-[3/2] h-auto w-full object-cover" />
    </picture>
  );
}

export function RoomStudy() {
  return (
    <section id="room-study" className="scroll-mt-24 border-y border-line bg-paper py-14 sm:py-20" aria-labelledby="room-heading">
      <div className="wrap">
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Eyebrow>A rental room, reconsidered</Eyebrow>
            <h2 id="room-heading" className="display mt-4 text-4xl sm:text-5xl">Small changes.<br /><em className="text-clay">A different feeling.</em></h2>
            <p className="mt-5 max-w-xl leading-relaxed text-ink-soft">One plausible Indian rental bedroom. The furniture isn&apos;t the problem; lighting, clashing textiles and everyday clutter are things we can work on.</p>
          </div>
          <p className="max-w-64 text-xs leading-relaxed text-ink-soft">Both images are AI-generated concepts, not customer photos or a live RoomReset makeover.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-6">
          {(["before", "after"] as const).map((state) => (
            <figure key={state}>
              <figcaption className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-serif text-2xl">{state === "before" ? "Before · everyday rental" : "After · a possible reset"}</h3>
                <span className="text-xs text-ink-soft">Styling concept</span>
              </figcaption>
              <div className="relative overflow-hidden rounded-2xl">
                <RoomImage state={state} sizes="(min-width: 1024px) 50vw, 100vw" />
                {CHANGES.map((change) => (
                  <span key={change.n} aria-hidden="true" className={`room-pin ${state === "after" ? "room-pin-after" : ""}`} style={{ left: `${state === "after" && change.n === 1 ? 18 : change.x}%`, top: `${state === "after" && change.n === 1 ? 46 : change.y}%` }}>
                    <span className="room-pin-number">{change.n}</span>
                    <span className="room-pin-label">{state === "before" ? change.before : change.after}</span>
                  </span>
                ))}
              </div>
              <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CHANGES.map((change) => (
                  <li key={change.n} className="flex items-start gap-2.5 text-sm leading-snug">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line text-xs" aria-hidden>{change.n}</span>
                    <span><span className="sr-only">Point {change.n}: </span>{state === "before" ? change.before : change.after}</span>
                  </li>
                ))}
              </ol>
            </figure>
          ))}
        </div>
        <div className="mt-9 border-t border-line pt-7">
          <p className="text-sm font-medium">Same layout. Same tiles, fan, window, bed, desk, chair and almirah. No painting or drilling.</p>
          <details className="mt-4 group">
            <summary className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm text-clay underline underline-offset-4">What changed, and why <span aria-hidden className="group-open:rotate-45">+</span></summary>
            <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {CHANGES.map((change) => <li key={change.n}><p className="text-sm font-medium">{change.n} · {change.label}</p><p className="mt-2 text-sm leading-relaxed text-ink-soft">{change.detail}</p></li>)}
            </ul>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-ink-soft">The calendar and visible electrical conduit stay, too. This is a styling direction, not a costed shopping list. Check sizes, storage space and your rental rules before buying.</p>
          </details>
        </div>
      </div>
    </section>
  );
}
