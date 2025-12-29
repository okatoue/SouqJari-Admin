/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.souqjari.com',
      },
      {
        protocol: 'https',
        hostname: 'api.souqjari.com',
      },
    ],
  },
};

export default nextConfig;
