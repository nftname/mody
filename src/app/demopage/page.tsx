'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// --- (1) الشارات ---
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

// --- (2) النجوم ---
const FiveStars = () => (
    <div className="stars-container" style={{ display: 'flex', justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} className="star-icon" viewBox="0 0 24 24" fill="#F0C420" stroke="#B8860B" strokeWidth="1">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
        ))}
    </div>
);

// --- (3) الأيقونات (تم استبدال المسارات بمسارات فيكتور أصلية وعالية الجودة) ---
const CryptoLogo = ({ type }: { type: string }) => {
    // هذا الستايل يمنع انضغاط الأيقونة نهائياً
    const style = { flexShrink: 0, minWidth: '32px' }; 
    
    switch (type) {
        case 'BTC': return <svg style={style} width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#F7931A"/><path d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z" fill="#FFF"/></svg>;
        case 'ETH': return <svg style={style} width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#627EEA"/><path d="M16.498 4v8.87l7.497 3.35z" fill="#C0CBF6"/><path d="M16.498 4L9 16.22l7.498-3.35z" fill="#FFF"/><path d="M16.498 21.968v6.027L24 17.616z" fill="#C0CBF6"/><path d="M16.498 27.995v-6.028L9 17.616z" fill="#FFF"/><path d="M16.498 20.573l7.497-4.353-7.497-3.348z" fill="#8197EE"/><path d="M9 16.22l7.498 4.353v-7.701z" fill="#C0CBF6"/></svg>;
        case 'POLYGON': return <svg style={style} width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#8247E5"/><path d="M21.9 10.325L16.5 7.275a1 1 0 00-1 0L10.1 10.325a1 1 0 00-.5.866v6.1a1 1 0 00.5.866l5.4 3.05a1 1 0 001 0l5.4-3.05a1 1 0 00.5-.866v-6.1a1 1 0 00-.5-.866zM16 20.275l-4.5-2.541v-5.082L16 15.193l4.5-2.541v5.082L16 20.275z" fill="#FFF"/></svg>;
        case 'SOL': return <svg style={style} width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#000"/><path d="M9.5 19.3l2.2-2.3h13l-2.2 2.3z" fill="url(#solGrad)"/><path d="M22.5 12.7l-2.2 2.3h-13l2.2-2.3z" fill="url(#solGrad)"/><path d="M9.5 25.8l2.2-2.3h13l-2.2 2.3z" fill="url(#solGrad)"/><defs><linearGradient id="solGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/></linearGradient></defs></svg>;
        case 'BNB': return <svg style={style} width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#F3BA2F"/><path d="M12.115 16L16 19.877 19.885 16 16 12.123 12.115 16zm-3.9 0L10.5 18.277l-2.292 2.285L6 18.369l2.215-2.37zm7.785-7.754l2.285 2.285-2.285 2.277L13.723 10.523 16 8.246zm3.9 7.754l2.215 2.37-2.207 2.193-2.293-2.285L19.9 16zM16 23.754l2.277-2.277L20.562 23.754l-2.277 2.292L16 23.754zM8.223 13.73l2.277-2.277 2.292 2.293-2.292 2.277L8.223 13.73z" fill="#FFF"/></svg>;
        case 'USDT': return <svg style={style} width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#26A17B"/><path d="M18.8 14.5h3.9v-2.3h-13.4v2.3h3.9v8.9h5.6v-8.9z" fill="#FFF"/></svg>;
        default: return null;
    }
};

const PayButton = ({ type, name }: { type: string, name: string }) => (
    <button className="pay-btn">
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            {/* الأيقونة على اليسار */}
            <div style={{ marginRight: '10px' }}>
                <CryptoLogo type={type} />
            </div>
            
            {/* حاوية النص: تأخذ المساحة المتبقية وتقوم بتوسيط المحتوى داخلها */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: '800', fontSize: '15px', color: '#1A1A1A', marginBottom: '2px' }}>{name}</span>
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Send</span>
            </div>
        </div>
    </button>
);

