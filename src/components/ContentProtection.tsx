'use client';

import { useEffect } from 'react';

export default function ContentProtection() {
  useEffect(() => {
    // Disable copy only
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  return null;
}
