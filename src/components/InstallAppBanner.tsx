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

    // Show banner after 2 seconds for testing
    const timer = setTimeout(() => {
      setShowBanner(true);
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
  }, []);

  const handleInstallClick = async () => {
    // إخفاء البانر فوراً
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');

    if (!deferredPrompt) {
      console.log('Install prompt not available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('Install outcome:', outcome);
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
        dir="ltr"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1E1E1E',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '12px 16px',
          zIndex: 99999,
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
                width: '40px',
                height: '40px',
                flexShrink: 0
              }}
            />
            
            <span style={{ 
              color: '#fff', 
              fontSize: '14px',
              fontWeight: '500',
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
                background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #B8860B 100%)',
                color: '#000',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(253, 185, 49, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(253, 185, 49, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(253, 185, 49, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
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
                padding: '8px',
                fontSize: '20px',
                cursor: 'pointer',
                lineHeight: 1,
                opacity: 0.7,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
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
