'use client';

import { useEffect } from 'react';

export default function ContentProtection() {
  useEffect(() => {
    // Disable copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable cut
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
    };
  }, []);

  return null;
}
