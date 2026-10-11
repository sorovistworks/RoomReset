import Link from "next/link";
import { ArrowRight, Banknote, KeyRound, ListChecks, ShoppingBag, SlidersHorizontal, Sparkle } from "lucide-react";
import { buttonClass, ButtonLink, ComingSoon, Eyebrow, MiniRoom, Photo, SectionHeading, SplitWords, SwatchStrip } from "@/components/ui";
import { HomeMotion } from "@/components/home-motion";
import { WaitlistForm } from "@/components/waitlist-form";
import { PHOTOS } from "@/lib/photos";
import { buildHomePlan } from "@/lib/home-plan";
import { NONE, type Answers } from "@/lib/taste-data";

// Real engine output for three sample households, rendered at build time.
const EXAMPLES: Answers[] = [
  { styles: ["warm-minimalist", "japandi"], moods: ["calm", "cozy"], avoidColours: [], boldness: 2, materials: ["linen", "wood", "ceramics"], tenure: "rent", home: "1bhk", vastu: false, climate: "mild", household: [], work: "hybrid", cooking: "light", help: "none", budget: "tight", fixtures: { floor: { id: "white-tiles" }, doors: { id: "white" }, walls: { id: "white" }, counter: { id: "black-granite" }, cabinets: { id: NONE } }, repaint: false },
  { styles: ["moody-contemporary", "modern-classic"], moods: ["luxurious"], avoidColours: [], boldness: 4, materials: ["velvet", "metal", "stone"], tenure: "own", home: "3bhk", vastu: true, climate: "north", household: ["partner", "kids"], work: "long", cooking: "daily", help: "maid", budget: "high", fixtures: { floor: { id: "undecided" }, doors: { id: "walnut" }, walls: { id: "undecided" }, counter: { id: "undecided" }, cabinets: { id: "undecided" } }, repaint: false },
  { styles: ["mediterranean", "bohemian"], moods: ["energised", "romantic"], avoidColours: ["grey"], boldness: 4, materials: ["rattan", "ceramics", "linen"], tenure: "rent", home: "2bhk", vastu: false, climate: "humid", household: ["partner", "pets"], work: "office", cooking: "daily", help: "none", budget: "mid", fixtures: { floor: { id: "grey-tiles" }, doors: { id: "teak" }, walls: { id: "off-white" }, counter: { id: "black-granite" }, cabinets: { id: "wood" } }, repaint: true },
];

const FEATURES = [
  { icon: Sparkle, title: "AI Room Makeovers", body: "Upload a photo of your room and see it reimagined in your Taste DNA." },
  { icon: Banknote, title: "Budget-Aware Design Plans", body: "Set a budget and get a plan that spends it where it matters most." },
  { icon: KeyRound, title: "Rental-Friendly Transformations", body: "No drilling, no repainting, no lost deposit — changes you can take with you." },
  { icon: ShoppingBag, title: "Shop the Look", body: "Pieces matched to your palette, materials and room — in one place." },
  { icon: SlidersHorizontal, title: "Personal Design Refinements", body: "Make it cozier, calmer or bolder until it feels exactly right." },
  { icon: ListChecks, title: "Room Makeover Guides", body: "A step-by-step plan for bringing your design to life, weekend by weekend." },
];

