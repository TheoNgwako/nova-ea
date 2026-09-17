import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '192.168.0.128',
    '192.168.8.24',
  ],
};

export default nextConfig;