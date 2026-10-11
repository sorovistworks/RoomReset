import Link from "next/link";
import { ArrowRight, Banknote, KeyRound, ListChecks, ShoppingBag, SlidersHorizontal, Sparkle } from "lucide-react";
import { ButtonLink, ComingSoon, Eyebrow, Photo, SectionHeading, SwatchStrip } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";
import { PHOTOS } from "@/lib/photos";
import { buildProfile } from "@/lib/taste-engine";
import { byId, STYLES, type Answers } from "@/lib/taste-data";

// Real engine output for three sample answer sets, rendered at build time.
const EXAMPLES: Answers[] = [
  { styles: ["warm-minimalist", "japandi"], moods: ["calm", "cozy"], palettes: ["warm-earthy"], avoidColours: [], boldness: 2, materials: ["linen", "wood", "ceramics"], dislikes: ["clutter"], statement: "quiet" },
  { styles: ["moody-contemporary", "modern-classic"], moods: ["luxurious"], palettes: ["moody-elegant"], avoidColours: [], boldness: 4, materials: ["velvet", "metal", "stone"], dislikes: [], statement: "elegant" },
  { styles: ["mediterranean", "bohemian"], moods: ["energised", "romantic"], palettes: ["warm-earthy", "playful-creative"], avoidColours: ["grey"], boldness: 4, materials: ["rattan", "ceramics", "linen"], dislikes: ["cold"], statement: "warm" },
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
  const examples = EXAMPLES.map((a) => buildProfile(a));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="wrap grid items-center gap-14 pb-20 pt-10 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-20">
          <div className="lg:col-span-6">
            <Eyebrow className="rise">Personal interior design · for people who rent</Eyebrow>
            <h1 className="display rise mt-6 text-[clamp(3rem,8.5vw,6.4rem)]" style={{ animationDelay: "80ms" }}>
              Your room. Your taste. <em className="text-clay">A whole new feeling.</em>
            </h1>
            <p className="rise mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ink-soft sm:mt-7 sm:text-lg" style={{ animationDelay: "180ms" }}>
              Discover your unique interior style. Soon, you&apos;ll be able to transform your rented room into a space that feels completely you — without
              expensive renovations.
            </p>
            <div className="rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: "260ms" }}>
              <ButtonLink href="/discover">
                Discover my taste <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/coming-soon" variant="secondary">
                See what&apos;s coming
              </ButtonLink>
            </div>
            <p className="rise mt-6 text-sm text-ink-soft" style={{ animationDelay: "340ms" }}>
              Free · 8 visual questions · about 3 minutes · no sign-up needed
            </p>
          </div>

          <div className="relative lg:col-span-6">
            <div className="settle relative mx-auto max-w-[34rem]">
              <Photo
                photo={PHOTOS.hero}
                preload
                sizes="(min-width: 1024px) 34rem, 92vw"
                className="aspect-[4/5] rounded-t-full rounded-b-[2rem]"
              />
              <Photo
                photo={PHOTOS.heroDetail}
                sizes="(min-width: 640px) 14rem, 40vw"
                className="absolute -bottom-8 -left-4 aspect-square w-[38%] rounded-[1.5rem] border-[6px] border-ivory sm:-left-10"
              />
              <div className="absolute -right-2 bottom-10 w-56 rounded-2xl border border-line bg-paper/95 p-4 shadow-[0_24px_60px_-24px_rgba(38,35,31,0.35)] sm:-right-8">
                <p className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-ink-soft">Example Taste DNA</p>
                <p className="mt-1.5 font-serif text-xl leading-tight">{examples[0].title}</p>
                <SwatchStrip className="mt-3 h-6" colours={[...examples[0].palette.main, ...examples[0].palette.accents].map((s) => s.hex)} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Style ribbon */}
      <div className="border-y border-line bg-sand/50">
        <p className="wrap flex flex-wrap justify-center gap-x-9 gap-y-2 py-6 text-center font-serif text-lg italic text-ink-soft sm:text-xl">
          {STYLES.map((s) => (
            <span key={s.id}>{s.name}</span>
          ))}
        </p>
      </div>

      {/* How it works */}
      <section className="wrap py-24 sm:py-32" aria-labelledby="how">
        <SectionHeading eyebrow="How RoomReset works" title={<span id="how">From instinct to a room that feels like you.</span>} />
        <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
          {[
            { n: "01", t: "Discover Your Taste", b: "Choose interiors, colours, textures and moods that naturally appeal to you." },
            { n: "02", t: "Meet Your Taste DNA", b: "Discover your personal aesthetic identity and a professionally balanced palette." },
            { n: "03", t: "Transform Your Room", b: "Upload your room, receive a personalised makeover, and shop the look.", soon: true },
          ].map((s) => (
            <li key={s.n} className="flex flex-col bg-paper p-8 sm:p-10">
              <span className="font-serif text-6xl text-clay/80">{s.n}</span>
              <h3 className="mt-8 font-serif text-3xl">{s.t}</h3>
              <p className="mt-3 leading-relaxed text-ink-soft">{s.b}</p>
              {s.soon ? <ComingSoon className="mt-6 self-start" /> : <span className="mt-6 text-xs uppercase tracking-[0.16em] text-olive">Available now</span>}
            </li>
          ))}
        </ol>
      </section>

      {/* Taste DNA feature */}
      <section className="bg-paper py-24 sm:py-32" aria-labelledby="dna">
        <div className="wrap grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow="Taste DNA" title={<span id="dna">Your personal taste is more than a style label.</span>}>
              <p>
                Most quizzes put you in a box. RoomReset reads what you actually respond to — the rooms you linger on, how you want to feel, the colours and
                textures you reach for, and just as importantly, what you can&apos;t stand.
              </p>
              <p className="mt-4">Then we balance it with professional design principles, so your palette works on real walls, not just on screen.</p>
            </SectionHeading>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-8 text-sm">
              {[
                ["Visual instinct", "The interiors you're drawn to"],
                ["Emotional tone", "How your room should feel"],
                ["Colour & contrast", "A coherent, readable palette"],
                ["Texture & limits", "Materials you love, things you don't"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-medium">{k}</dt>
                  <dd className="mt-1 text-ink-soft">{v}</dd>
                </div>
              ))}
            </dl>
            <ButtonLink href="/discover" className="mt-10">
              Find my Taste DNA <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
          <div className="space-y-6 lg:col-span-7">
            <p className="eyebrow">Three example profiles, generated by the Taste DNA engine</p>
            {examples.map((p, i) => {
              const style = byId(STYLES, p.primaryStyle);
              return (
                <article key={p.title} className="grid overflow-hidden rounded-3xl border border-line bg-ivory sm:grid-cols-[0.9fr_1.1fr]">
                  <Photo photo={style.photo} sizes="(min-width: 640px) 22rem, 100vw" className={`aspect-[4/3] sm:aspect-auto sm:min-h-72 ${i % 2 ? "sm:order-2" : ""}`} />
                  <div className="flex flex-col p-7 sm:p-9">
                    <p className="eyebrow">Example {i + 1}</p>
                    <h3 className="display mt-3 text-[2.1rem]">{p.title}</h3>
                    <p className="mt-1 text-sm text-ink-soft">{p.styleBlend}</p>
                    <div className="mt-6 flex gap-2">
                      {[...p.palette.main, ...p.palette.accents].map((s) => (
                        <span key={s.hex} title={`${s.name} ${s.hex}`} className="h-12 flex-1 rounded-lg border border-black/5" style={{ background: s.hex }} />
                      ))}
                    </div>
                    <p className="mt-6 text-sm leading-relaxed text-ink-soft">{p.roomFeeling.summary}</p>
                    <ul className="mt-auto flex flex-wrap gap-2 pt-6 text-xs">
                      {[p.boldnessLabel, `${p.contrast.label} contrast`, p.density.label].map((t) => (
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
          <SectionHeading eyebrow="The future of RoomReset" title={<span id="future">Imagine your room, reset.</span>}>
            <p>Soon you&apos;ll see your own space reimagined in your Taste DNA — layered, warm and entirely rental-friendly.</p>
          </SectionHeading>
          <p className="max-w-xs text-xs leading-relaxed text-ink-soft md:text-right">
            Inspiration imagery for illustration only. These are not transformations created by RoomReset.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-5">
          {[
            { p: PHOTOS.bedroomStone, label: "Stone & linen bedroom", cls: "col-span-2 md:col-span-7 aspect-[4/3] md:aspect-auto md:row-span-2" },
            { p: PHOTOS.livingNeutral, label: "Natural living room", cls: "md:col-span-5 aspect-[4/5] md:aspect-[16/10]" },
            { p: PHOTOS.diningSunlit, label: "Sunlit dining corner", cls: "md:col-span-5 aspect-[4/5] md:aspect-[16/10]" },
          ].map(({ p, label, cls }) => (
            <figure key={label} className={`group relative overflow-hidden rounded-[1.75rem] ${cls}`}>
              <Photo photo={p} sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0" imgClassName="transition-transform duration-[1.6s] ease-out group-hover:scale-[1.03]" />
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
                Everything you need to reset your room — coming soon.
              </h2>
            </div>
            <ButtonLink href="/coming-soon" variant="light" className="self-start md:self-auto">
              Preview what&apos;s coming <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
          <ul className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-ivory/10 bg-ivory/10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="bg-ink p-8 sm:p-10">
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
            <SectionHeading eyebrow="Early access" title={<span id="ea">Be among the first to see your room transformed.</span>}>
              <p>Join the early-access list and we&apos;ll let you know the moment AI makeovers are ready to try.</p>
            </SectionHeading>
            <ul className="mt-10 space-y-4 text-[0.95rem]">
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
          <div className="rounded-[2rem] border border-line bg-paper p-7 sm:p-10">
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
