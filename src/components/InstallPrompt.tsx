'use client';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      return; // Don't show if already installed
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '60px',
        left: 0,
        right: 0,
        backgroundColor: 'rgba(11, 14, 17, 0.98)',
        borderBottom: '1px solid #FCD535',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        zIndex: 1040,
        boxShadow: '0 4px 12px rgba(252, 213, 53, 0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="installGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF5CC" />
              <stop offset="20%" stopColor="#FCD535" />
              <stop offset="80%" stopColor="#B3882A" />
            </linearGradient>
          </defs>
          <path d="M256 20 L356 120 L256 220 L156 120 Z" fill="url(#installGold)" />
          <path d="M156 120 L256 220 L256 240 L156 140 Z" fill="#9E7C0C" />
          <path d="M256 292 L356 392 L256 492 L156 392 Z" fill="url(#installGold)" />
          <path d="M120 156 L220 256 L120 356 L20 256 Z" fill="url(#installGold)" />
          <path d="M392 156 L492 256 L392 356 L292 256 Z" fill="url(#installGold)" />
        </svg>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: '700', 
            fontSize: '14px', 
            color: '#FCD535',
            marginBottom: '2px' 
          }}>
            Install NNM Market App
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#aaa',
            lineHeight: '1.3'
          }}>
            Get quick access and a better experience
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={handleInstall}
          style={{
            background: 'linear-gradient(135deg, #F0B90B 0%, #FCD535 50%, #F0B90B 100%)',
            color: '#000',
            border: '1px solid #b3882a',
            fontWeight: '700',
            fontSize: '13px',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(252, 213, 53, 0.3)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(252, 213, 53, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(252, 213, 53, 0.3)';
          }}
        >
          Install
        </button>
        
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            color: '#999',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FCD535';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#999';
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
