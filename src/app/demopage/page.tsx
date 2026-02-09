'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// --- (1) الشارات ---
const ThreeVerificationBadges = () => (
    <div className="badges-container" style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        {/* Green */}
        <svg className="badge-icon" viewBox="0 0 42 42" fill="none" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}>
            <circle cx="21" cy="21" r="19" fill="#25D366" stroke="#888888" strokeWidth="1"/>
            <path d="M10 24 L18 32 L34 10" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* Blue */}
        <svg className="badge-icon" viewBox="0 0 42 42" fill="none" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}>
            <circle cx="21" cy="21" r="19" fill="#1DA1F2" stroke="#888888" strokeWidth="1"/>
            <path d="M10 24 L18 32 L34 10" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* Gold */}
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

// --- (3) الأيقونات (تم تحديث USDT ومنع الضغط) ---
const CryptoLogo = ({ type }: { type: string }) => {
    // ستايل موحد لمنع الضغط
    const style = { flexShrink: 0, minWidth: '40px', height: '40px' }; 
    
    switch (type) {
        case 'BTC': return (
            <svg style={style} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="32" fill="#F7931A"/>
                <path d="M44.384 25.875c.628-4.194-2.566-6.446-6.93-7.95L38.87 13.5l-3.456-.86-.842 3.376c-.909-.227-1.84-.44-2.77-.65L32.644 12l-3.457-.862-1.39 5.57s-.96-.24-1.353-.15c.894.204 1.05.746.993 1.187l-1.613 6.47c.097.024.22.06.356.114l-.366-.09-2.26 9.064c-.171.424-.606 1.062-1.586.818.036.05-1.352-.15-1.352-.15l-1.716 3.957 4.5.872c.836.21 1.656.43 2.462.636l-1.43 5.742 3.455.862 1.416-5.68c.944.256 1.86.49 2.756.714l-1.412 5.656 3.456.862 1.43-5.732c5.896 1.116 10.328.666 12.194-4.666 1.504-4.292-.074-6.77-3.176-8.384 2.26-.52 3.96-2.006 4.414-5.076zM38.484 36.95c-1.066 4.294-8.296 1.972-10.64 1.39l1.9-7.61c2.344.586 9.858 1.744 8.74 6.22zm1.07-11.138c-.974 3.906-6.99 1.92-8.94 1.434l1.72-6.9c1.95.486 8.236 1.392 7.22 5.466z" fill="white"/>
            </svg>
        );
        case 'ETH': return (
            <svg style={style} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#627EEA"/>
                <path d="M16 4L15.865 4.46V23.734L16 23.869L23.498 19.434L16 4Z" fill="#C0CBF6"/>
                <path d="M16 4L8.5 19.434L16 23.869V14.186V4Z" fill="white"/>
                <path d="M16 25.0755L15.932 25.1585V28.7995L16 29.0005L23.503 19.9575L16 25.0755Z" fill="#C0CBF6"/>
                <path d="M16 29.0005V25.0755L8.5 19.9575L16 29.0005Z" fill="white"/>
                <path d="M16 23.8695L23.498 19.4345L16 14.1865V23.8695Z" fill="#8197EE"/>
                <path d="M8.5 19.4345L16 23.8695V14.1865L8.5 19.4345Z" fill="#C0CBF6"/>
            </svg>
        );
        case 'POLYGON': return (
            <svg style={style} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#8247E5"/>
                <path d="M21.9 10.325L16.5 7.275a1 1 0 00-1 0L10.1 10.325a1 1 0 00-.5.866v6.1a1 1 0 00.5.866l5.4 3.05a1 1 0 001 0l5.4-3.05a1 1 0 00.5-.866v-6.1a1 1 0 00-.5-.866zM16 20.275l-4.5-2.541v-5.082L16 15.193l4.5-2.541v5.082L16 20.275z" fill="white"/>
            </svg>
        );
        case 'SOL': return (
            <svg style={style} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#000"/>
                <path d="M8.5 19.3L10.7 17H23.7L21.5 19.3H8.5Z" fill="url(#solGrad)"/>
                <path d="M23.5 12.7L21.3 15H8.30005L10.5 12.7H23.5Z" fill="url(#solGrad)"/>
                <path d="M8.5 25.8L10.7 23.5H23.7L21.5 25.8H8.5Z" fill="url(#solGrad)"/>
                <defs>
                    <linearGradient id="solGrad" x1="8.5" y1="12.7" x2="23.7" y2="25.8" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#00FFA3"/>
                        <stop offset="1" stopColor="#DC1FFF"/>
                    </linearGradient>
                </defs>
            </svg>
        );
        case 'BNB': return (
            <svg style={style} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#F3BA2F"/>
                <path d="M12.115 16L16 19.877L19.885 16L16 12.123L12.115 16ZM8.215 16L10.5 18.277L8.208 20.562L6 18.369L8.215 16ZM16 8.246L18.285 10.531L16 12.808L13.723 10.523L16 8.246ZM19.9 16L22.115 18.369L19.907 20.562L17.615 18.277L19.9 16ZM16 23.754L18.277 21.477L20.562 23.754L18.285 26.046L16 23.754ZM8.223 13.73L10.5 11.453L12.792 13.746L10.5 16.023L8.223 13.73Z" fill="white"/>
            </svg>
        );
        case 'USDT': return (
            <svg style={style} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#26A17B"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M19.96 14.28V11.83H24.5V10H7.5V11.83H12.04V14.28C12.04 14.39 12.04 14.5 12.05 14.61C9.62 14.9 7.82 15.65 7.82 16.53C7.82 17.41 9.61 18.15 12.03 18.45V24H19.96V18.45C22.39 18.16 24.18 17.41 24.18 16.53C24.18 15.65 22.39 14.91 19.97 14.61C19.97 14.5 19.96 14.39 19.96 14.28ZM19.96 16.53C19.96 17.15 18.19 17.65 16 17.65C13.81 17.65 12.04 17.15 12.04 16.53C12.04 15.91 13.81 15.41 16 15.41C18.19 15.41 19.96 15.91 19.96 16.53Z" fill="white"/>
            </svg>
        );
        default: return null;
    }
};

const PayButton = ({ type, name }: { type: string, name: string }) => (
    <button className="pay-btn">
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            {/* الأيقونة على اليسار */}
            <div style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
                <CryptoLogo type={type} />
            </div>
            
            {/* النص في المنتصف */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                <span style={{ fontWeight: '800', fontSize: '15px', color: '#1A1A1A', marginBottom: '0px', lineHeight: '1.2' }}>{name}</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#777', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Send</span>
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
  const diamondColor = '#101740'; 

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
            display: block; 
        }
        
        .conviction-number-wrapper {
            position: relative;
            display: inline-block; 
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
            right: -25px; 
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

        /* --- الأزرار --- */
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
                aspect-ratio: 3.3 / 1; 
                margin-top: -40px;
                display: flex;
                justify-content: center;
                align-items: center;
            } 
            
            .hero-banner-img {
                width: 100%;
                height: 100%;
                object-fit: cover; 
                object-position: center center;
            }

            .back-btn {
                width: 28px;        
                height: 28px;
                top: 15px; 
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
            
            .pay-grid { 
                grid-template-columns: repeat(2, 1fr); 
                max-width: 100%; 
                gap: 10px;
            }
            
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
