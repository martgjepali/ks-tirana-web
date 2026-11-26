import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Admin uploads (photos are shrunk in the browser first). Vercel accepts request bodies up to 4.5 MB.
    serverActions: { bodySizeLimit: "4.4mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
