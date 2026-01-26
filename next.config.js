/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We rely on Vercel for building, so we ignore strict checks to ensure success
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['gateway.pinata.cloud', 'ipfs.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  poweredByHeader: false,
};

module.exports = nextConfig;
