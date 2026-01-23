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
const LIME_COLOR = '#C0D860'; // اللون الليموني
const FOX_PATH = "M29.77 8.35C29.08 7.37 26.69 3.69 26.69 3.69L22.25 11.23L16.03 2.19L9.67 11.23L5.35 3.69C5.35 3.69 2.97 7.37 2.27 8.35C2.19 8.46 2.13 8.6 2.13 8.76C2.07 10.33 1.83 17.15 1.83 17.15L9.58 24.32L15.93 30.2L16.03 30.29L16.12 30.2L22.47 24.32L30.21 17.15C30.21 17.15 29.98 10.33 29.91 8.76C29.91 8.6 29.86 8.46 29.77 8.35ZM11.16 19.34L7.56 12.87L11.53 14.86L13.88 16.82L11.16 19.34ZM16.03 23.33L12.44 19.34L15.06 16.92L16.03 23.33ZM16.03 23.33L17.03 16.92L19.61 19.34L16.03 23.33ZM20.89 19.34L18.17 16.82L20.52 14.86L24.49 12.87L20.89 19.34Z";

// --- بيانات التوقعات المدمجة (2026-2030) لضمان السرعة الفورية ---
const STATIC_FORECAST_DATA = [
  { time: 1767312000, value: 10994.64 }, { time: 1767571200, value: 11271.18 }, { time: 1767830400, value: 11106.95 }, 
  { time: 1768089600, value: 11056.55 }, { time: 1768348800, value: 11076.11 }, { time: 1768435200, value: 823.85 }, 
  { time: 1768694400, value: 810.47 }, { time: 1768953600, value: 821.01 }, { time: 1769212800, value: 820.45 }, 
  { time: 1769472000, value: 841.35 }, { time: 1769731200, value: 839.31 }, { time: 1769990400, value: 826.35 }, 
  { time: 1770249600, value: 851.01 }, { time: 1770508800, value: 864.55 }, { time: 1770768000, value: 865.58 }, 
  { time: 1771027200, value: 873.72 }, { time: 1771286400, value: 857.64 }, { time: 1771545600, value: 851.22 }, 
  { time: 1771804800, value: 841.49 }, { time: 1772064000, value: 850.00 }, { time: 1772323200, value: 860.70 }, 
  { time: 1772582400, value: 850.43 }, { time: 1772841600, value: 850.34 }, { time: 1773100800, value: 853.88 }, 
  { time: 1773360000, value: 871.03 }, { time: 1773619200, value: 883.44 }, { time: 1773878400, value: 895.24 }, 
  { time: 1774137600, value: 905.50 }, { time: 1774396800, value: 906.42 }, { time: 1774656000, value: 914.80 }, 
  { time: 1774915200, value: 913.43 }, { time: 1775174400, value: 937.75 }, { time: 1775433600, value: 937.46 }, 
  { time: 1775692800, value: 948.20 }, { time: 1775952000, value: 974.32 }, { time: 1776211200, value: 970.11 }, 
  { time: 1776470400, value: 998.44 }, { time: 1776729600, value: 1003.99 }, { time: 1776988800, value: 1004.90 }, 
  { time: 1777248000, value: 1028.82 }, { time: 1777507200, value: 1026.10 }, { time: 1777766400, value: 1033.03 }, 
  { time: 1778025600, value: 1044.63 }, { time: 1778284800, value: 1067.04 }, { time: 1778544000, value: 1067.80 }, 
  { time: 1778803200, value: 1084.66 }, { time: 1779062400, value: 1064.68 }, { time: 1779321600, value: 1086.79 }, 
  { time: 1779580800, value: 1107.72 }, { time: 1779840000, value: 1118.39 }, { time: 1780099200, value: 1151.21 }, 
  { time: 1780358400, value: 1161.22 }, { time: 1780617600, value: 1184.09 }, { time: 1780876800, value: 1177.94 }, 
  { time: 1781136000, value: 1212.76 }, { time: 1781395200, value: 1227.96 }, { time: 1781654400, value: 1265.76 }, 
  { time: 1781913600, value: 1257.11 }, { time: 1782172800, value: 1269.71 }, { time: 1782432000, value: 1265.04 }, 
  { time: 1782691200, value: 1259.63 }, { time: 1782950400, value: 1291.83 }, { time: 1783209600, value: 1329.46 }, 
  { time: 1783468800, value: 1369.35 }, { time: 1783728000, value: 1367.18 }, { time: 1783987200, value: 1394.40 }, 
  { time: 1784246400, value: 1424.35 }, { time: 1784505600, value: 1405.39 }, { time: 1784764800, value: 1423.26 }, 
  { time: 1785024000, value: 1414.59 }, { time: 1785283200, value: 1394.91 }, { time: 1785542400, value: 1384.99 }, 
  { time: 1785801600, value: 1405.97 }, { time: 1786060800, value: 1399.59 }, { time: 1786320000, value: 1412.99 }, 
  { time: 1786579200, value: 1409.32 }, { time: 1786838400, value: 1448.29 }, { time: 1787097600, value: 1455.81 }, 
  { time: 1787356800, value: 1465.22 }, { time: 1787616000, value: 1480.37 }, { time: 1787875200, value: 1452.45 }, 
  { time: 1788134400, value: 1483.34 }, { time: 1788393600, value: 1518.36 }, { time: 1788652800, value: 1541.15 }, 
  { time: 1788912000, value: 1538.50 }, { time: 1789171200, value: 1550.59 }, { time: 1789430400, value: 1576.76 }, 
  { time: 1789689600, value: 1581.98 }, { time: 1789948800, value: 1573.24 }, { time: 1790208000, value: 1563.29 }, 
  { time: 1790467200, value: 1543.29 }, { time: 1790726400, value: 1515.32 }, { time: 1790985600, value: 1494.51 }, 
  { time: 1791244800, value: 1476.15 }, { time: 1791504000, value: 1462.07 }, { time: 1791763200, value: 1491.19 }, 
  { time: 1792022400, value: 1498.68 }, { time: 1792281600, value: 1540.16 }, { time: 1792540800, value: 1574.96 }, 
  { time: 1792800000, value: 1565.50 }
];

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

