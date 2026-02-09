'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// --- (1) الشارات ---
const ThreeVerificationBadges = () => (
    <div className="badges-container" style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
        {/* Green */}
        <svg className="badge-icon" viewBox="0 0 42 42" fill="none" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }}>
            <circle cx="21" cy="21" r="20" fill="#25D366" stroke="#ffffff" strokeWidth="2"/>
            <path d="M12 21l6 6 12-12" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* Blue */}
        <svg className="badge-icon" viewBox="0 0 42 42" fill="none" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }}>
            <circle cx="21" cy="21" r="20" fill="#1DA1F2" stroke="#ffffff" strokeWidth="2"/>
            <path d="M12 21l6 6 12-12" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* Gold */}
        <svg className="badge-icon" viewBox="0 0 42 42" fill="none" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }}>
            <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
            </defs>
            <circle cx="21" cy="21" r="20" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="2"/>
            <path d="M12 21l6 6 12-12" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
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
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const toggleFeedback = (type: 'like' | 'dislike') => {
      setFeedback(prev => prev === type ? null : type);
  };

  return (
    // خلفية أوف وايت غامقة قليلاً (#F0EDF2)
    <main style={{ backgroundColor: '#F0EDF2', minHeight: '100vh', fontFamily: '"Inter", sans-serif', position: 'relative', zIndex: 1000 }}>
      
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

        /* --- الهيدر --- */
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
        .back-btn:hover {
            background-color: rgba(0,0,0,0.9);
            transform: scale(1.05);
        }

        /* --- تصميم الكرت بألوان فخمة --- */
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
            
            /* --- التدرج الفخم الجديد: بنفسجي لامع من الأطراف وكحلي عميق في الوسط --- */
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

        .card-name-row {
            display: flex;
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

        /* --- تحجيم العناصر في الكمبيوتر --- */
        .badge-icon { width: 24px; height: 24px; } 
        .star-icon { width: 22px; height: 22px; } 
        
        .stars-container { 
            gap: 5px; 
            /* إنزال النجوم للأسفل لعدم مزاحمة الاسم */
            margin-top: 8px;
            margin-bottom: 5px; 
        }
        
        .badges-container {
            /* رفع الشارات للأعلى */
            margin-bottom: 5px;
            margin-top: 0px;
        }

        /* --- تنسيق قسم Conviction الجديد (ألوان كحلية/أرجوانية غامقة) --- */
        .conviction-box {
            text-align: center;
            margin-top: 15px;
            margin-bottom: 30px;
        }
        .conviction-label {
            color: #1e1b4b; /* كحلي غامق */
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            font-family: 'Satoshi', sans-serif;
            letter-spacing: 1px;
        }
        .conviction-value-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .conviction-number {
            color: #1e1b4b; /* كحلي غامق */
            font-size: 20px; /* تصغير الخط 25% (كان 26-28) */
            font-weight: 900;
            font-family: 'Satoshi', sans-serif;
        }
        .conviction-diamond {
            font-size: 22px; 
            color: #1e1b4b; /* كحلي غامق للماسة */
        }

        /* --- نصوص الشكر الجديدة (بنفس اللون الكحلي) --- */
        .thank-you-title {
            font-family: 'Satoshi', sans-serif;
            font-weight: 700;
            font-size: 22px;
            color: #1e1b4b; /* كحلي غامق */
            margin-bottom: 10px;
        }
        .thank-you-subtitle {
            color: #1e1b4b; /* كحلي غامق */
            font-size: 16px;
            line-height: 1.5;
            font-weight: 600;
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

        .cta-phrase {
            font-family: 'Cinzel', serif;
            font-size: 18px;
            color: #111;
            margin-bottom: 10px;
            font-weight: 700;
        }

        /* --- تنسيقات الجوال --- */
        @media (max-width: 768px) {
            .hero-banner-wrapper { 
                height: 18vh;
                min-height: 150px;
                aspect-ratio: unset;
                max-height: unset;
                margin-top: -40px;
                display: block;
            } 
            
            .hero-banner-img {
                /* إرجاع الصورة لوضعها الطبيعي في الجوال */
                object-fit: cover;
                object-position: center;
            }

            /* رفع السهم وتصغيره للجوال */
            .back-btn {
                width: 28px;        
                height: 28px;
                top: 45px;  /* رفع مناسب لتخطي الحافة */
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

            .badge-icon { width: 14px; height: 14px; }
            .star-icon { width: 12px; height: 12px; }
            .stars-container { gap: 1px; margin-top: 4px; margin-bottom: 2px; }
            .badges-container { margin-bottom: 2px; margin-top: 0px; }

            /* تكبير خط CTA في الجوال قليلاً */
            .cta-phrase {
                font-size: 13px; 
                letter-spacing: normal;
            }

            .footer-note { font-size: 10px; }
            .pay-grid { grid-template-columns: 1fr; max-width: 100%; }
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

          {/* قسم Conviction الجديد (تحت الكرت) */}
          <div className="conviction-box">
              <div className="conviction-label">Conviction</div>
              <div className="conviction-value-row">
                  <span className="conviction-number">500,000</span>
                  {/* الماسة تم تلوينها بالكحلي عبر الكلاس */}
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

              {/* قسم الشكر والتفاعل (أصبح جزءاً من الخلفية الرئيسية) */}
              <div style={{ marginTop: '40px', marginBottom: '10px' }}>
                <h2 className="thank-you-title">
                      Thank you for stepping into my ChainFace.
                  </h2>
                  <p className="thank-you-subtitle">
                      Your trust means everything.
                  </p>
              </div>

              {/* أزرار التفاعل (تحت النص مباشرة) */}
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

      {/* الفوتر الأبيض السفلي فقط للزر وعبارة الحث */}
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
