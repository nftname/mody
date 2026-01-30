'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // عرض البانر بعد 3 ثواني من تحميل الصفحة
      setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response: ${outcome}`);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleClose = () => {
    setShowBanner(false);
  };

  if (!showBanner || !deferredPrompt) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[9999] animate-slide-down"
      style={{
        animation: 'slideDown 0.5s ease-out forwards'
      }}
    >
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      
      <div className="bg-[#1a1a1a] shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center flex-1">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="NNM"
                  width={48}
                  height={48}
                  className="rounded-lg shadow-md"
                />
              </div>
              
              {/* Text */}
              <div className="ml-3 flex-1">
                <p className="text-white font-semibold text-sm sm:text-base">
                  Install NNM App
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Digital Name Assets
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={handleInstall}
                className="bg-[#F0C420] text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-yellow-500 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Install
              </button>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white p-2"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
