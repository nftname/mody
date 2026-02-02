/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // --- [تحديث البرو]: إعدادات المكتبات الخارجية لبيئة السيرفر ---
  // هذا الجزء هو المفتاح لعمل مكتبة sharp وكتابة الأسماء على الصور في Vercel/Serverless
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },

  // 1. إعدادات الصور (للسماح بجلب الصور من بيناتا)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
    // احتياطياً للدعم القديم لضمان عدم تعطل عرض أي NFT
    domains: ['gateway.pinata.cloud', 'ipfs.io', 'raw.githubusercontent.com'],
  },

  // 2. إصلاحات الويب 3 (المنطق الجوهري لربط المحافظ ومنع تعارض المكتبات)
  webpack: (config) => {
    // Ignore React Native Async Storage (Fixes the warning)
    // هذا الجزء يمنع التحذيرات المزعجة عند بناء المشروع
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false, 
    };

    // Ignore standard node modules for browser (Standard Web3 fix)
    // إعدادات ضرورية لعمل مكتبات مثل viem و wagmi داخل المتصفح
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      encoding: false, 
    };

    return config;
  },

  // 3. الحصن الرقمي (Security Headers) - الأسطر التي تحمي موقعك من الهجمات
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
