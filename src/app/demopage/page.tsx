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

const ThreeVerificationBadges = () => {
    const badgePath = "M22.25 12.5c0-1.58-.875-2.95-2.148-3.6.55-1.57.2-3.38-1.1-4.56C17.7 3.14 15.88 2.8 14.3 3.34c-.65-1.28-2.02-2.15-3.6-2.15s-2.95.87-3.6 2.15c-1.57-.54-3.38-.2-4.69 1.1-1.3 1.18-1.65 2.99-1.1 4.56-1.28.65-2.15 2.02-2.15 3.6s.87 2.95 2.15 3.6c-.55 1.57-.2 3.38 1.1 4.56 1.3 1.18 3.12 1.52 4.69.98.65 1.28 2.02 2.15 3.6 2.15s2.95-.87 3.6-2.15c1.58.54 3.39.2 4.69-1.1 1.3-1.18 1.65-2.99 1.1-4.56 1.28-.65 2.15-2.02 2.15-3.6z";
    const checkPath = "M10.5 17.5L5.5 12.5L7 11L10.5 14.5L17.5 7.5L19 9L10.5 17.5Z";

    const badgeStyle = { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' };

    return (
        <div className="badges-container" style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            <svg width="0" height="0">
                <defs>
                    <linearGradient id="goldLuxury" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FCD535" />
                        <stop offset="50%" stopColor="#F7931A" />
                        <stop offset="100%" stopColor="#B3882A" />
                    </linearGradient>
                    <linearGradient id="blueLuxury" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4A90E2" />
                        <stop offset="100%" stopColor="#1DA1F2" />
                    </linearGradient>
                    <linearGradient id="greenLuxury" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                </defs>
            </svg>

            <svg viewBox="0 0 25 25" style={badgeStyle} xmlns="http://www.w3.org/2000/svg" className="verification-badge">
                <path d={badgePath} fill="url(#greenLuxury)" />
                <path d={checkPath} fill="#FFFFFF" />
            </svg>
            
            <svg viewBox="0 0 25 25" style={badgeStyle} xmlns="http://www.w3.org/2000/svg" className="verification-badge">
                <path d={badgePath} fill="url(#blueLuxury)" />
                <path d={checkPath} fill="#FFFFFF" />
            </svg>

            <svg viewBox="0 0 25 25" style={badgeStyle} xmlns="http://www.w3.org/2000/svg" className="verification-badge">
                 <path d={badgePath} fill="url(#goldLuxury)" />
                 <path d={checkPath} fill="#FFFFFF" />
            </svg>
        </div>
    );
};


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
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;900&display=swap');

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
            height: 220px;
            position: relative;
            background-color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: -40px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            background-image: radial-gradient(circle at center, #ffffff 40%, #f8f9fa 100%);
            z-index: 5; 
            overflow: hidden;
        }

        .chainface-metallic-title {
            font-family: 'Outfit', sans-serif;
            font-size: 80px;     
            font-weight: 700;
            letter-spacing: -2px;
            margin: 0;
            padding-top: 15px;
            padding-left: 35px; /* الإزاحة لليمين */
            
            background: linear-gradient(
                135deg, 
                #4c1d95 10%,   
                #6d28d9 40%,   
                #a78bfa 50%,   
                #6d28d9 60%,   
                #4c1d95 90%    
            );

            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            
            filter: drop-shadow(0 2px 2px rgba(88, 28, 135, 0.2));
            text-transform: none;
            position: relative;
            z-index: 10;
        }

        /* تنسيق شبكة البلوك تشين */
        .blockchain-svg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1; 
            opacity: 0.6;
        }
        .node { fill: #e0e7ff; }
        .link { stroke: #eef2ff; stroke-width: 1.5px; }
        .node-active { fill: #d8b4fe; }

        .back-btn {
            position: absolute;
            top: 55px; left: 25px;
            width: 42px; height: 42px;
            border-radius: 50%;
            background-color: #f8f9fa; 
            display: flex; align-items: center; justify-content: center;
            color: #2E1A47; font-size: 20px; cursor: pointer; z-index: 100;
            border: 1px solid #E5E7EB;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
            background: linear-gradient(135deg, #1e1b4b 0%, #4c1d95 45%, #6d28d9 70%, #1e1b4b 100%);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 5px 0;
        }

        .card-content {
            text-align: center; color: white; z-index: 20; margin: 5px 0;
            display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;
        }

        .card-name {
            font-family: 'Cinzel', serif;
            font-size: 22px;
            font-weight: 700;
            color: white;
            text-shadow: 0 3px 10px rgba(0,0,0,0.7);
            letter-spacing: 0.5px;
        }

        .badge-icon { width: 23px; height: 23px; } 
        .star-icon { width: 21px; height: 21px; } 
        .stars-container { gap: 5px; margin-top: 8px; margin-bottom: 5px; }
        .badges-container { margin-bottom: 10px; margin-top: -5px; }
        .verification-badge { width: 22px; height: 22px; }

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
            font-family: 'Satoshi', sans-serif; font-weight: 700; font-size: 17px;
            color: ${deepPurpleColor}; margin-bottom: 10px;
        }
        .thank-you-subtitle {
            color: ${deepPurpleColor}; font-size: 16px; line-height: 1.5; font-weight: 600;
        }
        .cta-phrase {
            font-family: 'Cinzel', serif; font-size: 20px; color: ${deepPurpleColor};
            margin-bottom: 10px; font-weight: 700;
        }

        @media (max-width: 768px) {
            .hero-banner-wrapper { 
                height: 160px;
                margin-top: -40px;
            } 
            .chainface-metallic-title {
                font-size: 48px; /* تكبير الخط في الجوال */
                padding-left: 20px; /* تقليل الإزاحة قليلاً في الجوال */
            }
            .back-btn {
                width: 34px; height: 34px; top: 15px; left: 15px; font-size: 16px;
            }
            .identity-card-container { 
                width: 40%; height: 80px; min-width: 140px; margin: -22px 0 0 20px;
                border-radius: 12px; border-width: 0.8px; padding: 2px 0;
            }
            .card-content { margin: 2px 0; }
            .card-name { font-size: 15px; }
            .badge-icon { width: 13px; height: 13px; }
            .verification-badge { width: 13px; height: 13px; }
            .star-icon { width: 11px; height: 11px; }
            .stars-container { gap: 1px; margin-top: 4px; margin-bottom: 2px; }
            .badges-container { margin-bottom: 2px; margin-top: -2px; }
            
            .cta-phrase {
                font-size: 19px; letter-spacing: -0.5px; color: ${deepPurpleColor};
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
            background: linear-gradient(110deg, #7c1c58 0%, #3b1a57 50%, #1a237e 100%);
            border-radius: 25px;
            color: white;
            font-family: 'Satoshi', sans-serif;
            font-weight: 900;
            font-size: 14px;
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
          
          {/* تم تصحيح جميع Attributes من class إلى className لضمان عدم وجود أخطاء */}
          <svg className="blockchain-svg" width="100%" height="100%" viewBox="0 0 900 220" preserveAspectRatio="xMidYMid slice">
            <line x1="50" y1="50" x2="150" y2="100" className="link" />
            <line x1="50" y1="180" x2="150" y2="100" className="link" />
            <line x1="150" y1="100" x2="250" y2="40" className="link" />
            <line x1="150" y1="100" x2="220" y2="180" className="link" />
            <line x1="250" y1="40" x2="350" y2="90" className="link" />
            <line x1="850" y1="170" x2="750" y2="120" className="link" />
            <line x1="850" y1="40" x2="750" y2="120" className="link" />
            <line x1="750" y1="120" x2="650" y2="180" className="link" />
            <line x1="750" y1="120" x2="680" y2="50" className="link" />
            <line x1="680" y1="50" x2="580" y2="100" className="link" />
            
            <circle cx="50" cy="50" r="4" className="node" />
            <circle cx="50" cy="180" r="3" className="node" />
            <circle cx="150" cy="100" r="5" className="node-active" />
            <circle cx="250" cy="40" r="4" className="node" />
            <circle cx="220" cy="180" r="3" className="node" />
            <circle cx="350" cy="90" r="3" className="node" />
            <circle cx="850" cy="170" r="4" className="node" />
            <circle cx="850" cy="40" r="3" className="node" />
            <circle cx="750" cy="120" r="5" className="node-active" />
            <circle cx="650" cy="180" r="4" className="node" />
            <circle cx="680" cy="50" r="3" className="node" />
            <circle cx="580" cy="100" r="3" className="node" />
        </svg>

          <h1 className="chainface-metallic-title">ChainFace</h1>
      </div>

      <div className="page-container">
          <div className="identity-card-container">
              <div className="card-content">
                  <ThreeVerificationBadges />
                  <div className="card-name-row">
                      <span className="card-name">Alexander</span>
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
                  Your ChainFace
              </Link>
          </div>
      </div>

    </main>
  );
}
