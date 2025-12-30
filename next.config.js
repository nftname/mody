/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // 1. Ignore React Native Async Storage (Fixes the warning)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false, 
    };

    // 2. Ignore standard node modules for browser (Standard Web3 fix)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      encoding: false, 
    };

    return config;
  },
};

export default nextConfig;
