'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
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
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
      <div className="card shadow-lg" style={{ maxWidth: '320px' }}>
        <div className="card-body">
          <h6 className="card-title mb-2">Install App</h6>
          <p className="card-text small text-muted mb-3">
            Add our app to your home screen for quick access.
          </p>
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary btn-sm flex-grow-1"
              onClick={handleInstall}
            >
              Install
            </button>
            <button
              className="btn btn-outline-secondary btn-sm flex-grow-1"
              onClick={handleDismiss}
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
