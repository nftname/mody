'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import NGXWidget from '@/components/NGXWidget';
import NGXCapWidget from '@/components/NGXCapWidget';
import NGXVolumeWidget from '@/components/NGXVolumeWidget';
import NGXLiveChart from '@/components/NGXLiveChart';
import MarketTicker from '@/components/MarketTicker';

// --- إعدادات Supabase ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- الألوان والستايل ---
const BACKGROUND_DARK = '#1E1E1E';
const SURFACE_DARK = '#242424';
const BORDER_COLOR = '#2E2E2E';
const TEXT_PRIMARY = '#E0E0E0';
const TEXT_MUTED = '#B0B0B0';
const GOLD_COLOR = '#FFB300';
const GOLD_BASE = '#F0C420'; 
const FOX_PATH = "M29.77 8.35C29.08 7.37 26.69 3.69 26.69 3.69L22.25 11.23L16.03 2.19L9.67 11.23L5.35 3.69C5.35 3.69 2.97 7.37 2.27 8.35C2.19 8.46 2.13 8.6 2.13 8.76C2.07 10.33 1.83 17.15 1.83 17.15L9.58 24.32L15.93 30.2L16.03 30.29L16.12 30.2L22.47 24.32L30.21 17.15C30.21 17.15 29.98 10.33 29.91 8.76C29.91 8.6 29.86 8.46 29.77 8.35ZM11.16 19.34L7.56 12.87L11.53 14.86L13.88 16.82L11.16 19.34ZM16.03 23.33L12.44 19.34L15.06 16.92L16.03 23.33ZM16.03 23.33L17.03 16.92L19.61 19.34L16.03 23.33ZM20.89 19.34L18.17 16.82L20.52 14.86L24.49 12.87L20.89 19.34Z";

// --- أيقونة الذهب ---
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

// --- الرسم البياني المصغر الثابت (تم التعديل: خط أنحف، إزالة LIVE) ---
const StaticMiniChart = () => (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'linear-gradient(180deg, rgba(30,30,30,0) 0%, rgba(14,203,129,0.05) 100%)' }}>
        <svg viewBox="0 0 300 150" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            {/* خط بياني أنحف (strokeWidth="1.5") */}
            <path 
                d="M0,100 C40,90 60,120 100,110 C150,90 180,60 220,50 C260,40 280,20 300,10" 
                fill="none" 
                stroke="#0ECB81" 
                strokeWidth="1.5" 
                vectorEffect="non-scaling-stroke"
            />
             <path 
                d="M0,100 C40,90 60,120 100,110 C150,90 180,60 220,50 C260,40 280,20 300,10 V150 H0 Z" 
                fill="url(#greenGradient)" 
                stroke="none" 
            />
            <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ECB81" stopOpacity="0.15"/>
                    <stop offset="100%" stopColor="#0ECB81" stopOpacity="0"/>
                </linearGradient>
            </defs>
        </svg>
        {/* العلامة المائية فقط */}
        <div style={{ position: 'absolute', bottom: '8px', left: '10px', fontSize: '14px', fontWeight: '900', fontStyle: 'italic', color: 'rgba(255,255,255,0.5)' }}>
            NNM
        </div>
    </div>
);

