export default function unsplashLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // A custom loader bypasses basePath, so local images need the prefix added here.
  if (src.startsWith("/")) return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`;
  if (!src.startsWith("https://images.unsplash.com/")) return src;
  return `${src}?auto=format&fit=crop&w=${width}&q=${quality ?? 72}`;
}
