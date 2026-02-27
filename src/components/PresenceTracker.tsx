
'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

export default function PresenceTracker() {
  const { address, isConnected } = useAccount();
  const sessionId = useRef(crypto.randomUUID());

  useEffect(() => {
    const ping = async () => {
      try {
        await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionId.current,
            wallet: isConnected ? address : null,
          }),
        });
      } catch (e) {}
    };

    ping();
    const interval = setInterval(ping, 15000);
    return () => clearInterval(interval);
  }, [address, isConnected]);

  return null;
}
