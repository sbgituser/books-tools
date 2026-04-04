import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  compiler: {
    removeConsole: {
      exclude: ["error"],
    },
  },
};

export default nextConfig;
