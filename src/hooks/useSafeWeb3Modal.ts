'use client';

import { useWeb3Modal } from '@web3modal/wagmi/react';

/**
 * Hook wrapper for useWeb3Modal that safely works with SSR
 * Just re-exports the original hook since we're handling SSR at the layout level
 */
export function useSafeWeb3Modal() {
  return useWeb3Modal();
}
