'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import MarketTicker from '@/components/MarketTicker';

// --- CONSTANTS & STYLES ---
const GOLD_BTN_PRIMARY = '#D4AF37';
const GOLD_BTN_HIGHLIGHT = '#E6C76A';
const GOLD_BTN_SHADOW = '#B8962E';
const GOLD_BASE = '#F0C420';
const GOLD_LIGHT = '#FFD700';
const GOLD_MEDIUM = '#FDB931';
const GOLD_DARK = '#B8860B';
const TEXT_BODY_COLOR = '#B0B0B0';
const TEXT_HEADER_GRAY = '#B0B0B0';
const TEXT_OFF_WHITE = '#E0E0E0';

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
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<any>(null);
  const [isChartLibraryLoaded, setIsChartLibraryLoaded] = useState(false);

  // --- CHART INITIALIZATION ---
  const initChart = () => {
    const win = window as any;
    if (chartRef.current && win.Chart) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstance.current) chartInstance.current.destroy();

        const ChartConstructor = win.Chart;
        chartInstance.current = new ChartConstructor(ctx, {
          type: 'line',
          data: {
            labels: ['2017','2018','2019','2020','2021','2022','2023','2024','2025','2026','2027','2028','2029','2030'],
            datasets: [{
              label: 'Imperium Asset Value',
              data: [0.1, 0.3, 0.8, 1.5, 3.2, 6, 10, 15, 20, 35, 50, 70, 90, 120],
              borderColor: GOLD_BASE,
              backgroundColor: 'rgba(240, 196, 32, 0.08)', 
              fill: true,
              tension: 0.4,
              pointRadius: 2, 
              pointHoverRadius: 4,
              pointBackgroundColor: '#fff',
              pointBorderColor: GOLD_BASE,
              pointBorderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                  enabled: true,
                  backgroundColor: 'rgba(0,0,0,0.95)',
                  titleColor: GOLD_BASE,
                  bodyColor: '#fff',
                  borderColor: '#333',
                  borderWidth: 1,
                  padding: 10,
                  displayColors: false
              }
            },
            scales: {
              x: { 
                ticks: { color: TEXT_HEADER_GRAY, font: { size: 10 } }, 
                grid: { color: 'rgba(255,255,255,0.04)' } 
              },
              y: { 
                ticks: { color: TEXT_HEADER_GRAY, font: { size: 10 } }, 
                grid: { color: 'rgba(255,255,255,0.04)' } 
              }
            }
          }
        });
      }
    }
  };

  useEffect(() => {
    if (isChartLibraryLoaded) initChart();
  }, [isChartLibraryLoaded]);

  return (
    <main className="concept-page" style={{ 
      backgroundColor: '#1E1E1E', 
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
        .font-imperium { font-family: 'Cinzel', serif; }
        .text-gold { color: ${GOLD_BASE} !important; }
        
        /* Static Cards */
        .info-card-static {
          background-color: #242424; 
          border: 1px solid #2E2E2E;
          border-radius: 8px;
          padding: 24px;
        }
        
        /* Note Box Style */
        .note-box {
          background-color: rgba(240, 196, 32, 0.05);
          border-left: 3px solid ${GOLD_BASE};
          border-top: 1px solid rgba(240, 196, 32, 0.18);
          border-right: 1px solid rgba(240, 196, 32, 0.12);
          border-bottom: 1px solid rgba(240, 196, 32, 0.12);
          padding: 15px;
          font-size: 15px;
          color: ${TEXT_BODY_COLOR};
          border-radius: 0 4px 4px 0;
          margin-top: 15px;
          line-height: 1.6;
        }

        /* Ingot Button Style */
        .btn-ingot {
            background: linear-gradient(180deg, ${GOLD_BTN_HIGHLIGHT} 0%, ${GOLD_BTN_PRIMARY} 40%, ${GOLD_BTN_SHADOW} 100%);
            border: 1px solid ${GOLD_BTN_SHADOW};
            color: #2b1d00;
            font-family: 'Cinzel', serif;
            font-weight: 700;
            letter-spacing: 1px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3), 0 0 15px rgba(212, 175, 55, 0.1);
            text-shadow: 0 1px 0 rgba(255,255,255,0.4);
            transition: filter 0.3s ease, transform 0.2s ease;
            padding: 12px 30px; 
            font-size: 1rem;
            white-space: nowrap;
        }
        .btn-ingot:hover {
            filter: brightness(1.08);
            transform: translateY(-1px);
            color: #1a1100;
        }
        
        /* Mobile specific adjustments */
        @media (max-width: 768px) {
            .btn-ingot-wrapper {
                width: 70% !important; 
                margin: 0 auto;
            }
            .btn-ingot {
                width: 100%;
                padding: 12px 0;
                font-size: 0.85rem; 
            }
        }

        /* Ticker Animations (left unchanged intentionally) */
        .brand-text-gold { background: linear-gradient(to bottom, #FCD535 0%, #B3882A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 15px rgba(252, 213, 53, 0.2); } 
        .brand-icon-gold { color: #FCD535; text-shadow: 0 0 10px rgba(252, 213, 53, 0.4); }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } 
        .marquee-track { animation: scroll 75s linear infinite; width: max-content; }

        /* Page Typography (content only) */
        .concept-shell p,
        .concept-shell li,
        .concept-shell small,
        .concept-shell .small,
        .concept-shell label {
          font-family: "Inter", "Segoe UI", sans-serif;
          font-size: 15px;
          color: #B0B0B0;
        }
        .concept-shell h1,
        .concept-shell h2,
        .concept-shell h3,
        .concept-shell h4,
        .concept-shell h5,
        .concept-shell h6,
        .concept-shell .text-white {
          color: #E0E0E0 !important;
        }
        .concept-shell .text-gold,
        .concept-shell .gold,
        .concept-shell .highlight-gold,
        .concept-shell a.text-decoration-none.fw-bold {
          color: ${GOLD_BASE} !important;
        }
      `}</style>

      <Script 
        src="https://cdn.jsdelivr.net/npm/chart.js" 
        strategy="afterInteractive" 
        onLoad={() => setIsChartLibraryLoaded(true)} 
      />

      <MarketTicker />

      <div className="concept-shell">
      {/* --- HEADER SECTION --- */}
      <section className="container-fluid px-0 pt-5" style={{ paddingBottom: '60px' }}>
          <div style={{ paddingLeft: '20px', paddingRight: '20px' }}>
              <div className="text-start text-lg-center mx-auto">
                  
                  {/* Main Title */}
                    <h1 style={{ 
                      fontFamily: '"Inter", "Segoe UI", sans-serif', 
                      fontSize: '1.5rem', 
                      fontWeight: '700',
                      letterSpacing: '-1px', 
                      color: TEXT_OFF_WHITE, 
                      margin: 0,
                      lineHeight: '1.2'
                    }}>
                      NNM — The <span style={{ color: GOLD_MEDIUM }}>Imperium</span> <span style={{ color: TEXT_OFF_WHITE }}>Digital Name Asset Concept</span>
                    </h1>
                  
                  {/* Main Subtext */}
                    <p style={{ 
                      marginTop: '15px', 
                      marginBottom: 0,
                      maxWidth: '900px',
                      lineHeight: '1.6',
                      marginLeft: 'auto', // Centering on Desktop
                      marginRight: 'auto', // Centering on Desktop
                      // Mobile reset for alignment happens via parent class 'text-start'
                    }}>
                      The <span className="text-gold fw-bold">Imperium Asset</span> represents the ultimate tier of digital name ownership, far beyond standard tokens. Each <span className="text-gold fw-bold">Imperium Name</span> establishes immutable priority within the Web3 ecosystem, securing a permanent place in digital history. As we approach 2026, these assets are poised to become the cornerstone of digital identity and value.
                  </p>
              </div>
          </div>
      </section>

      {/* --- CONTENT COLUMNS --- */}
      <section className="container-fluid px-0 flex-grow-1">
        <div style={{ paddingLeft: '20px', paddingRight: '20px' }}>
            <div className="row g-5">
              
              {/* --- LEFT COLUMN (50%) --- */}
              <div className="col-12 col-lg-6">
                
                {/* Authority Section */}
                <div className="mb-5">
                  <h2 className="text-white h5 mb-3 fw-bold font-imperium" style={{ color: GOLD_MEDIUM }}>Authority & Scarcity</h2>
                  <p style={{ lineHeight: '1.7', maxWidth: '95%' }}>
                    Owning an Imperium Asset means more than participation — it means defining the future trajectory of high-value digital names. Scarcity, authenticity, and historical priority converge to create an asset of unparalleled distinction. This is the digital asset for those who aspire to permanence, recognition, and exclusivity.
                  </p>
                </div>

                {/* Why Imperium Stands Apart */}
                <div className="mb-5">
                   <h2 className="h4 mb-4 fw-bold font-imperium text-white" style={{ color: TEXT_OFF_WHITE }}>Why Imperium Stands Apart</h2>
                   
                   <div className="mb-3">
                         <h3 className="h6 text-white fw-bold mb-1" style={{ color: TEXT_OFF_WHITE }}>Immutable Priority:</h3>
                         <p>Each Imperium Name is recorded permanently on-chain, establishing first-mover recognition in the emerging 2026 digital landscape.</p>
                   </div>
                   
                   <div className="mb-3">
                         <h3 className="h6 text-white fw-bold mb-1" style={{ color: TEXT_OFF_WHITE }}>Global Recognition:</h3>
                         <p>Accessible across all Web3 marketplaces, the Imperium Asset ensures your digital identity is universally acknowledged.</p>
                   </div>
                   
                   <div className="mb-3">
                         <h3 className="h6 text-white fw-bold mb-1" style={{ color: TEXT_OFF_WHITE }}>Rare & Exclusive:</h3>
                         <p>Limited issuance guarantees that every name carries intrinsic scarcity, reinforcing its future prominence in the market.</p>
                   </div>
                </div>

                {/* Hierarchy Box */}
                <div className="info-card-static">
                  <h3 className="text-white h6 mb-3 fw-bold border-bottom border-secondary pb-2" style={{ color: TEXT_OFF_WHITE }}>Asset Class Hierarchy</h3>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2"><span style={{ color: GOLD_MEDIUM, fontWeight: 'bold' }}>- Imperium Name Assets — </span> Immutable Priority</li>
                    <li className="mb-2"><span className="text-white" style={{ color: TEXT_OFF_WHITE }}>- Art NFTs — </span> Collectibles</li>
                    <li className="mb-2"><span className="text-white" style={{ color: TEXT_OFF_WHITE }}>- Utility NFTs — </span> Access Mechanisms</li>
                    <li className="mb-2"><span className="text-white" style={{ color: TEXT_OFF_WHITE }}>- Gaming NFTs — </span> Interactive Assets</li>
                    <li><span className="text-white" style={{ color: TEXT_OFF_WHITE }}>- Standard Domains —</span> Leased Identifiers</li>
                  </ul>
                </div>
              </div>

              {/* --- RIGHT COLUMN (50%) --- */}
              <div className="col-12 col-lg-6">
                
                {/* Title Above Chart */}
                <div className="mb-3">
                    <h3 className="text-white h5 mb-2 font-imperium fw-bold" style={{ color: TEXT_OFF_WHITE }}>Valuation Trajectory (2017–2030)</h3>
                    <p style={{ lineHeight: '1.5' }}>
                        This visualization illustrates the historical growth of the NFT ecosystem and its projected evolution, highlighting the introduction of Imperium Assets in 2025 and their anticipated prominence as a foundational digital asset class by 2030.
                    </p>
                </div>

                {/* Graph Container */}
                <div className="info-card-static mb-3" style={{ padding: '15px' }}>
                    <div style={{ position: 'relative', width: '100%', height: '280px' }}>
                        <canvas ref={chartRef} id="nftGrowthChart"></canvas>
                    </div>
                </div>

                {/* Text OUTSIDE and BELOW Chart */}
                <div className="ps-2">
                    <p className="mt-2 mb-0" style={{ fontStyle: 'italic', lineHeight: '1.5' }}>
                        Historical trends are presented for contextual reference only. Projections are illustrative and hypothetical and do not imply guaranteed outcomes.
                    </p>
                
                </div>

                {/* Legal Note Box (Gold Border Added) */}
                <div className="note-box">
                  <span className="text-white fw-bold" style={{ color: TEXT_OFF_WHITE }}>Note:</span> This presentation provides general information. It is not financial advice. Ownership does not guarantee financial returns.
                </div>

              </div>
            </div>

            {/* CTA BUTTON (Mobile 70% Width) - LINKED TO /mint */}
            <div className="text-center mt-5 mb-5 btn-ingot-wrapper">
                 <Link href="/mint" className="btn btn-ingot rounded-1 text-decoration-none d-inline-block">
                     CLAIM YOUR NEXUS NAME
                 </Link>
            </div>
        </div>
      </section>
      </div>

      {/* --- BRAND TICKER --- */}
      <div className="w-100 py-3 border-top border-bottom border-secondary position-relative" style={{ borderColor: '#333 !important', marginTop: 'auto', marginBottom: '20px', backgroundColor: '#050505', maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)' }}>
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
