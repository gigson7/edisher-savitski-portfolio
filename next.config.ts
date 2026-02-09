import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable experimental features that may cause issues
  experimental: {
    // Use webpack instead of turbopack for builds
    turbo: undefined,
  },
};

export default nextConfig;
