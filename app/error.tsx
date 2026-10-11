"use client";

import { buttonClass, ButtonLink, Eyebrow } from "@/components/ui";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="wrap min-h-[60vh] py-24">
      <Eyebrow>Something went wrong</Eyebrow>
      <h1 className="display mt-5 max-w-2xl text-5xl">Sorry — this page didn&apos;t load properly.</h1>
      <p className="mt-5 max-w-md text-lg text-ink-soft">Your saved Taste DNA is safe in your browser. Try again, or head back home.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className={buttonClass("primary")}>
          Try again
        </button>
        <ButtonLink href="/" variant="secondary">
          Back home
        </ButtonLink>
      </div>
    </section>
  );
}
