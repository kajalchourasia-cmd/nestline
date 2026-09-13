import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The documented local URL uses 127.0.0.1. Next.js otherwise blocks its
  // development client resources because the dev server advertises localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
