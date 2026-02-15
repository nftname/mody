'use client';
import Link from 'next/link';
import MarketTicker from '@/components/MarketTicker';

// --- CONSTANTS & STYLES (Extracted from Reference) ---
const GOLD_BTN_PRIMARY = '#D4AF37';    // الذهبي الهادئ (الأساسي)
const GOLD_BTN_HIGHLIGHT = '#E6C76A';  // الإضاءة العلوية (مخففة)
const GOLD_BTN_SHADOW = '#B8962E';     // الظل
const GOLD_LIGHT = '#FFD700';
const GOLD_DARK = '#B8860B';
const GOLD_MEDIUM = '#FDB931'; 
const TEXT_BODY_COLOR = '#848E9C';
const TEXT_OFF_WHITE = '#EAECEF';
const BORDER_MAIN = '#2B3139';         // Added consistent border variable

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

export default function NNMConceptPage() {

  return (
    <main className="concept-page" style={{ 
      backgroundColor: '#181A20', 
      minHeight: '100vh', 
      paddingBottom: '0px', 
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* GLOBAL STYLES & ANIMATIONS */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap');
        .font-imperium { font-family: 'Cinzel', serif; }
        
        /* Helpers */
        .text-gold-highlight { color: ${GOLD_MEDIUM} !important; }
        .text-white { color: ${TEXT_OFF_WHITE} !important; }
        .text-body-gray { color: ${TEXT_BODY_COLOR}; }

        /* Font Sizing */
        p, li { 
            font-size: 0.95rem; 
            line-height: 1.6;
        }

        /* Ingot Button Style (Updated to Calm Gold) */
        .btn-ingot {
            background: linear-gradient(180deg, ${GOLD_BTN_HIGHLIGHT} 0%, ${GOLD_BTN_PRIMARY} 40%, ${GOLD_BTN_SHADOW} 100%);
            border: 1px solid ${GOLD_BTN_SHADOW};
            color: #2b1d00 !important; 
            font-family: 'Cinzel', serif;
            font-weight: 700;
            letter-spacing: 1px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3), 0 0 15px rgba(212, 175, 55, 0.1);
            text-shadow: 0 1px 0 rgba(255,255,255,0.4);
            transition: filter 0.3s ease, transform 0.2s ease;
            padding: 10px 30px; 
            font-size: 0.8rem; 
            white-space: nowrap; 
        }
        .btn-ingot:hover {
            filter: brightness(1.08);
            transform: translateY(-1px);
        }

        /* --- DESKTOP SHIFT (The Fix) --- */
        @media (min-width: 992px) {
            .cta-desktop-shift {
                margin-left: 25%;
            }
        }
        
        /* Mobile specific adjustments */
        @media (max-width: 768px) {
            .cta-desktop-shift { margin-left: 0; } 
            
            .btn-ingot-wrapper { 
                width: 50% !important; 
                margin: 0 auto; 
                display: block;
            }
            .btn-ingot { 
                width: 100%; 
                padding: 10px 0; 
                font-size: 11px !important; 
                white-space: nowrap !important;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .img-container { margin-bottom: 20px; }
        }

        /* Ticker Animations */
        .brand-text-gold { background: linear-gradient(to bottom, #FCD535 0%, #B3882A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 15px rgba(252, 213, 53, 0.2); } 
        .brand-icon-gold { color: #FCD535; text-shadow: 0 0 10px rgba(252, 213, 53, 0.4); }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } 
        .marquee-track { animation: scroll 75s linear infinite; width: max-content; }
        
        .section-spacer { margin-bottom: 80px; }
        @media (max-width: 768px) { .section-spacer { margin-bottom: 50px; } }
        
        .img-container {
            border: 1px solid ${BORDER_MAIN};
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
      `}</style>

      {/* --- HEADER / INTRO SECTION --- */}
      <section className="container pt-5 pb-5">
          <div className="row justify-content-start text-start">
              <div className="col-lg-9">
                  <h1 className="font-imperium fw-bold mb-4 text-white" style={{ fontSize: '2rem' }}>
                      The Three Tiers of <span className="text-gold-highlight">Digital Naming</span>
                  </h1>
                  
                  <h2 className="text-uppercase mb-4 text-white" style={{ letterSpacing: '2px', fontSize: '1rem' }}>
                      Choice, Positioning, and Intent
                  </h2>
                  
                  <p className="text-body-gray" style={{ lineHeight: '1.7' }}>
                      In every mature market, structure matters. Not all assets are created equal, and not all participants approach ownership with the same intent. As digital naming evolves into functional infrastructure, differentiation becomes a matter of clarity rather than hierarchy.
                  </p>
                  
                  {/* --- LINK INSERTION --- */}
                  <p className="text-body-gray" style={{ lineHeight: '1.7' }}>
                      At NNM, digital names are minted across three clearly defined tiers. These tiers do not determine future market value, do not imply performance, and do not create expectations. They exist to provide structural context and optional positioning at the moment of minting.
                      <br/>
                      
                  </p>

                  <p className="fw-bold fst-italic mt-3 text-white">
                      What follows is not a ranking system. It is a framework of choice.
                  </p>
              </div>
          </div>
      </section>

      {/* --- CONTENT TIERS --- */}
      <section className="container flex-grow-1">
        
        {/* TIER 1: IMMORTALS */}
        <div className="row align-items-center section-spacer">
            <div className="col-12 col-lg-6 mb-4 mb-lg-0">
                <div className="img-container">
                    <img src="/images/1000023703.jpg" alt="The Immortals Tier" className="img-fluid w-100" style={{ objectFit: 'cover' }} />
                </div>
            </div>
            <div className="col-12 col-lg-6 ps-lg-5 text-start">
                <h3 className="font-imperium h2 mb-3 text-white">The <span className="text-gold-highlight">Immortals</span> Tier</h3>
                <div className="text-body-gray">
                    <p>Some names are inherently scarce. Short character strings, culturally resonant words, and timeless identifiers often attract attention simply by their nature.</p>
                    <p className="fw-bold text-white">The Immortals Tier is designed for such names.</p>
                    <p>Names minted under this tier carry a higher minting fee, not as a signal of guaranteed value, but as a reflection of personal intent. The protocol does not assign worth to the name. The registrant does.</p>
                    <p>Minting within the Immortals Tier does not ensure visibility, demand, liquidity, or market activity. It represents a deliberate decision at the point of creation, nothing more.</p>
                </div>
            </div>
        </div>

        {/* TIER 2: ELITE */}
        <div className="row align-items-center section-spacer">
            <div className="col-12 col-lg-6 order-1 order-lg-2 mb-4 mb-lg-0">
                <div className="img-container">
                    <img src="/images/1000023702.jpg" alt="The Elite Tier" className="img-fluid w-100" style={{ objectFit: 'cover' }} />
                </div>
            </div>
            <div className="col-12 col-lg-6 order-2 order-lg-1 pe-lg-5 text-start">
                <h3 className="font-imperium h2 mb-3 text-white">The <span className="text-gold-highlight">Elite</span> Tier</h3>
                <div className="text-body-gray">
                    <p>Between exclusivity and accessibility lies balance.</p>
                    <p className="fw-bold text-white">The Elite Tier is intended for names that are meaningful, strategically chosen, or identity-driven, without requiring extreme scarcity.</p>
                    <p>This tier reflects a pragmatic approach to digital naming. Participants often use it for personal identifiers, brand-aligned names, or emerging use cases that may evolve over time.</p>
                    <p>As with all tiers, post-mint behavior is entirely market-driven. Activity and relevance emerge from use and demand, not from classification.</p>
                </div>
            </div>
        </div>

        {/* TIER 3: FOUNDERS */}
        <div className="row align-items-center section-spacer">
            <div className="col-12 col-lg-6 mb-4 mb-lg-0">
                <div className="img-container">
                    <img src="/images/1000023701.jpg" alt="The Founders Tier" className="img-fluid w-100" style={{ objectFit: 'cover' }} />
                </div>
            </div>
            <div className="col-12 col-lg-6 ps-lg-5 text-start">
                <h3 className="font-imperium h2 mb-3 text-white">The <span className="text-gold-highlight">Founders</span> Tier</h3>
                <div className="text-body-gray">
                    <p>Every ecosystem begins with early participants. Not because outcomes are certain, but because exploration and belief in open systems come first.</p>
                    <p className="fw-bold text-white">The Founders Tier is designed to be accessible by design.</p>
                    <p>It allows participants to mint digital names with minimal friction, serving as a natural entry point into the naming ecosystem. Some names minted at this tier may later gain relevance through adoption or integration. Others may remain purely personal identifiers.</p>
                    <p>Origin does not define outcome. In open markets, value is shaped by interaction, not initial cost.</p>
                </div>
            </div>
        </div>

      </section>

      {/* --- OUTRO & CTA SECTION --- */}
      <section className="container pb-5">
          <div className="row justify-content-start text-start">
              <div className="col-12 col-lg-9 p-0">
                  
                  <h4 className="font-imperium mb-4 text-white" style={{ fontSize: '1.25rem' }}>What These Tiers Do and Do Not Represent</h4>
                  
                  <p className="text-body-gray mb-3">
                      These tiers do not predict future value, influence secondary market performance, or grant ranking, priority, or algorithmic advantage.
                  </p>
                  <p className="text-body-gray mb-3">
                      They do provide clarity at minting, enable optional identity signaling, and reflect intent at the moment of creation.
                  </p>
                  <p className="text-body-gray mb-5">
                      A name minted at the Founders Tier may later circulate widely. A name minted at the Immortals Tier may never trade. Both outcomes are valid and entirely market-driven.
                  </p>
                  
                  {/* CTA AREA with DESKTOP SHIFT */}
                  <div className="text-center mt-4 cta-desktop-shift">
                      <p className="font-imperium mb-2 text-white fst-italic" style={{ fontSize: '0.85rem' }}>
                          The system provides structure. The market provides meaning.
                      </p>

                       <div className="btn-ingot-wrapper">
                            <Link href="/mint" className="btn btn-ingot rounded-1 text-decoration-none">
                                CLAIM YOUR NEXUS NAME
                            </Link>
                        </div>
                  </div>

              </div>
          </div>
      </section>

      {/* --- BRAND TICKER (Corrected to #333 with border-secondary) --- */}
      <div className="w-100 py-3 border-top border-bottom border-secondary position-relative" style={{ borderColor: '#333 !important', marginTop: 'auto', marginBottom: '50px', backgroundColor: '#0b0e11', maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)' }}>
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