export default function Home() {
  const examples = EXAMPLES.map((a) => buildHomePlan(a));

  return (
    <>
      <HomeMotion />
      <noscript dangerouslySetInnerHTML={{ __html: "<style>[data-intro]{animation:none!important}</style>" }} />
      {/* Hero */}
      <section data-hero className="relative overflow-hidden">
        <div className="wrap grid items-center gap-14 pb-20 pt-10 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-12">
          <div className="lg:col-span-6">
            <Eyebrow className="rise">Personal interior plan · for new Indian homes</Eyebrow>
            {/* Sized by width and height so the CTAs stay in the first view on short laptop screens; three set lines on desktop. */}
            <h1 className="display mt-6 text-[clamp(3rem,min(8.5vw,11svh),5.6rem)]">
              <span className="font-[460]">
                <SplitWords text="Your room." /> <br className="hidden lg:inline" />
                <SplitWords text="Your taste." start={2} />
              </span>{" "}
              <em className="font-[260] text-clay lg:block">
                <SplitWords text={"A whole new feeling."} start={4} />
              </em>
            </h1>
            <p className="rise mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ink-soft sm:mt-7 sm:text-lg lg:mt-6" style={{ animationDelay: "180ms" }}>
              Moving into an unfurnished flat? Get your top colour palettes, what to buy and what to skip, and a room-by-room plan built around your
              routine — rented or owned.
            </p>
            <div className="rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-8" style={{ animationDelay: "260ms" }}>
              <ButtonLink href="/discover">
                Discover my taste <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/coming-soon" variant="secondary">
                See what&apos;s coming
              </ButtonLink>
            </div>
            <p className="rise mt-6 text-sm text-ink-soft" style={{ animationDelay: "340ms" }}>
              Free · 13 quick questions · about 4 minutes · no sign-up needed
            </p>
          </div>

          <div className="relative lg:col-span-6">
            <div className="relative mx-auto max-w-[min(34rem,58svh)]">
              <div data-arch data-depth="0.6">
                <Photo
                  photo={PHOTOS.hero}
                  preload
                  sizes="(min-width: 1024px) 34rem, 92vw"
                  className="aspect-4/5 rounded-t-full rounded-b-4xl"
                />
              </div>
              <div data-intro data-detail data-depth="1.4" className="absolute -bottom-8 -left-4 w-[38%] sm:-left-10">
                <Photo
                  photo={PHOTOS.heroDetail}
                  sizes="(min-width: 640px) 14rem, 40vw"
                  className="aspect-square rounded-3xl border-[6px] border-ivory"
                />
              </div>
              <div data-intro data-card data-depth="-0.8" className="absolute -right-2 bottom-10 w-56 rounded-2xl border border-line bg-paper/95 p-4 shadow-[0_24px_60px_-24px_rgba(38,35,31,0.35)] sm:-right-8">
                <p className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-ink-soft">Example top palette</p>
                <p className="mt-1.5 font-serif text-xl leading-tight">{examples[0].palettes[0].palette.name}</p>
                <SwatchStrip className="swatches mt-3 h-6" colours={examples[0].palettes[0].colours.map((c) => c.hex)} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Style ribbon */}
      <div className="border-y border-line bg-sand/50">
        <p className="wrap flex flex-wrap justify-center gap-x-9 gap-y-2 py-6 text-center font-serif text-lg italic text-ink-soft sm:text-xl">
          {["Top 5 palettes", "Buy now · later · skip", "Material priorities", "Dos & don’ts", "Chores to delegate", "Move-in plan"].map((s) => (
            <span key={s}>{s}</span>
          ))}
        </p>
      </div>

      {/* How it works */}
      <section className="wrap py-24 sm:py-32" aria-labelledby="how">
        <SectionHeading eyebrow="How RoomReset works" title={<span id="how"><SplitWords text="From instinct to a room that feels like you." /></span>} />
        <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
          {[
            { n: "01", t: "Share Your Taste & Routine", b: "Pick rooms, feelings and textures you love, then tell us about your home, weather and week.", cta: ["/discover", "Start the quiz"] },
            { n: "02", t: "Get Your Home Plan", b: "Palettes, what to buy or skip, materials and chores to hand over — for every room.", cta: ["#dna", "See example plans"] },
            { n: "03", t: "Transform Your Room", b: "Upload your room, receive a personalised makeover, and shop the look.", cta: ["#early-access", "Join early access"], soon: true },
          ].map((s) => (
            <li key={s.n} data-reveal className="flex flex-col bg-paper p-8 sm:p-10">
              <span className="font-serif text-6xl text-clay/80">{s.n}</span>
              <h3 className="mt-8 font-serif text-3xl">{s.t}</h3>
              <p className="mt-3 leading-relaxed text-ink-soft">{s.b}</p>
              {s.soon ? <ComingSoon className="mt-6 self-start" /> : <span className="mt-6 text-xs uppercase tracking-[0.16em] text-olive">Available now</span>}
              <div className="mt-auto pt-8">
                {/* In-page hashes stay plain <a> so Lenis scrolls them; page links go through Link for basePath. */}
                {s.cta[0].startsWith("#") ? (
                  <a href={s.cta[0]} className={buttonClass("secondary", "min-h-11 px-5")}>
                    {s.cta[1]} <ArrowRight className="size-4" aria-hidden />
                  </a>
                ) : (
                  <ButtonLink href={s.cta[0]} variant="secondary" className="min-h-11 px-5">
                    {s.cta[1]} <ArrowRight className="size-4" aria-hidden />
                  </ButtonLink>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Taste DNA feature */}
      <section className="bg-paper py-24 sm:py-32" aria-labelledby="dna">
        <div className="wrap grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow="Your home plan" title={<span id="dna"><SplitWords text="Not a style label — a plan for how you live." /></span>}>
              <p>
                Most quizzes put you in a box. RoomReset reads what you respond to — the rooms you linger on, how you want to feel, the textures you reach
                for — and pairs it with how you actually live: your home, your weather, your work hours and your kitchen.
              </p>
              <p className="mt-4">So a renter in humid Mumbai and an owner facing Delhi winters get very different advice.</p>
            </SectionHeading>
            <dl data-reveal className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-8 text-sm">
              {[
                ["Visual instinct", "Rooms, colours and textures you love"],
                ["Your home", "Rented or owned, size and weather"],
                ["Your routine", "Work hours, cooking and help at home"],
                ["Your budget", "Split sensibly across rooms"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-medium">{k}</dt>
                  <dd className="mt-1 text-ink-soft">{v}</dd>
                </div>
              ))}
            </dl>
            <ButtonLink data-reveal href="/discover" className="mt-10">
              Plan my home <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
          <div className="space-y-6 lg:col-span-7">
            <p data-reveal className="eyebrow">Three example households, planned by the RoomReset engine</p>
            {examples.map((p, i) => {
              const top = p.palettes[0];
              return (
                <article key={i} data-reveal className="grid overflow-hidden rounded-3xl border border-line bg-ivory sm:grid-cols-[0.9fr_1.1fr]">
                  <MiniRoom colours={top.room} className={`aspect-4/3 sm:aspect-auto sm:min-h-72 ${i % 2 ? "sm:order-2" : ""}`} />
                  <div className="flex flex-col p-7 sm:p-9">
                    <p className="eyebrow">Example {i + 1}</p>
                    <p className="mt-3 text-sm text-ink-soft">{p.summary.join(" · ")}</p>
                    <h3 className="display mt-3 text-[2.1rem]">{top.palette.name}</h3>
                    <div className="mt-5 flex gap-2">
                      {top.colours.map((c) => (
                        <span key={c.hex} title={`${c.name} ${c.hex}`} className="h-12 flex-1 rounded-lg border border-black/5" style={{ background: c.hex }} />
                      ))}
                    </div>
                    <p className="mt-6 text-sm leading-relaxed text-ink-soft">
                      <span className="text-ink">Kitchen, buy now:</span> {p.rooms[1].buy.now.slice(0, 4).map((x) => x.name).join(", ")}
                    </p>
                    <ul className="mt-auto flex flex-wrap gap-2 pt-6 text-xs">
                      {[`${p.hoursFreed} h/week freed`, `Skip: ${p.rooms.flatMap((r) => r.buy.skip)[0]?.name ?? "nothing"}`].map((t) => (
                        <li key={t} className="rounded-full border border-line px-3 py-1.5 text-ink-soft">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Inspiration showcase */}
      <section className="wrap py-24 sm:py-32" aria-labelledby="future">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="The future of RoomReset" title={<span id="future"><SplitWords text="Imagine your room, reset." /></span>}>
            <p>Soon you&apos;ll see your own space reimagined in your Taste DNA — layered, warm and entirely rental-friendly.</p>
          </SectionHeading>
          <p data-reveal className="max-w-xs text-xs leading-relaxed text-ink-soft md:text-right">
            Inspiration imagery for illustration only. These are not transformations created by RoomReset.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-5">
          {[
            { p: PHOTOS.bedroomStone, label: "Stone & linen bedroom", cls: "col-span-2 md:col-span-7 aspect-4/3 md:aspect-auto md:row-span-2" },
            { p: PHOTOS.livingNeutral, label: "Natural living room", cls: "md:col-span-5 aspect-4/5 md:aspect-16/10" },
            { p: PHOTOS.diningSunlit, label: "Sunlit dining corner", cls: "md:col-span-5 aspect-4/5 md:aspect-16/10" },
          ].map(({ p, label, cls }) => (
            <figure key={label} data-reveal className={`group relative overflow-hidden rounded-[1.75rem] ${cls}`}>
              <Photo photo={p} sizes="(min-width: 768px) 50vw, 100vw" className="parallax absolute inset-x-0 inset-y-[-8%]" imgClassName="transition-transform duration-[1.6s] ease-out group-hover:scale-[1.03]" />
              <figcaption className="absolute bottom-4 left-4 rounded-full bg-paper/90 px-3.5 py-1.5 text-xs">
                <span className="text-ink-soft">Inspiration · </span>
                {label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Coming soon */}
      <section className="bg-ink py-24 text-ivory sm:py-32" aria-labelledby="soon">
        <div className="wrap">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow text-ivory/60!">On the way</p>
              <h2 id="soon" className="display mt-4 text-4xl sm:text-5xl">
                <SplitWords text="Everything you need to reset your room — coming soon." />
              </h2>
            </div>
            <ButtonLink href="/coming-soon" variant="light" className="self-start md:self-auto">
              Preview what&apos;s coming <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
          <ul className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-ivory/10 bg-ivory/10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} data-reveal className="bg-ink p-8 sm:p-10">
                <div className="flex items-start justify-between gap-4">
                  <Icon className="size-6 text-[#d9a184]" strokeWidth={1.4} aria-hidden />
                  <ComingSoon tone="light" />
                </div>
                <h3 className="mt-10 font-serif text-2xl">{title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ivory/70">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Early access */}
      <section id="early-access" className="scroll-mt-20 py-24 sm:py-32" aria-labelledby="ea">
        <div className="wrap grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Early access" title={<span id="ea"><SplitWords text="Be among the first to see your room transformed." /></span>}>
              <p>Join the early-access list and we&apos;ll let you know the moment AI makeovers are ready to try.</p>
            </SectionHeading>
            <ul data-reveal className="mt-10 space-y-4 text-[0.95rem]">
              {[
                "First access to AI room makeovers when they launch",
                "Invites tailored to your Taste DNA",
                "A say in what we build next — just reply to any email",
                "Only occasional updates, and you can unsubscribe at any time",
              ].map((b) => (
                <li key={b} className="flex gap-4">
                  <span aria-hidden className="mt-2.5 h-px w-6 shrink-0 bg-clay" />
                  <span className="text-ink-soft">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal className="rounded-4xl border border-line bg-paper p-7 sm:p-10">
            <p className="font-serif text-2xl">Join early access</p>
            <p className="mb-6 mt-2 text-sm text-ink-soft">
              Haven&apos;t found your style yet?{" "}
              <Link href="/discover" className="text-clay underline underline-offset-4">
                Discover your Taste DNA first
              </Link>{" "}
              — it&apos;s free.
            </p>
            <WaitlistForm />
          </div>
        </div>
      </section>
    </>
  );
}
