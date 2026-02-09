'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// --- (1) Modern Web3 Standard Icons (2025 Vector Assets) ---
// تم استخدام مسارات SVG الرسمية المحدثة لضمان الدقة والوضوح التام
const CryptoIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'BTC': return (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#F7931A"/>
                <path d="M22.2 13.9C22.5 12.3 21.3 11.5 19.7 10.9L20.2 8.8L18.9 8.5L18.4 10.6C18 10.5 17.7 10.4 17.3 10.3L17.8 8.2L16.5 7.9L16 10C15.7 10 15.3 9.9 15 9.9L13.2 9.5L12.8 11.1C12.8 11.1 13.8 11.3 13.8 11.3C14.5 11.5 14.6 11.8 14.6 12.1L13.7 15.5C13.8 15.5 13.8 15.5 13.9 15.5C13.8 15.6 13.8 15.6 13.7 15.6L12.6 20.2C12.5 20.3 12.4 20.6 12 20.5C12 20.5 11.1 20.3 11.1 20.3L10.3 22.1L13.7 22.9C14.3 23.1 15 23.2 15.6 23.4L15.1 25.5L16.4 25.8L16.9 23.7C17.3 23.8 17.6 23.9 18 24L17.5 26.1L18.8 26.4L19.3 24.3C21.5 24.7 23.2 24.5 23.9 22.5C24.4 20.9 23.8 20 22.7 19.4C23.5 19.2 24.1 18.7 24.3 17.5ZM20.8 21C20.4 22.6 17.7 21.7 16.8 21.5L17.5 18.6C18.4 18.9 21.3 19.3 20.8 21ZM21.2 16.8C20.8 18.3 18.5 17.6 17.8 17.4L18.4 14.8C19.1 15 21.5 15.4 21.2 16.8Z" fill="white"/>
            </svg>
        );
        case 'ETH': return (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#627EEA"/>
                <path d="M16 4L8.5 16.5L16 21L23.5 16.5L16 4Z" fill="white" fillOpacity="0.6"/>
                <path d="M16 4V21L23.5 16.5L16 4Z" fill="white"/>
                <path d="M16 22L8.5 17.5L16 28L23.5 17.5L16 22Z" fill="white" fillOpacity="0.6"/>
                <path d="M16 28V22L23.5 17.5L16 28Z" fill="white"/>
            </svg>
        );
        case 'POLYGON': return (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#8247E5"/>
                <path d="M22.5 10.5L16.5 7L10.5 10.5V16.5L16.5 20L22.5 16.5V10.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16.5 12V16M16.5 16L13 18M16.5 16L20 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        );
        case 'SOL': return (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#000"/>
                <path d="M8 20.5L10 18.5H24L22 20.5H8Z" fill="#14F195"/>
                <path d="M24 14.5L22 16.5H8L10 14.5H24Z" fill="#9945FF"/>
                <path d="M8 8.5L10 6.5H24L22 8.5H8Z" fill="#14F195"/>
            </svg>
        );
        case 'BNB': return (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#F3BA2F"/>
                <path d="M12.1 16L16 19.9L19.9 16L16 12.1L12.1 16ZM9 16L10.5 17.5L9 19L7.5 17.5L9 16ZM16 9L17.5 10.5L16 12L14.5 10.5L16 9ZM23 16L24.5 17.5L23 19L21.5 17.5L23 16ZM16 23L17.5 24.5L16 26L14.5 24.5L16 23Z" fill="white"/>
            </svg>
        );
        case 'USDT': return (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#26A17B"/>
                <path d="M19.5 13.5H22V11H10V13.5H12.5V23H15V25H17V23H19.5V13.5Z" fill="white"/>
            </svg>
        );
        default: return null;
    }
};

// --- (2) Web3 Payment Button Component ---
// تصميم موحد للأزرار، يظهر الأيقونة واسم الشبكة بوضوح
const Web3PaymentButton = ({ type, name }: { type: string, name: string }) => (
    <button className="web3-payment-btn">
        <div className="btn-content">
            <div className="token-info">
                <CryptoIcon type={type} />
                <span className="token-name">{name}</span>
            </div>
            {/* سهم بسيط لإظهار أن الزر قابل للنقر (اختياري ويضفي طابعاً تفاعلياً) */}
            <div className="action-arrow">
                <i className="bi bi-chevron-right"></i>
            </div>
        </div>
    </button>
);

// --- (3) Helper Components (Badges & Stars) ---
const ThreeVerificationBadges = () => (
    <div className="badges-container" style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        <svg className="badge-icon" viewBox="0 0 42 42" fill="none" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}>
            <circle cx="21" cy="21" r="19" fill="#25D366" stroke="#888888" strokeWidth="1"/>
            <path d="M10 24 L18 32 L34 10" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg className="badge-icon" viewBox="0 0 42 42" fill="none" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}>
            <circle cx="21" cy="21" r="19" fill="#1DA1F2" stroke="#888888" strokeWidth="1"/>
            <path d="M10 24 L18 32 L34 10" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg className="badge-icon" viewBox="0 0 42 42" fill="none" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}>
            <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
            </defs>
            <circle cx="21" cy="21" r="19" fill="url(#goldGrad)" stroke="#888888" strokeWidth="1"/>
            <path d="M10 24 L18 32 L34 10" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

