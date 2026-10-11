import type { Metadata } from "next";
import { Results } from "@/components/results";

export const metadata: Metadata = {
  title: "Your home plan",
  description: "Your top palettes, material priorities, what to buy or skip, and chores to delegate — room by room.",
};

export default function ResultsPage() {
  return <Results />;
}
