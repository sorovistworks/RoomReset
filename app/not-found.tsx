import type { Metadata } from "next";
import { ButtonLink, Eyebrow, Photo } from "@/components/ui";
import { PHOTOS } from "@/lib/photos";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="wrap grid min-h-[70vh] items-center gap-12 py-20 lg:grid-cols-2">
      <div>
        <Eyebrow>404</Eyebrow>
        <h1 className="display mt-5 text-5xl sm:text-6xl">This room doesn&apos;t exist — yet.</h1>
        <p className="mt-5 max-w-md text-lg text-ink-soft">The page you&apos;re looking for has moved or never existed. Let&apos;s get you somewhere lovely.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/">Back home</ButtonLink>
          <ButtonLink href="/discover" variant="secondary">
            Discover my taste
          </ButtonLink>
        </div>
      </div>
      <Photo photo={PHOTOS.emptyRoom} sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-4/3 rounded-4xl" />
    </section>
  );
}
