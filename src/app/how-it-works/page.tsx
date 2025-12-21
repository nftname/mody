'use client';
import Link from 'next/link';
import { useState } from 'react';

// --- 1. THE DIAGRAM COMPONENT (Global/Apple Style) ---
const OwnershipFlowDiagram = () => {
  return (
    <div className="w-100 overflow-hidden rounded-4 p-0 position-relative" 
         style={{ 
             backgroundColor: '#0d1117',
             border: '1px solid rgba(252, 213, 53, 0.1)',
             boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
             background: 'linear-gradient(180deg, rgba(22, 27, 34, 0.6) 0%, rgba(13, 17, 23, 1) 100%)'
         }}>
      
      <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'linear-gradient(#FCD535 1px, transparent 1px), linear-gradient(90deg, #FCD535 1px, transparent 1px)',
          backgroundSize: '40px 40px'
      }}></div>

      <svg width="100%" height="auto" viewBox="0 0 1000 300" xmlns="http://www.w3.org/2000/svg" className="position-relative" style={{ zIndex: 10 }}>
        <defs>
            <linearGradient id="premiumGold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#B3882A" stopOpacity="0.8"/>
                <stop offset="50%" stopColor="#FCD535" stopOpacity="1"/>
                <stop offset="100%" stopColor="#B3882A" stopOpacity="0.8"/>
            </linearGradient>
            <filter id="appleGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
        </defs>

        <path d="M180 150 L380 150 M520 150 L720 150 M720 150 L820 150" 
              stroke="url(#premiumGold)" strokeWidth="1.5" strokeDasharray="8 8" fill="none" opacity="0.4" />
        
        <circle r="3" fill="#FCD535" filter="url(#appleGlow)">
             <animateMotion dur="3s" repeatCount="indefinite" path="M180 150 L380 150" calcMode="linear" />
        </circle>
        <circle r="3" fill="#FCD535" filter="url(#appleGlow)">
             <animateMotion dur="3s" repeatCount="indefinite" path="M520 150 L820 150" calcMode="linear" begin="1.5s" />
        </circle>

        <g transform="translate(100, 150)">
            <rect x="-80" y="-50" width="160" height="100" rx="20" fill="#161b22" stroke="#333" strokeWidth="1" fillOpacity="0.8" />
            <circle cx="0" cy="-15" r="22" fill="none" stroke="#FCD535" strokeWidth="1.5" />
            <path d="M-10 -10 H10 V10 H-10 Z" fill="none" stroke="#FCD535" strokeWidth="1.5" />
            <text y="25" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif">Your Wallet</text>
            <text y="42" textAnchor="middle" fill="#848E9C" fontSize="11" fontFamily="Inter, sans-serif">Connect</text>
        </g>

        <g transform="translate(450, 150)">
            <rect x="-70" y="-50" width="140" height="100" rx="20" fill="#161b22" stroke="#333" strokeWidth="1" fillOpacity="0.8" />
            <path d="M0 -35 L0 -5" stroke="url(#premiumGold)" strokeWidth="1" opacity="0.5" />
            <circle cx="0" cy="-20" r="25" fill="#1E2329" stroke="url(#premiumGold)" strokeWidth="1.5" />
            <text y="25" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif">NNM Market</text>
            <text y="42" textAnchor="middle" fill="#848E9C" fontSize="11" fontFamily="Inter, sans-serif">Mint & Trade</text>
        </g>

        <g transform="translate(850, 150)">
            <circle r="50" fill="url(#premiumGold)" opacity="0.05" filter="url(#appleGlow)">
                 <animate attributeName="opacity" values="0.05;0.15;0.05" dur="3s" repeatCount="indefinite" />
            </circle>
            <rect x="-80" y="-50" width="160" height="100" rx="20" fill="#161b22" stroke="#FCD535" strokeWidth="1.5" fillOpacity="0.9" />
            <path d="M0 -25 L-15 -15 V5 C-15 15 0 25 0 25 C0 25 15 15 15 5 V-15 Z" fill="none" stroke="#FCD535" strokeWidth="2" />
            <path d="M-5 0 L0 5 L5 -5" fill="none" stroke="#FCD535" strokeWidth="2" />
            <text y="25" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600" fontFamily="Inter, sans-serif">Sovereign Asset</text>
            <text y="42" textAnchor="middle" fill="#FCD535" fontSize="11" fontFamily="Inter, sans-serif" fontWeight="500">100% Owned</text>
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
            <h2 className="fw-bold text-white mb-4" style={{ fontSize: '1.25rem' }}>Important Notes & Common Questions</h2>
            <div className="d-flex flex-column gap-3">
                {faqItems.map((item, index) => (
                    <div key={index} 
                         className="rounded-3 overflow-hidden" 
                         style={{ backgroundColor: '#161b22', border: '1px solid #232838' }}>
                        <button 
                            onClick={() => toggleFAQ(index)}
                            className="w-100 d-flex justify-content-between align-items-center p-3 text-start bg-transparent border-0"
                            style={{ cursor: 'pointer', outline: 'none' }}
                        >
                            <span className="fw-semibold" style={{ color: openIndex === index ? '#FCD535' : '#E6E8EB', fontSize: '15px' }}>
                                {item.q}
                            </span>
                            <i className={`bi bi-chevron-down`} 
                               style={{ 
                                   color: '#848E9C', 
                                   transition: 'transform 0.3s',
                                   transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)'
                               }}></i>
                        </button>
                        
                        <div style={{ 
                                maxHeight: openIndex === index ? '200px' : '0', 
                                overflow: 'hidden', 
                                transition: 'max-height 0.3s ease-in-out'
                            }}>
                            <div className="p-3 pt-0" style={{ color: '#848E9C', fontSize: '14px', lineHeight: '1.6' }}>
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
    <main style={{ backgroundColor: '#0d1117', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '80px' }}>
      
      <div className="container pt-5">
        <div className="row justify-content-center">
          
          <div className="col-12">

            {/* HEADER */}
            <header className="text-center text-md-start mb-5 ps-lg-3">
              <h1 className="fw-bold text-white mb-3" 
                  style={{ 
                      fontSize: '1.53rem', 
                      letterSpacing: '-1px', 
                      lineHeight: '1.2' 
                  }}>
                How <span style={{ color: '#FCD535' }}>NNM</span> Works
              </h1>
              <p style={{ 
                  fontSize: '15px', 
                  color: '#848E9C', 
                  lineHeight: '1.6',
                  marginTop: '15px',
                  maxWidth: '900px' 
              }}>
                NNM is a Web3 marketplace for <strong className="text-white">Digital Name Assets</strong> — a new class of scarce, blockchain-native assets designed for long-term digital ownership, discovery, and exchange.
              </p>
            </header>

            {/* SECTIONS */}
            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem' }}>
                What Are <span style={{ color: '#FCD535' }}>Digital Name Assets</span>?
              </h2>
              <p style={{ fontSize: '15px', color: '#848E9C', lineHeight: '1.6', marginBottom: '14px' }}>
                Digital Name Assets are unique, non-fungible blockchain assets that represent rare digital identifiers. They are not identities, domains, or credentials. They are collectible, ownable digital assets secured by decentralized networks and verifiable on-chain.
              </p>
              <p style={{ fontSize: '15px', color: '#848E9C', lineHeight: '1.6' }}>
                Each asset is defined by scarcity, provenance, and permanence. Ownership is recorded transparently on the blockchain, allowing users to hold, trade, or transfer assets without intermediaries.
              </p>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem' }}>
                The <span style={{ color: '#FCD535' }}>NNM Marketplace</span>
              </h2>
              <p style={{ fontSize: '15px', color: '#848E9C', lineHeight: '1.6', marginBottom: '14px' }}>
                NNM operates as an open marketplace where users can discover, list, and exchange Digital Name Assets directly with one another. The platform does not act as a broker, advisor, or custodian.
              </p>
              <p style={{ fontSize: '15px', color: '#848E9C', lineHeight: '1.6' }}>
                All transactions occur through user-connected wallets. NNM does not hold user funds, does not guarantee liquidity, and does not participate in pricing decisions.
              </p>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem' }}>
                Platform Walkthrough
              </h2>
              <div className="d-flex align-items-center justify-content-center rounded-3" 
                   style={{ 
                       marginTop: '20px', 
                       border: '1px dashed #333', 
                       backgroundColor: '#161b22', 
                       padding: '60px', 
                       color: '#555' 
                   }}>
                <div className="text-center">
                    <i className="bi bi-play-circle d-block mb-2" style={{ fontSize: '30px', color: '#FCD535' }}></i>
                    <span style={{ color: '#848E9C' }}>Platform Video Guide Coming Soon</span>
                </div>
              </div>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem' }}>
                NGX Index: Market Intelligence
              </h2>
              <p style={{ fontSize: '15px', color: '#848E9C', lineHeight: '1.6', marginBottom: '14px' }}>
                NGX is a global NFT market indicator developed to observe ecosystem-wide activity. It reflects aggregated market signals across NFT sectors, including Digital Name Assets, without providing financial predictions or investment advice.
              </p>
              <p style={{ fontSize: '15px', color: '#848E9C', lineHeight: '1.6' }}>
                NNM is one of several data contributors to NGX. The index is informational only and does not represent performance guarantees.
              </p>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem' }}>
                Sovereign Ownership Flow
              </h2>
              <div className="mt-4">
                 <OwnershipFlowDiagram />
              </div>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem' }}>
                Ownership & Responsibility
              </h2>
              <p style={{ fontSize: '15px', color: '#848E9C', lineHeight: '1.6', marginBottom: '14px' }}>
                Users are solely responsible for their actions on the platform. NNM does not provide investment advice, does not assess asset value, and does not guarantee outcomes.
              </p>
              <p style={{ fontSize: '15px', color: '#848E9C', lineHeight: '1.6' }}>
                Digital Name Assets are not securities, identities, or financial instruments. Participation is voluntary and subject to user discretion.
              </p>
            </section>

            {/* NEW FAQ SECTION */}
            <section className="mb-5 ps-lg-3">
                <FAQSection />
            </section>

            <footer className="ps-lg-3" style={{ borderTop: '1px solid #222', paddingTop: '30px', marginTop: '40px' }}>
              <p style={{ fontSize: '13px', color: '#555' }}>
                NNM is a decentralized discovery and exchange platform. All content is provided for informational purposes only.
              </p>
            </footer>

          </div>
        </div>
      </div>
    </main>
  );
}