'use client';
import Link from 'next/link';
import React, { useState } from 'react'; // استدعاء useState للتفاعل
import { useRouter } from 'next/navigation';

// --- (1) الشارات ---
const ThreeVerificationBadges = () => (
    <div style={{ display: 'flex', gap: '5px', marginBottom: '4px', justifyContent: 'center' }}>
        <svg width="14" height="14" viewBox="0 0 42 42" fill="none" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}>
            <circle cx="21" cy="21" r="20" fill="#1DA1F2" stroke="#ffffff" strokeWidth="1.5"/>
            <path d="M12 21l6 6 12-12" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg width="14" height="14" viewBox="0 0 42 42" fill="none" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}>
            <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
            </defs>
            <circle cx="21" cy="21" r="20" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1.5"/>
            <path d="M12 21l6 6 12-12" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg width="14" height="14" viewBox="0 0 42 42" fill="none" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}>
            <circle cx="21" cy="21" r="20" fill="#25D366" stroke="#ffffff" strokeWidth="1.5"/>
            <path d="M12 21l6 6 12-12" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

// --- (2) النجوم ---
const FiveStars = () => (
    <div style={{ display: 'flex', gap: '2px', marginTop: '2px', justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#F0C420" stroke="#B8860B" strokeWidth="1">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
        ))}
    </div>
);

// --- (3) أيقونات العملات ---
const CryptoLogo = ({ type }: { type: string }) => {
    switch (type) {
        case 'BTC': return <svg width="20" height="20" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#F7931A"/><path d="M22.6 14.2c.4-2.6-1.6-4-4.3-5l.9-3.5-2.1-.5-.8 3.4c-.6-.1-1.1-.3-1.7-.4l.9-3.5-2.1-.5-.9 3.6c-.5-.1-.9-.2-1.4-.3l-3-.8-.6 2.3s1.6.4 1.6.4c.9.2 1 .8 1 1.2l-1 4.1c.1 0 .2 0 .3.1-.1 0-.2 0-.3-.1l-1.4 5.6c-.1.3-.4.7-1 .6 0 0-1.6-.4-1.6-.4l-1.1 2.6 2.8.7c.5.1 1 .3 1.5.4l-.9 3.6 2.1.5.9-3.6c.6.1 1.1.3 1.7.4l-.9 3.6 2.1.5.9-3.5c3.6.7 6.4.4 7.6-2.9.9-2.7-.1-4.2-1.9-5.2 1.4-.3 2.4-1.2 2.7-3z" fill="#FFF"/></svg>;
        case 'ETH': return <svg width="20" height="20" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#627EEA"/><path d="M16 4l-8.5 14L16 29l8.5-11z" fill="#FFF" opacity="0.6"/><path d="M16 4v14l8.5-4z" fill="#FFF"/></svg>;
        case 'POLYGON': return <svg width="20" height="20" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#8247E5"/><path d="M21.5 10.5L16 7.5l-5.5 3v6l5.5 3 5.5-3z" stroke="#FFF" strokeWidth="2" fill="none"/></svg>;
        case 'SOL': return <svg width="20" height="20" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#000"/><path d="M8 22.5l2.5-2.5h13l-2.5 2.5zm13.5-6l-2.5 2.5h-13l2.5-2.5zm-13.5-6l2.5-2.5h13l-2.5 2.5z" fill="url(#solGrad)"/><defs><linearGradient id="solGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/></linearGradient></defs></svg>;
        case 'BNB': return <svg width="20" height="20" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#F3BA2F"/><path d="M16 11l-3 3 3 3 3-3-3-3zm0-5l-8 8 8 8 8-8-8-8zm0 21l-3-3 3-3 3 3-3 3z" fill="#FFF"/></svg>;
        case 'USDT': return <svg width="20" height="20" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#26A17B"/><path d="M18.5 15.5v-2h5v-2h-15v2h5v2c0 2.5 4 2.5 4 0v-4" stroke="#FFF" strokeWidth="2" fill="none"/><path d="M16 23c-4.5 0-8-1-8-2.5s3.5-2.5 8-2.5 8 1 8 2.5-3.5 2.5-8 2.5z" fill="none" stroke="#FFF"/></svg>;
        default: return null;
    }
};

const PayButton = ({ type, name }: { type: string, name: string }) => (
    <button className="pay-btn">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CryptoLogo type={type} />
            <span style={{ fontWeight: '700', fontSize: '13px' }}>{name}</span>
        </div>
        <span style={{ fontSize: '11px', opacity: 0.7 }}>Send</span>
    </button>
);

