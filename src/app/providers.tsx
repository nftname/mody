'use client';

import * as React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
// 1. تحديث الاستيراد لإضافة أدوات الاتصال القوي
import { WagmiProvider, http, fallback } from 'wagmi';
import { polygon } from 'viem/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const origin = typeof window !== 'undefined' ? window.location.origin : 'https://Nftnnm.com';

const config = getDefaultConfig({
  appName: 'NNM Market',
  appDescription: 'Nexus Digital Name NFTs Market',
  appUrl: origin,
  appIcon: `${origin}/icons/icon.svg`,
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '9e2e602f47e436db24b660ee7f01f141',
  chains: [polygon],
  // 2. إضافة نظام النقل القوي (هذا هو الحل لمشكلة التجميد)
  transports: {
    [polygon.id]: fallback([
      http("https://polygon-bor.publicnode.com"), // سريع جداً ومجاني
      http("https://polygon-rpc.com"),             // الرسمي
      http("https://rpc.ankr.com/polygon")         // احتياطي
    ]),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
            theme={darkTheme({
                accentColor: '#FCD535',
                accentColorForeground: 'black',
                borderRadius: 'small',
                fontStack: 'system',
                overlayBlur: 'small',
            })}
            modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