const FiveStars = () => (
    <div className="stars-container" style={{ display: 'flex', justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} className="star-icon" viewBox="0 0 24 24" fill="#F0C420" stroke="#B8860B" strokeWidth="1">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
        ))}
    </div>
);

export default function DemoProfilePage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const toggleFeedback = (type: 'like' | 'dislike') => {
      setFeedback(prev => prev === type ? null : type);
  };

  const deepPurpleColor = '#2E1A47'; 
  const diamondColor = '#101740'; 

  return (
    <main style={{ backgroundColor: '#F0EDF2', minHeight: '100vh', fontFamily: '"Inter", sans-serif', position: 'relative', zIndex: 1000 }}>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Satoshi:wght@700;900&family=Orbitron:wght@500;700&display=swap');
        @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');

        /* --- Reset & Base --- */
        nav, footer, .navbar, .footer, header:not(.hero-banner-wrapper) {
            display: none !important;
        }

        .page-container {
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            position: relative;
        }

        /* --- Header --- */
        .hero-banner-wrapper {
            width: 100%;
            height: auto;
            aspect-ratio: 3.3 / 1;
            max-height: 300px;
            position: relative;
            background-color: transparent;
            overflow: hidden;
            margin-top: -40px; 
        }

        .hero-banner-img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: center;
        }
        
        .hero-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.2));
            pointer-events: none;
        }

        .back-btn {
            position: absolute;
            top: 55px; left: 25px;
            width: 45px; height: 45px;
            border-radius: 50%;
            background-color: rgba(0,0,0,0.6); 
            backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            color: white; font-size: 22px; cursor: pointer; z-index: 100;
            border: 1px solid rgba(255,255,255,0.3);
            transition: all 0.2s ease;
        }

        /* --- Profile Card --- */
        .identity-card-container {
            position: relative;
            width: 260px;
            height: 140px;
            margin-top: -30px; 
            margin-left: 10%; 
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.4);
            z-index: 10;
            background: radial-gradient(circle at center, #0F172A 0%, #1e1b4b 40%, #581c87 100%);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 5px 0;
        }

        .card-content {
            text-align: center; color: white; z-index: 20; margin: 5px 0;
            display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;
        }

        .card-name {
            font-family: 'Satoshi', sans-serif;
            font-size: 20px; font-weight: 900;
            text-transform: uppercase; color: white;
            text-shadow: 0 3px 10px rgba(0,0,0,0.7);
            letter-spacing: 0.5px;
        }

        .badge-icon { width: 23px; height: 23px; } 
        .star-icon { width: 21px; height: 21px; } 
        .stars-container { gap: 5px; margin-top: 8px; margin-bottom: 5px; }
        .badges-container { margin-bottom: 10px; margin-top: -5px; }

        /* --- Conviction Section --- */
        .conviction-box {
            position: relative; text-align: center; margin-top: 15px; margin-bottom: 30px;
        }
        .conviction-label {
            color: ${deepPurpleColor}; 
            font-size: 14px; font-weight: 700; text-transform: uppercase;
            font-family: 'Satoshi', sans-serif; letter-spacing: 1px;
            display: block; 
        }
        .conviction-number-wrapper {
            position: relative; display: inline-block; margin-top: 5px;
        }
        .conviction-number {
            color: ${deepPurpleColor};
            font-size: 20px; font-weight: 900; font-family: 'Satoshi', sans-serif;
        }
        .conviction-diamond {
            position: absolute; font-size: 18px; color: ${diamondColor};
            right: -25px; top: 50%; transform: translateY(-50%);
        }

        /* --- Payment Grid (Web3 Buttons) --- */
        .pay-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr); /* 3 أعمدة للكمبيوتر */
            gap: 12px;
            max-width: 800px;
            margin: 0 auto;
        }

        /* تنسيق الزر الموحد */
        .web3-payment-btn {
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            height: 64px; /* ارتفاع قياسي ومريح */
            width: 100%;
            cursor: pointer;
            transition: all 0.2s ease;
            padding: 0 16px;
            display: flex;
            align-items: center;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .web3-payment-btn:hover {
            border-color: #D1D5DB;
            background: #F9FAFB;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .btn-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }

        .token-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .token-name {
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            font-size: 16px;
            color: #111827;
        }

        .action-arrow {
            color: #9CA3AF;
            font-size: 14px;
        }

        /* --- Text & Footer --- */
        .footer-note {
             margin-top: 30px; font-size: 12px; color: #aaa; font-style: italic;
        }
        .thank-you-title {
            font-family: 'Satoshi', sans-serif; font-weight: 700; font-size: 22px;
            color: ${deepPurpleColor}; margin-bottom: 10px;
        }
        .thank-you-subtitle {
            color: ${deepPurpleColor}; font-size: 16px; line-height: 1.5; font-weight: 600;
        }
        .cta-phrase {
            font-family: 'Cinzel', serif; font-size: 18px; color: ${deepPurpleColor};
            margin-bottom: 10px; font-weight: 700;
        }

        /* --- Mobile Responsive --- */
        @media (max-width: 768px) {
            .hero-banner-wrapper { 
                height: auto; min-height: unset; aspect-ratio: 3.3 / 1; 
                margin-top: -40px; display: flex; justify-content: center; align-items: center;
            } 
            .hero-banner-img {
                width: 100%; height: 100%; object-fit: cover; object-position: center center;
            }
            .back-btn {
                width: 28px; height: 28px; top: 15px; left: 15px; font-size: 14px; border-width: 0.5px;
            }
            .identity-card-container { 
                width: 40%; height: 80px; min-width: 140px; margin: -22px 0 0 20px;
                border-radius: 12px; border-width: 0.8px; padding: 2px 0;
            }
            .card-content { margin: 2px 0; }
            .card-name { font-size: 15px; }
            .badge-icon { width: 13px; height: 13px; }
            .star-icon { width: 11px; height: 11px; }
            .stars-container { gap: 1px; margin-top: 4px; margin-bottom: 2px; }
            .badges-container { margin-bottom: 2px; margin-top: -2px; }
            
            .cta-phrase {
                font-size: 17px; letter-spacing: -0.5px; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis; color: ${deepPurpleColor};
            }
            .footer-note { font-size: 10px; }

            /* Grid for Mobile: 2 Columns */
            .pay-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
            
            .web3-payment-btn {
                height: 60px; /* أقصر قليلاً للجوال */
                padding: 0 12px;
            }
            
            .token-name {
                font-size: 14px;
            }
            
            .action-arrow {
                display: none; /* إخفاء السهم في الجوال لتوفير مساحة */
            }
        }
      `}</style>

      <div className="hero-banner-wrapper">
          <div className="back-btn" onClick={() => router.back()}>
              <i className="bi bi-arrow-left"></i>
          </div>
          <img 
            src="/images/your-chainface.jpg" 
            alt="ChainFace Cover" 
            className="hero-banner-img"
          />
          <div className="hero-overlay"></div>
      </div>

      <div className="page-container">
          <div className="identity-card-container">
              <div className="card-content">
                  <ThreeVerificationBadges />
                  <div className="card-name-row">
                      <span className="card-name">ALEXANDER</span>
                  </div>
              </div>
              <FiveStars />
          </div>

          <div className="conviction-box">
              <span className="conviction-label">Conviction</span>
              <div className="conviction-number-wrapper">
                  <span className="conviction-number">500,000</span>
                  <span className="conviction-diamond">💎</span>
              </div>
          </div>

          <div style={{ maxWidth: '800px', margin: '20px auto', textAlign: 'center', padding: '0 20px' }}>
              
              {/* --- شبكة الأزرار الستة --- */}
              <div className="pay-grid">
                  <Web3PaymentButton type="BTC" name="Bitcoin" />
                  <Web3PaymentButton type="ETH" name="Ethereum" />
                  <Web3PaymentButton type="POLYGON" name="Polygon" />
                  <Web3PaymentButton type="SOL" name="Solana" />
                  <Web3PaymentButton type="BNB" name="BNB Chain" />
                  <Web3PaymentButton type="USDT" name="Tether" />
              </div>

              <p className="footer-note">
                  Payments are peer-to-peer. ChainFace never holds funds.
              </p>

              <div style={{ marginTop: '40px', marginBottom: '10px' }}>
                <h2 className="thank-you-title">
                      Thank you for stepping into my ChainFace.
                  </h2>
                  <p className="thank-you-subtitle">
                      Your trust means everything.
                  </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
                  <i 
                    className={`bi bi-hand-thumbs-up-fill ${feedback === 'like' ? 'text-gold' : 'text-grey'}`} 
                    style={{ fontSize: '24px', cursor: 'pointer', color: feedback === 'like' ? '#F0C420' : '#ccc', transition: '0.3s' }}
                    onClick={() => toggleFeedback('like')}
                  ></i>
                  <i 
                    className={`bi bi-hand-thumbs-down-fill ${feedback === 'dislike' ? 'text-gold' : 'text-grey'}`} 
                    style={{ fontSize: '24px', cursor: 'pointer', color: feedback === 'dislike' ? '#F0C420' : '#ccc', transition: '0.3s' }}
                    onClick={() => toggleFeedback('dislike')}
                  ></i>
              </div>

          </div>
      </div>

      <div style={{ padding: '30px 20px', backgroundColor: '#fff', borderTop: '1px solid #eee', textAlign: 'center' }}>
          
          <p className="cta-phrase">
             Claim your sovereign name assets now.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15px' }}>
              <Link href="/chainface" className="marketing-btn">
                  YOUR CHAINFACE
              </Link>
          </div>
      </div>

    </main>
  );
}
