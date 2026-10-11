import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { SourceCapture } from "@/components/source-capture";
import { SITE } from "@/lib/site";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: { title: `${SITE.name} — Discover your Taste DNA`, description: SITE.description, siteName: SITE.name, type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#f7f3ec" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" data-scroll-behavior="smooth" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <SourceCapture />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
