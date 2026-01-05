'use client';
import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import NGXWidget from '@/components/NGXWidget';
import NGXCapWidget from '@/components/NGXCapWidget';
import MarketTicker from '@/components/MarketTicker';
import Link from 'next/link';

const BACKGROUND_DARK = '#1E1E1E';
const SURFACE_DARK = '#242424';
const BORDER_COLOR = '#2E2E2E';
const TEXT_PRIMARY = '#E0E0E0';
const TEXT_MUTED = '#B0B0B0';
const GOLD_SOLID = '#F0C420';
const GOLD_LIGHT = '#FFD700';
const GOLD_DARK = '#B8860B';
const GOLD_GRADIENT = 'linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #B8860B 100%)';

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

const historicalData = [
  { date: '2017', value: 20 },
  { date: '2018', value: 45 },
  { date: '2019', value: 60 },
  { date: '2020', value: 150 },
  { date: '2021', value: 980 },
  { date: '2022', value: 350 },
  { date: '2023', value: 320 },
  { date: '2024', value: 550 },
  { date: 'May 25', value: 720 },
  { date: 'Sep 25', value: 890 },
  { date: 'Dec 25', value: 1100 },
];

const forecastData = [
  { year: 'Q1 25', value: 720 }, { year: 'Q3 25', value: 890 },
  { year: 'Q1 26', value: 1150 }, { year: 'Q3 26', value: 1400 },
];

const mainArticle = {
    title: "Why 'Sovereign Digital Name Assets' Are Becoming The New NFT Gold Standard",
    content: "The era of renting digital presence is over. We are entering the 'Ownership Phase' for all NFT markets. Global institutions are recognizing tokenized names (Name Assets) as liquid, valuable digital assets. The NGX index now tracks market-wide trends, reflecting the future of rare NFT ownership. 2026 is projected as the pivotal year for mainstream adoption and recognition of premium digital name assets.",
    author: "Chief Market Analyst — Market Briefing",
    date: "" 
};

