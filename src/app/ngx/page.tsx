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

const EmbedCard = ({ title, component, width, height, embedId }: any) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const code = `<iframe src="https://nnm.market/embed/${embedId}?theme=auto" width="${width}" height="${height}" frameborder="0" style="border-radius:12px; overflow:hidden;"></iframe>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="embed-card h-100 d-flex flex-column justify-content-between">
      <div className="preview-area">
        <div className="widget-scale-wrapper">
          {component}
        </div>
      </div>
      <div className="info-area mt-2 text-center text-md-start">
        <h6 className="d-none d-md-block mb-1 fw-bold text-white" style={{ fontSize: '11px' }}>{title}</h6>
        
        {/* زر النسخ */}
        <button 
            onClick={handleCopy} 
            className={`btn btn-sm w-100 mb-1 copy-btn ${copied ? 'btn-success' : 'btn-outline-secondary'}`}
        >
            {copied ? 'COPIED' : 'COPY'}
        </button>
        
        {/* العلامة المائية */}
        <div className="watermark">
            Powered by NNM Sovereign Name Assets
        </div>
      </div>

      <style jsx>{`
        .embed-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid ${BORDER_COLOR};
            border-radius: 8px;
            padding: 12px;
            transition: all 0.3s;
            overflow: hidden;
        }
        .embed-card:hover {
            border-color: rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.04);
        }
        .preview-area {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
        }
        .widget-scale-wrapper {
            transform: scale(0.65); /* مقاس الكمبيوتر الافتراضي */
            transform-origin: center;
            width: 100%;
            display: flex;
            justify-content: center;
        }
        .copy-btn {
            font-size: 10px;
            padding: 4px 0;
            border-radius: 4px;
        }
        .watermark {
            font-size: 9px;
            color: #FCD535; /* Gold */
            font-style: italic;
            opacity: 0.9;
            line-height: 1.1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* --- MOBILE ADJUSTMENTS (3 IN A ROW) --- */
        @media (max-width: 768px) {
            .embed-card {
                padding: 5px;
                border: 1px solid rgba(255,255,255,0.05);
            }
            .preview-area {
                height: 40px; /* ارتفاع أقل في الجوال */
            }
            /* تصغير شديد للويدجت ليناسب عرض 33% */
            .widget-scale-wrapper {
                transform: scale(0.30); 
                width: 300px; /* نعطيها عرض وهمي لكي لا تنضغط العناصر */
            }
            .copy-btn {
                font-size: 8px;
                padding: 2px 0;
                margin-top: 5px;
            }
            .watermark {
                font-size: 5px; /* خط صغير جداً */
                white-space: normal; /* السماح بالنزول لسطرين */
                text-align: center;
                margin-top: 2px;
            }
        }
      `}</style>
    </div>
  );
};

export default function NGXPage() {
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
                    <h1 className="fw-bold mb-2 main-title">
                            NGX NFT Index — The Global Benchmark
                    </h1>
                    <p className="mb-0 main-desc">
                        The premier benchmark tracking the global NFT market, aggregating sentiment, liquidity, and rare digital name assets across all platforms.
                    </p>
                </div>
            </div>
        </div>
      </div>

      <div className="container-fluid py-4 px-3 px-md-4">
        
        {/* LIVE CHART */}
        <div className="content-container mb-4">
             <NGXLiveChart />
        </div>

        {/* ARTICLE */}
        <div className="content-container">
            <div className="article-wrapper">
                
                <h2 className="article-heading mb-3">NFTs as a Market Infrastructure: From Digital Collectibles to Asset Class Architecture</h2>
                
                <p className="article-text">
                    Since their emergence in the late 2010s, Non-Fungible Tokens (NFTs) have undergone a fundamental transformation. What began as a niche experiment in digital ownership has evolved into a multi-layered market infrastructure spanning art, gaming, identity, finance, and cultural capital.
                </p>
                
                <p className="article-text">
                    In their earliest phase, NFTs were primarily perceived as speculative digital collectibles—artifacts whose value was driven by novelty, scarcity, and community-driven hype. However, as the market matured, this narrow definition proved insufficient to describe the expanding utility and structural complexity of NFT-based assets.
                </p>

                <p className="article-text">
                    By the early 2020s, NFTs began to establish themselves not merely as digital items, but as programmable ownership primitives—capable of representing access rights, intellectual property, virtual land, in-game economies, and decentralized identities. This shift marked the beginning of NFTs as a legitimate asset class rather than a transient trend.
                </p>

                <h3 className="article-heading mt-4 mb-2">The Evolution of NFT Market Structure</h3>
                
                <p className="article-text">
                    As NFT ecosystems expanded, a clear hierarchy of asset types began to emerge. Art NFTs continued to function as cultural and collectible instruments. Utility NFTs enabled access mechanisms across platforms and communities. Gaming NFTs introduced interactive value, while domain-based NFTs bridged identity and digital real estate.
                </p>

                <p className="article-text">
                    This diversification created a structural challenge: traditional valuation models—largely price-driven and speculative—were no longer sufficient to capture the true composition of the NFT market. Volume alone could not explain influence. Floor price could not define importance. A more systemic lens became necessary.
                </p>

                <h3 className="article-heading mt-4 mb-2">Why Market Indexing Matters in NFTs</h3>

                <p className="article-text">
                    In traditional financial markets, indices serve as neutral observatories—tools that reflect market structure rather than predict outcomes. As NFTs mature, similar indexing frameworks are beginning to surface, not to forecast prices, but to contextualize market evolution.
                </p>

                <p className="article-text">
                    Indexing in NFT markets provides a way to observe asset-class balance, category dominance, and structural shifts over time. Rather than focusing on individual projects, indices analyze the ecosystem itself.
                </p>

                <p className="article-text">
                    Within this context, independent frameworks such as the NGX Index have emerged to monitor NFT market architecture through classification models, asset weighting, and scarcity dynamics. The NGX Index does not function as a pricing oracle or investment signal. Instead, it operates as a structural reference—tracking how different NFT asset classes evolve relative to one another as the market matures.
                </p>

                <p className="article-text">
                    This approach reflects a broader transition in NFTs: from speculation-driven discovery toward infrastructure-level understanding.
                </p>

                <h3 className="article-heading mt-4 mb-2">NFTs as a Recognized Asset Class</h3>

                <p className="article-text">
                    By 2024–2025, NFTs had firmly entered institutional, corporate, and cultural conversations. Major brands, gaming studios, and digital platforms adopted NFTs not as speculative instruments, but as ownership layers embedded within larger systems.
                </p>

                <p className="article-text">
                    At this stage, the question is no longer whether NFTs will persist, but how they will be organized, measured, and understood over the long term. Asset-class frameworks, standardized terminology, and analytical indices are becoming essential components of this next phase.
                </p>

                <h3 className="article-heading mt-4 mb-2">Looking Ahead: 2026 and Beyond</h3>

                <p className="article-text">
                    As regulatory clarity improves and technical standards stabilize, NFTs are expected to transition further into infrastructure assets—integrated seamlessly into digital economies rather than existing as standalone products.
                </p>

                <p className="article-text">
                    The emergence of neutral market observatories, classification systems, and non-speculative indices will play a critical role in this evolution. They allow participants—creators, developers, institutions, and researchers—to understand the NFT ecosystem as a whole rather than through isolated data points.
                </p>

                <p className="article-text mb-3">
                    In this sense, NFTs are no longer defined by individual tokens, but by the architecture they collectively form.
                </p>

                {/* DISCLAIMER */}
                <div className="w-100 mt-2 border-top border-secondary" style={{ borderColor: '#333 !important', paddingTop: '10px' }}>
                    <p className="fst-italic mb-0 w-100" style={{ lineHeight: '1.4', fontSize: '11px', color: '#999999' }}>
                        This article is provided for informational and educational purposes only. It does not constitute financial advice, investment recommendations, or an offer to buy or sell any digital asset. References to market structures, indices, or frameworks—including the NGX Index—are descriptive in nature and intended solely to illustrate industry developments. Readers are encouraged to conduct independent research and consult qualified professionals before making any financial or strategic decisions. The publication of this material does not imply endorsement, solicitation, or prediction of market performance.
                    </p>
                </div>
                
                {/* DEVELOPERS EMBED SECTION */}
                <div className="mt-5 pt-4">
                    <div className="d-flex align-items-center mb-3">
                         <div style={{ width: '30px', height: '2px', background: '#FCD535', marginRight: '10px' }}></div>
                         <h4 className="fw-bold mb-0 text-white" style={{ fontSize: '14px', letterSpacing: '1px' }}>DEVELOPERS & MARKET DATA</h4>
                    </div>
                    
                    <div className="row g-2"> {/* Reduced gutter for tighter layout */}
                        
                        {/* 1. Full Bar (Always Full Width) */}
                        <div className="col-12">
                             <div className="embed-card">
                                <div className="preview-area" style={{ height: '80px' }}>
                                    <div className="widget-scale-wrapper" style={{ transform: 'scale(0.6)' }}>
                                        <div className="d-flex gap-2">
                                            <NGXWidget theme="dark" />
                                            <NGXCapWidget theme="dark" />
                                            <NGXVolumeWidget theme="dark" />
                                        </div>
                                    </div>
                                </div>
                                <div className="info-area d-flex justify-content-between align-items-center mt-2 px-2">
                                    <div>
                                        <h6 className="mb-0 fw-bold text-white" style={{ fontSize: '11px' }}>NGX Full Market Bar</h6>
                                        <div className="watermark" style={{ fontSize: '9px' }}>Powered by NNM Sovereign Name Assets</div>
                                    </div>
                                    <button className="btn btn-sm btn-outline-secondary copy-btn px-3">COPY CODE</button>
                                </div>
                             </div>
                        </div>

                        {/* 2. Individual Widgets (3 in a row on Mobile via col-4) */}
                        <div className="col-4 col-md-4">
                            <EmbedCard 
                                title="Sentiment" 
                                component={<NGXWidget theme="dark" />} 
                                width="320" height="100" embedId="ngx-sentiment"
                            />
                        </div>

                        <div className="col-4 col-md-4">
                            <EmbedCard 
                                title="Market Cap" 
                                component={<NGXCapWidget theme="dark" />} 
                                width="320" height="100" embedId="ngx-cap"
                            />
                        </div>

                        <div className="col-4 col-md-4">
                            <EmbedCard 
                                title="Volume" 
                                component={<NGXVolumeWidget theme="dark" />} 
                                width="320" height="100" embedId="ngx-volume"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>

      </div>

      <style jsx global>{`
        .header-wrapper {
            background: ${SURFACE_DARK};
            border-bottom: 1px solid ${BORDER_COLOR};
            padding: 4px 0;
            margin-top: 0;
        }

        .widgets-grid-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: nowrap;
            max-width: 1050px;
            margin: 0 auto;
            padding: 0 15px;
        }

        .content-container {
            max-width: 1050px;
            margin: 0 auto;
        }

        .widget-item { flex: 0 0 310px; }

        .main-title { font-size: 1.65rem; color: ${TEXT_PRIMARY}; letter-spacing: -0.5px; }
        .main-desc { font-size: 15px; color: ${TEXT_MUTED}; max-width: 650px; }
        .text-section { max-width: 1050px; margin: 0 auto; }
        
        .article-heading {
            font-size: 1.65rem; 
            color: ${TEXT_PRIMARY}; 
            letter-spacing: -0.5px;
            font-weight: 700;
            font-family: "Inter", "Segoe UI", sans-serif;
            line-height: 1.3;
        }

        .article-heading.mt-4 { font-size: 1.3rem; }

        .article-text {
            color: ${TEXT_MUTED};
            font-family: "Inter", "Segoe UI", sans-serif;
            font-size: 15px;
            line-height: 1.6; 
            margin-bottom: 0.8rem;
            text-align: justify;
        }
        
        .article-wrapper { margin-left: 0; padding-left: 0; }

        @media (max-width: 768px) {
            .header-wrapper { padding: 2px 0 !important; }
            .widgets-grid-container {
                display: flex !important;
                flex-wrap: nowrap !important;
                justify-content: space-between !important;
                gap: 2px !important;
                padding: 0 4px !important;
                max-width: 100% !important;
                overflow-x: hidden;
            }
            .widget-item {
                flex: 1 1 auto !important;
                min-width: 0 !important;
                max-width: 33% !important;
            }
            .main-title { font-size: 1.25rem; text-align: center; }
            .main-desc { font-size: 13px; text-align: center; margin: 0 auto; }
            
            .article-heading { font-size: 1.25rem; text-align: left; }
            .article-text { font-size: 14px; text-align: left; }
        }
      `}</style>
    </main>
  );
}
