'use client';

import { useState, useEffect } from 'react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isArabic, setIsArabic] = useState(false);

  useEffect(() => {
    // 1. Check Language
    if (typeof navigator !== 'undefined') {
      setIsArabic(navigator.language.startsWith('ar'));
    }

    // 2. Check LocalStorage (12-Hour Cooldown)
    const lastDismissed = localStorage.getItem('install_banner_dismissed');
    const twelveHours = 12 * 60 * 60 * 1000;
    const isReadyToShow = !lastDismissed || (Date.now() - parseInt(lastDismissed) > twelveHours);

    // 3. Listen for PWA event
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (isReadyToShow) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Save current time to localStorage to hide for 12 hours
    localStorage.setItem('install_banner_dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div 
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed top-0 left-0 w-full z-[9999] flex items-center justify-between px-4 py-3 shadow-lg fade-in"
      style={{
        background: 'rgba(20, 20, 20, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(240, 196, 32, 0.3)'
      }}
    >
      {/* Content Container */}
      <div className="flex items-center gap-3">
        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white transition"
          aria-label="Close"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo Placeholder (Replace /logo.png with your actual logo path if needed) */}
        <div className="w-8 h-8 relative rounded-md overflow-hidden border border-gray-700">
           {/* Using actual icon from /icons folder */}
           <img src="/icons/icon-192x192.png" alt="Logo" className="object-cover w-full h-full" onError={(e) => e.currentTarget.style.display = 'none'} />
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <span className="text-white text-sm font-bold">
            {isArabic ? 'تطبيق NNM' : 'NNM App'}
          </span>
          <span className="text-xs text-gray-400">
            {isArabic ? 'أسرع، وأسهل، وآمن.' : 'Faster, easier access.'}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleInstallClick}
        className="px-4 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)',
          color: '#000',
          border: 'none'
        }}
      >
        {isArabic ? 'تثبيت' : 'Install'}
      </button>
    </div>
  );
}
