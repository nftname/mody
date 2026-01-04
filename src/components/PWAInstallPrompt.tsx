'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const LS_KEY = 'pwa_prompt_closed';
  const LS_INSTALL_KEY = 'pwa_installed';

  // كشف إذا كان التطبيق مثبت بالفعل
  useEffect(() => {
    const installed = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
    setIsStandalone(installed);
    
    if (installed) {
      localStorage.setItem(LS_INSTALL_KEY, 'true');
    }
  }, []);

  // التقاط حدث التثبيت
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      localStorage.setItem(LS_INSTALL_KEY, 'true');
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // قرار عرض البانر
  useEffect(() => {
    const isHome = pathname === '/';
    
    // إذا كان التطبيق مثبت أو ليس في الصفحة الرئيسية
    if (isStandalone || !isHome) {
      setShowBanner(false);
      return;
    }

    // التحقق من localStorage
    const wasClosed = localStorage.getItem(LS_KEY);
    const wasInstalled = localStorage.getItem(LS_INSTALL_KEY);
    
    if (wasInstalled === 'true') {
      setShowBanner(false);
      return;
    }

    if (wasClosed) {
      const closedTime = parseInt(wasClosed, 10);
      const now = Date.now();
      const hoursPassed = (now - closedTime) / (1000 * 60 * 60);
      
      // إعادة الظهور بعد 24 ساعة
      if (hoursPassed < 24) {
        setShowBanner(false);
        return;
      }
    }

    // عرض البانر بعد 2 ثانية
    const timer = setTimeout(() => {
      if (deferredPrompt) {
        setShowBanner(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [pathname, deferredPrompt, isStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem(LS_INSTALL_KEY, 'true');
        setShowBanner(false);
      } else {
        handleClose();
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during install prompt:', error);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowBanner(false);
      setIsClosing(false);
      localStorage.setItem(LS_KEY, Date.now().toString());
    }, 300);
  };

  if (!showBanner || !deferredPrompt) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`pwa-overlay ${isClosing ? 'closing' : ''}`}
        onClick={handleClose}
      />

      {/* Install Banner */}
      <div className={`pwa-banner ${isClosing ? 'closing' : ''}`}>
        <div className="pwa-banner-content">
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="pwa-close-btn"
            aria-label="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>

          {/* App Icon */}
          <div className="pwa-icon-wrapper">
            <div className="pwa-icon-glow"></div>
            <svg viewBox="0 0 200 200" className="pwa-icon">
              <defs>
                <linearGradient id="iconGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="50%" stopColor="#FDB931" />
                  <stop offset="100%" stopColor="#B8860B" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="95" fill="url(#iconGradient)" />
              <text 
                x="100" 
                y="130" 
                fontSize="100" 
                fontWeight="900" 
                fontFamily="'Cinzel', serif"
                fill="#1a1100" 
                textAnchor="middle"
              >
                N
              </text>
            </svg>
          </div>

          {/* Content */}
          <div className="pwa-content">
            <h3 className="pwa-title">Install NNM Market</h3>
            <p className="pwa-description">
              Get instant access to the premier NFT marketplace. 
              Install our app for a faster, native experience.
            </p>
            
            {/* Features */}
            <div className="pwa-features">
              <div className="pwa-feature">
                <i className="bi bi-lightning-charge-fill"></i>
                <span>Lightning Fast</span>
              </div>
              <div className="pwa-feature">
                <i className="bi bi-bell-fill"></i>
                <span>Push Notifications</span>
              </div>
              <div className="pwa-feature">
                <i className="bi bi-phone-fill"></i>
                <span>Works Offline</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pwa-actions">
            <button 
              onClick={handleInstall}
              className="pwa-install-btn"
            >
              <i className="bi bi-download"></i>
              Install App
            </button>
            <button 
              onClick={handleClose}
              className="pwa-later-btn"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .pwa-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 9998;
          animation: fadeIn 0.3s ease-out;
        }

        .pwa-overlay.closing {
          animation: fadeOut 0.3s ease-out;
        }

        .pwa-banner {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 420px;
          background: linear-gradient(135deg, #0b0e11 0%, #1a1d23 100%);
          border: 1px solid rgba(252, 213, 53, 0.3);
          border-radius: 20px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.9),
            0 0 40px rgba(252, 213, 53, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          z-index: 9999;
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }

        .pwa-banner.closing {
          animation: slideDown 0.3s ease-out;
        }

        .pwa-banner-content {
          padding: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .pwa-close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .pwa-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          transform: rotate(90deg);
        }

        .pwa-icon-wrapper {
          position: relative;
          width: 100px;
          height: 100px;
          margin-bottom: 20px;
        }

        .pwa-icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(252, 213, 53, 0.3) 0%, transparent 70%);
          animation: pulse 2s ease-in-out infinite;
        }

        .pwa-icon {
          position: relative;
          width: 100px;
          height: 100px;
          filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5));
          animation: float 3s ease-in-out infinite;
        }

        .pwa-content {
          text-align: center;
          margin-bottom: 25px;
        }

        .pwa-title {
          font-family: 'Cinzel', serif;
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(180deg, #FFD700 0%, #B8860B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 10px 0;
          letter-spacing: 0.5px;
        }

        .pwa-description {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 20px 0;
          max-width: 320px;
        }

        .pwa-features {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .pwa-feature {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(252, 213, 53, 0.08);
          border: 1px solid rgba(252, 213, 53, 0.2);
          border-radius: 20px;
          padding: 6px 12px;
          font-size: 12px;
          color: #FCD535;
        }

        .pwa-feature i {
          font-size: 14px;
        }

        .pwa-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .pwa-install-btn {
          background: linear-gradient(180deg, #FFD700 0%, #B8860B 100%);
          border: 1px solid #B8860B;
          color: #1a1100;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.5px;
          padding: 14px 30px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 
            0 4px 15px rgba(252, 213, 53, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .pwa-install-btn:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 6px 20px rgba(252, 213, 53, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          filter: brightness(1.1);
        }

        .pwa-install-btn:active {
          transform: translateY(0);
        }

        .pwa-install-btn i {
          font-size: 18px;
        }

        .pwa-later-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          padding: 12px 24px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pwa-later-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.9);
          border-color: rgba(255, 255, 255, 0.25);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes slideUp {
          from {
            transform: translate(-50%, 100vh);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
          to {
            transform: translate(-50%, 100vh);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @media (max-width: 480px) {
          .pwa-banner {
            width: 95%;
            max-width: none;
            border-radius: 16px;
          }

          .pwa-banner-content {
            padding: 25px 20px;
          }

          .pwa-icon-wrapper {
            width: 80px;
            height: 80px;
          }

          .pwa-icon {
            width: 80px;
            height: 80px;
          }

          .pwa-icon-glow {
            width: 100px;
            height: 100px;
          }

          .pwa-title {
            font-size: 20px;
          }

          .pwa-description {
            font-size: 13px;
          }

          .pwa-features {
            gap: 8px;
          }

          .pwa-feature {
            font-size: 11px;
            padding: 5px 10px;
          }

          .pwa-install-btn {
            font-size: 15px;
            padding: 12px 24px;
          }
        }
      `}</style>
    </>
  );
}
