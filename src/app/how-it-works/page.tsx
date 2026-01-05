'use client';
import Link from 'next/link';
import { useState } from 'react';

const GOLD_BASE = '#F0C420';
const GOLD_LIGHT = '#FFD700';
const GOLD_MEDIUM = '#FDB931';
const GOLD_DARK = '#B8860B';
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

// --- 1. THE DIAGRAM COMPONENT (Global/Apple Style) ---
const OwnershipFlowDiagram = () => {
  return (
    <div className="w-100 overflow-hidden rounded-4 p-0 position-relative" 
       style={{ 
         backgroundColor: '#1E1E1E',
         border: `1px solid ${GOLD_BASE}22`,
         boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
         background: 'linear-gradient(180deg, rgba(36, 36, 36, 0.7) 0%, rgba(30, 30, 30, 1) 100%)'
       }}>
      
      <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
            backgroundImage: `linear-gradient(${GOLD_BASE} 1px, transparent 1px), linear-gradient(90deg, ${GOLD_BASE} 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
      }}></div>

      <svg width="100%" height="auto" viewBox="0 0 1000 300" xmlns="http://www.w3.org/2000/svg" className="position-relative" style={{ zIndex: 10 }}>
        <defs>
            <linearGradient id="premiumGold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={GOLD_DARK} stopOpacity="0.9"/>
              <stop offset="50%" stopColor={GOLD_BASE} stopOpacity="1"/>
              <stop offset="100%" stopColor={GOLD_LIGHT} stopOpacity="0.9"/>
            </linearGradient>
            <filter id="appleGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
        </defs>

        <path d="M180 150 L380 150 M520 150 L720 150 M720 150 L820 150" 
              stroke="url(#premiumGold)" strokeWidth="1.5" strokeDasharray="8 8" fill="none" opacity="0.4" />
        
           <circle r="3" fill={GOLD_BASE} filter="url(#appleGlow)">
             <animateMotion dur="3s" repeatCount="indefinite" path="M180 150 L380 150" calcMode="linear" />
        </circle>
           <circle r="3" fill={GOLD_BASE} filter="url(#appleGlow)">
             <animateMotion dur="3s" repeatCount="indefinite" path="M520 150 L820 150" calcMode="linear" begin="1.5s" />
        </circle>

        <g transform="translate(100, 150)">
            <rect x="-80" y="-50" width="160" height="100" rx="20" fill="#242424" stroke="#2E2E2E" strokeWidth="1" fillOpacity="0.9" />
            <circle cx="0" cy="-15" r="22" fill="none" stroke={GOLD_BASE} strokeWidth="1.5" />
            <path d="M-10 -10 H10 V10 H-10 Z" fill="none" stroke={GOLD_BASE} strokeWidth="1.5" />
            <text y="25" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif">Your Wallet</text>
            <text y="42" textAnchor="middle" fill="#B0B0B0" fontSize="11" fontFamily="Inter, sans-serif">Connect</text>
        </g>

        <g transform="translate(450, 150)">
            <rect x="-70" y="-50" width="140" height="100" rx="20" fill="#242424" stroke="#2E2E2E" strokeWidth="1" fillOpacity="0.9" />
            <path d="M0 -35 L0 -5" stroke="url(#premiumGold)" strokeWidth="1" opacity="0.6" />
            <circle cx="0" cy="-20" r="25" fill="#1E2329" stroke="url(#premiumGold)" strokeWidth="1.5" />
            <text y="25" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif">NNM Market</text>
            <text y="42" textAnchor="middle" fill="#B0B0B0" fontSize="11" fontFamily="Inter, sans-serif">Mint & Trade</text>
        </g>

        <g transform="translate(850, 150)">
            <circle r="50" fill="url(#premiumGold)" opacity="0.05" filter="url(#appleGlow)">
                 <animate attributeName="opacity" values="0.05;0.15;0.05" dur="3s" repeatCount="indefinite" />
            </circle>
            <rect x="-80" y="-50" width="160" height="100" rx="20" fill="#242424" stroke={GOLD_BASE} strokeWidth="1.5" fillOpacity="0.9" />
            <path d="M0 -25 L-15 -15 V5 C-15 15 0 25 0 25 C0 25 15 15 15 5 V-15 Z" fill="none" stroke={GOLD_BASE} strokeWidth="2" />
            <path d="M-5 0 L0 5 L5 -5" fill="none" stroke={GOLD_BASE} strokeWidth="2" />
            <text y="25" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif">Sovereign Asset</text>
            <text y="42" textAnchor="middle" fill={GOLD_BASE} fontSize="11" fontFamily="Inter, sans-serif" fontWeight="500">100% Owned</text>
        </g>
      </svg>
    </div>
  );
};

// --- 2. FAQ DATA ---
const faqItems = [
    {
        q: "What is NNM’s role in the process?",
        a: "NNM operates as a non-custodial marketplace interface. All name assets are minted, owned, transferred, and held directly within the user’s connected wallet. NNM does not store, control, or manage user assets at any stage."
    },
    {
        q: "Does NNM have access to my wallet or assets?",
        a: "No. Wallet connection is used solely to enable on-chain interactions. Users retain full and exclusive control over their wallets, private keys, and name assets at all times."
    },
    {
        q: "Who sets prices and manages sales?",
        a: "All pricing decisions, offers, and sales terms are defined entirely by asset owners. NNM does not influence pricing, valuation, or market demand."
    },
    {
        q: "What happens after I purchase or mint a name?",
        a: "Once a transaction is completed on-chain, the name asset is permanently recorded on the blockchain and delivered directly to your wallet, along with its associated metadata and minting details."
    },
    {
        q: "Can I sell or transfer my name outside NNM?",
        a: "Yes. Name assets are fully portable. Owners may hold, transfer, sell, or list their assets on any compatible wallet or marketplace without restriction."
    },
    {
        q: "Does NNM provide financial or investment advice?",
        a: "No. All content, data, and market information presented on the platform is provided for informational purposes only. Users make independent decisions based on their own judgment."
    },
    {
        q: "Are transactions reversible?",
        a: "Blockchain transactions are immutable by design. Once confirmed on-chain, transactions cannot be altered or reversed."
    },
    {
        q: "What fees does NNM charge?",
        a: "NNM applies a transparent service fee on completed marketplace transactions. No additional hidden fees are imposed by the platform."
    },
    {
        q: "Is availability of names guaranteed?",
        a: "No. Name availability depends on on-chain status at the time of search or minting. Availability may change instantly due to blockchain activity."
    },
    {
        q: "Who is responsible for compliance and usage?",
        a: "Users are solely responsible for understanding and complying with applicable local laws, regulations, and wallet security practices when interacting with the platform."
    },
    {
        q: "Where is ownership recorded?",
        a: "All ownership records exist exclusively on the blockchain network. NNM provides a visual interface to display this data but does not maintain off-chain ownership records."
    }
];

// --- 3. FAQ ACCORDION COMPONENT ---
const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="mt-5 pt-4 border-top border-secondary border-opacity-25">
        <h2 className="fw-bold text-white mb-4" style={{ fontSize: '1.25rem', color: '#E0E0E0' }}>Important Notes & Common Questions</h2>
            <div className="d-flex flex-column gap-3">
                {faqItems.map((item, index) => (
                    <div key={index} 
                         className="rounded-3 overflow-hidden" 
               style={{ backgroundColor: '#242424', border: '1px solid #2E2E2E' }}>
                        <button 
                            onClick={() => toggleFAQ(index)}
                            className="w-100 d-flex justify-content-between align-items-center p-3 text-start bg-transparent border-0"
                            style={{ cursor: 'pointer', outline: 'none' }}
                        >
                <span className="fw-semibold" style={{ color: openIndex === index ? GOLD_BASE : '#E0E0E0', fontSize: '15px' }}>
                                {item.q}
                            </span>
                            <i className={`bi bi-chevron-down`} 
                               style={{ 
                     color: '#B0B0B0', 
                                   transition: 'transform 0.3s',
                                   transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)'
                               }}></i>
                        </button>
                        
                        <div style={{ 
                                maxHeight: openIndex === index ? '200px' : '0', 
                                overflow: 'hidden', 
                                transition: 'max-height 0.3s ease-in-out'
                            }}>
                            <div className="p-3 pt-0" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                                {item.a}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- 4. MAIN PAGE ---
export default function HowItWorksPage() {
  return (
    <main className="how-page" style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '80px' }}>
      
      <div className="container pt-5">
        <div className="row justify-content-center">
          
          <div className="col-12">

            {/* HEADER */}
            <header className="text-center text-md-start mb-5 ps-lg-3">
              <h1 className="fw-bold text-white mb-3" 
                  style={{ 
                      fontSize: '1.53rem', 
                      letterSpacing: '-1px', 
                      lineHeight: '1.2',
                      color: '#E0E0E0'
                  }}>
                How <span style={{ color: GOLD_MEDIUM }}>NNM</span> Works
              </h1>
              <p style={{ 
                  lineHeight: '1.6',
                  marginTop: '15px',
                  maxWidth: '900px' 
              }}>
                NNM is a Web3 marketplace for <strong className="text-white">Digital Name Assets</strong> — a new class of scarce, blockchain-native assets designed for long-term digital ownership, discovery, and exchange.
              </p>
            </header>

            {/* SECTIONS */}
            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem', color: '#E0E0E0' }}>
                What Are <span style={{ color: GOLD_MEDIUM }}>Digital Name Assets</span>?
              </h2>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                Digital Name Assets are unique, non-fungible blockchain assets that represent rare digital identifiers. They are not identities, domains, or credentials. They are collectible, ownable digital assets secured by decentralized networks and verifiable on-chain.
              </p>
              <p style={{ lineHeight: '1.6' }}>
                Each asset is defined by scarcity, provenance, and permanence. Ownership is recorded transparently on the blockchain, allowing users to hold, trade, or transfer assets without intermediaries.
              </p>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem', color: '#E0E0E0' }}>
                The <span style={{ color: GOLD_MEDIUM }}>NNM Marketplace</span>
              </h2>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                NNM operates as an open marketplace where users can discover, list, and exchange Digital Name Assets directly with one another. The platform does not act as a broker, advisor, or custodian.
              </p>
              <p style={{ lineHeight: '1.6' }}>
                All transactions occur through user-connected wallets. NNM does not hold user funds, does not guarantee liquidity, and does not participate in pricing decisions.
              </p>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem', color: '#E0E0E0' }}>
                Platform Walkthrough
              </h2>
              <div className="d-flex align-items-center justify-content-center rounded-3" 
                   style={{ 
                       marginTop: '20px', 
                       border: '1px dashed #2E2E2E', 
                       backgroundColor: '#242424', 
                       padding: '60px', 
                       color: '#B0B0B0' 
                   }}>
                <div className="text-center">
                    <i className="bi bi-play-circle d-block mb-2" style={{ fontSize: '30px', color: GOLD_MEDIUM }}></i>
                    <span>Platform Video Guide Coming Soon</span>
                </div>
              </div>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem', color: '#E0E0E0' }}>
                NGX Index: Market Intelligence
              </h2>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                NGX is a global NFT market indicator developed to observe ecosystem-wide activity. It reflects aggregated market signals across NFT sectors, including Digital Name Assets, without providing financial predictions or investment advice.
              </p>
              <p style={{ lineHeight: '1.6' }}>
                NNM is one of several data contributors to NGX. The index is informational only and does not represent performance guarantees.
              </p>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem', color: '#E0E0E0' }}>
                Sovereign Ownership Flow
              </h2>
              <div className="mt-4">
                 <OwnershipFlowDiagram />
              </div>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem', color: '#E0E0E0' }}>
                Ownership & Responsibility
              </h2>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                Users are solely responsible for their actions on the platform. NNM does not provide investment advice, does not assess asset value, and does not guarantee outcomes.
              </p>
              <p style={{ lineHeight: '1.6' }}>
                Digital Name Assets are not securities, identities, or financial instruments. Participation is voluntary and subject to user discretion.
              </p>
            </section>

            {/* NEW FAQ SECTION */}
            <section className="mb-5 ps-lg-3">
                <FAQSection />
            </section>

            <footer className="ps-lg-3" style={{ borderTop: '1px solid #2E2E2E', paddingTop: '30px', marginTop: '40px' }}>
              <p style={{ fontSize: '15px' }}>
                NNM is a decentralized discovery and exchange platform. All content is provided for informational purposes only.
              </p>
            </footer>

          </div>
        </div>
      </div>
      <style jsx global>{`
        .how-page p,
        .how-page li,
        .how-page small,
        .how-page .small,
        .how-page label {
          font-family: "Inter", "Segoe UI", sans-serif;
          font-size: 15px;
          color: #B0B0B0;
        }
        .how-page h1,
        .how-page h2,
        .how-page h3,
        .how-page h4,
        .how-page h5,
        .how-page h6,
        .how-page .text-white {
          color: #E0E0E0 !important;
        }
        .how-page .text-gold,
        .how-page .gold,
        .how-page .highlight-gold,
        .how-page a.text-decoration-none.fw-bold {
          color: ${GOLD_BASE} !important;
        }

        /* Ticker Animations */
        .brand-text-gold { background: linear-gradient(to bottom, #FCD535 0%, #B3882A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 15px rgba(252, 213, 53, 0.2); } 
        .brand-icon-gold { color: #FCD535; text-shadow: 0 0 10px rgba(252, 213, 53, 0.4); }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } 
        .marquee-track { animation: scroll 75s linear infinite; width: max-content; }
        .marquee-track { animation: scroll 75s linear infinite; width: max-content; }
      `}</style>

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