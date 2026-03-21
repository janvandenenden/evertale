import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-ff52a9b8fb2f4031be59d54e6d7b632f.r2.dev",
      },
    ],
  },
};

export default nextConfig;