const marketIntelligence = [
  {
    id: 1,
    category: "STRATEGIC ANALYSIS",
    date: "Dec 07, 2025",
    title: "Digital Name Standards: Bridging Ownership & Value",
    content: "As high-value digital assets move on-chain, clarity and transparency of ownership become essential. Randomized identifiers no longer suffice for premium assets. This drives demand for high-quality Name Assets to serve as a readable, valuable ownership layer. 'Name NFTs' are positioned as a central interface in the evolving digital financial ecosystem.",
    sources: "Sources: Industry Reports, Market Analysis",
  },
  {
    id: 2,
    category: "SECTOR OUTLOOK",
    date: "Dec 06, 2025",
    title: "Gaming Economies: The Rise of Tradeable Names",
    content: "Leading game developers are embracing Web3 models. Gamer identities are shifting from rented entries to fully tradeable, liquid Name Assets. Market trends indicate significant growth in Name Asset contracts, reinforcing that digital names are emerging as one of the most liquid and strategic asset classes within the metaverse.",
    sources: "Sources: Global Market Analysis, Sector Research",
  },
  {
    id: 3,
    category: "TECHNICAL DEEP DIVE",
    date: "Dec 05, 2025",
    title: "Liquidity Insights: Premium Name Assets vs Social Identities",
    content: "The digital name market is dividing into two layers: social recognition and commercial tradeable assets. While social reputation develops gradually, premium Name Assets operate like scarce, tradable digital real estate. These high-demand assets represent key opportunities for strategic acquisition within the digital name ecosystem.",
    sources: "Sources: Market Intelligence, Global Analysis",
  }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
            <div className="p-2 shadow-sm" style={{ fontSize: '11px', background: SURFACE_DARK, border: `1px solid ${BORDER_COLOR}`, color: TEXT_PRIMARY }}>
                <p className="fw-bold m-0" style={{ color: TEXT_PRIMARY }}>{label}</p>
                <p className="fw-bold m-0" style={{ color: GOLD_SOLID }}>NGX: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const SectionHeader = ({ title }: { title: string }) => (
    <div className="d-flex align-items-center mb-3 pb-2" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
        <div style={{ width: '4px', height: '16px', background: GOLD_SOLID, marginRight: '10px' }}></div>
        <h3 className="fw-bold m-0 text-uppercase" style={{ fontSize: '14px', letterSpacing: '1px', color: TEXT_PRIMARY }}>{title}</h3>
    </div>
);

const LiveMomentumChart = () => {
    const [data, setData] = useState([
        { val: 40 }, { val: 60 }, { val: 45 }, { val: 80 }, { val: 70 }, { val: 90 }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => prev.map(item => ({
                val: Math.max(20, Math.min(100, item.val + (Math.random() * 20 - 10)))
            })));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ height: '80px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <Bar dataKey="val" radius={[2, 2, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={GOLD_SOLID} fillOpacity={0.6 + (index * 0.05)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default function NGXPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="p-5 text-center">Loading Analytics...</div>;

    return (
        <main className="ngx-page" style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', color: TEXT_PRIMARY }}>
      
      <MarketTicker />

      {/* Header Section */}
      <div className="py-4 px-4 shadow-sm" style={{ background: SURFACE_DARK, borderBottom: `1px solid ${BORDER_COLOR}` }}>
        <div className="container-fluid">
            
            {/* Widgets Row - Unified Size (310px) */}
            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                {/* 1. NGX Sentiment Widget - Expanded Container */}
                <div style={{ width: '310px' }}>
                     <NGXWidget theme="dark" />
                </div>

                {/* 2. NGX Market Cap Widget - Expanded Container */}
                <div style={{ width: '310px' }}>
                     <NGXCapWidget theme="dark" />
                </div>
                
                {/* 3. Placeholder for NGX Assets (Future) - Ready for same size */}
                {/* <div style={{ width: '310px' }}> <NGXAssetsWidget theme="dark" /> </div> */}
            </div>

            {/* Title Row */}
            <div className="row align-items-center">
                <div className="col-lg-12">
                    <h1 className="fw-bold mb-2" style={{ fontSize: '1.65rem', letterSpacing: '-0.5px', color: TEXT_PRIMARY }}>
                            NGX NFT Index — The Global Benchmark <span className="text-gold-500"></span>
                    </h1>
                    <p className="mb-0" style={{ fontSize: '15px', maxWidth: '650px', color: TEXT_MUTED }}>
                        The premier benchmark tracking the global NFT market, aggregating sentiment, liquidity, and rare digital name assets across all platforms.
                    </p>
                </div>
            </div>
        </div>
      </div>

      <div className="container-fluid py-4 px-4">
        
        <div className="row g-4">
            
            <div className="col-lg-8">
                
                <div className="bg-card-white p-4 mb-4 rounded-2 border shadow-sm" style={{ borderColor: BORDER_COLOR }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <SectionHeader title="Market Performance" />
                        <span className="badge" style={{ background: GOLD_GRADIENT, color: '#1a1200', border: 'none' }}>2017 - Present</span>
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historicalData}>
                                <defs>
                                    <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={GOLD_SOLID} stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor={GOLD_SOLID} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={BORDER_COLOR} />
                                <XAxis dataKey="date" tick={{fontSize: 11, fill: TEXT_MUTED}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 11, fill: TEXT_MUTED}} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke={GOLD_SOLID} strokeWidth={2} fillOpacity={1} fill="url(#colorHist)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-4 mb-4 rounded-2 position-relative overflow-hidden shadow-sm" 
                     style={{ background: 'linear-gradient(135deg, #262626 0%, #1E1E1E 100%)', color: TEXT_PRIMARY, border: `1px solid ${BORDER_COLOR}` }}>
                    <div className="position-relative z-1">
                        <h2 className="fw-bold text-gold-500 mb-3 h4">{mainArticle.title}</h2>
                        <p className="lh-lg mb-3" style={{ fontSize: '15px', color: TEXT_PRIMARY, maxWidth: '95%' }}>
                            {mainArticle.content}
                        </p>
                        <div className="d-flex align-items-center gap-3 pt-3" style={{ borderTop: `1px solid ${BORDER_COLOR}` }}>
                             <div className="d-flex align-items-center gap-2">
                                <div className="bg-gold-500 rounded-circle" style={{ width: '8px', height: '8px', background: GOLD_SOLID }}></div>
                                <span className="small fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px', color: TEXT_MUTED }}>
                                    Chief Market Analyst — Market Briefing
                                </span>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card-white p-4 mb-2 rounded-2 border shadow-sm" style={{ borderColor: BORDER_COLOR, borderTop: `3px solid ${GOLD_SOLID}` }}>
                     <div className="d-flex justify-content-between align-items-center mb-3">
                        <SectionHeader title="Growth Forecast (2025 - 2026)" />
                        <span className="badge" style={{ background: 'transparent', color: TEXT_PRIMARY, border: `1px solid ${BORDER_COLOR}` }}>AI Projection</span>
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecastData}>
                                <defs>
                                    <linearGradient id="colorFore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={GOLD_SOLID} stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor={GOLD_SOLID} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={BORDER_COLOR} />
                                <XAxis dataKey="year" tick={{fontSize: 11, fill: TEXT_MUTED}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 11, fill: TEXT_MUTED}} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke={GOLD_SOLID} strokeWidth={2} fillOpacity={1} fill="url(#colorFore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                     <div className="fst-italic small mt-2" style={{ color: TEXT_MUTED }}>
                         * NGX provides information only and does not guarantee financial returns.
                     </div>

            </div>

            <div className="col-lg-4">
                
                <div className="bg-card-white p-4 mb-4 rounded-2 border shadow-sm" style={{ borderColor: BORDER_COLOR }}>
                    <div className="d-flex justify-content-between align-items-end mb-3">
                        <div>
                            <SectionHeader title="Buying Pressure" />
                            <div className="small" style={{ color: TEXT_MUTED }}>Buy/Sell Volume Ratio</div>
                        </div>
                        <div className="fw-bold blink-text" style={{ color: GOLD_SOLID }}>● Live</div>
                    </div>
                    <LiveMomentumChart />
                    <div className="mt-3 pt-3 small" style={{ borderTop: `1px solid ${BORDER_COLOR}`, color: TEXT_MUTED }}>
                        Indicates the strength of incoming buy orders vs sell orders.
                    </div>
                </div>

                <div className="bg-card-white p-4 mb-4 rounded-2 border shadow-sm" style={{ borderColor: BORDER_COLOR }}>
                    <SectionHeader title="Index Weights" />
                    <p className="mb-3" style={{ fontSize: '15px', lineHeight: '1.5', color: TEXT_MUTED }}>
                        Weighted allocation based on market cap and utility:
                    </p>
                    <ul className="list-unstyled m-0">
                        <li className="d-flex align-items-center justify-content-between py-2 px-2 rounded mb-1" style={{ backgroundColor: '#2c2c2c' }}>
                            <span className="fw-bold" style={{ fontSize: '16px', color: TEXT_PRIMARY }}>1. Sovereign Names (ENS/NNM)</span>
                            <span className="badge" style={{ background: GOLD_GRADIENT, color: '#1a1200', fontSize: '14px' }}>30%</span>
                        </li>
                        <li className="d-flex align-items-center justify-content-between py-2" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                            <span className="fw-bold" style={{ fontSize: '16px', color: TEXT_PRIMARY }}>2. GameFi & Metaverse (IMX)</span>
                            <span className="badge" style={{ background: 'transparent', color: TEXT_PRIMARY, border: `1px solid ${BORDER_COLOR}`, fontSize: '14px' }}>25%</span>
                        </li>
                        <li className="d-flex align-items-center justify-content-between py-2" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                            <span className="fw-bold" style={{ fontSize: '16px', color: TEXT_PRIMARY }}>3. Digital Art & Culture (APE)</span>
                            <span className="badge" style={{ background: 'transparent', color: TEXT_PRIMARY, border: `1px solid ${BORDER_COLOR}`, fontSize: '14px' }}>25%</span>
                        </li>
                         <li className="d-flex align-items-center justify-content-between py-2" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                            <span className="fw-bold" style={{ fontSize: '16px', color: TEXT_PRIMARY }}>4. Infrastructure (ETH)</span>
                            <span className="badge" style={{ background: 'transparent', color: TEXT_PRIMARY, border: `1px solid ${BORDER_COLOR}`, fontSize: '14px' }}>20%</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-card-white p-4 mb-4 rounded-2 border shadow-sm" style={{ borderColor: BORDER_COLOR }}>
                    <SectionHeader title="Methodology" />
                    <p className="small mb-0" style={{ lineHeight: '1.6', color: TEXT_MUTED }}>
                        The NGX calculation prioritizes <strong style={{ color: TEXT_PRIMARY }}>Sovereign Name Assets (30%)</strong> as the core naming layer of Web3, balancing it with high-liquidity sectors like Gaming and Art.
                    </p>
                </div>

                 <div className="p-4 text-center shadow-sm rounded-2" style={{ background: SURFACE_DARK, border: `1px solid ${BORDER_COLOR}`, color: TEXT_PRIMARY }}>
                    <h6 className="fw-bold text-gold-500 mb-2">Developers & Analysts</h6>
                    <p className="small mb-3" style={{ fontSize: '11px', color: TEXT_MUTED }}>
                        Integrate the NGX Index into your dashboard.
                    </p>
                    <button className="btn btn-sm w-100 rounded-0" style={{ fontSize: '11px', background: 'transparent', color: TEXT_PRIMARY, border: `1px solid ${BORDER_COLOR}` }}>
                        GET WIDGET CODE
                    </button>
                </div>

            </div>

        </div> 
        
        <div className="row mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER_COLOR}` }}>
            <div className="col-12 mb-4">
                 <h4 className="fw-bold m-0" style={{ color: TEXT_PRIMARY }}>Internal Market Intelligence</h4>
                 <p className="small m-0" style={{ color: TEXT_MUTED }}>Comprehensive insights aggregated from global market activity.</p>
            </div>

            <div className="col-12">
                <div className="d-flex flex-column gap-4">
                    {marketIntelligence.map((report) => (
                        <div key={report.id} className="bg-card-white p-4 rounded-2 border shadow-sm" style={{ borderColor: BORDER_COLOR }}>
                            <div className="row">
                                <div className="col-md-3 d-none d-md-block" style={{ borderRight: `1px solid ${BORDER_COLOR}` }}>
                                    <span className="fw-bold small text-uppercase d-block mb-1" style={{ color: GOLD_SOLID, fontSize: '11px', letterSpacing: '1px' }}>
                                        {report.category}
                                    </span>
                                    <div className="small" style={{ color: TEXT_MUTED }}>{report.date}</div>
                                </div>
                                
                                <div className="col-md-9 ps-md-3">
                                    <div className="d-block d-md-none mb-2">
                                        <span className="fw-bold small text-uppercase me-2" style={{ color: GOLD_SOLID, fontSize: '10px' }}>{report.category}</span>
                                        <span className="small" style={{ fontSize: '10px', color: TEXT_MUTED }}>{report.date}</span>
                                    </div>

                                    <h5 className="fw-bold mb-3" style={{ fontSize: '20px', color: TEXT_PRIMARY }}>{report.title}</h5>
                                    <p className="mb-3" style={{ fontSize: '16px', lineHeight: '1.7', textAlign: 'justify', color: TEXT_MUTED }}>
                                        {report.content}
                                    </p>
                                    <div className="small fw-bold fst-italic" style={{ color: TEXT_PRIMARY }}>
                                        {report.sources}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>

            <style jsx global>{`
                .bg-card-white { background-color: ${SURFACE_DARK} !important; }
                .text-navy-900 { color: ${TEXT_PRIMARY} !important; }
                .text-navy-600 { color: ${TEXT_MUTED} !important; }
                .text-gold-500 { color: ${GOLD_SOLID} !important; }
                .bg-navy-900 { background-color: ${SURFACE_DARK} !important; }
                @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
                .blink-text { animation: blink 2s infinite; }
                .ngx-page p,
                .ngx-page li,
                .ngx-page small,
                .ngx-page .small {
                    font-family: "Inter", "Segoe UI", sans-serif;
                    font-size: 15px;
                    color: ${TEXT_MUTED};
                }

                /* Ticker Animations */
                .brand-text-gold { background: linear-gradient(to bottom, #FCD535 0%, #B3882A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 15px rgba(252, 213, 53, 0.2); } 
                .brand-icon-gold { color: #FCD535; text-shadow: 0 0 10px rgba(252, 213, 53, 0.4); }
                @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } 
                .marquee-track { animation: scroll 75s linear infinite; width: max-content; }
            `}</style>

            {/* --- BRAND TICKER --- */}
            <div className="w-100 py-3 border-top border-bottom border-secondary position-relative" style={{ borderColor: '#333 !important', marginTop: 'auto', marginBottom: '20px', backgroundColor: '#0b0e11', maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)' }}>
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