// --- الرسم البياني المصغر الثابت ---
const StaticMiniChart = ({ isMobile }: { isMobile: boolean }) => (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'linear-gradient(180deg, rgba(30,30,30,0) 0%, rgba(192, 216, 96, 0.05) 100%)' }}>
        <svg viewBox="0 0 300 150" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path 
                d="M0,100 C40,90 60,120 100,110 C150,90 180,60 220,50 C260,40 280,20 300,10" 
                fill="none" 
                stroke={LIME_COLOR} 
                strokeWidth="2" 
                vectorEffect="non-scaling-stroke"
            />
             <path 
                d="M0,100 C40,90 60,120 100,110 C150,90 180,60 220,50 C260,40 280,20 300,10 V150 H0 Z" 
                fill="url(#limeGradient)" 
                stroke="none" 
            />
            <defs>
                <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={LIME_COLOR} stopOpacity="0.2"/>
                    <stop offset="100%" stopColor={LIME_COLOR} stopOpacity="0"/>
                </linearGradient>
            </defs>
        </svg>
        <div style={{ 
            position: 'absolute', 
            bottom: '8px', 
            left: '0', 
            width: '100%',
            textAlign: 'center',
            fontSize: isMobile ? '8px' : '10px', 
            fontWeight: '900', 
            fontStyle: 'italic', 
            color: 'rgba(255,255,255,0.3)',
            pointerEvents: 'none',
            letterSpacing: '0.5px',
            fontFamily: '"Inter", sans-serif'
        }}>
            NNM Protocol Register Blockchain
        </div>
    </div>
);

