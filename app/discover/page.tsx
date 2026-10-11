import type { Metadata } from "next";
import { Questionnaire } from "@/components/questionnaire";

export const metadata: Metadata = {
  title: "Discover your Taste DNA",
  description: "Thirteen quick questions about your taste, your new home and your routine. Free, private and no sign-up needed.",
};

export default function DiscoverPage() {
  return <Questionnaire />;
}
