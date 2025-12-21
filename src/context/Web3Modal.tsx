'use client';

import React, { ReactNode } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { polygon } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const projectId = 'a3d90f237583624180436d2466635234'; 

const metadata = {
  name: 'Nexus Name Market',
  description: 'Nexus Digital Name Assets Marketplace',
  url: 'https://nexus.io', 
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [polygon] as const;

const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false, 
  enableOnramp: false,
  enableEmail: false, // هذا هو السطر الذي يلغي جوجل والإيميل نهائياً
  themeMode: 'dark',
  allWallets: 'SHOW'
});

export function Web3ModalProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