export default function DemoProfilePage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const toggleFeedback = (type: 'like' | 'dislike') => {
      setFeedback(prev => prev === type ? null : type);
  };

  const deepPurpleColor = '#2E1A47'; 
  const diamondColor = '#101740'; // أزرق كحلي غامق للماسة

  return (
    <main style={{ backgroundColor: '#F0EDF2', minHeight: '100vh', fontFamily: '"Inter", sans-serif', position: 'relative', zIndex: 1000 }}>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Satoshi:wght@700;900&family=Orbitron:wght@500;700&display=swap');
        @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');

        nav, footer, .navbar, .footer, header:not(.hero-banner-wrapper) {
            display: none !important;
        }

        .page-container {
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            position: relative;
        }

        /* --- الهيدر (الكمبيوتر) --- */
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
            top: 55px; 
            left: 25px;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background-color: rgba(0,0,0,0.6); 
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 22px;
            cursor: pointer;
            z-index: 100;
            border: 1px solid rgba(255,255,255,0.3);
            transition: all 0.2s ease;
        }

        /* --- الكرت --- */
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
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 5px 0;
        }

        .card-content {
            text-align: center;
            color: white;
            z-index: 20;
            margin: 5px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
        }

        .card-name {
            font-family: 'Satoshi', sans-serif;
            font-size: 20px;
            font-weight: 900;
            text-transform: uppercase;
            color: white;
            text-shadow: 0 3px 10px rgba(0,0,0,0.7);
            letter-spacing: 0.5px;
        }

        /* الأحجام */
        .badge-icon { width: 23px; height: 23px; } 
        .star-icon { width: 21px; height: 21px; } 
        .stars-container { gap: 5px; margin-top: 8px; margin-bottom: 5px; }
        .badges-container { margin-bottom: 10px; margin-top: -5px; }

        /* --- Conviction --- */
        .conviction-box {
            position: relative;
            text-align: center;
            margin-top: 15px;
            margin-bottom: 30px;
        }
        .conviction-label {
            color: ${deepPurpleColor}; 
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            font-family: 'Satoshi', sans-serif;
            letter-spacing: 1px;
            display: block; /* لضمان نزولها في سطر لوحدها */
        }
        
        /* حاوية الرقم والماسة لضبط التوسط المطلق */
        .conviction-number-wrapper {
            position: relative;
            display: inline-block; /* ليكون على قد حجم الرقم */
            margin-top: 5px;
        }

        .conviction-number {
            color: ${deepPurpleColor};
            font-size: 20px; 
            font-weight: 900;
            font-family: 'Satoshi', sans-serif;
        }
        
        .conviction-diamond {
            position: absolute;
            font-size: 18px; 
            color: ${diamondColor};
            right: -25px; /* دفع الماسة لليمين خارج حدود الرقم */
            top: 50%;
            transform: translateY(-50%);
        }

        .thank-you-title {
            font-family: 'Satoshi', sans-serif;
            font-weight: 700;
            font-size: 22px;
            color: ${deepPurpleColor};
            margin-bottom: 10px;
        }
        .thank-you-subtitle {
            color: ${deepPurpleColor};
            font-size: 16px;
            line-height: 1.5;
            font-weight: 600;
        }

        /* --- تنسيق الأزرار (عام) --- */
        .pay-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            max-width: 750px;
            margin: 0 auto;
        }

        .pay-btn {
            background: #fff;
            border: 1px solid #eee;
            border-radius: 16px;
            /* ارتفاع كبير لإظهار الأيقونة */
            height: 75px; 
            padding: 0 15px;
            display: flex;
            justify-content: flex-start; 
            align-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #333;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .pay-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.06);
            border-color: #d1d5db;
        }

        .marketing-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 200px;
            height: 48px;
            background: linear-gradient(110deg, #5e1139 0%, #240b36 50%, #020c1b 100%);
            border-radius: 25px;
            color: white;
            font-family: 'Satoshi', sans-serif;
            font-weight: 900;
            font-size: 14px;
            text-transform: uppercase;
            text-decoration: none;
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            transition: transform 0.2s;
        }

        .footer-note {
             margin-top: 30px;
             font-size: 12px;
             color: #aaa;
             font-style: italic;
        }

        .cta-phrase {
            font-family: 'Cinzel', serif;
            font-size: 18px;
            color: ${deepPurpleColor};
            margin-bottom: 10px;
            font-weight: 700;
        }

        /* --- تنسيقات الجوال --- */
        @media (max-width: 768px) {
            .hero-banner-wrapper { 
                height: auto; 
                min-height: unset; 
                /* استخدام Aspect Ratio هو الحل الوحيد لعدم مط الصورة في الجوال */
                aspect-ratio: 3.3 / 1; 
                margin-top: -40px;
                display: flex;
                justify-content: center;
                align-items: center;
            } 
            
            .hero-banner-img {
                width: 100%;
                height: 100%;
                /* في الجوال، الصورة يجب أن تكون Cover لتملأ العرض */
                object-fit: cover; 
                /* توسيط الصورة */
                object-position: center center;
            }

            /* رفع السهم للمنطقة البيضاء */
            .back-btn {
                width: 28px;        
                height: 28px;
                top: 15px; /* في المنطقة البيضاء */
                left: 15px;
                font-size: 14px;    
                border-width: 0.5px;
            }
            
            .identity-card-container { 
                width: 40%;
                height: 80px;
                min-width: 140px;
                margin: -22px 0 0 20px;
                border-radius: 12px;
                border-width: 0.8px;
                padding: 2px 0;
            }

            .card-content { margin: 2px 0; }
            .card-name { font-size: 15px; }

            .badge-icon { width: 13px; height: 13px; }
            .star-icon { width: 11px; height: 11px; }
            .stars-container { gap: 1px; margin-top: 4px; margin-bottom: 2px; }
            .badges-container { margin-bottom: 2px; margin-top: -2px; }

            .cta-phrase {
                font-size: 17px; 
                letter-spacing: -0.5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: ${deepPurpleColor};
            }

            .footer-note { font-size: 10px; }
            
            /* أزرار الدفع للجوال (زرين في الصف) */
            .pay-grid { 
                grid-template-columns: repeat(2, 1fr); 
                max-width: 100%; 
                gap: 10px;
            }
            
            /* تقليل بادينج الزر قليلاً في الجوال */
            .pay-btn {
                padding: 0 10px;
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
              {/* حاوية خاصة لضبط التوسط مع الماسة المطلقة */}
              <div className="conviction-number-wrapper">
                  <span className="conviction-number">500,000</span>
                  <span className="conviction-diamond">💎</span>
              </div>
          </div>

          <div style={{ maxWidth: '700px', margin: '20px auto', textAlign: 'center', padding: '0 20px' }}>
              
              <div className="pay-grid">
                  <PayButton type="BTC" name="Bitcoin" />
                  <PayButton type="ETH" name="Ethereum" />
                  <PayButton type="POLYGON" name="Polygon" />
                  <PayButton type="SOL" name="Solana" />
                  <PayButton type="BNB" name="BNB Chain" />
                  <PayButton type="USDT" name="Tether" />
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
