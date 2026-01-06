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

      {/* Restored Padding for Mobile Container to prevent spill */}
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

                {/* DISCLAIMER - Darker Text Color (#999) */}
                <div className="w-100 mt-2 border-top border-secondary" style={{ borderColor: '#333 !important', paddingTop: '10px' }}>
                    <p className="fst-italic mb-0 w-100" style={{ lineHeight: '1.4', fontSize: '11px', color: '#999999' }}>
                        This article is provided for informational and educational purposes only. It does not constitute financial advice, investment recommendations, or an offer to buy or sell any digital asset. References to market structures, indices, or frameworks—including the NGX Index—are descriptive in nature and intended solely to illustrate industry developments. Readers are encouraged to conduct independent research and consult qualified professionals before making any financial or strategic decisions. The publication of this material does not imply endorsement, solicitation, or prediction of market performance.
                    </p>
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
        
        .article-wrapper {
            margin-left: 0;
            padding-left: 0;
        }

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