export default function DemoProfilePage() {
  const router = useRouter();
  // حالة اللايك والديسلايك (ذهبي عند التفعيل)
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const toggleFeedback = (type: 'like' | 'dislike') => {
      setFeedback(prev => prev === type ? null : type);
  };

  return (
    <main style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: '"Inter", sans-serif', position: 'relative', zIndex: 1000 }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Satoshi:wght@700;900&family=Orbitron:wght@500;700&display=swap');
        @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");

        nav, footer, .navbar, .footer, header:not(.hero-banner-wrapper) {
            display: none !important;
        }

        .page-container {
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            position: relative;
        }

        /* --- تعديل البنر للكمبيوتر ليظهر الصورة كاملة --- */
        .hero-banner-wrapper {
            width: 100%;
            height: 30vh; 
            height: auto;          /* الارتفاع أوتوماتيكي */
            aspect-ratio: 3.3 / 1;  /* النسبة الأصلية للصورة (3360/1280) تضمن عدم القص */
            max-height: 200px;      /* حد أقصى للارتفاع */
            position: relative;
            background-color: #000;
            overflow: hidden;
        }

        .hero-banner-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
        }
        
        .hero-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.2));
            pointer-events: none;
        }

        .back-btn {
            position: absolute;
            top: 25px;
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
        .back-btn:hover {
            background-color: rgba(0,0,0,0.9);
            transform: scale(1.05);
        }

        .identity-card-container {
            position: relative;
            width: 260px;
            height: 140px;
            /* الكمبيوتر: تداخل بسيط جداً 10% */
            margin-top: -30px; 
            margin-left:7%; 
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(0,0,0,0.25);
            border: 1px solid rgba(255,255,255,0.3);
            z-index: 10;
            background-color: #1a1a1a;
            background-image: url('/images/chainface-card-bg.png');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .card-content {
            text-align: center;
            color: white;
            z-index: 20;
            margin-top: 5px; 
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .card-name-row {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .card-name {
            font-family: 'Satoshi', sans-serif;
            font-size: 20px;
            font-weight: 900;
            text-transform: uppercase;
            color: white;
            text-shadow: 0 2px 5px rgba(0,0,0,0.6);
            letter-spacing: 0.5px;
        }

        .pay-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            max-width: 650px;
            margin: 0 auto;
        }

        .pay-btn {
            background: #fff;
            border: 1px solid #eee;
            border-radius: 10px;
            padding: 10px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #333;
            box-shadow: 0 2px 4px rgba(0,0,0,0.03);
        }
        .pay-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.08);
            border-color: #ddd;
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
        .marketing-btn:hover { transform: scale(1.02); }

        .footer-note {
             margin-top: 25px;
             font-size: 12px;
             color: #aaa;
             font-style: italic;
        }

        /* --- تنسيقات الجوال --- */
        @media (max-width: 768px) {
            .hero-banner-wrapper { 
                /* للجوال نستخدم ارتفاع ثابت مناسب وليس أوتوماتيك لضمان التناسق */
                height: 18vh;
                min-height: 150px;
                aspect-ratio: unset;
                max-height: unset;
            } 
            
            .identity-card-container { 
                width: 40%;
                height: 80px;
                min-width: 140px;
                margin: -22px 0 0 20px;
                /* تقليل الدوران بنسبة 50% (كان 25 -> 12px) */
                border-radius: 12px;
                border-width: 0.8px;
            }
            
            .card-name {
                font-size: 15px;
            }

            .footer-note {
                font-size: 10px;
            }

            .pay-grid { grid-template-columns: 1fr; max-width: 100%; }
        }
      `}</style>

      <div className="hero-banner-wrapper">
          <div className="back-btn" onClick={() => router.back()}>
              <i className="bi bi-arrow-left"></i>
          </div>
          <img 
            src="/images/your-chainface.png" 
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
                  <FiveStars />
              </div>
          </div>

          <div style={{ maxWidth: '700px', margin: '30px auto', textAlign: 'center', padding: '0 20px' }}>
              <h2 style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: '700', fontSize: '22px', color: '#4A148C', marginBottom: '10px' }}>
                  Thank you for stepping into my ChainFace.
              </h2>
              <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5', marginBottom: '30px', fontWeight: '500' }}>
                  Your trust means everything.
                  <br/>
                  <span style={{ color: '#888', fontSize: '13px', marginTop: '10px', display: 'block', fontWeight: '600' }}>
                     Conviction: <strong style={{ color: '#4A148C' }}>500,000</strong> 💎
                  </span>
              </p>

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

          </div>
      </div>

      <div style={{ marginTop: '60px', padding: '40px 20px', backgroundColor: '#fff', borderTop: '1px solid #eee', textAlign: 'center' }}>
          
          {/* العبارة المطلوبة فوق الزر */}
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#111', marginBottom: '10px', fontWeight: '700' }}>
             Claim your sovereign name assets now.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', marginTop: '20px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                  <i 
                    className={`bi bi-hand-thumbs-up-fill ${feedback === 'like' ? 'text-gold' : 'text-grey'}`} 
                    style={{ fontSize: '22px', cursor: 'pointer', color: feedback === 'like' ? '#F0C420' : '#ccc', transition: '0.3s' }}
                    onClick={() => toggleFeedback('like')}
                  ></i>
                  <i 
                    className={`bi bi-hand-thumbs-down-fill ${feedback === 'dislike' ? 'text-gold' : 'text-grey'}`} 
                    style={{ fontSize: '22px', cursor: 'pointer', color: feedback === 'dislike' ? '#F0C420' : '#ccc', transition: '0.3s' }}
                    onClick={() => toggleFeedback('dislike')}
                  ></i>
              </div>

              <Link href="/chainface" className="marketing-btn">
                  YOUR CHAINFACE
              </Link>
          </div>
      </div>

    </main>
  );
}
