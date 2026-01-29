'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallAppBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') return;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    if (isStandalone) return;

    const timer = setTimeout(() => {
      if (!deferredPrompt) {
        setShowBanner(true);
      }
    }, 2000);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowBanner(true);
      clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(timer);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install:\n\n• Chrome: Menu → Install App\n• Safari iOS: Share → Add to Home Screen\n• Edge: Menu → Apps → Install');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowBanner(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Installation error:', error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#000',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '10px 16px',
          zIndex: 9999,
          animation: 'slideDown 0.3s ease-out'
        }}
      >
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          {/* Logo + Text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <img 
              src="/icons/icon-64x64.png" 
              alt="NNM"
              style={{
                width: '32px',
                height: '32px',
                flexShrink: 0
              }}
            />
            
            <span style={{ 
              color: '#fff', 
              fontSize: '14px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              Install App
            </span>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={handleInstallClick}
              style={{
                backgroundColor: '#FCD535',
                color: '#000',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Install
            </button>
            
            <button
              onClick={handleDismiss}
              style={{
                backgroundColor: 'transparent',
                color: '#fff',
                border: 'none',
                padding: '6px 8px',
                fontSize: '18px',
                cursor: 'pointer',
                lineHeight: 1
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
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
    </>
  );
};

export default InstallAppBanner;
