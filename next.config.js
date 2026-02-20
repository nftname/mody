const nextConfig = {
  reactStrictMode: true,

  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },

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
        hostname: 'cloudflare-ipfs.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
    domains: ['gateway.pinata.cloud', 'ipfs.io', 'cloudflare-ipfs.com', 'raw.githubusercontent.com'],
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false, 
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      encoding: false, 
    };

    return config;
  },

  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://static.cloudflareinsights.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
      font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:;
      img-src 'self' blob: data: https://gateway.pinata.cloud https://ipfs.io https://cloudflare-ipfs.com https://raw.githubusercontent.com https://cryptologos.cc https://cdn-icons-png.flaticon.com https://api.qrserver.com;
      connect-src 'self' https://*.walletconnect.com wss://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.org https://*.infura.io https://*.alchemyapi.io https://cloudflare-eth.com https://*.supabase.co https://api.web3modal.org https://*.llamarpc.com https://rpc.ankr.com https://bsc-dataseed.binance.org https://api.coingecko.com https://polygon-bor.publicnode.com https://cdn.jsdelivr.net;
      frame-src 'self' https://verify.didit.me https://app.uniswap.org https://*.walletconnect.com https://*.walletconnect.org https://*.coinbase.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

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
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader
          }
        ]
      }
    ]
  }
};

export default nextConfig;
