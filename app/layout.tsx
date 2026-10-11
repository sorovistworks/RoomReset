import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { SourceCapture } from "@/components/source-capture";
import { SITE } from "@/lib/site";
import "./globals.css";
import { preconnect } from "react-dom";

const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
// opsz axis: large headlines automatically get Fraunces' finer, high-contrast display cut.
const serif = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-fraunces", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: { title: `${SITE.name} — Discover your Taste DNA`, description: SITE.description, siteName: SITE.name, type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#f7f3ec" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Every page shows Unsplash photos; open the connection while the HTML is still parsing.
  preconnect("https://images.unsplash.com");
  return (
    <html lang="en-GB" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <SourceCapture />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
