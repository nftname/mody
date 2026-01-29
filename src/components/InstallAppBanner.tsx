'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallAppBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // الترجمات
  const getTranslations = () => {
    if (typeof window === 'undefined') return { title: 'Install NNM App', install: 'Install', iosInstructions: 'Tap Share & Add to Home' };
    
    const lang = navigator.language.toLowerCase();
    const translations: Record<string, { title: string; install: string; iosInstructions: string }> = {
      'ar': { title: 'تثبيت تطبيق NNM', install: 'تثبيت', iosInstructions: 'اضغط مشاركة ثم إضافة للشاشة الرئيسية' },
      'en': { title: 'Install NNM App', install: 'Install', iosInstructions: 'Tap Share & Add to Home' },
      // لغات أخرى يمكن إضافتها هنا
    };

    const langCode = lang.split('-')[0];
    return translations[lang] || translations[langCode] || translations['en'];
  };

  const t = getTranslations();

  useEffect(() => {
    setIsMounted(true);
    
    // التحقق من الإغلاق السابق
    if (localStorage.getItem('nnm_install_banner_dismissed')) return;

    // التحقق من iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // التحقق هل التطبيق مثبت بالفعل
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // التقاط حدث التثبيت للأندرويد
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // منع شريط المتصفح الافتراضي
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // مؤقت لإظهار البنر (لضمان ظهوره حتى لو تأخر الحدث قليلاً)
    const timer = setTimeout(() => setShowBanner(true), 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowBanner(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    setShowBanner(false);
    localStorage.setItem('nnm_install_banner_dismissed', 'true');
  };

  if (!isMounted || !showBanner || isStandalone) return null;

  return (
    <>
      <div 
        dir="ltr" 
        className="install-banner"
      >
        <div className="banner-content">
          {/* القسم الأيسر: الأيقونة والنص */}
          <div className="left-section">
            <div className="icon-wrapper">
              <img src="/icons/icon-192x192.png" alt="NNM" />
            </div>
            
            <div className="text-wrapper">
              <span className="app-title">{t.title}</span>
              {isIOS && <span className="ios-hint">{t.iosInstructions}</span>}
            </div>
          </div>

          {/* القسم الأيمن: الزر والإغلاق */}
          <div className="right-section">
            {/* الزر يظهر فقط إذا لم يكن iOS وكان الحدث جاهزاً */}
            {!isIOS && deferredPrompt && (
              <button onClick={handleInstall} className="install-btn">
                {t.install}
              </button>
            )}
            
            <button onClick={handleClose} className="close-btn" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 13L13 1M1 1L13 13" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .install-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 99999;
          background-color: #121212; /* خلفية داكنة جداً */
          border-bottom: 1px solid rgba(252, 213, 53, 0.2);
          box-shadow: 0 4px 20px rgba(0,0,0,0.8);
          animation: slideDown 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .banner-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          min-height: 70px; /* ارتفاع مضمون */
          max-width: 1400px;
          margin: 0 auto;
          gap: 12px;
        }

        /* --- Left Section --- */
        .left-section {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1; /* يأخذ المساحة المتبقية */
          min-width: 0; /* مهم جداً لمنع النص من دفع العناصر */
        }

        .icon-wrapper {
          width: 44px;
          height: 44px;
          background: #000000;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0; /* ممنوع تصغير الأيقونة */
          border: 1px solid rgba(255,255,255,0.1);
        }

        .icon-wrapper img {
          width: 34px;
          height: 34px;
          border-radius: 6px;
          object-fit: cover;
        }

        .text-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden; /* لقص النص الطويل */
        }

        .app-title {
          color: #FCD535;
          font-weight: 700;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ios-hint {
          font-size: 10px;
          color: #999;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* --- Right Section --- */
        .right-section {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0; /* ممنوع تصغير هذا القسم نهائياً */
        }

        .install-btn {
          background: linear-gradient(135deg, #FFD700 0%, #B8860B 100%);
          color: #000;
          border: none;
          border-radius: 6px;
          padding: 0 16px;
          height: 36px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 2px 10px rgba(252, 213, 53, 0.2);
          transition: transform 0.2s;
        }
        
        .install-btn:active {
          transform: scale(0.96);
        }

        .close-btn {
          background: rgba(255,255,255,0.08);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
          cursor: pointer;
          flex-shrink: 0;
        }

        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default InstallAppBanner;
