'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config, projectId } from '../components/Web3Provider';

// Create modal instance once - this will be shared across all components
// This approach is recommended by WalletConnect for Next.js apps
if (typeof window !== 'undefined') {
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
}
