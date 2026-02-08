'use client';
import Link from 'next/link';
import Image from 'next/image';

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

// --- MAIN COMPONENT ---
export default function ChainFacePage() {
  return (
    <main className="chainface-page" style={{ 
      backgroundColor: '#1E1E1E', // نفس لون خلفية Conviction
      minHeight: '100vh', 
      paddingBottom: '0px', 
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* GLOBAL STYLES */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap');
        
        .cf-header { color: ${TEXT_OFF_WHITE}; font-weight: 700; margin-bottom: 1rem; }
        .cf-text { color: ${TEXT_BODY_COLOR}; line-height: 1.7; font-size: 15px; margin-bottom: 1.5rem; }
        .cf-list { list-style: none; padding-left: 0; margin-bottom: 1.5rem; }
        .cf-list li { 
            position: relative; 
            padding-left: 20px; 
            color: ${TEXT_BODY_COLOR}; 
            margin-bottom: 8px; 
            font-size: 15px;
        }
        .cf-list li::before {
            content: "•";
            color: ${GOLD_BASE};
            font-weight: bold;
            position: absolute;
            left: 0;
            top: 0;
        }
        
        /* Ticker Animations */
        .brand-text-gold { background: linear-gradient(to bottom, #FCD535 0%, #B3882A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 15px rgba(252, 213, 53, 0.2); } 
        .brand-icon-gold { color: #FCD535; text-shadow: 0 0 10px rgba(252, 213, 53, 0.4); }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } 
        .marquee-track { animation: scroll 75s linear infinite; width: max-content; }
      `}</style>

      {/* --- HERO SECTION (Split Layout) --- */}
      <section className="container pt-5 pb-5">
          <div className="row g-5 align-items-start">
              
              {/* LEFT COLUMN: Main Text */}
              <div className="col-12 col-lg-7">
                  <h1 className="fw-bold mb-2" 
                      style={{ 
                          fontSize: '2.5rem', 
                          fontFamily: '"Inter", sans-serif',
                          color: TEXT_OFF_WHITE,
                          lineHeight: '1.2'
                      }}>
                    ChainFace
                  </h1>
                  <h2 className="fw-light mb-4" style={{ fontSize: '1.5rem', color: GOLD_BASE }}>
                    Your Face on the Blockchain
                  </h2>
                  
                  <p className="cf-text fw-medium" style={{ fontSize: '1.1rem', color: '#FFF' }}>
                    The one place where your digital identity moves beyond an address — into presence, trust, and real interaction.
                  </p>

                  <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '30px 0' }} />

                  <h3 className="cf-header h4">Why ChainFace Exists</h3>
                  <p className="cf-text">
                    In the blockchain world, everything exists — except the face. Addresses are long. Transactions are silent. And trust is scattered across numbers.
                  </p>
                  <p className="cf-text">
                    ChainFace was created to close that gap. It is not a social network. It is not a wallet. It is not a financial intermediary.
                  </p>
                  <p className="cf-text">
                    It is your official space on the blockchain — one clear, human place where others recognize you and interact with confidence.
                  </p>
              </div>

              {/* RIGHT COLUMN: Image (Placeholder) */}
              <div className="col-12 col-lg-5">
                  <div style={{ 
                      width: '100%', 
                      position: 'relative', 
                      borderRadius: '12px', 
                      overflow: 'hidden',
                      border: `1px solid ${GOLD_BASE}40`, // Gold border with transparency
                      boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                  }}>
                      {/* استبدل الرابط أدناه برابط صورتك الحقيقية */}
                      <img 
                        src="/images/chainface-hero.jpg" 
                        alt="ChainFace Identity" 
                        style={{ width: '100%', height: 'auto', display: 'block' }} 
                        // في حال لم تكن الصورة موجودة بعد، يمكنك استخدام هذا الرابط المؤقت كبديل للتجربة:
                        // src="https://placehold.co/768x1376/1E1E1E/F0C420?text=ChainFace+Identity"
                      />
                  </div>
              </div>
          </div>
      </section>

      {/* --- CONTENT BLOCKS --- */}
      <section className="container pb-5">
          <div className="row justify-content-center">
              <div className="col-12 col-lg-8">
                  
                  {/* What Is ChainFace? */}
                  <div className="mb-5">
                      <h3 className="cf-header h4">What Is ChainFace?</h3>
                      <p className="cf-text">ChainFace is a digital identity page linked to your NNM digital name.</p>
                      <p className="cf-text mb-2">A page that:</p>
                      <ul className="cf-list">
                          <li>Receives payments directly to your wallets</li>
                          <li>Displays verification and trust signals</li>
                          <li>Gives you a professional presence in Web3</li>
                          <li>With no middlemen</li>
                          <li>No custody of funds</li>
                          <li>No technical complexity</li>
                      </ul>
                      <p className="cf-text fw-bold text-white">It is the interface of the blockchain.</p>
                  </div>

                  {/* Built for Everyone */}
                  <div className="mb-5">
                      <h3 className="cf-header h4">Built for Everyone</h3>
                      <p className="cf-text mb-2">Whether you are:</p>
                      <ul className="cf-list">
                          <li>An individual receiving value</li>
                          <li>A freelancer or creator</li>
                          <li>A digital merchant</li>
                          <li>An investor</li>
                          <li>Or someone entering blockchain for the first time</li>
                      </ul>
                      <p className="cf-text">
                        ChainFace is the simplest starting point. No explanations needed. No technical barriers. Your name opens the door.
                      </p>
                  </div>

                  {/* Why NNM Digital Names Matter */}
                  <div className="mb-5">
                      <h3 className="cf-header h4">Why NNM Digital Names Matter</h3>
                      <p className="cf-text">
                        Anyone can own a wallet address. But not every name creates presence. NNM names are more than NFTs. They are keys to a future identity layer.
                      </p>
                      <p className="cf-text mb-2">With ChainFace:</p>
                      <ul className="cf-list">
                          <li>The name becomes a face</li>
                          <li>The face becomes trust</li>
                          <li>And trust becomes real interaction</li>
                      </ul>
                      <p className="cf-text mb-2">That is why NNM offers:</p>
                      <ul className="cf-list">
                          <li>Elite Class</li>
                          <li>Founders Class</li>
                          <li>Immortals Class</li>
                      </ul>
                      <p className="cf-text">Each class reflects your level of presence, not just ownership.</p>
                  </div>

                  {/* Trust Without Breaking Blockchain Principles */}
                  <div className="mb-5">
                      <h3 className="cf-header h4">Trust Without Breaking Blockchain Principles</h3>
                      <p className="cf-text">Blockchain was built for freedom. The real world still needs clarity.</p>
                      <p className="cf-text mb-2">With ChainFace:</p>
                      <ul className="cf-list">
                          <li>Verification is optional</li>
                          <li>Identity is fully controlled by you</li>
                          <li>Privacy is your decision</li>
                      </ul>
                      <p className="cf-text mb-2">You choose to be:</p>
                      <ul className="cf-list">
                          <li>Unverified</li>
                          <li>Wallet-Verified</li>
                          <li>ID-Verified</li>
                          <li>Business-Verified</li>
                      </ul>
                      <p className="cf-text">Transparency here is a feature, not an obligation.</p>
                  </div>

                  {/* Payments */}
                  <div className="mb-5">
                      <h3 className="cf-header h4">Payments, the Way They Should Be</h3>
                      <ul className="cf-list">
                          <li>Wallet-to-Wallet</li>
                          <li>Peer-to-Peer</li>
                          <li>No intermediaries</li>
                          <li>No custody</li>
                      </ul>
                      <p className="cf-text">Payments are peer-to-peer. ChainFace never holds funds.</p>
                      <p className="cf-text">We do not manage your money. We simply present your identity.</p>
                  </div>

                  {/* Why Now? */}
                  <div className="mb-5">
                      <h3 className="cf-header h4">Why Now?</h3>
                      <p className="cf-text">
                        Years ago, having an online presence was optional. Then it became essential.
                      </p>
                      <p className="cf-text">
                        Today, having a presence on the blockchain is becoming inevitable. ChainFace is not a trend. It is an identity layer — built before the space becomes crowded.
                      </p>
                      <p className="cf-text">Those who join early secure their place in the future.</p>
                  </div>

                  {/* Final Thought */}
                  <div className="text-center mt-5 p-4 rounded-3" style={{ backgroundColor: '#242424', border: '1px solid #333' }}>
                      <h3 className="cf-header h4 mb-3">Final Thought</h3>
                      <p className="cf-text fst-italic">
                        In the future, people will not ask: What is your address? They will ask:
                      </p>
                      <h4 className="fw-bold text-white mb-3">Where is your face on the blockchain?</h4>
                      <p className="cf-text">
                        ChainFace is not a page. It is not a product.
                      </p>
                      <p className="fw-bold text-white mb-0" style={{ fontSize: '1.2rem' }}>It is your place.</p>
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
