# Indian renter design notes

Research accessed 11 October 2026. These are qualitative references, not a representative survey. India has many housing types, climates, incomes and tastes. The website depicts one plausible urban rental bedroom, not a universal Indian room.

## Evidence and interpretation

- [A renter asking for a limited-budget makeover](https://www.reddit.com/r/IndianHomeDecor/comments/1u2sb15/24f_rental_rooms_makeover/) explicitly cannot paint and rents the bed, wardrobe and table. The author's response also points out that heavy bedding is unsuitable for Mumbai weather. This informs preserving furniture and using a cotton bedsheet rather than a duvet. It does not establish national prevalence.
- [A Kolkata renter's room and constraints](https://www.reddit.com/r/IndianHomeDecor/comments/1vnv6hg/help_me_rentalfriendly_makeover_ideas_for_this/) describes a simple bed and utility tables, a modest budget, and avoiding drilling or structural changes. This informs a small, portable styling intervention.
- [A steel-almirah discussion](https://www.reddit.com/r/IndianHomeDecor/comments/1pacc54/almirah_makeover_paint_or_wallpaper/) describes retaining four steel almirahs in a rental. Search excerpts were available; the full page could not be fetched. This is limited evidence of a real constraint, not evidence that steel storage is unattractive.
- [Nilkamal's chair range](https://www.nilkamalfurniture.com/collections/chairs) includes plastic chairs for home and study use. This supports their plausibility as useful existing furniture; it is a manufacturer source, not a housing survey.
- [IKEA India's curtains guidance](https://www.ikea.com/in/en/cat/curtains-10700/) discusses window measurement, fabrics, light and privacy. [Bedroom lighting guidance](https://www.ikea.com/in/en/rooms/bedroom/light-pub2d2d971a/) describes soft warm lighting. These support removable textile and lighting choices, not a specific guaranteed budget.

The tiled floor, barred window, fan, surface electrical conduit, mixed utility furniture, calendar and printed cotton bedding are art-direction choices that make this particular room plausible. No incidence statistics are claimed. Colour, print, steel furniture and plastic chairs are not presented as inherently bad. The after keeps the furniture, calendar, conduit, tiled floor and printed textiles. An exposed insulated charger lead is distinct from damaged electrical wiring: the checklist directs electrical defects to the landlord or a qualified electrician, not a DIY makeover.

## Website changes

- Retain the existing serif typography, warm neutral palette, Tailwind conventions and App Router architecture.
- Shorten the home page into five purposeful sections: introduction, room study, working Taste DNA, resources and early access. Remove unrelated luxury inspiration and repeated feature grids.
- Show the before/after together on desktop and sequentially on mobile, without requiring a swipe, animation or JavaScript toggle. Four numbered markers locate lighting, competing textiles, laundry on a seat and loose storage boxes. Small screens get a readable external key; wider images add text labels directly on the photo.
- Label generated concepts beside every presentation. They are not live AI product output, customer rooms, a product list or a verified price quote.
- Serve two sizes of each local WebP. Mobile 640px assets are 23,740 bytes (after) and 27,612 bytes (before); 1280px assets are 70,668 and 82,880 bytes. The reused after image can be cached. Native image dimensions reserve the ratio; only the hero loads eagerly.
- Resources offers a real six-item in-page checklist. Ebook, lighting guide and budget worksheet remain coming soon, without fake download buttons, dates or email gates.
- Keep questionnaire, deterministic engine, local storage, share format, waitlist API and feature flags intact. Budget planner starts at ₹10,000 and calls its furniture priority storage; its existing allocation logic and range are retained.
- Shorten Coming soon while preserving its disabled room-details preview, working budget planner and working waitlist form. Remove unrelated before/after stock photos and speculative expensive product previews.
- Browser checks found two existing accessibility/usability issues: the budget input shared `id="budget"` with its containing section, and the mobile menu stayed open after route navigation. The slider now has its own `budget-amount` ID and an accessible label. A small mobile-navigation component closes the native details menu when a link is selected; the details control still works without JavaScript.

## Image provenance

Generated with the built-in OpenAI ImageGen tool, first a before photograph and then an edit of that image. No external model API, API key, payment integration or runtime image generation was added. The source PNGs remain in the tool's default generated-images directory; only optimized project assets are tracked.

The exact final prompt set is saved in [IMAGE-PROMPTS.md](IMAGE-PROMPTS.md).

Final project assets:

```text
public/images/rental-before-640.webp
public/images/rental-before-1280.webp
public/images/rental-after-640.webp
public/images/rental-after-1280.webp
```

The edit preserves the visible room geometry and major furniture closely, rather than claiming perfect pixel identity. Small generated texture details can vary. Wardrobe access and walking space remain visible; there is no larger window, new floor, built-in joinery or wall finish.

## Validation and launch limits

Run `npm test`, `npm run typecheck` and `npm run build`. Existing tests cover the Taste DNA engine (including 500 randomized palette profiles) and waitlist validation, duplicates, provider errors and rate limiting. Browser verification covers mobile and desktop layout, image loading, navigation, the checklist, quiz completion and persistence, budget interaction and waitlist validation/unconfigured feedback.

The local checkout has no configured Supabase URL or key. The existing waitlist correctly reports that nothing was saved; live insertion must be verified in a configured environment. Contact email remains the existing placeholder unless configured. A public deployment was not performed by these local changes. Font compilation uses the existing Google-font setup and needs network access at build time.
