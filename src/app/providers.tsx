'use client';

import * as React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, http, fallback } from 'wagmi';
import { polygon, mainnet, bsc } from 'viem/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nftnnm.com';

const config = getDefaultConfig({
  appName: 'NNM Market',
  appDescription: 'Nexus Digital Name NFTs Market',
  appUrl: origin,
  appIcon: `${origin}/icons/icon.svg`,
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '9e2e602f47e436db24b660ee7f01f141',
  chains: [polygon, mainnet, bsc],
  transports: {
    [polygon.id]: fallback([
      http("https://polygon.drpc.org"),
      http("https://rpc-mainnet.maticvigil.com"),
      http("https://polygon-rpc.com"),
      http("https://polygon-bor.publicnode.com"),
      http("https://rpc.ankr.com/polygon")
    ]),
    [mainnet.id]: fallback([
      http("https://cloudflare-eth.com"),
      http("https://eth.drpc.org"),
      http("https://rpc.builder0x69.com"),
      http("https://eth.llamarpc.com"),
      http("https://rpc.ankr.com/eth")
    ]),
    [bsc.id]: fallback([
      http("https://bsc-dataseed1.defibit.io"),
      http("https://bsc-dataseed2.defibit.io"),
      http("https://bsc-dataseed.binance.org"),
      http("https://binance.llamarpc.com")
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
