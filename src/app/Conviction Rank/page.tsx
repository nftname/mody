'use client';
import Link from 'next/link';

const GOLD_BASE = '#F0C420';
const GOLD_LIGHT = '#FFD700';
const GOLD_MEDIUM = '#FDB931';
const GOLD_DARK = '#B8860B';
const TEXT_OFF_WHITE = '#E0E0E0';

// --- BRAND ICONS DATA (Reused for consistency) ---
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

// --- MAIN PAGE COMPONENT ---
export default function ConvictionRankPage() {
  return (
    <main className="conviction-page" style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '80px' }}>
      
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
                Conviction <span style={{ color: GOLD_MEDIUM }}>Rank</span>
              </h1>
              
              <div style={{ lineHeight: '1.8', maxWidth: '800px', marginTop: '20px', color: '#B0B0B0' }}>
                <p>In today's NFT marketplaces, value is often misunderstood.</p>
                <p>Prices rise.<br/>Prices fall.<br/>Charts fluctuate.<br/>Volumes spike.</p>
                <p>But none of this answers the core question serious participants care about:</p>
                <p className="fw-semibold text-white">Which assets do people genuinely believe in?</p>
                <p>Not for a moment.<br/>Not based on hype.<br/>But with real conviction.</p>
                <p>This is exactly what Conviction Rank was built to measure.</p>
              </div>
            </header>

            {/* SECTIONS */}
            
            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem', color: '#E0E0E0' }}>
                Beyond Price: Why Conviction Matters More Than Liquidity
              </h2>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                In traditional markets, professional investors don’t build portfolios based on likes, hype, or short-term attention.
                They build them based on conviction.
              </p>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                Conviction separates noise from signal. It’s the difference between a trade and a thesis.
              </p>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                NFT markets have lacked a clear way to measure this—until now.
              </p>
              <p style={{ lineHeight: '1.6' }}>
                Most analyses rely solely on price and volume—both reactive, easily manipulated, and often misleading.
                Conviction Rank introduces a fundamentally different metric: <strong className="text-white">belief-backed positioning.</strong>
              </p>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem', color: '#E0E0E0' }}>
                What Is Conviction Rank?
              </h2>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                Conviction Rank is not a popularity contest. It is not voting. It is not social engagement.
              </p>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                Conviction Rank measures how many verified NFT holders are willing to publicly support a specific digital name.
              </p>
              <p style={{ lineHeight: '1.6', marginBottom: '10px' }}>Every supporter:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '14px', lineHeight: '1.8' }}>
                  <li>Owns a registered NNM name</li>
                  <li>Has real involvement in the ecosystem</li>
                  <li>Signals belief consciously and irreversibly</li>
              </ul>
              <p style={{ lineHeight: '1.6' }}>
                No anonymous votes. No bots. No free clicks.
                Each act of conviction carries real weight because it comes from active, verified participants.
              </p>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem', color: '#E0E0E0' }}>
                How Conviction Changes Market Behavior
              </h2>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                Visible conviction changes market dynamics. Assets with strong conviction tend to:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '14px', lineHeight: '1.8' }}>
                  <li>Trade with resilience</li>
                  <li>Recover faster from downturns</li>
                  <li>Attract long-term holders rather than short-term flippers</li>
              </ul>
              <p style={{ lineHeight: '1.6' }}>
                This is not theory—it mirrors how high-conviction equities behave in traditional markets.
                Conviction Rank doesn’t predict price—it explains <strong className="text-white">why price moves before it moves.</strong>
              </p>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem', color: '#E0E0E0' }}>
                The Psychology Behind Conviction
              </h2>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                Humans follow confidence—not charts. When traders see a name backed by hundreds of verified holders, trust forms naturally:
              </p>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                Not because the platform says so,<br/>
                But because the market itself signals alignment.
              </p>
              <p style={{ lineHeight: '1.6' }}>
                This is social proof without manipulation. Collective belief without coordination. Decentralized confidence.
              </p>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem', color: '#E0E0E0' }}>
                WNNM Credits: Reputation, Not Speculation
              </h2>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                Conviction within NNM accumulates <strong style={{ color: GOLD_BASE }}>WNNM Credits</strong>.
              </p>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                These are <strong className="text-white">not tokens</strong>, they are <strong className="text-white">not tradable</strong>, and they are <strong className="text-white">not financial instruments</strong>.
              </p>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                WNNM Credits represent reputation and engagement. Whenever you mint a new name on the platform or purchase a name from the Marketplace, you earn WNNM Credits.
              </p>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                These credits are stored in your wallet and can be used to support the names you believe deserve recognition.
              </p>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                Each WNNM Credit spent converts immediately into NNM Credits, which you can claim and withdraw to your wallet.
              </p>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                You may support any name only once, and you cannot support names you own—ensuring that your support reflects genuine community conviction.
              </p>
              <p style={{ lineHeight: '1.6' }}>
                WNNM Credits unlock visibility advantages, platform privileges, and influence within Conviction Rank, rewarding engagement, not speculation.
              </p>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem', color: '#E0E0E0' }}>
                Why Conviction Rank Favors Early Supporters
              </h2>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                Early conviction has disproportionate value. Supporting a name before it becomes popular compounds reputation.
              </p>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                As the ecosystem grows, early supporters gain historical positioning, not just economic benefit.
              </p>
              <p style={{ lineHeight: '1.6' }}>
                Conviction Rank records who believed first. In digital markets, that history matters.
              </p>
            </section>

            <section className="mb-5 ps-lg-3">
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: '1.25rem', color: '#E0E0E0' }}>
                A Market That Remembers
              </h2>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                Most marketplaces forget intent. NNM records it.
              </p>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                Conviction Rank ensures belief is visible. Trust leaves a footprint. Commitment has memory.
              </p>
              <p style={{ lineHeight: '1.6', marginBottom: '14px' }}>
                This is how digital names evolve from collectibles into true assets. This is how markets mature. And this is how signal rises above noise.
              </p>
              <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
                Conviction is no longer silent.<br/>
                <span style={{ color: GOLD_BASE, fontWeight: 'bold' }}>It’s ranked.</span>
              </p>
            </section>

            {/* FOOTER */}
            <footer className="ps-lg-3" style={{ borderTop: '1px solid #2E2E2E', paddingTop: '20px', marginTop: '40px', marginBottom: '60px' }}>
              <p style={{ fontSize: '11px', color: '#777', lineHeight: '1.5' }}>
                NNM is a decentralized discovery and exchange platform. All content is provided for informational purposes only.
              </p>
            </footer>

          </div>
        </div>
      </div>
      <style jsx global>{`
        .conviction-page p,
        .conviction-page li,
        .conviction-page small,
        .conviction-page .small,
        .conviction-page label {
          font-family: "Inter", "Segoe UI", sans-serif;
          font-size: 15px;
          color: #B0B0B0;
        }
        .conviction-page h1,
        .conviction-page h2,
        .conviction-page h3,
        .conviction-page h4,
        .conviction-page h5,
        .conviction-page h6,
        .conviction-page .text-white {
          color: #E0E0E0 !important;
        }
        .conviction-page .text-gold {
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
