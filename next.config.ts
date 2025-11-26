import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/scorm-content/:path*",
        destination: "http://localhost:3000/scorm-content/:path*",
      },
     {
      source: "/api/auth/me",
      destination: "https://14d87ace0ad2.ngrok-free.app/auth/me",
    },

    ];
  },
  images: {
    remotePatterns: [
      {   
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "youtube.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "youtube.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-b50c5924d2c64c1397f8e200306b9bfb.r2.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dummyimage.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "dummyimage.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
    ],
    domains: [
      "via.placeholder.com",
      "10.101.20.220",
      "api-lms-kappa.vercel.app",
      "res.cloudinary.com",
      "pub-b50c5924d2c64c1397f8e200306b9bfb.r2.dev",
      "dummyimage.com",
      "example.com",
    ],
  },

 
  experimental: {
    allowedDevOrigins: ["http://10.101.20.220:3001"],
  },
  reactStrictMode: false,
};

export default nextConfig;
