import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PHOTOS } from "@/lib/photos";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  const credits = [...new Map(Object.values(PHOTOS).map((p) => [p.credit, p])).keys()].sort();
  return (
    <LegalPage eyebrow="Terms" title="Terms of use." updated="12 October 2026">
      <p>By using RoomReset you agree to these terms. They&apos;re short, because the product is simple today.</p>

      <h2>What RoomReset offers today</h2>
      <p>
        RoomReset currently offers a free Taste DNA questionnaire and personalised home plan, including an illustrative budget section, plus an early-access list. AI room makeovers, catalogue shopping
        and interactive design refinements are in development and clearly marked &ldquo;Coming soon&rdquo;. Nothing on the site can be purchased, and no
        payment is ever requested.
      </p>

      <h2>Design suggestions</h2>
      <p>
        Your home plan is general guidance, generated from your answers by fixed rules. Prices are illustrative rather than live quotes. It is not professional advice for your specific property,
        medical needs or accessibility requirements. Check your tenancy agreement and written permissions before changing a rented home, and use qualified professionals for electrical, plumbing,
        structural and individual accessibility work.
      </p>

      <h2>Imagery</h2>
      <p>
        Photographs are inspiration and illustrative examples only. They are not transformations created by RoomReset. Prices shown in previews are
        illustrative, not offers.
      </p>

      <h2>Fair use</h2>
      <p>Please don&apos;t misuse the site, attempt to disrupt it, or submit someone else&apos;s email address to the early-access list.</p>

      <h2>Changes and contact</h2>
      <p>
        We may update these terms as RoomReset grows, and will change the date above when we do. Questions? Email{" "}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>

      <h2 id="image-credits">Image credits</h2>
      <p>
        Photographs are from <a href="https://unsplash.com">Unsplash</a>, used under the Unsplash License. With thanks to: {credits.join(", ")}.
      </p>
      <p>
        The furnished room on the coming-soon page is an AI visualisation, made with Higgsfield from Salvo Media LLC&apos;s Unsplash photo of the same empty
        room. It illustrates a future feature and is not a RoomReset result.
      </p>
    </LegalPage>
  );
}
