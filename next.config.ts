import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: 'D:/WebServer/react/bookmarks',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
    ],
  },
};

export default nextConfig;