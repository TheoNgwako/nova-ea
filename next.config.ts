import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ['localhost', '192.168.8.24', '127.0.0.1'],
};

export default nextConfig;