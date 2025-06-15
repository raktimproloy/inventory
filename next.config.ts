import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during production builds
  },
  images: {
    domains: ['localhost',"firebasestorage.googleapis.com"], // For external images from localhost or other domains
  },
};
export default nextConfig;
