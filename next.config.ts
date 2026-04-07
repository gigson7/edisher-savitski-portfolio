import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable runtime image optimization — images are pre-optimized as WebP.
  // This prevents sharp/libvips from spawning CPU-count threads at runtime,
  // which exceeds Hostinger shared hosting's nproc limit.
  images: {
    unoptimized: true,
  },
  // Disable experimental features that may cause issues
  experimental: {
    // Use webpack instead of turbopack for builds
    turbo: undefined,
  },
  // Override cache headers for Hostinger CDN (hcdn).
  // Next.js defaults to s-maxage=31536000 for static pages, which works
  // on Vercel (auto-invalidated on deploy) but causes stale HTML on
  // Hostinger since its CDN doesn't purge on redeploy.
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
        },
      ],
    },
  ],
};

export default nextConfig;