// --- كارت التضمين (Embed Card) ---
const EmbedCard = ({ title, component, embedId, label, isFullBar, isChart }: any) => {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth <= 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // ضبط الارتفاعات
  let previewHeight = '60px';
  if (isChart) previewHeight = isMobile ? '120px' : '160px'; 
  if (isFullBar) previewHeight = isMobile ? '90px' : '60px'; 

  return (
    <div className="embed-card h-100 d-flex flex-column justify-content-between">
      <div className="preview-area" style={{ height: previewHeight }}>
        <div className={`widget-scale-wrapper ${isFullBar ? 'full-bar-scale' : isChart ? 'chart-scale' : 'individual-scale'}`} style={{ pointerEvents: 'none' }}>
          {isChart ? <StaticMiniChart isMobile={isMobile} /> : component}
        </div>
      </div>
      
      <div className="info-area mt-1 text-center" style={{ zIndex: 10 }}>
        <h6 className="d-none d-md-block mb-1 unified-title" style={{ fontSize: '10px', marginBottom: '4px' }}>{title}</h6>
        {label && <div className="mobile-label fw-bold mb-1">{label}</div>}
        
        <button 
            onClick={handleCopy} 
            className={`btn btn-sm mb-1 copy-btn ${copied ? 'btn-success' : 'btn-outline-secondary'}`}
            style={{ 
                width: '30%', 
                minWidth: '60px',
                margin: '4px auto 0', 
                display: 'block',
                padding: '2px 0'
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
            display: flex; 
            flex-direction: column;
            align-items: center; 
        }
        .preview-area { display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; width: 100%; flex-grow: 1; }
        
        .widget-scale-wrapper { transform-origin: center; display: flex; justify-content: center; width: 100%; }
        
        /* Desktop Defaults */
        .full-bar-scale { transform: scale(0.5); width: auto; } 
        .individual-scale { transform: scale(0.75); } 
        .chart-scale { width: 100%; height: 100%; } 

        .copy-btn { font-size: 9px; border-radius: 4px; color: #ddd; border-color: #444; }
        .mobile-label { display: none; color: ${GOLD_COLOR}; font-size: 9px; letter-spacing: 0.5px; }

        @media (max-width: 768px) {
            .embed-card { padding: 6px 4px; border: 1px solid rgba(255,255,255,0.05); min-height: 100px; }
            
            .full-bar-scale { 
                transform: scale(0.63); 
                width: auto; 
                margin: 0 auto;
            }
            
            .individual-scale { transform: scale(0.6); width: 100%; }
            .chart-scale { width: 100%; height: 100%; }
            
            .mobile-label { display: block; font-size: 8px; margin-bottom: 4px !important; }
            .copy-btn { font-size: 8px; }
        }
      `}</style>
    </div>
  );
};

const ProtectedWidgetWrapper = ({ children }: { children: React.ReactNode }) => (
    <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {children}
        <div style={{ 
            marginTop: '2px', 
            fontSize: '8px', 
            fontWeight: '900', 
            fontStyle: 'italic', 
            color: 'rgba(255,255,255,0.3)', 
            fontFamily: '"Inter", sans-serif',
            whiteSpace: 'nowrap'
        }}>
            NNM Protocol Register Blockchain
        </div>
    </div>
);

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
                    <h1 className="mb-2 unified-title">NGX NFT Index — The Global Benchmark</h1>
                    <p className="mb-0 unified-text">
                        The premier benchmark tracking the global NFT market, aggregating sentiment, liquidity, and rare digital name assets across all platforms.
                    </p>
                </div>
            </div>
        </div>
      </div>

      <div className="container-fluid py-4 px-3 px-md-4" style={{ paddingBottom: '0' }}> 
        
        {/* LIVE CHART with HARDCODED DATA PASSED AS PROP */}
        <div className="content-container mb-4">
             {/* تنبيه هام جداً:
                لكي تعمل هذه البيانات (initialData)
                يجب عليك الدخول لملف components/NGXLiveChart.tsx
                وإضافة استقبال الـ prop المسمى 'initialData' واستخدامه كقيمة افتراضية.
             */}
             <NGXLiveChart initialData={STATIC_FORECAST_DATA} />
        </div>

        {/* --- ARTICLE SECTION --- */}
        <div className="content-container">
            <div className="article-wrapper">
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

                {/* --- MARKET INDICES CTA (Added Section) --- */}
                <div className="mt-5 mb-2">
                    <div className="p-3 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3" 
                         style={{ 
                             background: 'linear-gradient(90deg, rgba(255, 179, 0, 0.05) 0%, rgba(30, 30, 30, 0) 100%)', 
                             borderLeft: `3px solid ${GOLD_COLOR}`,
                             borderRadius: '0 6px 6px 0' 
                         }}>
                        <div>
                            <h5 className="fw-bold mb-1 text-white" style={{ fontSize: '1rem' }}>
                                <i className="bi bi-bar-chart-steps me-2" style={{ color: GOLD_COLOR }}></i>
                                Understanding Market Structure
                            </h5>
                            <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                                Learn more about the methodology, weighting, and classification behind these indices.
                            </p>
                        </div>
                        <Link 
                            href="/market-indices" 
                            className="btn btn-sm btn-outline-warning text-uppercase fw-bold px-4"
                            style={{ 
                                fontSize: '0.75rem', 
                                letterSpacing: '1px', 
                                whiteSpace: 'nowrap',
                                borderRadius: '20px'
                            }}
                        >
                            View Index Methodology <i className="bi bi-arrow-right ms-1"></i>
                        </Link>
                    </div>
                </div>

                {/* --- LATEST NEWS SECTION --- */}
                <div className="mt-4 pt-2 mb-4">
                     <div className="d-flex align-items-center mb-3 border-bottom border-secondary pb-2" style={{borderColor: 'rgba(255,255,255,0.1) !important'}}>
                         <div style={{ width: '6px', height: '6px', background: '#F6465D', borderRadius: '50%', marginRight: '10px' }}></div>
                         <h4 className="fw-bold mb-0 text-white text-uppercase" style={{ fontSize: '11.5px', letterSpacing: '1px' }}>Global Market Wire</h4>
                     </div>

                     {loadingNews ? (
                         <div className="text-muted text-center py-3" style={{ fontSize: '12px' }}>Loading Insights...</div>
                     ) : latestNews ? (
                         <div className="news-item-wrapper">
                            <div className="news-card d-flex flex-column flex-md-row gap-4 align-items-start">
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
                
                {/* --- DEVELOPERS TOOLKIT (FINAL) --- */}
                <div className="mt-5 pt-4">
                    <div className="d-flex align-items-center mb-3">
                         <div style={{ width: '30px', height: '2px', background: GOLD_COLOR, marginRight: '10px' }}></div>
                         <h4 className="fw-bold mb-0 text-white" style={{ fontSize: '14px', letterSpacing: '1px' }}>DEVELOPERS & MARKET DATA</h4>
                    </div>
                    
                    <div className="row g-2 justify-content-center">
                        {/* 1. الشريط الكامل: حاوية ثابتة مع إلغاء الهوامش الداخلية قسراً */}
                        <div className="col-12">
                             <EmbedCard 
                                title="NGX Full Market Bar"
                                isFullBar={true}
                                component={
                                    <ProtectedWidgetWrapper>
                                        <div className="d-flex justify-content-center align-items-center w-100" style={{ minWidth: '950px', gap: '0' }}>
                                            <div style={{ margin: '0 !important', padding: '0 !important', display: 'flex', justifyContent: 'center' }}><NGXWidget theme="dark" /></div>
                                            <div style={{ margin: '0 !important', padding: '0 !important', display: 'flex', justifyContent: 'center' }}><NGXCapWidget theme="dark" /></div>
                                            <div style={{ margin: '0 !important', padding: '0 !important', display: 'flex', justifyContent: 'center' }}><NGXVolumeWidget theme="dark" /></div>
                                        </div>
                                    </ProtectedWidgetWrapper>
                                }
                                embedId="ngx-full-bar"
                             />
                        </div>

                        {/* 2. الرسم البياني: عرض 50% للكمبيوتر و 80% للجوال */}
                        <div className="col-12 col-md-12"> 
                            <div className="d-flex justify-content-center">
                                 <div className="chart-wrapper-responsive"> 
                                     <EmbedCard 
                                        title="Live Chart Widget"
                                        isChart={true}
                                        component={<StaticMiniChart isMobile={false} />} 
                                        embedId="ngx-chart-widget"
                                     />
                                 </div>
                            </div>
                        </div>

                        {/* 3. الكبسولات الثلاث المنفصلة */}
                        <div className="col-4">
                            <EmbedCard 
                                title="Sentiment" 
                                label="Sentiment" 
                                component={
                                    <ProtectedWidgetWrapper>
                                        <NGXWidget theme="dark" />
                                    </ProtectedWidgetWrapper>
                                } 
                                embedId="ngx-sentiment" 
                            />
                        </div>
                        <div className="col-4">
                            <EmbedCard 
                                title="Market Cap" 
                                label="Cap" 
                                component={
                                    <ProtectedWidgetWrapper>
                                        <NGXCapWidget theme="dark" />
                                    </ProtectedWidgetWrapper>
                                } 
                                embedId="ngx-cap" 
                            />
                        </div>
                        <div className="col-4">
                            <EmbedCard 
                                title="Volume" 
                                label="Volume" 
                                component={
                                    <ProtectedWidgetWrapper>
                                        <NGXVolumeWidget theme="dark" />
                                    </ProtectedWidgetWrapper>
                                } 
                                embedId="ngx-volume" 
                            />
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
        /* --- UNIFIED TYPOGRAPHY --- */
        .unified-title { font-size: 1.65rem; color: ${TEXT_PRIMARY}; letter-spacing: -0.5px; font-weight: 700; font-family: "Inter", "Segoe UI", sans-serif; line-height: 1.3; }
        .unified-text { font-size: 15px; color: ${TEXT_MUTED}; font-family: "Inter", "Segoe UI", sans-serif; font-weight: 400; line-height: 1.6; }

        /* --- GENERAL --- */
        .header-wrapper { background: ${SURFACE_DARK}; border-bottom: 1px solid ${BORDER_COLOR}; padding: 4px 0; margin-top: 0; }
        .widgets-grid-container { display: flex; justify-content: space-between; align-items: center; flex-wrap: nowrap; max-width: 1050px; margin: 0 auto; padding: 0 15px; }
        .content-container { max-width: 1050px; margin: 0 auto; }
        .widget-item { flex: 0 0 310px; }
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

        /* --- CHART RESPONSIVE SIZE --- */
        /* Desktop: 50% width */
        .chart-wrapper-responsive { width: 50%; max-width: 500px; }

        /* --- MOBILE ADJUSTMENTS --- */
        @media (max-width: 768px) {
            .header-wrapper { padding: 2px 0 !important; }
            .widgets-grid-container { display: flex !important; flex-wrap: nowrap !important; justify-content: space-between !important; gap: 2px !important; padding: 0 4px !important; max-width: 100% !important; overflow-x: hidden; }
            .widget-item { flex: 1 1 auto !important; min-width: 0 !important; max-width: 33% !important; }
            .unified-title { font-size: 1.25rem; text-align: left !important; }
            .unified-text { font-size: 13px; text-align: left !important; }
            .text-section { text-align: left !important; }
            .news-card { flex-direction: column-reverse !important; }
            .news-thumbnail { width: 100%; height: 160px; margin-bottom: 10px; }
            
            /* Chart Mobile: 80% width */
            .chart-wrapper-responsive { width: 80%; }
        }

        .brand-text-gold { background: linear-gradient(to bottom, #FCD535 0%, #B3882A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 15px rgba(252, 213, 53, 0.2); } 
        .brand-icon-gold { color: #FCD535; text-shadow: 0 0 10px rgba(252, 213, 53, 0.4); }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } 
        .marquee-track { animation: scroll 75s linear infinite; width: max-content; }
      `}</style>
    </main>
  );
}
