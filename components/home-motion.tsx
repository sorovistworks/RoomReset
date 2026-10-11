"use client";

import { useEffect } from "react";

// Home-page motion: Lenis smooth scroll driven by GSAP's ticker, a hero intro, and scroll reveals.
// Everything lives inside a reduced-motion media query, so `reduce` users get the static, final page.
// GSAP and Lenis load as a separate chunk after hydration, keeping them off the critical path.
export function HomeMotion() {
  useEffect(() => {
    let mm: { revert(): void } | undefined;
    let cancelled = false;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")]).then(([{ default: gsap }, { ScrollTrigger }, { default: Lenis }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const m = (mm = gsap.matchMedia());

      m.add("(prefers-reduced-motion: no-preference)", () => {
        const lenis = new Lenis({ anchors: { offset: -80 } });
        lenis.on("scroll", ScrollTrigger.update);
        const raf = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);

        // Hero intro. The headline and main photo animate in CSS from first paint (globals.css);
        // GSAP brings in the supporting layers once it has loaded.
        const hero = document.querySelector<HTMLElement>("[data-hero]");
        if (hero) {
          const q = gsap.utils.selector(hero);
          gsap
            .timeline({ defaults: { ease: "expo.out", duration: 1.2 } })
            .from(q("[data-detail]"), { yPercent: 25, autoAlpha: 0 })
            .from(q("[data-card]"), { yPercent: 30, autoAlpha: 0 }, 0.2)
            .from(q(".swatches > span"), { scaleX: 0, transformOrigin: "left", stagger: 0.08, duration: 0.8 }, 0.4);
          // Hand over from the CSS pre-hide (see globals.css) now that GSAP owns the start state.
          q("[data-intro]").forEach((el: HTMLElement) => (el.style.animation = "none"));
        }

        // Section headings rise word by word; supporting copy and media follow in batches.
        gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
          if (el.closest("[data-hero]")) return;
          gsap.from(el.querySelectorAll("[data-w]"), {
            yPercent: 110,
            duration: 1.1,
            stagger: 0.05,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
        gsap.set("[data-reveal]", { autoAlpha: 0, y: 32 });
        ScrollTrigger.batch("[data-reveal]", {
          start: "top 90%",
          once: true,
          onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, ease: "power3.out" }),
        });

        // Inspiration photos drift inside their frames; the wrapper is oversized so no edge ever shows.
        gsap.utils.toArray<HTMLElement>(".parallax").forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -6 },
            { yPercent: 6, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });

        const refresh = () => ScrollTrigger.refresh();
        document.fonts?.ready.then(refresh);
        window.addEventListener("load", refresh);

        return () => {
          window.removeEventListener("load", refresh);
          gsap.ticker.remove(raf);
          lenis.destroy();
        };
      });

      // Pointer depth on the hero collage: fine pointers only, and it always settles back to rest.
      m.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        const hero = document.querySelector<HTMLElement>("[data-hero]");
        if (!hero) return;
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", hero).map((el) => ({
          depth: Number(el.dataset.depth),
          x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
        }));
        const move = (nx: number, ny: number) => layers.forEach((l) => (l.x(nx * l.depth * 14), l.y(ny * l.depth * 14)));
        const onMove = (e: PointerEvent) => {
          const r = hero.getBoundingClientRect();
          move((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
        };
        const rest = () => move(0, 0);
        const onVisibility = () => document.hidden && rest();
        hero.addEventListener("pointermove", onMove);
        hero.addEventListener("pointerleave", rest);
        window.addEventListener("blur", rest);
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
          hero.removeEventListener("pointermove", onMove);
          hero.removeEventListener("pointerleave", rest);
          window.removeEventListener("blur", rest);
          document.removeEventListener("visibilitychange", onVisibility);
        };
      });
    });
    return () => {
      cancelled = true;
      mm?.revert();
    };
  }, []);

  return null;
}
