import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Privacy" title="Your privacy, in plain language." updated="11 October 2026">
      <p>
        RoomReset is a pre-launch product. We collect as little as possible, and we never sell your data. This policy explains what we collect, why, and the
        choices you have.
      </p>

      <h2>Your Taste DNA stays in your browser</h2>
      <p>
        Your questionnaire answers and results are saved only in your own browser (using local storage) so you can return to them. They are not sent to our
        servers and we cannot see them. You can erase them at any time with &ldquo;Reset preferences&rdquo; on your results page, or by clearing your
        browser&apos;s site data.
      </p>
      <p>
        If you use &ldquo;Share my plan&rdquo;, your quiz answers (tastes, home size, floor, door and wall colours, weather, household, routine and budget band) are encoded into the
        link you share, so anyone with the link can see them. The link contains no name, email or contact details.
      </p>

      <h2>Early-access list</h2>
      <p>If you join early access, we store:</p>
      <ul>
        <li>your email address (required) and first name (optional);</li>
        <li>your Taste DNA style name, if you have one, so we can tailor your invite;</li>
        <li>the campaign that brought you to us (for example, a social media post), if known;</li>
        <li>when you gave consent and which version of this policy applied.</li>
      </ul>
      <p>
        We use this only to email you about RoomReset early access and launch. The list is stored with our database provider, Supabase, and is never
        publicly accessible. Every email will include a way to unsubscribe, and you can ask us to delete your details at any time.
      </p>

      <h2>Room photos</h2>
      <p>RoomReset does not currently accept or store room photographs. When that feature launches, we will update this policy before collecting any.</p>

      <h2>Cookies and analytics</h2>
      <p>We do not use advertising cookies or third-party tracking. Session storage is used only to remember which campaign link you arrived from.</p>

      <h2>Your rights</h2>
      <p>
        You can ask to access, correct or delete the information we hold about you. Email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> and
        we&apos;ll respond promptly.
      </p>
    </LegalPage>
  );
}
