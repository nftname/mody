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

  // Multi-language support based on browser language
  const getTranslations = () => {
    if (typeof window === 'undefined') return { title: 'Install NNM App', install: 'Install', close: 'Close', iosInstructions: 'Tap Share button and "Add to Home Screen"' };
    
    const lang = navigator.language.toLowerCase();
    
    const translations: Record<string, { title: string; install: string; close: string; iosInstructions: string }> = {
      'ar': { 
        title: 'حمّل تطبيق NNM', 
        install: 'تثبيت', 
        close: 'إغلاق',
        iosInstructions: 'انقر على زر المشاركة ثم "إضافة إلى الشاشة الرئيسية"'
      },
      'en': { 
        title: 'Install NNM App', 
        install: 'Install', 
        close: 'Close',
        iosInstructions: 'Tap Share button and "Add to Home Screen"'
      },
      'es': { 
        title: 'Instalar App NNM', 
        install: 'Instalar', 
        close: 'Cerrar',
        iosInstructions: 'Toca el botón Compartir y "Añadir a pantalla de inicio"'
      },
      'fr': { 
        title: 'Installer l\'App NNM', 
        install: 'Installer', 
        close: 'Fermer',
        iosInstructions: 'Appuyez sur Partager puis "Sur l\'écran d\'accueil"'
      },
      'de': { 
        title: 'NNM App installieren', 
        install: 'Installieren', 
        close: 'Schließen',
        iosInstructions: 'Teilen-Button und "Zum Home-Bildschirm" tippen'
      },
      'zh': { 
        title: '安装 NNM 应用', 
        install: '安装', 
        close: '关闭',
        iosInstructions: '点击分享按钮，然后选择"添加到主屏幕"'
      },
      'ja': { 
        title: 'NNMアプリをインストール', 
        install: 'インストール', 
        close: '閉じる',
        iosInstructions: '共有ボタンをタップし、「ホーム画面に追加」を選択'
      },
      'pt': { 
        title: 'Instalar App NNM', 
        install: 'Instalar', 
        close: 'Fechar',
        iosInstructions: 'Toque em Compartilhar e "Adicionar à Tela Inicial"'
      },
      'ru': { 
        title: 'Установить NNM', 
        install: 'Установить', 
        close: 'Закрыть',
        iosInstructions: 'Нажмите "Поделиться" и "На экран «Домой»"'
      },
      'hi': { 
        title: 'NNM ऐप इंस्टॉल करें', 
        install: 'इंस्टॉल करें', 
        close: 'बंद करें',
        iosInstructions: 'शेयर बटन दबाएं और "होम स्क्रीन पर जोड़ें" चुनें'
      },
      'ko': { 
        title: 'NNM 앱 설치', 
        install: '설치', 
        close: '닫기',
        iosInstructions: '공유 버튼을 누른 후 "홈 화면에 추가"를 선택하세요'
      },
      'it': { 
        title: 'Installa App NNM', 
        install: 'Installa', 
        close: 'Chiudi',
        iosInstructions: 'Tocca Condividi e "Aggiungi a Home"'
      },
      'tr': { 
        title: 'NNM Uygulamasını Yükle', 
        install: 'Yükle', 
        close: 'Kapat',
        iosInstructions: 'Paylaş düğmesine dokunun ve "Ana Ekrana Ekle"yi seçin'
      }
    };

    // Try exact match first, then try language code only (e.g., 'en-US' -> 'en')
    const langCode = lang.split('-')[0];
    return translations[lang] || translations[langCode] || translations['en'];
  };

  const t = getTranslations();

  useEffect(() => {
    setIsMounted(true);
    
    console.log('🔍 [InstallBanner] Checking banner conditions...');
    
    // Check if already dismissed
    const dismissed = localStorage.getItem('nnm_install_banner_dismissed');
    console.log('📦 [InstallBanner] Dismissed status:', dismissed);
    
    // FORCE SHOW FOR TESTING - Remove this after testing
    // localStorage.removeItem('nnm_install_banner_dismissed');
    
    if (dismissed) {
      console.log('⚠️ [InstallBanner] Banner was dismissed, not showing');
      return;
    }

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);
    console.log('📱 [InstallBanner] Is iOS:', ios);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    console.log('🖥️ [InstallBanner] Is Standalone:', standalone);

    if (standalone) {
      console.log('✅ [InstallBanner] Already installed, not showing banner');
      return;
    }

    // For non-iOS: Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎯 [InstallBanner] beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS OR force show on all devices after 2 seconds
    const timer = setTimeout(() => {
      console.log('⏰ [InstallBanner] Timer fired, showing banner');
      setShowBanner(true);
    }, 2000);


    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    console.log('🚀 [InstallBanner] Install button clicked');
    if (!deferredPrompt) {
      console.log('⚠️ [InstallBanner] No deferred prompt available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ PWA installed');
      }
      
      setDeferredPrompt(null);
      setShowBanner(false);
      localStorage.setItem('nnm_install_banner_dismissed', 'true');
    } catch (error) {
      console.error('Install error:', error);
    }
  };

  const handleClose = () => {
    console.log('❌ [InstallBanner] Banner closed by user');
    setShowBanner(false);
    localStorage.setItem('nnm_install_banner_dismissed', 'true');
  };

  // Don't render on server-side
  if (!isMounted) return null;
  
  if (!showBanner || isStandalone) {
    console.log('🚫 [InstallBanner] Not showing banner:', { showBanner, isStandalone });
    return null;
  }

  console.log('✨ [InstallBanner] Rendering banner!');

  return (
    <div 
      className="fade-in" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        backgroundColor: '#1a1a1a',
        borderBottom: '1px solid rgba(252, 213, 53, 0.3)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div 
        className="container-fluid d-flex align-items-center justify-content-between py-2 px-3"
        style={{ maxWidth: '1400px', margin: '0 auto' }}
      >
        {/* App Icon + Text */}
        <div className="d-flex align-items-center gap-3">
          <div 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #B8860B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(252, 213, 53, 0.3)'
            }}
          >
            <img 
              src="/icons/icon-192x192.png" 
              alt="NNM" 
              style={{ width: '32px', height: '32px', borderRadius: '6px' }}
            />
          </div>
          
          <div className="d-flex flex-column">
            <span 
              className="fw-bold" 
              style={{ 
                color: '#FCD535', 
                fontSize: '14px',
                lineHeight: '1.2'
              }}
            >
              {t.title}
            </span>
            {isIOS && (
              <span style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
                {t.iosInstructions}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex align-items-center gap-2">
          {!isIOS && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="btn fw-bold"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #B8860B 100%)',
                color: '#1a1200',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 16px',
                fontSize: '13px',
                boxShadow: '0 2px 8px rgba(252, 213, 53, 0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {t.install}
            </button>
          )}
          
          <button
            onClick={handleClose}
            className="btn border-0"
            style={{
              background: 'transparent',
              color: '#888',
              fontSize: '20px',
              padding: '4px 8px',
              lineHeight: '1'
            }}
            aria-label={t.close}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      </div>

      <style jsx>{`
        .fade-in {
          animation: slideDown 0.3s ease-out;
        }
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
    </div>
  );
};

export default InstallAppBanner;
