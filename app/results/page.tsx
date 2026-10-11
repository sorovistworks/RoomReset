import type { Metadata } from "next";
import { Results } from "@/components/results";

export const metadata: Metadata = {
  title: "Your Taste DNA",
  description: "Your personal interior style identity, signature palette, material story and design principles.",
};

export default function ResultsPage() {
  return <Results />;
}
