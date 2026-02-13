'use client';
import Link from 'next/link';

// ألوان الهوية الموحدة - تم ضبطها لراحة العين
const BRAND_GOLD = '#FCD535'; // نفس درجة أصفر باينانس الذهبي
const TEXT_OFF_WHITE = '#EAECEF'; // أوف وايت مائل للزرقة الخفيفة جداً (مثل نصوص باينانس)
const TEXT_MUTED = '#848E9C';     // رمادي مائل للزرقة (للنصوص الفرعية)

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
    // التغيير الرئيسي هنا: الخلفية أصبحت #181A20 لتطابق هوية باينانس
    <main className="legal-page" style={{ backgroundColor: '#181A20', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '80px' }}>
      
      <div className="container pt-5">
        <div className="row justify-content-center">
          
          <div className="col-12 col-lg-10">

            {/* HEADER */}
            <header className="mb-5 border-bottom border-secondary border-opacity-25 pb-4">
              <h1 className="fw-bold mb-2" 
                  style={{ 
                      fontSize: '2.2rem', 
                      letterSpacing: '-1px', 
                      lineHeight: '1.2',
                      color: TEXT_OFF_WHITE
                  }}>
                NNM Terms of <span style={{ color: BRAND_GOLD }}>Service</span>
              </h1>
              <p style={{ color: TEXT_MUTED, fontSize: '13px', marginTop: '10px' }}>
                Effective: February 2026
              </p>
            </header>

            {/* INTRO */}
            <section className="mb-5">
                {/* تغيير لون خلفية الكارد إلى #1E2329 ليتماشى مع الخلفية الجديدة */}
                <div className="p-4 rounded-3" style={{ backgroundColor: '#1E2329', border: '1px solid #2B3139' }}>
                    <p className="mb-0 fw-medium" style={{ color: TEXT_OFF_WHITE, lineHeight: '1.7', fontSize: '15px' }}>
                        <strong style={{ color: BRAND_GOLD }}>IMPORTANT NOTICE:</strong> By accessing, browsing, connecting a wallet to, minting, listing, interacting with, or otherwise using the NFT Name Market (NNM) website, interface, smart contracts, or ChainFace services (collectively, the “Protocol”), you acknowledge that you have read, understood, and irrevocably agree to be legally bound by this Agreement. If you do not agree, you must immediately discontinue all access.
                    </p>
                </div>
            </section>

            {/* SECTION I */}
            <section className="mb-5">
                <h2 className="section-title mb-4">I. TERMS OF SERVICE & LIABILITY</h2>
                
                {/* 1 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">1. ELIGIBILITY & AGE REQUIREMENTS</h3>
                    <p className="term-text">
                        By using the NNM Protocol you represent, warrant, and covenant that you are at least <strong>18 years old</strong> (or of legal majority in your jurisdiction), possess full legal capacity to enter into this Agreement, and that your use of the Protocol complies with all applicable laws and regulations. Users accept sole responsibility for any legal consequences arising from jurisdiction-specific obligations.
                    </p>
                </div>

                {/* 2 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">2. PROTOCOL NATURE – INTERFACE ONLY</h3>
                    <p className="term-text">NNM provides a strictly decentralized interface for autonomous smart contracts on public blockchains.</p>
                    <ul className="term-list">
                        <li><strong>NNM is not</strong> a financial institution, broker, exchange, escrow, wallet, custodian, or regulated marketplace.</li>
                        <li>NNM does not hold, control, or access user funds or private keys.</li>
                        <li>All transactions are peer-to-peer and executed solely by users through their own wallets.</li>
                        <li>NNM does not guarantee liquidity, execution, or value of any asset.</li>
                        <li>Users acknowledge that NNM is a neutral interface and does not mediate or intervene in transactions.</li>
                    </ul>
                </div>

                {/* 3 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">3. DECENTRALIZED & JURISDICTION-NEUTRAL OPERATION</h3>
                    <p className="term-text">NNM operates globally and is jurisdiction-agnostic.</p>
                    <ul className="term-list">
                        <li>NNM does not solicit, target, or conduct business in any specific country.</li>
                        <li>NNM has no physical presence for financial operations.</li>
                        <li>Users assume full responsibility for compliance with local laws and regulations.</li>
                        <li>NNM assumes no liability for jurisdiction-specific regulatory obligations.</li>
                    </ul>
                </div>

                {/* 4 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">4. NO FINANCIAL, INVESTMENT, OR LEGAL ADVICE</h3>
                    <p className="term-text">
                        All content is informational only. NNM provides no investment, financial, tax, or legal advice. Users act at their own risk. Users must seek independent professional counsel for any financial, investment, or legal decisions.
                    </p>
                </div>

                {/* 5 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">5. DIGITAL ASSET CLASSIFICATION</h3>
                    <p className="term-text">NFT Names and related digital items (“Digital Identity Assets”) are:</p>
                    <ul className="term-list">
                        <li>Purely visual identity assets.</li>
                        <li>Not securities, equities, or investment contracts.</li>
                        <li>Not granting trademark, publicity, or commercial rights outside the blockchain.</li>
                        <li>Not guaranteeing exclusivity, enforceability, or financial appreciation.</li>
                        <li>Users acknowledge that minting does not imply ownership rights beyond blockchain metadata.</li>
                    </ul>
                </div>

                {/* 6 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">6. MARKET ACTIVITY & ADMIN/OPERATIONAL WALLETS</h3>
                    <p className="term-text">
                        NNM may operate an Initial Market Testing Phase for up to ninety (90) days using authorized Operational and Admin Wallets:
                    </p>
                    <ul className="term-list">
                        <li>Such wallets are used for technical testing, initial liquidity, educational evaluation of market activity, and trading indicator assessments.</li>
                        <li>Trades via Operational/Admin Wallets do not constitute financial advice, investment recommendation, or market guarantees.</li>
                        <li>Users acknowledge that any observed market activity during this period is experimental and not indicative of future results.</li>
                        <li>NNM provides no warranty regarding price, volume, liquidity, or outcomes during testing.</li>
                        <li><strong>After the 90-day testing period</strong>, Operational/Admin Wallets cease experimental activities, and the marketplace operates fully user-driven.</li>
                    </ul>
                </div>

                {/* 7 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">7. CHAINFACE SERVICE</h3>
                    <p className="term-text">ChainFace provides decentralized identity display linked to NFT ownership.</p>
                    <ul className="term-list">
                        <li>NNM does not custody funds or process payments.</li>
                        <li>NNM does not verify legality of user transactions or mediate disputes.</li>
                        <li>Users fully control all interactions via ChainFace; all activities are peer-to-peer.</li>
                        <li>Users accept complete autonomy and privacy, with zero liability on NNM’s part.</li>
                    </ul>
                </div>

                {/* 8 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">8. CONVICTION POINTS SYSTEM</h3>
                    <p className="term-text">Conviction Rank points (WNNM → NNM Points):</p>
                    <ul className="term-list">
                        <li>Are symbolic, non-monetary, and purely internal to the platform.</li>
                        <li>Are not a currency, token, security, or tradable asset.</li>
                        <li>Are fully controlled by NNM and may be modified, suspended, or terminated at any time without notice.</li>
                        <li>Users acknowledge that points carry no claim to future tokens, coins, or tradable rights.</li>
                    </ul>
                </div>

                {/* 9 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">9. USER RESPONSIBILITY</h3>
                    <p className="term-text">Users are fully responsible for:</p>
                    <ul className="term-list">
                        <li>Content minted, listed, or displayed on the Protocol.</li>
                        <li>Compliance with intellectual property, trademark, publicity rights, and third-party rights.</li>
                        <li>Wallet security, transaction approvals, and tax obligations.</li>
                        <li>Any actions, messages, or interactions via ChainFace or NFT assets.</li>
                        <li>Users acknowledge that NNM does not monitor or verify user content; all on-chain activity is solely the user’s responsibility.</li>
                    </ul>
                </div>

                {/* 10 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">10. PROHIBITED ACTIVITIES</h3>
                    <p className="term-text">Users agree not to use NNM for:</p>
                    <ul className="term-list">
                        <li>Money laundering, terrorist financing, or sanctions violations.</li>
                        <li>Market manipulation (including wash trading) or automated bot activity.</li>
                        <li>Fraudulent, deceptive, or illegal conduct.</li>
                    </ul>
                    <p className="term-text mt-2">NNM reserves the right to restrict access to wallets suspected of prohibited activities or violation of these Terms.</p>
                </div>

                {/* 11 - The Strong Burn Clause */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">11. PROHIBITED CONTENT, THIRD-PARTY RIGHTS & RIGHT TO BURN</h3>
                    <p className="term-text">To maintain protocol integrity and compliance, users must NOT mint or display Digital Identity Assets that:</p>
                    <ul className="term-list">
                        <li>Violate trademarks, copyrights, or publicity rights of celebrities, public figures, or corporations.</li>
                        <li>Contain hate speech, slurs, explicit violence, pornography, or illegal content.</li>
                        <li>Are identified as “high-risk” names for misuse or infringement.</li>
                    </ul>
                    <p className="term-text mt-3">
                        NNM reserves the <strong>strict right, at its sole discretion, to block, delist, or burn (permanently destroy)</strong> any Digital Identity Asset:
                    </p>
                    <ul className="term-list">
                        <li>In response to valid legal claims.</li>
                        <li>If an asset violates the community standards or high-risk policies.</li>
                        <li>If the asset is involved in misuse, unauthorized commercial exploitation, or regulatory concerns.</li>
                    </ul>
                    <p className="term-text mt-3 fw-bold" style={{ color: '#FF5555' }}>
                        NO REFUNDS: In the event an asset is blocked, delisted, or burned, the user forfeits all access and is not entitled to any refund, compensation, or reimbursement for minting or gas fees.
                    </p>
                </div>

                {/* 12 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">12. NAME BURN AUTHORIZATION</h3>
                    <p className="term-text">NNM may, at its sole discretion, burn or remove Digital Identity Assets under circumstances including but not limited to:</p>
                    <ul className="term-list">
                        <li>Verified legal claims or court orders.</li>
                        <li>Misuse, impersonation, or infringement of third-party rights.</li>
                        <li>Detection of fraudulent, malicious, or harmful activity.</li>
                        <li>Any activity that threatens the integrity or security of the Protocol.</li>
                    </ul>
                </div>

                {/* 13 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">13. LIMITATION OF LIABILITY – “AS IS”</h3>
                    <p className="term-text">The Protocol is provided “AS IS” and “AS AVAILABLE.” NNM shall not be liable for:</p>
                    <ul className="term-list">
                        <li>Bugs, exploits, or vulnerabilities in smart contracts.</li>
                        <li>Network failures, latency, high gas fees, or congestion on the Polygon blockchain.</li>
                        <li>Loss of funds or assets.</li>
                        <li>Unauthorized wallet access.</li>
                        <li>Market volatility or trading losses.</li>
                        <li>Regulatory or legal consequences arising from user activity.</li>
                    </ul>
                    <p className="term-text mt-2">Maximum liability, if any, is strictly limited to amounts directly paid to NNM for services.</p>
                </div>

                {/* 14 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">14. INDEMNIFICATION</h3>
                    <p className="term-text">
                        Users agree to indemnify, defend, and hold harmless NNM, affiliates, and associated entities from any claims, losses, or damages arising from:
                    </p>
                    <ul className="term-list">
                        <li>Violation of laws or third-party rights.</li>
                        <li>Unauthorized transactions.</li>
                        <li>Misuse of NFT Names, ChainFace, or Digital Identity Assets.</li>
                    </ul>
                </div>

                {/* 15 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">15. INTELLECTUAL PROPERTY</h3>
                    <ul className="term-list">
                        <li>All platform branding, analytics, NGX NFT Index, sub-indices, and proprietary tools remain exclusive property of NNM.</li>
                        <li>On-chain assets are fully controlled by individual wallet holders.</li>
                        <li>Reproduction, copying, or unauthorized use of proprietary data, indices, or methodology is strictly prohibited.</li>
                    </ul>
                </div>

                {/* 16 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">16. PRIVACY POLICY</h3>
                    <p className="term-text">NNM follows a Zero-PII policy:</p>
                    <ul className="term-list">
                        <li>No collection of personal data (names, emails, IP addresses).</li>
                        <li>No account registration required.</li>
                        <li>Blockchain transactions remain inherently public.</li>
                        <li>Users acknowledge that all on-chain activity is public by nature and at their own discretion.</li>
                    </ul>
                </div>

                {/* 17 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">17. MODIFICATIONS</h3>
                    <p className="term-text">NNM may update these Terms at any time; continued use constitutes acceptance of the updated Terms.</p>
                </div>

                {/* 18 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">18. GOVERNING LAW & ARBITRATION</h3>
                    <ul className="term-list">
                        <li>All disputes are resolved via individual binding arbitration.</li>
                        <li>Class actions are waived.</li>
                        <li>Governing law: Singapore law and internationally recognized arbitration standards.</li>
                    </ul>
                </div>

                {/* 19 */}
                <div className="term-block mb-4">
                    <h3 className="term-heading">19. MISCELLANEOUS</h3>
                    <ul className="term-list">
                        <li>Users agree that NNM is a neutral interface only, providing no financial, legal, or custodial functions.</li>
                        <li>Acceptance of these Terms constitutes full waiver of claims against NNM for user-generated actions, misuse, or regulatory consequences.</li>
                        <li>These Terms fully cover all liabilities, including name minting, NFT ownership, ChainFace use, and high-risk content control.</li>
                    </ul>
                </div>

            </section>

            <footer className="mt-5 pt-4 border-top border-secondary border-opacity-25 mb-5">
              <p style={{ fontSize: '13px', color: TEXT_MUTED, fontStyle: 'italic' }}>
                <strong style={{ color: TEXT_OFF_WHITE }}>AGREEMENT:</strong> By connecting your wallet, you confirm you have read and accepted these terms.
              </p>
            </footer>

          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Scrollbar Styling to match dark theme */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #181A20; 
        }
        ::-webkit-scrollbar-thumb {
          background: #2B3139; 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #474D57; 
        }

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
            font-size: 1.15rem;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .legal-page .term-text {
            color: ${TEXT_MUTED};
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 8px;
        }
        .legal-page .term-text strong {
            color: ${TEXT_OFF_WHITE};
            font-weight: 600;
        }
        .legal-page .term-list {
            list-style-type: none;
            padding-left: 15px;
            margin-top: 8px;
        }
        .legal-page .term-list li {
            position: relative;
            padding-left: 18px;
            margin-bottom: 6px;
            color: ${TEXT_MUTED};
            font-size: 15px;
            line-height: 1.5;
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
      <div className="w-100 py-3 border-top border-bottom border-secondary position-relative" style={{ borderColor: '#2B3139 !important', marginTop: 'auto', marginBottom: '10px', backgroundColor: '#0b0e11', maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)' }}>
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
