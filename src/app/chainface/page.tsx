'use client';
import Link from 'next/link';
import React from 'react';

// --- CONSTANTS & STYLES ---
const GOLD_BASE = '#F0C420';
const GOLD_LIGHT = '#FFD700';
const GOLD_DARK = '#B8860B';
const TEXT_OFF_WHITE = '#E0E0E0';
const TEXT_BODY_COLOR = '#B0B0B0';

// --- BRAND ICONS DATA ---
const FOX_PATH = "M29.77 8.35C29.08 7.37 26.69 3.69 26.69 3.69L22.25 11.23L16.03 2.19L9.67 11.23L5.35 3.69C5.35 3.69 2.97 7.37 2.27 8.35C2.19 8.46 2.13 8.6 2.13 8.76C2.07 10.33 1.83 17.15 1.83 17.15L9.58 24.32L15.93 30.2L16.03 30.29L16.12 30.2L22.47 24.32L30.21 17.15C30.21 17.15 29.98 10.33 29.91 8.76C29.91 8.6 29.86 8.46 29.77 8.35ZM11.16 19.34L7.56 12.87L11.53 14.86L13.88 16.82L11.16 19.34ZM16.03 23.33L12.44 19.34L15.06 16.92L16.03 23.33ZM16.03 23.33L17.03 16.92L19.61 19.34L16.03 23.33ZM20.89 19.34L18.17 16.82L20.52 14.86L24.49 12.87L20.89 19.34Z";

const trustedBrands = [ 
    { name: "POLYGON", icon: "bi-link-45deg", isCustom: false },
    { name: "BNB CHAIN", icon: "bi-diamond-fill", isCustom: false },
    { name: "ETHEREUM", icon: "bi-currency-ethereum", isCustom: false },
    { name: "SOLANA", icon: "bi-lightning-charge-fill", isCustom: false },
    { name: "METAMASK", icon: FOX_PATH, isCustom: true }, 
    { name: "UNISWAP", icon: "bi-arrow-repeat", isCustom: false },
    { name: "CHAINLINK", icon: "bi-hexagon-fill", isCustom: false },
    { name: "PINATA", icon: "bi-cloud-fill", isCustom: false }, 
    { name: "IPFS", icon: "bi-box-seam-fill", isCustom: false },
    { name: "ARWEAVE", icon: "bi-database-fill-lock", isCustom: false },
    { name: "BUNDLR", icon: "bi-collection-fill", isCustom: false },
    { name: "ZKSYNC", icon: "bi-shield-check", isCustom: false },
    { name: "OPTIMISM", icon: "bi-graph-up-arrow", isCustom: false }
];

const GoldIcon = ({ icon, isCustomSVG = false }: { icon: string, isCustomSVG?: boolean }) => {
    if (isCustomSVG) {
        return (
            <svg viewBox="0 0 32 32" width="22" height="22" style={{ marginBottom: '2px' }}>
                <defs>
                  <linearGradient id="goldGradientIcon" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={GOLD_LIGHT} />
                    <stop offset="100%" stopColor={GOLD_DARK} />
                  </linearGradient>
                </defs>
                <path d={icon} fill="url(#goldGradientIcon)" />
            </svg>
        );
    }
    return <i className={`bi ${icon} brand-icon-gold`} style={{ fontSize: '20px' }}></i>;
};

// --- NEW: Golden Circle Check Badge (Extracted & Converted to SVG) ---
const GoldenCheckBadge = () => (
    <svg width="12" height="12" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '15px', filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.3))' }}>
        <defs>
            <linearGradient id="goldBadgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFA500" />
            </linearGradient>
        </defs>
        {/* الدائرة الذهبية مع الإطار الأبيض */}
        <circle cx="21" cy="21" r="20" fill="url(#goldBadgeGradient)" stroke="#ffffff" strokeWidth="2"/>
        {/* علامة الصح السوداء */}
        <path d="M12 21l6 6 12-12" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
);