// --- كارت التضمين (Embed Card) ---
const EmbedCard = ({ title, component, embedId, label, isFullBar, isChart }: any) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let w = "320";
    let h = "100";
    if (isFullBar) { w = "100%"; h = "90"; }
    if (isChart) { w = "100%"; h = "400"; } 

    const code = `<iframe src="https://nftnnm.com/embed/${embedId}?theme=auto" width="${w}" height="${h}" frameborder="0" style="border-radius:12px; overflow:hidden;"></iframe>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="embed-card h-100 d-flex flex-column justify-content-between">
      <div className="preview-area" style={{ height: isChart ? '100px' : '60px' }}>
        <div className={`widget-scale-wrapper ${isFullBar ? 'full-bar-scale' : isChart ? 'chart-scale' : 'individual-scale'}`}>
          {component}
        </div>
      </div>
      
      <div className="info-area mt-1 text-center">
        <h6 className="d-none d-md-block mb-1 unified-title" style={{ fontSize: '10px', marginBottom: '4px' }}>{title}</h6>
        {label && <div className="mobile-label fw-bold mb-1">{label}</div>}
        
        <button 
            onClick={handleCopy} 
            className={`btn btn-sm mb-1 copy-btn ${copied ? 'btn-success' : 'btn-outline-secondary'}`}
            style={{ 
                width: '90%', 
                margin: '0 auto', 
                display: 'block'
            }}
        >
            {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>

      <style jsx>{`
        .embed-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid ${BORDER_COLOR};
            border-radius: 6px;
            padding: 5px;
            overflow: hidden;
            position: relative;
        }
        .preview-area { display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; width: 100%; }
        
        /* Scaling Logic */
        .widget-scale-wrapper { transform-origin: center; display: flex; justify-content: center; }
        .full-bar-scale { transform: scale(0.65); width: 150%; } 
        .individual-scale { transform: scale(0.6); }
        .chart-scale { width: 100%; height: 100%; } 

        .copy-btn { font-size: 9px; padding: 2px 0; border-radius: 4px; color: #ddd; border-color: #444; }
        .mobile-label { display: none; color: ${GOLD_COLOR}; font-size: 9px; letter-spacing: 0.5px; }

        @media (max-width: 768px) {
            .embed-card { padding: 4px; border: 1px solid rgba(255,255,255,0.05); }
            /* ضبط المقاسات للجوال */
            .full-bar-scale { transform: scale(0.38); width: 260%; margin-left: -80%; }
            .individual-scale { transform: scale(0.45); width: 220px; }
            
            .mobile-label { display: block; font-size: 8px; margin-bottom: 2px !important; }
            .copy-btn { font-size: 8px; }
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

  const [latestNews, setLatestNews] = useState<any>(null);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news_posts')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) setLatestNews(data[0]);
      } catch (err) {
        console.error('Error fetching latest news:', err);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchLatestNews();
  }, []);

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "JUST NOW";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} MINS AGO`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} HOURS AGO`;
    return `${Math.floor(hours / 24)} DAYS AGO`;
  };

  return (
    <main className="ngx-page" style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', color: TEXT_PRIMARY }}>
      <MarketTicker />

      {/* HEADER */}
      <div className="header-wrapper shadow-sm">
        <div className="container-fluid p-0"> 
            <div className="widgets-grid-container">
                <div className="widget-item"> <NGXWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXCapWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXVolumeWidget theme="dark" /> </div>
            </div>
            
            <div className="row px-2 mt-3 text-section align-items-center">
                <div className="col-lg-12">
                    {/* المصدر الرئيسي للستايل (Title Style Source) */}
                    <h1 className="mb-2 unified-title">NGX NFT Index — The Global Benchmark</h1>
                    {/* المصدر الرئيسي للستايل (Text Style Source) */}
                    <p className="mb-0 unified-text">
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

        {/* --- ARTICLE SECTION --- */}
        <div className="content-container">
            <div className="article-wrapper">
                {/* تم تطبيق unified-title و unified-text على جميع العناصر */}
                <h2 className="unified-title mb-3">NFTs as a Market Infrastructure: From Digital Collectibles to Asset Class Architecture</h2>
                
                <p className="unified-text mb-3">Since their emergence in the late 2010s, Non-Fungible Tokens (NFTs) have undergone a fundamental transformation. What began as a niche experiment in digital ownership has evolved into a multi-layered market infrastructure spanning art, gaming, identity, finance, and cultural capital.</p>
                <p className="unified-text mb-3">In their earliest phase, NFTs were primarily perceived as speculative digital collectibles—artifacts whose value was driven by novelty, scarcity, and community-driven hype. However, as the market matured, this narrow definition proved insufficient to describe the expanding utility and structural complexity of NFT-based assets.</p>
                <p className="unified-text mb-3">By the early 2020s, NFTs began to establish themselves not merely as digital items, but as programmable ownership primitives—capable of representing access rights, intellectual property, virtual land, in-game economies, and decentralized identities. This shift marked the beginning of NFTs as a legitimate asset class rather than a transient trend.</p>

                <h3 className="unified-title mt-4 mb-2" style={{ fontSize: '1.3rem' }}>The Evolution of NFT Market Structure</h3>
                <p className="unified-text mb-3">As NFT ecosystems expanded, a clear hierarchy of asset types began to emerge. Art NFTs continued to function as cultural and collectible instruments. Utility NFTs enabled access mechanisms across platforms and communities. Gaming NFTs introduced interactive value, while domain-based NFTs bridged identity and digital real estate.</p>
                <p className="unified-text mb-3">This diversification created a structural challenge: traditional valuation models—largely price-driven and speculative—were no longer sufficient to capture the true composition of the NFT market. Volume alone could not explain influence. Floor price could not define importance. A more systemic lens became necessary.</p>

                <h3 className="unified-title mt-4 mb-2" style={{ fontSize: '1.3rem' }}>Why Market Indexing Matters in NFTs</h3>
                <p className="unified-text mb-3">In traditional financial markets, indices serve as neutral observatories—tools that reflect market structure rather than predict outcomes. As NFTs mature, similar indexing frameworks are beginning to surface, not to forecast prices, but to contextualize market evolution.</p>
                <p className="unified-text mb-3">Indexing in NFT markets provides a way to observe asset-class balance, category dominance, and structural shifts over time. Rather than focusing on individual projects, indices analyze the ecosystem itself.</p>
                <p className="unified-text mb-3">Within this context, independent frameworks such as the NGX Index have emerged to monitor NFT market architecture through classification models, asset weighting, and scarcity dynamics. The NGX Index does not function as a pricing oracle or investment signal. Instead, it operates as a structural reference—tracking how different NFT asset classes evolve relative to one another as the market matures.</p>
                <p className="unified-text mb-3">This approach reflects a broader transition in NFTs: from speculation-driven discovery toward infrastructure-level understanding.</p>

                <h3 className="unified-title mt-4 mb-2" style={{ fontSize: '1.3rem' }}>NFTs as a Recognized Asset Class</h3>
                <p className="unified-text mb-3">By 2024–2025, NFTs had firmly entered institutional, corporate, and cultural conversations. Major brands, gaming studios, and digital platforms adopted NFTs not as speculative instruments, but as ownership layers embedded within larger systems.</p>
                <p className="unified-text mb-3">At this stage, the question is no longer whether NFTs will persist, but how they will be organized, measured, and understood over the long term. Asset-class frameworks, standardized terminology, and analytical indices are becoming essential components of this next phase.</p>

                <h3 className="unified-title mt-4 mb-2" style={{ fontSize: '1.3rem' }}>Looking Ahead: 2026 and Beyond</h3>
                <p className="unified-text mb-3">As regulatory clarity improves and technical standards stabilize, NFTs are expected to transition further into infrastructure assets—integrated seamlessly into digital economies rather than existing as standalone products.</p>
                <p className="unified-text mb-3">The emergence of neutral market observatories, classification systems, and non-speculative indices will play a critical role in this evolution. They allow participants—creators, developers, institutions, and researchers—to understand the NFT ecosystem as a whole rather than through isolated data points.</p>
                <p className="unified-text mb-3">In this sense, NFTs are no longer defined by individual tokens, but by the architecture they collectively form.</p>

                {/* --- LATEST NEWS SECTION --- */}
                <div className="mt-5 pt-3 mb-4">
                     <div className="d-flex align-items-center mb-3 border-bottom border-secondary pb-2" style={{borderColor: 'rgba(255,255,255,0.1) !important'}}>
                         <div style={{ width: '6px', height: '6px', background: '#F6465D', borderRadius: '50%', marginRight: '10px' }}></div>
                         <h4 className="fw-bold mb-0 text-white text-uppercase" style={{ fontSize: '14px', letterSpacing: '1px' }}>Global Market Wire</h4>
                     </div>

                     {loadingNews ? (
                         <div className="text-muted text-center py-3" style={{ fontSize: '12px' }}>Loading Insights...</div>
                     ) : latestNews ? (
                         <div className="news-item-wrapper">
                            <div className="news-card d-flex flex-column flex-md-row gap-4 align-items-start">
                                {/* TEXT */}
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <span className="badge-category">{latestNews.category || 'MARKET'}</span>
                                        <span className="text-date">{timeAgo(latestNews.created_at)}</span>
                                    </div>
                                    
                                    <h2 className="unified-title" style={{ fontSize: '1.3rem', cursor: 'pointer' }}>
                                        <Link href={`/blog/${latestNews.id}`} className="text-decoration-none text-white hover-gold">
                                            {latestNews.title}
                                        </Link>
                                    </h2>
                                    
                                    <p className="unified-text news-summary">{latestNews.summary}</p>
                                    
                                    <div className="mt-2">
                                        <Link href={`/blog/${latestNews.id}`} className="read-more-link">
                                            READ ANALYSIS <i className="bi bi-arrow-right-short"></i>
                                        </Link>
                                    </div>
                                </div>
                                {/* IMAGE */}
                                {latestNews.image_url && (
                                    <div className="news-thumbnail flex-shrink-0">
                                        <Link href={`/blog/${latestNews.id}`}>
                                            <img src={latestNews.image_url} alt="News" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                         </div>
                     ) : (
                         <div className="text-muted" style={{ fontSize: '13px' }}>No updates currently available.</div>
                     )}
                </div>

                {/* --- DISCLAIMER --- */}
                <div className="w-100 mt-2 border-top border-secondary" style={{ borderColor: '#333 !important', paddingTop: '8px' }}>
                    <p className="fst-italic mb-0 w-100" style={{ lineHeight: '1.2', fontSize: '9px', color: '#777', opacity: 0.9 }}>
                        This article is provided for informational and educational purposes only. It does not constitute financial advice, investment recommendations, or an offer to buy or sell any digital asset. References to market structures, indices, or frameworks—including the NGX Index—are descriptive in nature and intended solely to illustrate industry developments. Readers are encouraged to conduct independent research and consult qualified professionals before making any financial or strategic decisions. The publication of this material does not imply endorsement, solicitation, or prediction of market performance.
                    </p>
                </div>
                
                {/* --- DEVELOPERS TOOLKIT (Reordered Layout) --- */}
                <div className="mt-5 pt-4">
                    <div className="d-flex align-items-center mb-3">
                         <div style={{ width: '30px', height: '2px', background: GOLD_COLOR, marginRight: '10px' }}></div>
                         <h4 className="fw-bold mb-0 text-white" style={{ fontSize: '14px', letterSpacing: '1px' }}>DEVELOPERS & MARKET DATA</h4>
                    </div>
                    
                    <div className="row g-2">
                        {/* 1. الشريط الكامل (عرض كامل) */}
                        <div className="col-12">
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
                                embedId="ngx-full-bar"
                             />
                        </div>

                        {/* 2. الرسم البياني المصغر (عرض كامل - تحته مباشرة) */}
                        <div className="col-12">
                             <EmbedCard 
                                title="Live Chart Widget"
                                isChart={true}
                                component={<StaticMiniChart />} 
                                embedId="ngx-chart-widget"
                             />
                        </div>

                        {/* 3. الكبسولات الثلاث (في الأسفل) */}
                        <div className="col-4">
                            <EmbedCard title="Sentiment" label="Sentiment" component={<NGXWidget theme="dark" />} embedId="ngx-sentiment" />
                        </div>
                        <div className="col-4">
                            <EmbedCard title="Market Cap" label="Cap" component={<NGXCapWidget theme="dark" />} embedId="ngx-cap" />
                        </div>
                        <div className="col-4">
                            <EmbedCard title="Volume" label="Volume" component={<NGXVolumeWidget theme="dark" />} embedId="ngx-volume" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>

      <div style={{ width: '100%', height: '2.5rem', background: 'transparent' }}></div>

      {/* FOOTER STRIP */}
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

      <div style={{ width: '100%', height: '80px', background: 'transparent' }}></div>

      <style jsx global>{`
        /* --- UNIFIED TYPOGRAPHY (السر في توحيد الخطوط) --- */
        .unified-title {
            font-size: 1.65rem;
            color: ${TEXT_PRIMARY};
            letter-spacing: -0.5px;
            font-weight: 700;
            font-family: "Inter", "Segoe UI", sans-serif;
            line-height: 1.3;
        }
        
        .unified-text {
            font-size: 15px;
            color: ${TEXT_MUTED};
            font-family: "Inter", "Segoe UI", sans-serif;
            font-weight: 400;
            line-height: 1.6;
        }

        /* --- GENERAL --- */
        .header-wrapper { background: ${SURFACE_DARK}; border-bottom: 1px solid ${BORDER_COLOR}; padding: 4px 0; margin-top: 0; }
        .widgets-grid-container { display: flex; justify-content: space-between; align-items: center; flex-wrap: nowrap; max-width: 1050px; margin: 0 auto; padding: 0 15px; }
        .content-container { max-width: 1050px; margin: 0 auto; }
        .widget-item { flex: 0 0 310px; }
        
        /* --- ARTICLE --- */
        .article-wrapper { margin-left: 0; padding-left: 0; }

        /* --- NEWS STYLES --- */
        .badge-category { font-size: 9px; font-weight: 700; color: ${GOLD_BASE}; text-transform: uppercase; letter-spacing: 1px; border: 1px solid ${GOLD_BASE}44; padding: 2px 6px; border-radius: 4px; }
        .text-date { font-size: 9px; color: #666; font-weight: 600; text-transform: uppercase; }
        .hover-gold:hover { color: ${GOLD_BASE} !important; }
        .news-summary { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .read-more-link { font-size: 10px; color: ${GOLD_BASE}; text-decoration: none; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .read-more-link:hover { text-decoration: underline; filter: brightness(1.2); }
        .news-thumbnail { width: 140px; height: 90px; border-radius: 4px; overflow: hidden; border: 1px solid #333; cursor: pointer; }
        .news-thumbnail img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .news-card:hover .news-thumbnail img { transform: scale(1.05); }

        /* --- MOBILE ADJUSTMENTS --- */
        @media (max-width: 768px) {
            .header-wrapper { padding: 2px 0 !important; }
            .widgets-grid-container { display: flex !important; flex-wrap: nowrap !important; justify-content: space-between !important; gap: 2px !important; padding: 0 4px !important; max-width: 100% !important; overflow-x: hidden; }
            .widget-item { flex: 1 1 auto !important; min-width: 0 !important; max-width: 33% !important; }
            
            /* FORCED LEFT ALIGNMENT ON MOBILE */
            .unified-title { font-size: 1.25rem; text-align: left !important; }
            .unified-text { font-size: 13px; text-align: left !important; }
            .text-section { text-align: left !important; }
            
            /* News Mobile */
            .news-card { flex-direction: column-reverse !important; }
            .news-thumbnail { width: 100%; height: 160px; margin-bottom: 10px; }
        }

        .brand-text-gold { background: linear-gradient(to bottom, #FCD535 0%, #B3882A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 15px rgba(252, 213, 53, 0.2); } 
        .brand-icon-gold { color: #FCD535; text-shadow: 0 0 10px rgba(252, 213, 53, 0.4); }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } 
        .marquee-track { animation: scroll 75s linear infinite; width: max-content; }
      `}</style>
    </main>
  );
}
