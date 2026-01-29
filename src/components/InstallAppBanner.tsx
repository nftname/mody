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
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(12px)',
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div 
        className="container-fluid px-3"
        style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <div 
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              background: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(252, 213, 53, 0.2)',
              flexShrink: 0
            }}
          >
            <img 
              src="/icons/icon-192x192.png" 
              alt="NNM" 
              style={{ width: '36px', height: '36px', borderRadius: '8px' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span 
              className="fw-bold text-truncate" 
              style={{ 
                color: '#FCD535', 
                fontSize: '15px',
                lineHeight: '1.2'
              }}
            >
              {t.title}
            </span>
            {isIOS && (
              <span className="text-truncate" style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                {t.iosInstructions}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {!isIOS && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="btn fw-bold"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #B8860B 100%)',
                color: '#1a1200',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '700',
                boxShadow: '0 2px 10px rgba(252, 213, 53, 0.2)',
                whiteSpace: 'nowrap'
              }}
            >
              {t.install}
            </button>
          )}
          
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888',
              cursor: 'pointer'
            }}
            aria-label={t.close}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        .fade-in {
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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
