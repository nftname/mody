'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider, cookieStorage, createStorage } from 'wagmi';
import { mainnet, polygon, sepolia, polygonAmoy } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '54fe9dac19f995601dd79e204769a53d';

const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nnm-market.vercel.app';

export const metadata = {
  name: 'NNM Market',
  description: 'NFT Name Marketplace | Sovereign Identity Assets',
  url: origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [mainnet, polygon, sepolia, polygonAmoy] as const;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  })
});

// Global flag to track modal creation
let modalCreated = false;

export default function Web3Provider({ 
   children, 
   initialState 
}: { 
   children: ReactNode; 
   initialState?: any;
}) {
  const initialized = useRef(false);

  useEffect(() => {
    // Create modal only once on client-side
    if (!initialized.current && !modalCreated) {
      try {
        createWeb3Modal({
          wagmiConfig: config,
          projectId,
          enableAnalytics: false,
          enableOnramp: false,
          enableEmail: false,
          themeVariables: {
            '--w3m-accent': '#F0B90B',
            '--w3m-color-mix': '#F0B90B',
            '--w3m-color-mix-strength': 5,
            '--w3m-border-radius-master': '4px',
            '--w3m-z-index': 999999
          }
        });
        modalCreated = true;
        initialized.current = true;
      } catch (error) {
        console.error('Failed to create Web3Modal:', error);
      }
    }
  }, []);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}