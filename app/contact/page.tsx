import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contact & support" };

export default function ContactPage() {
  return (
    <LegalPage eyebrow="Contact & support" title="We'd love to hear from you.">
      <p>
        Questions about your Taste DNA, feedback on what you&apos;d like Habitaste to do for your room, or a privacy request — email us and a real person will
        reply.
      </p>
      <p className="not-prose mt-8">
        <a href={`mailto:${SITE.contactEmail}`} className="font-serif text-3xl text-ink! no-underline! hover:text-clay!">
          {SITE.contactEmail}
        </a>
      </p>

      <h2>Quick answers</h2>
      <ul>
        <li>
          <strong>Where are my results?</strong> On the <Link href="/results">results page</Link>, in the same browser you used. They aren&apos;t stored on our
          servers.
        </li>
        <li>
          <strong>How do I start again?</strong> Use &ldquo;Reset preferences&rdquo; on your results page.
        </li>
        <li>
          <strong>When do AI makeovers launch?</strong> We don&apos;t have a date to share yet. <Link href="/#early-access">Join early access</Link> and
          we&apos;ll email you.
        </li>
        <li>
          <strong>Remove me from the list?</strong> Use the unsubscribe link in any email, or email us and we&apos;ll delete your details.
        </li>
      </ul>
    </LegalPage>
  );
}
