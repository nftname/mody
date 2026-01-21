'use client';
import Link from 'next/link';

// --- IMPORTS FOR WIDGETS ---
import NGXWidget from '@/components/NGXWidget';
import NGXCapWidget from '@/components/NGXCapWidget';
import NGXVolumeWidget from '@/components/NGXVolumeWidget';

// --- CONSTANTS ---
const GOLD_BASE = '#F0C420';
const GOLD_LIGHT = '#FFD700';
const GOLD_MEDIUM = '#FDB931'; 
const GOLD_DARK = '#B8860B';

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

export default function NGXWhitepaperPage() {
  return (
    <main className="ngx-page" style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* GLOBAL STYLES */}
      <style jsx global>{`
        .ngx-page p,
        .ngx-page li {
          font-family: "Inter", "Segoe UI", sans-serif;
          font-size: 15px;
          color: #B0B0B0;
          line-height: 1.5; 
          margin-bottom: 8px; /* Reduced paragraph spacing */
        }
        .ngx-page ul {
            padding-left: 20px;
            margin-bottom: 15px;
        }
        .ngx-page h1,
        .ngx-page h2,
        .ngx-page h3,
        .ngx-page .text-white {
          color: #E0E0E0 !important;
        }
        
        /* WIDGET FLOATING STYLE (DESKTOP) */
        @media (min-width: 992px) {
            .widget-float-container {
                float: right;
                margin-left: 30px;
                margin-bottom: 15px;
                margin-top: 5px;
                width: 330px; /* Slightly wider than widget to contain border/padding */
                clear: right;
                z-index: 10;
                position: relative;
            }
        }

        /* WIDGET STACKING STYLE (MOBILE) */
        @media (max-width: 991px) {
            .widget-float-container {
                float: none;
                width: 100%;
                margin: 20px auto;
                display: flex;
                justify-content: center;
            }
        }

        /* THE LIGHT BOX AROUND WIDGET */
        .widget-box-style {
            padding: 10px;
            border: 1px solid rgba(255, 255, 255, 0.08); /* Subtle border */
            border-radius: 12px;
            background: rgba(0, 0, 0, 0.15); /* Very slight dark background */
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        /* Reduced Vertical Spacing for Sections */
        .section-tight {
            margin-bottom: 50px; /* Reduced by ~20% from typical 60-80px */
            padding-bottom: 30px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .section-tight:last-of-type {
            border-bottom: none;
            margin-bottom: 40px;
        }

        /* Ticker Animations */
        .brand-text-gold { background: linear-gradient(to bottom, #FCD535 0%, #B3882A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 15px rgba(252, 213, 53, 0.2); } 
        .brand-icon-gold { color: #FCD535; text-shadow: 0 0 10px rgba(252, 213, 53, 0.4); }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } 
        .marquee-track { animation: scroll 75s linear infinite; width: max-content; }
      `}</style>

      <div className="container pt-5 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-11">

            {/* --- MAIN HEADER --- */}
            <header className="mb-4 pb-3 border-bottom border-secondary border-opacity-25 text-start">
              <h1 className="fw-bold text-white mb-2" style={{ fontSize: '2.2rem', letterSpacing: '-1px', lineHeight: '1.2' }}>
                NGX NFT Index <span style={{ color: GOLD_MEDIUM }}>Framework</span>
              </h1>
              <h2 className="text-white mb-3" style={{ fontSize: '1.2rem', fontWeight: '400', letterSpacing: '0.5px' }}>
                Institutional Whitepaper
              </h2>
              
              <div style={{ maxWidth: '100%', color: '#B0B0B0' }}>
                <p className="fw-bold text-white mb-2">Introduction: NGX NFT Index</p>
                <p>
                  The <strong className="text-white">NGX NFT Index</strong> represents a comprehensive framework designed to provide a structural lens on the global NFT market. Developed as a neutral analytical benchmark, this framework aggregates the entirety of NFT market activity across the four primary sectors: <strong className="text-white">Land, Gaming, Art, and Digital Names (e.g., ENS-like domains, NNM Registry)</strong>. Its purpose is to establish a reference architecture for market participants, researchers, and competing platforms, reflecting both historical evolution and current structural dynamics of the NFT ecosystem.
                </p>
                <p>
                  This framework does <strong className="text-white">not constitute financial advice</strong>, a trading signal, or an investment instrument. Instead, it serves as a <strong className="text-white">methodological and academic reference</strong> that documents the evolution, structure, and activity of NFT assets across the global market.
                </p>
              </div>
            </header>

            {/* --- SECTION 1: SENTIMENT INDEX --- */}
            <section className="section-tight">
                {/* FLOAT CONTAINER: 
                   On Desktop: Floats right, text wraps around it.
                   On Mobile: Stacks normally.
                */}
                <div className="widget-float-container">
                    <div className="widget-box-style">
                        <NGXWidget theme="dark" title="NGX NFTs" />
                    </div>
                </div>

                {/* TEXT CONTENT - Wraps around the widget */}
                <div className="text-start">
                    <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.5rem' }}>
                        <span style={{ color: GOLD_MEDIUM }}>1.</span> NGX NFT Sentiment Index
                    </h2>
                    
                    <p>
                        The <strong className="text-white">Sentiment Index</strong> captures the collective behavioral signals observed across all four NFT sectors, measuring structural patterns of buying and selling activity. It aggregates indicators of market enthusiasm, caution, and directional pressure without attributing individual sentiment to any specific participant or platform.
                    </p>

                    <p className="fw-bold text-white mt-3 mb-2">Key Highlights:</p>
                    <ul>
                        <li>Measures aggregated signals of market confidence and caution across the NFT ecosystem.</li>
                        <li>Tracks periods of elevated transactional intensity versus subdued market engagement.</li>
                        <li>Provides a reference for structural shifts and emerging trends in market behavior.</li>
                        <li>Designed for analytical benchmarking, not predictive or investment purposes.</li>
                    </ul>

                    <p>
                        By documenting historical sentiment fluctuations, the index establishes <strong className="text-white">temporal precedence</strong>, reinforcing the intellectual ownership of the NGX NFT analytical methodology.
                    </p>
                    {/* Clearing floats to ensure section height captures everything if text is short */}
                    <div style={{ clear: 'both' }}></div>
                </div>
            </section>

            {/* --- SECTION 2: MARKET CAPITALIZATION INDEX --- */}
            <section className="section-tight">
                
                <div className="widget-float-container">
                    <div className="widget-box-style">
                         <NGXCapWidget theme="dark" title="NGX Cap NFTs" />
                    </div>
                </div>

                <div className="text-start">
                    <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.5rem' }}>
                            <span style={{ color: GOLD_MEDIUM }}>2.</span> NGX NFT Market Capitalization Index
                    </h2>
                    
                    <p>
                        The <strong className="text-white">Market Cap Index</strong> evaluates the aggregate capital deployed across all NFT sectors, providing a holistic perspective of liquidity flows and market scale. It integrates the totalized market value of digital assets without disclosing proprietary weighting or computational mechanisms.
                    </p>

                    <p className="fw-bold text-white mt-3 mb-2">Key Highlights:</p>
                    <ul>
                        <li>Aggregates valuation metrics across Land, Gaming, Art, and Digital Names sectors.</li>
                        <li>Reflects systemic market expansion and contraction trends.</li>
                        <li>Functions as a structural reference, illustrating sectoral balance and capital distribution.</li>
                        <li>Supports comparative analyses without serving as an investment recommendation.</li>
                    </ul>
                    
                    <p>
                        This index emphasizes the <strong className="text-white">foundational structure of the NFT economy</strong>, documenting historical data points to assert <strong className="text-white">methodological priority</strong> while remaining fully neutral and legally unencumbered.
                    </p>
                    <div style={{ clear: 'both' }}></div>
                </div>
            </section>

            {/* --- SECTION 3: VOLUME INDEX --- */}
            <section className="section-tight">
                
                <div className="widget-float-container">
                    <div className="widget-box-style">
                        <NGXVolumeWidget theme="dark" title="NGX Volume" />
                    </div>
                </div>

                <div className="text-start">
                    <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.5rem' }}>
                            <span style={{ color: GOLD_MEDIUM }}>3.</span> NGX NFT Volume Index
                    </h2>
                    
                    <p>
                        The <strong className="text-white">Volume Index</strong> captures the transactional activity within the NFT ecosystem across all four sectors, providing a real-time lens on operational liquidity and engagement levels. It consolidates activity volumes while maintaining confidentiality of proprietary data computations.
                    </p>

                    <p className="fw-bold text-white mt-3 mb-2">Key Highlights:</p>
                    <ul>
                        <li>Measures comprehensive market activity across Land, Gaming, Art, and Digital Names.</li>
                        <li>Highlights periods of heightened transactional throughput and relative sector performance.</li>
                        <li>Offers an institutional-grade reference framework for comparative research and market observation.</li>
                        <li>Operates strictly as a benchmark, with zero liability for investment outcomes.</li>
                    </ul>

                    <p>
                        By structuring volume data as an independent index, this component reinforces the NGX NFT Index <strong className="text-white">as a benchmark standard</strong> while safeguarding the integrity of intellectual property and historical precedence.
                    </p>
                    <div style={{ clear: 'both' }}></div>
                </div>
            </section>

            {/* --- FRAMEWORK POSITIONING & CONCLUSION --- */}
            <section className="mb-5">
                <div className="row">
                    <div className="col-12 text-start">
                        
                        <h3 className="fw-bold text-white mb-3" style={{ fontSize: '1.3rem' }}>
                            Framework Positioning & Legal Notice
                        </h3>
                        <p>
                            The <strong className="text-white">NGX NFT Index Framework</strong> is intended solely as a <strong className="text-white">neutral, reference-grade analytical tool</strong>. It does <strong className="text-white">not constitute investment advice</strong>, solicitation, or a predictive mechanism. All indicators are descriptive of market structure, aggregated activity, and sectoral dynamics.
                        </p>
                        <p>
                            The framework and its components document the historical development and structural design of NFT market indices, establishing precedence and <strong className="text-white">institutional credibility</strong> without claiming operational authority or proprietary market control. Use of this framework does not imply endorsement, sponsorship, or affiliation with any market participant, platform, or regulatory body.
                        </p>

                        <hr className="my-4 border-secondary border-opacity-25" />

                        <h3 className="fw-bold text-white mb-3" style={{ fontSize: '1.3rem' }}>
                            Conclusion
                        </h3>
                        <p>
                            The NGX NFT Index Framework embodies a <strong className="text-white">methodical, academically-oriented, and institutionally rigorous</strong> approach to understanding the NFT ecosystem. By providing neutral, aggregate insights into sentiment, market capitalization, and volume across all major sectors, it establishes a reference standard for:
                        </p>
                        <ul>
                            <li>Market researchers</li>
                            <li>Institutional participants</li>
                            <li>Index developers</li>
                            <li>Competing platforms</li>
                        </ul>
                        <p>
                            This framework reinforces intellectual ownership, ensures historical precedence, and maintains a <strong className="text-white">zero-responsibility legal posture</strong>, while contributing a robust, structured lens to the study and understanding of global NFT market dynamics.
                        </p>

                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="text-start" style={{ borderTop: '1px solid #2E2E2E', paddingTop: '20px', marginTop: '20px', marginBottom: '40px' }}>
              <p style={{ fontSize: '11px', color: '#777', lineHeight: '1.5' }}>
                © 2026 NNM. All rights reserved. NGX Indices are powered by real-time on-chain data.
              </p>
            </footer>

          </div>
        </div>
      </div>

      {/* --- BRAND TICKER (Sticky Bottom) --- */}
      <div className="w-100 py-3 border-top border-bottom border-secondary position-relative" style={{ borderColor: '#333 !important', marginTop: 'auto', marginBottom: '20px', backgroundColor: '#0b0e11', maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)' }}>
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
