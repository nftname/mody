'use client';
import React, { useEffect, useState } from 'react';
import NGXWidget from '@/components/NGXWidget';
import NGXCapWidget from '@/components/NGXCapWidget';
import NGXVolumeWidget from '@/components/NGXVolumeWidget';
import NGXLiveChart from '@/components/NGXLiveChart';
import MarketTicker from '@/components/MarketTicker';

const BACKGROUND_DARK = '#1E1E1E';
const SURFACE_DARK = '#242424';
const BORDER_COLOR = '#2E2E2E';
const TEXT_PRIMARY = '#E0E0E0';
const TEXT_MUTED = '#B0B0B0';
const GOLD_COLOR = '#FFB300';
const FOX_PATH = "M29.77 8.35C29.08 7.37 26.69 3.69 26.69 3.69L22.25 11.23L16.03 2.19L9.67 11.23L5.35 3.69C5.35 3.69 2.97 7.37 2.27 8.35C2.19 8.46 2.13 8.6 2.13 8.76C2.07 10.33 1.83 17.15 1.83 17.15L9.58 24.32L15.93 30.2L16.03 30.29L16.12 30.2L22.47 24.32L30.21 17.15C30.21 17.15 29.98 10.33 29.91 8.76C29.91 8.6 29.86 8.46 29.77 8.35ZM11.16 19.34L7.56 12.87L11.53 14.86L13.88 16.82L11.16 19.34ZM16.03 23.33L12.44 19.34L15.06 16.92L16.03 23.33ZM16.03 23.33L17.03 16.92L19.61 19.34L16.03 23.33ZM20.89 19.34L18.17 16.82L20.52 14.86L24.49 12.87L20.89 19.34Z";

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

