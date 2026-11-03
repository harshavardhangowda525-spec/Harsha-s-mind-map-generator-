import type { NextConfig } from "next";

/**
 * Static preview build for GitHub Pages:
 *   STATIC_EXPORT=1 PAGES_BASE_PATH=/repo-name/iron-pulse npm run build:pages
 * Normal builds (Vercel) are unaffected.
 */
const isExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(isExport ? { output: "export" as const, trailingSlash: true, basePath } : {}),
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: isExport,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    // Remote sources allowed for next/image. Remove Unsplash once the
    // client's own photographs live in /public/images.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  ...(isExport ? {} : { headers }),
};

async function headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
}

export default nextConfig;
