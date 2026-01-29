import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NNM | Digital Name Assets',
    short_name: 'NNM',
    description: 'The Global Market of Nexus Rare Digital Name NFTs.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1E1E1E',
    theme_color: '#F0C420',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512x512.png', 
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      }
    ],
  }
}
