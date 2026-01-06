'use client';

import * as React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  Theme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
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
  ssr: true,
});

const queryClient = new QueryClient();

const baseTheme = darkTheme({
  accentColor: '#F0C420',
  accentColorForeground: 'black',
  borderRadius: 'small',
  fontStack: 'system',
  overlayBlur: 'small',
});

const nnmCustomTheme: Theme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    modalBackground: '#0b0e11',
    modalBorder: 'rgba(255, 255, 255, 0.08)',
    menuItemBackground: '#141414',
    modalText: '#E0E0E0',
    modalTextSecondary: '#D4C49D',
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
            theme={nnmCustomTheme}
            modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
