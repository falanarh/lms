import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/scorm-content/:path*',
        destination: 'http://localhost:3000/scorm-content/:path*',
      },
    ];
  },
};

export default nextConfig;
