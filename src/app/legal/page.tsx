'use client';
import Link from 'next/link';

// ألوان الهوية الموحدة
const BRAND_GOLD = '#FCD535'; 
const GOLD_DARK = '#B3882A';
const TEXT_OFF_WHITE = '#E0E0E0';
const TEXT_MUTED = '#B0B0B0';

// --- BRAND ICONS DATA (للحفاظ على جمالية الفوتر) ---
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
                    <stop offset="0%" stopColor="#FCD535" />
                    <stop offset="100%" stopColor="#B3882A" />
                  </linearGradient>
                </defs>
                <path d={icon} fill="url(#goldGradientIcon)" />
            </svg>
        );
    }
    return <i className={`bi ${icon} brand-icon-gold`} style={{ fontSize: '20px' }}></i>;
};

export default function LegalPage() {
  return (
    <main className="legal-page" style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '80px' }}>
      
      <div className="container pt-5">
        <div className="row justify-content-center">
          
          <div className="col-12 col-lg-10">

            {/* HEADER */}
            <header className="mb-5 border-bottom border-secondary border-opacity-25 pb-4">
              <h1 className="fw-bold text-white mb-2" 
                  style={{ 
                      fontSize: '2.2rem', 
                      letterSpacing: '-1px', 
                      lineHeight: '1.2',
                      color: TEXT_OFF_WHITE
                  }}>
                Terms of <span style={{ color: BRAND_GOLD }}>Service</span>
              </h1>
              <p style={{ color: '#777', fontSize: '14px', marginTop: '10px' }}>
                Last Updated: November 2025
              </p>
            </header>

            {/* INTRO */}
            <section className="mb-5">
                <div className="p-4 rounded-3" style={{ backgroundColor: '#242424', border: '1px solid #2E2E2E' }}>
                    <p className="mb-0 fw-medium" style={{ color: TEXT_OFF_WHITE, lineHeight: '1.7' }}>
                        <strong style={{ color: BRAND_GOLD }}>IMPORTANT NOTICE:</strong> By accessing, browsing, connecting a wallet to, minting through, listing on, interacting with, or otherwise using the NFT Name Market (NNM) interface (the &quot;Site&quot;) and protocol, you acknowledge that you have read, understood, and fully agree to be legally bound by this User Agreement (&quot;Agreement&quot;). If you do not agree to any portion of these Terms, you must immediately discontinue all access to the Site and Protocol.
                    </p>
                </div>
            </section>

            {/* SECTION I */}
            <section className="mb-5">
                <h2 className="section-title mb-4">I. TERMS OF SERVICE & LIABILITY</h2>
                
                <div className="term-block mb-4">
                    <h3 className="term-heading">1. ELIGIBILITY & AGE REQUIREMENTS</h3>
                    <p className="term-text">
                        By using the NNM Protocol you represent, warrant, and covenant that you are at least <strong>18 years old</strong> (or of legal majority where you reside), that you possess the full legal capacity and authority to enter into this Agreement, and that your use of the Protocol will comply with all applicable laws and regulations.
                    </p>
                </div>

                <div className="term-block mb-4">
                    <h3 className="term-heading">2. PROTOCOL NATURE — INTERFACE-ONLY</h3>
                    <p className="term-text">NNM is strictly a <strong>visual interface layer</strong>. It is not an exchange, escrow, broker, custodian, wallet provider, financial institution, or regulated marketplace.</p>
                    <ul className="term-list">
                        <li><strong>Interface Only:</strong> NNM controls only the website and UI through which blockchain data is presented.</li>
                        <li><strong>No Custody:</strong> NNM does not possess, store, control, or have access to your private keys or assets.</li>
                        <li><strong>Autonomous:</strong> The underlying smart contracts on Polygon remain fully autonomous and immutable.</li>
                    </ul>
                </div>

                <div className="term-block mb-4">
                    <h3 className="term-heading">3. JURISDICTION-NEUTRAL OPERATION</h3>
                    <p className="term-text">
                        NNM operates as a decentralized, jurisdiction-agnostic protocol interface. The Site is not operated, managed, hosted, administered, or controlled from within any specific country or legal jurisdiction. Access to the Site is global and passive in nature.
                    </p>
                    <p className="term-text mt-2">
                        Any access or use of the Site occurs solely at the initiative of the user, who is fully responsible for ensuring compliance with the laws applicable in their own jurisdiction.
                    </p>
                </div>

                <div className="term-block mb-4">
                    <h3 className="term-heading">4. NO FINANCIAL, LEGAL, OR TAX ADVICE</h3>
                    <p className="term-text">
                        All content is for informational purposes only. Nothing on the Site constitutes investment advice. You should seek independent professional counsel. Your use of the Protocol is at your own risk.
                    </p>
                </div>

                <div className="term-block mb-4">
                    <h3 className="term-heading">5. LIMITATION OF LIABILITY — &quot;AS IS&quot;</h3>
                    <p className="term-text">
                        To the fullest extent permitted by law, <strong>NNM expressly disclaims all warranties</strong>. The Service is provided &quot;AS IS.&quot; NNM shall not be liable for any damages, lost profits, smart-contract vulnerabilities, gas fee losses, or unauthorized access. NNM&apos;s liability is limited to the maximum extent permitted by law.
                    </p>
                </div>

                <div className="term-block mb-4">
                    <h3 className="term-heading">6. USER RESPONSIBILITY & INDEMNIFICATION</h3>
                    <p className="term-text">You accept full responsibility for any content you mint. NNM does not review or verify legality of user content.</p>
                    <ul className="term-list">
                        <li><strong>No Monitoring:</strong> The interface displays on-chain content as recorded.</li>
                        <li><strong>Indemnification:</strong> You agree to indemnify and hold NNM harmless against any claims arising from your use or IP violations.</li>
                    </ul>
                </div>

                <div className="term-block mb-4">
                    <h3 className="term-heading">7. ASSET CLASSIFICATION</h3>
                    <p className="term-text">NFTs are classified as <strong>&quot;Visual Identity Assets&quot;</strong>.</p>
                    <ul className="term-list">
                        <li><strong>No Commercial Rights:</strong> Minting does NOT grant trademark rights outside the blockchain.</li>
                        <li><strong>No Exclusivity:</strong> NNM does not guarantee global exclusivity or enforceability.</li>
                    </ul>
                </div>

                <div className="term-block mb-4">
                    <h3 className="term-heading">8. PROHIBITED ACTIVITIES</h3>
                    <p className="term-text">You agree not to use NNM for illegal purposes, including money laundering, terrorist financing, sanctions violations, market manipulation (wash trading), or bot activity.</p>
                </div>

                <div className="term-block mb-4">
                    <h3 className="term-heading">9. GOVERNING LAW</h3>
                    <p className="term-text">
                        All disputes shall be resolved by binding individual arbitration. Class-actions are waived. Governed by the laws of <strong>Singapore</strong>.
                    </p>
                </div>
            </section>

            {/* SECTION II */}
            <section className="mb-5">
                <h2 className="section-title mb-4">II. PRIVACY POLICY</h2>
                <div className="term-block mb-4">
                    <h3 className="term-heading">10. MAXIMUM PRIVACY / DATA POLICY</h3>
                    <p className="term-text">NNM uses a Zero-PII philosophy. We do not collect names, emails, or IP addresses.</p>
                    <ul className="term-list">
                        <li>No accounts or registrations required.</li>
                        <li>No analytics tracking for identification.</li>
                        <li>We only read public on-chain data.</li>
                    </ul>
                </div>
            </section>

            {/* SECTION III */}
            <section className="mb-5">
                <h2 className="section-title mb-4">III. INTELLECTUAL PROPERTY</h2>
                <div className="term-block mb-4">
                    <h3 className="term-heading">11. TAKEDOWN MECHANISM</h3>
                    <p className="term-text">
                        NNM respects IP rights. Upon valid notice (DMCA), we may delist the NFT from the UI and hide metadata. This affects the UI only; the on-chain token remains immutable.
                    </p>
                </div>
            </section>

            <footer className="mt-5 pt-4 border-top border-secondary border-opacity-25 mb-5">
              <p style={{ fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
                NNM reserves the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.
              </p>
            </footer>

          </div>
        </div>
      </div>

      <style jsx global>{`
        .legal-page .section-title {
            color: ${TEXT_OFF_WHITE};
            font-size: 1.5rem;
            font-weight: 700;
            border-left: 3px solid ${BRAND_GOLD};
            padding-left: 15px;
            letter-spacing: 0.5px;
        }
        .legal-page .term-heading {
            color: ${TEXT_OFF_WHITE};
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .legal-page .term-text {
            color: ${TEXT_MUTED};
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 10px;
        }
        .legal-page .term-text strong {
            color: #E0E0E0;
        }
        .legal-page .term-list {
            list-style-type: none;
            padding-left: 15px;
            margin-top: 10px;
        }
        .legal-page .term-list li {
            position: relative;
            padding-left: 15px;
            margin-bottom: 8px;
            color: ${TEXT_MUTED};
            font-size: 15px;
        }
        .legal-page .term-list li::before {
            content: "•";
            color: ${BRAND_GOLD};
            position: absolute;
            left: 0;
            font-weight: bold;
        }
        
        /* Ticker Animations */
        .brand-text-gold { background: linear-gradient(to bottom, #FCD535 0%, #B3882A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 15px rgba(252, 213, 53, 0.2); } 
        .brand-icon-gold { color: #FCD535; text-shadow: 0 0 10px rgba(252, 213, 53, 0.4); }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } 
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
