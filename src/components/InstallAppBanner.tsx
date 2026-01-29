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

    const langCode = lang.split('-')[0];
    return translations[lang] || translations[langCode] || translations['en'];
  };

  const t = getTranslations();

  useEffect(() => {
    setIsMounted(true);
    
    const dismissed = localStorage.getItem('nnm_install_banner_dismissed');
    
    if (dismissed) {
      return;
    }

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 2000);


    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      setDeferredPrompt(null);
      setShowBanner(false);
      localStorage.setItem('nnm_install_banner_dismissed', 'true');
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    setShowBanner(false);
    localStorage.setItem('nnm_install_banner_dismissed', 'true');
  };

  if (!isMounted) return null;
  
  if (!showBanner || isStandalone) {
    return null;
  }

  return (
    <div 
      dir="ltr"
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
        <div className="d-flex align-items-center gap-3">
          <div 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#000000',
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
          
          <div className="d-flex flex-column text-start">
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
