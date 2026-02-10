'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const COIN_LOGOS = {
    BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=026",
    ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=026",
    POLYGON: "https://cryptologos.cc/logos/polygon-matic-logo.svg?v=026",
    SOL: "https://cryptologos.cc/logos/solana-sol-logo.svg?v=026",
    BNB: "https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=026",
    USDT: "https://cryptologos.cc/logos/tether-usdt-logo.svg?v=026",
};

const Web3PaymentButton = ({ type, name }: { type: keyof typeof COIN_LOGOS, name: string }) => (
    <button className="web3-payment-btn">
        <div className="btn-content">
            <div className="logo-wrapper">
                <img 
                    src={COIN_LOGOS[type]} 
                    alt={`${name} Logo`} 
                    width="32" 
                    height="32" 
                    className="coin-logo"
                    style={{ objectFit: 'contain' }}
                />
            </div>
            
            <div className="token-info">
                <span className="token-name">{name}</span>
                <span className="action-text">Send</span>
            </div>
        </div>
    </button>
);

const ThreeVerificationBadges = () => (
    <div className="badges-container" style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
        {/* 1. Green Badge (Security) 
            نستخدم صورة العلامة الزرقاء الأصلية ونحول لونها للأخضر لضمان تطابق الشكل 100% مع البقية
        */}
        <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Twitter_Verified_Badge.svg/640px-Twitter_Verified_Badge.svg.png" 
            alt="Security Verified" 
            style={{ 
                width: '24px', 
                height: '24px', 
                // هذا الفلتر يحول اللون الأزرق إلى أخضر زمردي فخم
                filter: 'hue-rotate(260deg) drop-shadow(0 3px 5px rgba(0,0,0,0.2))' 
            }} 
        />
        
        {/* 2. Blue Badge (Identity) - صورة أصلية */}
        <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Twitter_Verified_Badge.svg/640px-Twitter_Verified_Badge.svg.png" 
            alt="Identity Verified" 
            style={{ 
                width: '24px', 
                height: '24px', 
                filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.2))' 
            }} 
        />

        {/* 3. Gold Badge (Premium) - صورة أصلية */}
        <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Twitter_Verified_Badge_Gold.svg/640px-Twitter_Verified_Badge_Gold.svg.png" 
            alt="Gold Tier" 
            style={{ 
                width: '24px', 
                height: '24px', 
                filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.2))' 
            }} 
        />
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Satoshi:wght@700;900&family=Orbitron:wght@500;700&display=swap');
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

        .pay-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            max-width: 800px;
            margin: 0 auto;
        }

        .web3-payment-btn {
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 16px;
            height: 72px;
            width: 100%;
            cursor: pointer;
            transition: all 0.2s ease;
            padding: 0 16px;
            display: flex;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .web3-payment-btn:hover {
            border-color: #D1D5DB;
            background: #F9FAFB;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.08);
        }

        .btn-content {
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;
        }

        .logo-wrapper {
            width: 32px; 
            height: 32px;
            min-width: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 14px;
        }
        
        .coin-logo {
            width: 100%;
            height: 100%;
            object-fit: contain; 
        }

        .token-info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            flex: 1;
        }

        .token-name {
            font-family: 'Inter', sans-serif;
            font-weight: 700;
            font-size: 15px;
            color: #111827;
            line-height: 1.2;
        }

        .action-text {
            font-size: 11px;
            font-weight: 600;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
        }

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
            font-family: 'Cinzel', serif; font-size: 27px; color: ${deepPurpleColor};
            margin-bottom: 10px; font-weight: 700;
        }

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
                font-size: 25px; letter-spacing: -0.5px; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis; color: ${deepPurpleColor};
            }
            .footer-note { font-size: 10px; }

            .pay-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
            
            .web3-payment-btn {
                height: 60px;
                padding: 0 12px;
            }
            
            .token-name {
                font-size: 14px;
            }
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
        .marketing-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
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

              <div style={{ marginTop: '40px', marginBottom: '14px' }}>
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
             Claim your sovereign name assets now
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
              <Link href="/mint" className="marketing-btn">
                  YOUR ChainFace
              </Link>
          </div>
      </div>

    </main>
  );
}