const EmbedCard = ({ title, component, width, height, embedId, label, isFullBar }: any) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const code = `<iframe src="https://nftnnm.com/embed/${embedId}?theme=auto" width="${width}" height="${height}" frameborder="0" style="border-radius:12px; overflow:hidden;"></iframe>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="embed-card h-100 d-flex flex-column justify-content-between">
      <div className="preview-area">
        <div className={`widget-scale-wrapper ${isFullBar ? 'full-bar-scale' : 'individual-scale'}`}>
          {component}
        </div>
      </div>
      
      <div className="info-area mt-1 text-center">
        <h6 className="d-none d-md-block mb-1 fw-bold text-white" style={{ fontSize: '11px' }}>{title}</h6>
        {label && <div className="mobile-label fw-bold mb-1">{label}</div>}
        
        {/* ✅ التعديل الجراحي هنا: ضبط عرض الزر بناءً على نوع الكارت */}
        <button 
            onClick={handleCopy} 
            className={`btn btn-sm mb-1 copy-btn ${copied ? 'btn-success' : 'btn-outline-secondary'}`}
            style={{ 
                width: isFullBar ? '32.5%' : '100%', // عرض مخصص للشريط الكامل ليماثل الأزرار تحته
                minWidth: '120px',
                margin: '0 auto', // توسيط الزر
                display: 'block'
            }}
        >
            {copied ? 'COPIED' : 'COPY'}
        </button>
        
        <div className="watermark">
            Powered by NNM Sovereign Name Assets
        </div>
      </div>

      <style jsx>{`
        .embed-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid ${BORDER_COLOR};
            border-radius: 8px;
            padding: 10px;
            transition: all 0.3s;
            overflow: hidden;
            position: relative;
        }
        .embed-card:hover {
            border-color: rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.04);
        }
        .preview-area {
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
        }
        .widget-scale-wrapper {
            transform-origin: center;
            width: 100%;
            display: flex;
            justify-content: center;
        }
        .full-bar-scale { transform: scale(0.85); }
        .individual-scale { transform: scale(0.75); }

        .copy-btn {
            font-size: 10px;
            padding: 4px 0;
            border-radius: 4px;
            color: #ddd;
            border-color: #444;
        }
        .mobile-label {
            display: none;
            color: ${GOLD_COLOR};
            font-size: 10px;
            letter-spacing: 0.5px;
        }
        .watermark {
            font-size: 9px;
            color: #777;
            font-style: italic;
            opacity: 0.8;
            line-height: 1.1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        @media (max-width: 768px) {
            .embed-card { padding: 4px; border: 1px solid rgba(255,255,255,0.05); }
            .preview-area { height: 45px; }
            .full-bar-scale { transform: scale(0.55); width: 180%; margin-left: -40%; }
            .individual-scale { transform: scale(0.48); width: 280px; }
            .copy-btn { font-size: 8px; padding: 2px 0; margin-top: 2px; background: rgba(0,0,0,0.3); }
            .mobile-label { display: block; font-size: 8px; margin-bottom: 2px !important; }
            .watermark { display: none; }
        }
      `}</style>
    </div>
  );
};

export default function NGXPage() {
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="p-5 text-center">Loading Analytics...</div>;

  return (
    <main className="ngx-page" style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', color: TEXT_PRIMARY }}>
      <MarketTicker />

      {/* HEADER SECTION */}
      <div className="header-wrapper shadow-sm">
        <div className="container-fluid p-0"> 
            <div className="widgets-grid-container">
                <div className="widget-item"> <NGXWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXCapWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXVolumeWidget theme="dark" /> </div>
            </div>
            <div className="row px-2 mt-3 text-section align-items-center">
                <div className="col-lg-12">
                    <h1 className="fw-bold mb-2 main-title">NGX NFT Index — The Global Benchmark</h1>
                    <p className="mb-0 main-desc">
                        The premier benchmark tracking the global NFT market, aggregating sentiment, liquidity, and rare digital name assets across all platforms.
                    </p>
                </div>
            </div>
        </div>
      </div>

      <div className="container-fluid py-4 px-3 px-md-4" style={{ paddingBottom: '0' }}> 
        {/* LIVE CHART */}
        <div className="content-container mb-4">
             <NGXLiveChart />
        </div>

        {/* ARTICLE */}
        <div className="content-container">
            <div className="article-wrapper">
                <h2 className="article-heading mb-3">NFTs as a Market Infrastructure: From Digital Collectibles to Asset Class Architecture</h2>
                <p className="article-text">Since their emergence in the late 2010s, Non-Fungible Tokens (NFTs) have undergone a fundamental transformation. What began as a niche experiment in digital ownership has evolved into a multi-layered market infrastructure spanning art, gaming, identity, finance, and cultural capital.</p>
                <p className="article-text">In their earliest phase, NFTs were primarily perceived as speculative digital collectibles—artifacts whose value was driven by novelty, scarcity, and community-driven hype. However, as the market matured, this narrow definition proved insufficient to describe the expanding utility and structural complexity of NFT-based assets.</p>
                <p className="article-text">By the early 2020s, NFTs began to establish themselves not merely as digital items, but as programmable ownership primitives—capable of representing access rights, intellectual property, virtual land, in-game economies, and decentralized identities. This shift marked the beginning of NFTs as a legitimate asset class rather than a transient trend.</p>

                <h3 className="article-heading mt-4 mb-2">The Evolution of NFT Market Structure</h3>
                <p className="article-text">As NFT ecosystems expanded, a clear hierarchy of asset types began to emerge. Art NFTs continued to function as cultural and collectible instruments. Utility NFTs enabled access mechanisms across platforms and communities. Gaming NFTs introduced interactive value, while domain-based NFTs bridged identity and digital real estate.</p>
                <p className="article-text">This diversification created a structural challenge: traditional valuation models—largely price-driven and speculative—were no longer sufficient to capture the true composition of the NFT market. Volume alone could not explain influence. Floor price could not define importance. A more systemic lens became necessary.</p>

                <h3 className="article-heading mt-4 mb-2">Why Market Indexing Matters in NFTs</h3>
                <p className="article-text">In traditional financial markets, indices serve as neutral observatories—tools that reflect market structure rather than predict outcomes. As NFTs mature, similar indexing frameworks are beginning to surface, not to forecast prices, but to contextualize market evolution.</p>
                <p className="article-text">Indexing in NFT markets provides a way to observe asset-class balance, category dominance, and structural shifts over time. Rather than focusing on individual projects, indices analyze the ecosystem itself.</p>
                <p className="article-text">Within this context, independent frameworks such as the NGX Index have emerged to monitor NFT market architecture through classification models, asset weighting, and scarcity dynamics. The NGX Index does not function as a pricing oracle or investment signal. Instead, it operates as a structural reference—tracking how different NFT asset classes evolve relative to one another as the market matures.</p>
                <p className="article-text">This approach reflects a broader transition in NFTs: from speculation-driven discovery toward infrastructure-level understanding.</p>

                <h3 className="article-heading mt-4 mb-2">NFTs as a Recognized Asset Class</h3>
                <p className="article-text">By 2024–2025, NFTs had firmly entered institutional, corporate, and cultural conversations. Major brands, gaming studios, and digital platforms adopted NFTs not as speculative instruments, but as ownership layers embedded within larger systems.</p>
                <p className="article-text">At this stage, the question is no longer whether NFTs will persist, but how they will be organized, measured, and understood over the long term. Asset-class frameworks, standardized terminology, and analytical indices are becoming essential components of this next phase.</p>

                <h3 className="article-heading mt-4 mb-2">Looking Ahead: 2026 and Beyond</h3>
                <p className="article-text">As regulatory clarity improves and technical standards stabilize, NFTs are expected to transition further into infrastructure assets—integrated seamlessly into digital economies rather than existing as standalone products.</p>
                <p className="article-text">The emergence of neutral market observatories, classification systems, and non-speculative indices will play a critical role in this evolution. They allow participants—creators, developers, institutions, and researchers—to understand the NFT ecosystem as a whole rather than through isolated data points.</p>
                <p className="article-text mb-3">In this sense, NFTs are no longer defined by individual tokens, but by the architecture they collectively form.</p>

                <div className="w-100 mt-2 border-top border-secondary" style={{ borderColor: '#333 !important', paddingTop: '8px' }}>
                    <p className="fst-italic mb-0 w-100" style={{ lineHeight: '1.2', fontSize: '9px', color: '#777', opacity: 0.9 }}>
                        This article is provided for informational and educational purposes only. It does not constitute financial advice, investment recommendations, or an offer to buy or sell any digital asset. References to market structures, indices, or frameworks—including the NGX Index—are descriptive in nature and intended solely to illustrate industry developments. Readers are encouraged to conduct independent research and consult qualified professionals before making any financial or strategic decisions. The publication of this material does not imply endorsement, solicitation, or prediction of market performance.
                    </p>
                </div>
                
                {/* DEVELOPERS EMBED SECTION */}
                <div className="mt-5 pt-4">
                    <div className="d-flex align-items-center mb-3">
                         <div style={{ width: '30px', height: '2px', background: GOLD_COLOR, marginRight: '10px' }}></div>
                         <h4 className="fw-bold mb-0 text-white" style={{ fontSize: '14px', letterSpacing: '1px' }}>DEVELOPERS & MARKET DATA</h4>
                    </div>
                    
                    <div className="row g-1">
                        <div className="col-12 mb-2">
                             <EmbedCard 
                                title="NGX Full Market Bar"
                                isFullBar={true}
                                component={
                                    <div className="d-flex gap-2">
                                        <NGXWidget theme="dark" />
                                        <NGXCapWidget theme="dark" />
                                        <NGXVolumeWidget theme="dark" />
                                    </div>
                                }
                                width="100%" height="90" embedId="ngx-full-bar"
                             />
                        </div>

                        <div className="col-4">
                            <EmbedCard title="Sentiment" label="Sentiment" component={<NGXWidget theme="dark" />} width="320" height="100" embedId="ngx-sentiment" />
                        </div>
                        <div className="col-4">
                            <EmbedCard title="Market Cap" label="Market Cap" component={<NGXCapWidget theme="dark" />} width="320" height="100" embedId="ngx-cap" />
                        </div>
                        <div className="col-4">
                            <EmbedCard title="Volume" label="Volume" component={<NGXVolumeWidget theme="dark" />} width="320" height="100" embedId="ngx-volume" />
                        </div>
                    </div>
                </div>

            </div>
        </div>

      </div>

      <div style={{ width: '100%', height: '2.5rem', background: 'transparent' }}></div>

      {/* 2. الشريط الأسود */}
      <div className="w-100 py-3 border-top border-bottom border-secondary position-relative" 
           style={{ 
               borderColor: '#333 !important', 
               backgroundColor: '#0b0e11', 
               maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)', 
               WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)' 
           }}>
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

      {/* 3. مسافة سفلية شفافة */}
      <div style={{ width: '100%', height: '80px', background: 'transparent' }}></div>

      <style jsx global>{`
        .header-wrapper { background: ${SURFACE_DARK}; border-bottom: 1px solid ${BORDER_COLOR}; padding: 4px 0; margin-top: 0; }
        .widgets-grid-container { display: flex; justify-content: space-between; align-items: center; flex-wrap: nowrap; max-width: 1050px; margin: 0 auto; padding: 0 15px; }
        .content-container { max-width: 1050px; margin: 0 auto; }
        .widget-item { flex: 0 0 310px; }
        .main-title { font-size: 1.65rem; color: ${TEXT_PRIMARY}; letter-spacing: -0.5px; }
        .main-desc { font-size: 15px; color: ${TEXT_MUTED}; max-width: 650px; }
        .text-section { max-width: 1050px; margin: 0 auto; }
        .article-heading { font-size: 1.65rem; color: ${TEXT_PRIMARY}; letter-spacing: -0.5px; font-weight: 700; font-family: "Inter", "Segoe UI", sans-serif; line-height: 1.3; }
        .article-heading.mt-4 { font-size: 1.3rem; }
        .article-text { color: ${TEXT_MUTED}; font-family: "Inter", "Segoe UI", sans-serif; font-size: 15px; line-height: 1.6; margin-bottom: 0.8rem; text-align: justify; }
        .article-wrapper { margin-left: 0; padding-left: 0; }

        @media (max-width: 768px) {
            .header-wrapper { padding: 2px 0 !important; }
            .widgets-grid-container { display: flex !important; flex-wrap: nowrap !important; justify-content: space-between !important; gap: 2px !important; padding: 0 4px !important; max-width: 100% !important; overflow-x: hidden; }
            .widget-item { flex: 1 1 auto !important; min-width: 0 !important; max-width: 33% !important; }
            .main-title { font-size: 1.25rem; text-align: center; }
            .main-desc { font-size: 13px; text-align: center; margin: 0 auto; }
            .article-heading { font-size: 1.25rem; text-align: left; }
            .article-text { font-size: 14px; text-align: left; }
        }

        .brand-text-gold { background: linear-gradient(to bottom, #FCD535 0%, #B3882A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 15px rgba(252, 213, 53, 0.2); } 
        .brand-icon-gold { color: #FCD535; text-shadow: 0 0 10px rgba(252, 213, 53, 0.4); }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } 
        .marquee-track { animation: scroll 75s linear infinite; width: max-content; }
      `}</style>
    </main>
  );
}

