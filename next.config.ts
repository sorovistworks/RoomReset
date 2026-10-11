import type { NextConfig } from "next";

// GitHub Pages preview build: static files under /RoomReset, so no API route or response headers.
const pages = process.env.GITHUB_PAGES === "true";
const basePath = pages ? "/RoomReset" : "";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(pages ? { output: "export", basePath, trailingSlash: true } : {}),
  // Paths outside next/link (image loader, full-page redirects) read this to add the prefix.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // Unsplash's CDN does the resizing, so no Next image server is needed (portable to Cloudflare).
  images: { loader: "custom", loaderFile: "./lib/image-loader.ts" },
  ...(pages ? {} : { headers }),
};

async function headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ];
}

export default nextConfig;