export default function ChainFacePage() {
  return (
    <main className="chainface-page" style={{ 
      backgroundColor: '#1E1E1E', 
      minHeight: '100vh', 
      paddingBottom: '0px', 
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;600;700&family=Satoshi:wght@700;900&family=Orbitron:wght@500;700&display=swap');
        
        .cf-header { color: ${TEXT_OFF_WHITE}; font-weight: 700; margin-bottom: 0.8rem; font-size: 1.15rem; }
        .cf-text { color: ${TEXT_BODY_COLOR}; line-height: 1.6; font-size: 14.5px; margin-bottom: 1rem; }
        .cf-list { list-style: none; padding-left: 0; margin-bottom: 1.2rem; }
        .cf-list li { 
            position: relative; 
            padding-left: 18px; 
            color: ${TEXT_BODY_COLOR}; 
            margin-bottom: 6px; 
            font-size: 14.5px;
            line-height: 1.5;
        }
        .cf-list li::before {
            content: "•";
            color: ${GOLD_BASE};
            font-weight: bold;
            position: absolute;
            left: 0;
            top: 1px;
        }
        
        .content-block {
            background-color: transparent;
            padding-bottom: 20px;
        }

        /* --- FINAL SIGNATURE BUTTON STYLE (LOCKED DIMENSIONS) --- */
        .signature-btn {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            
            /* أبعاد ثابتة غير قابلة للتغيير نهائياً */
            width: 190px !important; 
            min-width: 190px !important;
            max-width: 190px !important;
            height: 55px !important;
            min-height: 55px !important;
            max-height: 55px !important;
            
            /* منع الانكماش */
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            
            background: linear-gradient(110deg, #5e1139 0%, #240b36 50%, #020c1b 100%);
            border-radius: 30px;
            padding: 0 12px;
            text-decoration: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.08);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
            margin: 0;
        }
        .signature-btn::before {
             content: '';
             position: absolute;
             top: 0; left: 0; width: 100%; height: 50%;
             background: linear-gradient(to bottom, rgba(255,255,255,0.05), transparent);
             border-radius: 30px 30px 0 0;
             pointer-events: none;
        }
        .signature-btn:hover {
            transform: translateY(-1.5px); 
            box-shadow: 0 8px 25px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.2);
            border-color: rgba(255,255,255,0.2);
        }

        .sig-qr-container {
            width: 28px; 
            height: 28px;
            background: rgba(255,255,255,0.92);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            flex-shrink: 0; 
        }
        .sig-qr-code {
            width: 23px;
            height: 23px;
            background-image: url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ALEXANDER_CF_SIGNATURE');
            background-size: cover;
            opacity: 0.85;
            mix-blend-mode: multiply;
        }

       .sig-content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start; /* هذا السطر سيضبط المحاذاة */
            flex-grow: 1;
            padding-right: 5px; 
            overflow: hidden; 
        }
        
        /* حاوية للسطر العلوي (الكلمة + الشارة) */
        .sig-top-row {
            display: flex;
            align-items: center;
            margin-bottom: 2px;
        }

        .sig-label {
            font-family: 'Orbitron', sans-serif;
            font-size: 9px;
            color: rgba(255,255,255,0.95);
            letter-spacing: 0.5px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            font-weight: 700;
            white-space: nowrap;
        }

        .sig-name {
            font-family: 'Satoshi', sans-serif;
            font-weight: 900;
            font-size: 15px;
            text-transform: uppercase;
            background: linear-gradient(to bottom, #ffffff 40%, #b0b0b0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: 0.2px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
            display: block;
            white-space: nowrap;
        }
        
        .brand-text-gold { background: linear-gradient(to bottom, #FCD535 0%, #B3882A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 15px rgba(252, 213, 53, 0.2); } 
        .brand-icon-gold { color: #FCD535; text-shadow: 0 0 10px rgba(252, 213, 53, 0.4); }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } 
        .marquee-track { animation: scroll 75s linear infinite; width: max-content; }
      `}</style>

      {/* --- HERO SECTION --- */}
      <section className="container pt-5 pb-5">
          <div className="row g-5 align-items-start">
              
              {/* LEFT: Text Area */}
              <div className="col-12 col-lg-6 pt-2">
                  <h1 className="fw-bold mb-2" 
                      style={{ 
                          fontSize: '2.5rem', 
                          fontFamily: '"Inter", sans-serif',
                          color: TEXT_OFF_WHITE,
                          lineHeight: '1.1'
                      }}>
                    ChainFace
                  </h1>
                  <h2 className="fw-light mb-4" style={{ fontSize: '1.4rem', color: GOLD_BASE }}>
                    Your Face on the Blockchain
                  </h2>
                  
                  <p className="cf-text fw-medium" style={{ fontSize: '1.05rem', color: '#FFF' }}>
                    The one place where your digital identity moves beyond an address — into presence, trust, and real interaction.
                  </p>

                  <div style={{ width: '60px', height: '2px', backgroundColor: GOLD_BASE, margin: '25px 0' }}></div>

                  <h3 className="cf-header h5">Why ChainFace Exists</h3>
                  <p className="cf-text">
                    In the blockchain world, everything exists — except the face. Addresses are long. Transactions are silent. And trust is scattered across numbers.
                  </p>
                  <p className="cf-text">
                    ChainFace closes that gap. Not a social network. Not a wallet. Not a financial intermediary. It is your official space on the blockchain — clear, human, and trusted.
                  </p>
              </div>

              {/* RIGHT: Image Area & CTA BOX */}
              <div className="col-12 col-lg-6 d-flex flex-column align-items-center align-items-lg-start ps-lg-5">
                  {/* Top Image */}
                  <div style={{ 
                      width: '100%', 
                      maxWidth: '420px', 
                      position: 'relative', 
                      borderRadius: '12px', 
                      overflow: 'hidden',
                      border: `1px solid ${GOLD_BASE}30`, 
                      boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
                      marginTop: '0px',
                      marginBottom: '20px'
                  }}>
                      <img 
                        src="/images/chainface-hero.jpg" 
                        alt="ChainFace Identity" 
                        style={{ width: '100%', height: 'auto', display: 'block' }} 
                      />
                  </div>

                  {/* UPPER CTA BOX */}
                  <div className="d-flex flex-column align-items-center justify-content-center rounded-3" 
                       style={{ 
                           width: '100%',
                           maxWidth: '600px', 
                           backgroundColor: 'rgba(36, 36, 36, 0.4)', 
                           border: '1px solid rgba(255, 255, 255, 0.05)',
                           gap: '15px', 
                           textAlign: 'center',
                           padding: '15px 0' 
                       }}>
                      
                      {/* Text */}
                      <div>
                          <p className="cf-text mb-1" style={{ fontSize: '14px', letterSpacing: '0.3px' }}>
                            Future is not about an address. It is about a <span className="text-white fw-bold">ChainFace</span>.
                          </p>
                          <p className="text-white fw-bold mb-0" style={{ fontSize: '15px', letterSpacing: '0.5px' }}>
                            See your place on the blockchain
                          </p>
                      </div>

                      {/* Button (Top) */}
                      <Link href="/chainface-demo" className="signature-btn" title="View Example Profile">
                          <div className="sig-qr-container"><div className="sig-qr-code"></div></div>
                          <div className="sig-content">
                              {/* السطر العلوي: الكلمة + الشارة */}
                              <div className="sig-top-row">
                                  <span className="sig-label">ChainFace</span>
                                  <GoldenCheckBadge />
                              </div>
                              <span className="sig-name">ALEXANDER</span>
                          </div>
                      </Link>

                  </div>

              </div>
          </div>
      </section>

      {/* --- SPLIT CONTENT LAYOUT --- */}
      <section className="container pb-5 mt-4">
          <div className="row g-5">
              
              {/* LEFT COLUMN */}
              <div className="col-12 col-md-6 pe-md-4" style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="content-block">
                      <h3 className="cf-header">What Is ChainFace?</h3>
                      <p className="cf-text">A digital identity page linked to your NNM digital name.</p>
                      <ul className="cf-list">
                          <li>Receives payments directly to your wallets</li>
                          <li>Displays verification and trust signals</li>
                          <li>Gives you a professional presence in Web3</li>
                          <li>No middlemen, no custody, no complexity</li>
                      </ul>
                      <p className="cf-text fw-bold text-white small">It is the interface of the blockchain.</p>
                  </div>

                  <div className="content-block">
                      <h3 className="cf-header">Built for Everyone</h3>
                      <p className="cf-text mb-2">Whether you are:</p>
                      <ul className="cf-list">
                          <li>An individual receiving value</li>
                          <li>A freelancer or creator</li>
                          <li>A digital merchant or investor</li>
                          <li>Or entering blockchain for the first time</li>
                      </ul>
                      <p className="cf-text">
                        The simplest starting point. No explanations needed. Your name opens the door.
                      </p>
                  </div>

                   <div className="content-block">
                      <h3 className="cf-header">Why Now?</h3>
                      <p className="cf-text">
                        Years ago, online presence was optional. Then essential. Today, blockchain presence is inevitable. ChainFace is an identity layer built before the space crowds.
                      </p>
                      <p className="cf-text text-white">Join early. Secure your place.</p>
                  </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="col-12 col-md-6 ps-md-4">
                  <div className="content-block">
                      <h3 className="cf-header">Why Digital Names Matter</h3>
                      <p className="cf-text">
                        Anyone can own a wallet. Not everyone owns presence. NNM names are keys to a future identity layer.
                      </p>
                      <ul className="cf-list">
                          <li>The name becomes a face</li>
                          <li>The face becomes trust</li>
                          <li>Trust becomes real interaction</li>
                      </ul>
                      <p className="cf-text">
                        NNM offers <strong>Elite</strong>, <strong>Founders</strong>, and <strong>Immortals</strong> classes. Each reflects your level of presence, not just ownership.
                      </p>
                  </div>

                  <div className="content-block">
                      <h3 className="cf-header">Trust & Freedom</h3>
                      <p className="cf-text">Blockchain means freedom. The world needs clarity.</p>
                      <ul className="cf-list">
                          <li>Verification is optional</li>
                          <li>Identity is fully controlled by you</li>
                          <li>Privacy is your decision</li>
                      </ul>
                      <p className="cf-text">
                        Choose: Unverified, Wallet-Verified, ID-Verified, or Business-Verified. Transparency is a feature, not an obligation.
                      </p>
                  </div>

                  <div className="content-block">
                      <h3 className="cf-header">Payments, Done Right</h3>
                      <ul className="cf-list">
                          <li>Wallet-to-Wallet (Peer-to-Peer)</li>
                          <li>No intermediaries</li>
                          <li>No custody of funds</li>
                      </ul>
                      <p className="cf-text">We do not manage your money. We simply present your identity.</p>
                  </div>
              </div>
          </div>

          {/* FINAL THOUGHT & SIGNATURE (BOTTOM) */}
          <div className="row justify-content-center mt-5">
              <div className="col-12 col-md-11">
                  <div className="d-flex flex-column flex-md-row align-items-center justify-content-center p-4 rounded-3" 
                       style={{ 
                           backgroundColor: '#242424', 
                           border: '1px solid #333',
                           gap: '25px'
                       }}>
                      
                      {/* Text */}
                      <div className="text-center text-md-end">
                          <p className="cf-text mb-0" style={{ fontSize: '15px', letterSpacing: '0.3px' }}>
                            Future is not about an address. It is about a <span className="text-white fw-bold">ChainFace</span>.
                          </p>
                          <p className="text-white fw-bold mb-0" style={{ fontSize: '16px', letterSpacing: '0.5px' }}>
                            See your place on the blockchain
                          </p>
                      </div>

                      {/* Button (Bottom) */}
                      <Link href="/chainface-demo" className="signature-btn" style={{ minWidth: '190px', width: '190px', flex: 'none' }} title="View Example Profile">

                          <div className="sig-qr-container"><div className="sig-qr-code"></div></div>
                          <div className="sig-content">
                              {/* السطر العلوي: الكلمة + الشارة */}
                              <div className="sig-top-row">
                                  <span className="sig-label">ChainFace</span>
                                  <GoldenCheckBadge />
                              </div>
                              <span className="sig-name">ALEXANDER</span>
                          </div>
                      </Link>

                  </div>
              </div>
          </div>
      </section>

      {/* --- BRAND TICKER --- */}
      <div className="w-100 py-3 border-top border-bottom border-secondary position-relative" style={{ borderColor: '#333 !important', marginTop: 'auto', marginBottom: '10px', backgroundColor: '#0b0e11', maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)' }}>
          <div className="text-center mb-2"><span className="text-secondary text-uppercase" style={{ fontSize: '10px', letterSpacing: '3px', opacity: 1, color: '#aaa' }}>Built for Web3</span></div>
          <div className="marquee-container overflow-hidden position-relative w-100">
              <div className="marquee-track d-flex align-items-center">
                  {[...trustedBrands, ...trustedBrands, ...trustedBrands].map((brand, index) => (
                      <div key={index} className="brand-item d-flex align-items-center justify-content-center mx-5" style={{ minWidth: '120px', transition: '0.4s' }}>
                          <div className="brand-logo d-flex align-items-center gap-2" style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Montserrat, sans-serif', letterSpacing: '1px' }}>
                              <GoldIcon icon={brand.icon} isCustomSVG={brand.isCustom} />
                              <span className="brand-text-gold">{brand.name}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

    </main>
  );
}
