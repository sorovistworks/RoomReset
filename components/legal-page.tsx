import type { ReactNode } from "react";
import { Eyebrow } from "./ui";

export function LegalPage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated?: string; children: ReactNode }) {
  return (
    <div className="wrap py-16 sm:py-24">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="display mt-5 max-w-3xl text-5xl sm:text-6xl">{title}</h1>
      {updated && <p className="mt-4 text-sm text-ink-soft">Last updated {updated}</p>}
      <div className="prose-rr mt-10">{children}</div>
    </div>
  );
}
