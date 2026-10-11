import type { Metadata } from "next";
import { getImageProps } from "next/image";
import { preload } from "react-dom";
import { Questionnaire } from "@/components/questionnaire";
import { QUIZ_PHOTO_SIZES } from "@/lib/photos";
import { STYLES } from "@/lib/taste-data";

export const metadata: Metadata = {
  title: "Discover your Taste DNA",
  description: "Thirteen quick questions about your taste, your new home and your routine. Free, private and no sign-up needed.",
};

export default function DiscoverPage() {
  // The quiz renders in the browser (it reads saved answers first), so start the first row of photos from the server HTML.
  for (const { photo } of STYLES.slice(0, 2)) {
    const { props } = getImageProps({ src: photo.src, alt: "", fill: true, sizes: QUIZ_PHOTO_SIZES });
    preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: "high" });
  }
  return <Questionnaire />;
}
