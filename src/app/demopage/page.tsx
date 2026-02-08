'use client';
import Link from 'next/link';
import React from 'react';

// --- Components (Same as before) ---
const GoldenCheckBadge = () => (
    <svg width="18" height="18" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '6px', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
        <defs>
            <linearGradient id="goldBadgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFA500" />
            </linearGradient>
        </defs>
        <circle cx="21" cy="21" r="20" fill="url(#goldBadgeGradient)" stroke="#ffffff" strokeWidth="3"/>
        <path d="M12 21l6 6 12-12" stroke="#000000" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const FiveStars = () => (
    <div style={{ display: 'flex', gap: '3px', marginTop: '6px', justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#F0C420" stroke="#B8860B" strokeWidth="1">
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
  return (
    <main style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Satoshi:wght@700;900&family=Orbitron:wght@500;700&display=swap');

        /* حاوية الصفحة */
        .page-container {
            width: 100%;
            max-width: 1400px; /* نسمح بعرض كبير ليتناسب مع الصور العريضة */
            margin: 0 auto;
            position: relative;
        }

        /* 1. البنر الذكي (Smart Aspect Ratio Banner) */
   .hero-banner-wrapper {
    width: 100%;
    height: 30vh;              /* 👈 30% من ارتفاع الشاشة */
    min-height: 180px;         /* حماية من الصغر */
    max-height: 380px;         /* حماية من التضخم */
    position: relative;
    background-color: #000;
    overflow: hidden;
}

.hero-banner-img {
    width: 100%;
    height: 100%;
    object-fit: contain;       /* 👈 أهم سطر: بدون قص */
    object-position: center;
    background-color: #000;
}
        
        .hero-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.2));
            pointer-events: none;
        }

        /* 2. الكرت الصغير (Identity Card) */
        .identity-card-container {
            position: relative;
            width: 260px;
            height: 140px;
            /* نرفعه للأعلى ليتداخل مع البنر، القيمة تعتمد على حجم البنر المتغير */
            margin-top: -70px; 
            margin-left: 5%; /* مسافة من اليسار */
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
            border: 2px solid rgba(255,255,255,0.6);
            z-index: 10;
            background-color: #1a1a1a;
            background-image: url('/images/chainface-card-bg.jpg');
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
            margin-top: 15px;
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

        /* الشبكة والزر */
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

        @media (max-width: 768px) {
            .identity-card-container { margin: -50px auto 0 auto; } /* في الوسط للجوال */
            .pay-grid { grid-template-columns: 1fr; max-width: 100%; }
        }
      `}</style>

      {/* 1. Hero Banner Container */}
      <div className="hero-banner-wrapper">
          <img 
            src="/images/your-chainface.jpg" 
            alt="ChainFace Cover" 
            className="hero-banner-img"
          />
          <div className="hero-overlay"></div>
      </div>

      {/* 2. Page Container (Holds Card & Content) */}
      <div className="page-container">
          
          {/* Identity Card */}
          <div className="identity-card-container">
              <div className="card-content">
                  <div className="card-name-row">
                      <span className="card-name">ALEXANDER</span>
                      <GoldenCheckBadge />
                  </div>
                  <FiveStars />
              </div>
          </div>

          {/* 3. Main Content */}
          <div style={{ maxWidth: '700px', margin: '30px auto', textAlign: 'center', padding: '0 20px' }}>
              
              <h2 style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: '700', fontSize: '22px', color: '#4A148C', marginBottom: '10px' }}>
                  Welcome to my sovereign territory on Web3. 
              </h2>
              <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.5', marginBottom: '30px' }}>
                  No intermediaries, no noise—just direct value and absolute ownership.
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

              <p style={{ marginTop: '25px', fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>
                  We do not manage your money. We simply present your identity.
              </p>

          </div>
      </div>

      {/* 4. Footer */}
      <div style={{ marginTop: '60px', padding: '40px 20px', backgroundColor: '#fff', borderTop: '1px solid #eee', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#111', marginBottom: '10px', fontWeight: '700' }}>
              Ownership is the new status. Claim your sovereign asset now.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', marginTop: '20px' }}>
              <div style={{ display: 'flex', gap: '15px', color: '#ccc' }}>
                  <i className="bi bi-hand-thumbs-up-fill" style={{ fontSize: '22px', cursor: 'pointer' }}></i>
                  <i className="bi bi-hand-thumbs-down-fill" style={{ fontSize: '22px', cursor: 'pointer' }}></i>
              </div>

              <Link href="/chainface" className="marketing-btn">
                  YOUR CHAINFACE
              </Link>
          </div>
      </div>

    </main>
  );
}

