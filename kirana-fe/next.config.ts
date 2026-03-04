import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable TypeScript build errors from failing the build
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "play.google.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/delete-account.html",
        destination: "/delete-account",
        permanent: true,
      },
      {
        source: "/contact.html",
        destination: "/contact",
        permanent: true,
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:11434", "127.0.0.1:3000", "127.0.0.1:*"],
    },
  },
};

export default nextConfig;
