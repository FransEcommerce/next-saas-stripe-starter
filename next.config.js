const { withContentlayer } = require("next-contentlayer2");

import("./env.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "drive.frs.com.my",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 禁用 TypeScript 类型检查
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = withContentlayer(nextConfig);
