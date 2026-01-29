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
    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') return;

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Show banner immediately for testing (will be replaced by event)
    const timer = setTimeout(() => {
      if (!deferredPrompt) {
        // Show banner even without prompt for iOS or unsupported browsers
        setShowBanner(true);
      }
    }, 2000);

    // Listen for install prompt
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
      // For browsers that don't support prompt, just show instructions
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
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1a1a1a',
          borderTop: '1px solid #FCD535',
          padding: '12px 16px',
          zIndex: 9999,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
          animation: 'slideUpBanner 0.3s ease-out'
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* App Icon */}
          <div 
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FCD535 0%, #B3882A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1200' }}>N</span>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
              Install NNM App
            </div>
            <div style={{ color: '#8a939b', fontSize: '12px' }}>
              Quick access from your home screen
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={handleInstallClick}
              style={{
                background: 'linear-gradient(135deg, #FCD535 0%, #B3882A 100%)',
                color: '#1a1200',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Install
            </button>
            
            <button
              onClick={handleDismiss}
              style={{
                background: 'transparent',
                color: '#8a939b',
                border: '1px solid #333',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideUpBanner {
          from {
            transform: translateY(100%);
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
