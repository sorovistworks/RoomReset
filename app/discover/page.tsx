import type { Metadata } from "next";
import { Questionnaire } from "@/components/questionnaire";

export const metadata: Metadata = {
  title: "Discover your Taste DNA",
  description: "Eight visual questions about the rooms, colours, textures and feelings you love. Free, private and no sign-up needed.",
};

export default function DiscoverPage() {
  return <Questionnaire />;
}
