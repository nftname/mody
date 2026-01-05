'use client';
import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import NGXWidget from '@/components/NGXWidget';
import NGXCapWidget from '@/components/NGXCapWidget';
import NGXVolumeWidget from '@/components/NGXVolumeWidget'; 
import MarketTicker from '@/components/MarketTicker';
import Link from 'next/link';

const BACKGROUND_DARK = '#1E1E1E';
const SURFACE_DARK = '#242424';
const BORDER_COLOR = '#2E2E2E';
const TEXT_PRIMARY = '#E0E0E0';
const TEXT_MUTED = '#B0B0B0';
const GOLD_SOLID = '#F0C420';
const GOLD_GRADIENT = 'linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #B8860B 100%)';

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

const marketIntelligence = [
  {
    id: 1,
    category: "STRATEGIC ANALYSIS",
    date: "Dec 07, 2025",
    title: "Digital Name Standards: Bridging Ownership & Value",
    content: "As high-value digital assets move on-chain, clarity and transparency of ownership become essential. Randomized identifiers no longer suffice for premium assets. This drives demand for high-quality Name Assets to serve as a readable, valuable ownership layer.",
    sources: "Sources: Industry Reports, Market Analysis",
  },
  {
    id: 2,
    category: "SECTOR OUTLOOK",
    date: "Dec 06, 2025",
    title: "Gaming Economies: The Rise of Tradeable Names",
    content: "Leading game developers are embracing Web3 models. Gamer identities are shifting from rented entries to fully tradeable, liquid Name Assets. Market trends indicate significant growth in Name Asset contracts.",
    sources: "Sources: Global Market Analysis, Sector Research",
  },
  {
    id: 3,
    category: "TECHNICAL DEEP DIVE",
    date: "Dec 05, 2025",
    title: "Liquidity Insights: Premium Name Assets vs Social Identities",
    content: "The digital name market is dividing into two layers: social recognition and commercial tradeable assets. While social reputation develops gradually, premium Name Assets operate like scarce, tradable digital real estate.",
    sources: "Sources: Market Intelligence, Global Analysis",
  }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
            <div className="p-2 shadow-sm" style={{ fontSize: '11px', background: SURFACE_DARK, border: `1px solid ${BORDER_COLOR}`, color: TEXT_PRIMARY }}>
                <p className="fw-bold m-0">{label}</p>
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
    const [data, setData] = useState([{ val: 40 }, { val: 60 }, { val: 45 }, { val: 80 }, { val: 70 }, { val: 90 }]);
    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => prev.map(item => ({ val: Math.max(20, Math.min(100, item.val + (Math.random() * 20 - 10))) })));
        }, 2000);
        return () => clearInterval(interval);
    }, []);
    return (
        <div style={{ height: '80px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <Bar dataKey="val" radius={[2, 2, 0, 0]}>
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={GOLD_SOLID} fillOpacity={0.6 + (index * 0.05)} />)}
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
        <main className="ngx-page" style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', color: TEXT_PRIMARY }}>
      <MarketTicker />

      {/* HEADER SECTION: Balanced Distribution */}
      <div className="header-wrapper shadow-sm">
        <div className="container-fluid py-2"> 
            
            {/* WIDGET CONTAINER: Using Space-Between for Geometric Balance */}
            <div className="widgets-grid-container">
                <div className="widget-item"> <NGXWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXCapWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXVolumeWidget theme="dark" /> </div>
            </div>

            <div className="row align-items-center px-2 mt-3 text-section">
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

      <div className="container-fluid py-4 px-2">
        <div className="row g-4">
            <div className="col-lg-8">
                <div className="bg-card-white p-4 mb-4 rounded-2 border shadow-sm" style={{ borderColor: BORDER_COLOR }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <SectionHeader title="Market Performance" />
                        <span className="badge" style={{ background: GOLD_GRADIENT, color: '#1a1200' }}>2017 - Present</span>
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
                </div>
            </div>
        </div>
      </div>

      <style jsx global>{`
        .header-wrapper {
            background: ${SURFACE_DARK};
            border-bottom: 1px solid ${BORDER_COLOR};
            padding: 8px 0;
        }

        /* --- DESKTOP: Geometric Spacing --- */
        .widgets-grid-container {
            display: flex;
            justify-content: space-between; /* Distributes space between widgets */
            align-items: center;
            flex-wrap: nowrap;
            max-width: 1050px; /* Limits expansion for a centered look */
            margin: 0 auto; /* Centers the whole widget group */
            padding: 0 15px;
        }

        .widget-item {
            flex: 0 0 310px; /* Fixed width for consistency */
        }

        .main-title { font-size: 1.65rem; color: ${TEXT_PRIMARY}; letter-spacing: -0.5px; }
        .main-desc { font-size: 15px; color: ${TEXT_MUTED}; max-width: 650px; }
        .text-section { max-width: 1050px; margin: 0 auto; }

        /* --- MOBILE: Seamless Tiling --- */
        @media (max-width: 768px) {
            .widgets-grid-container {
                justify-content: center; /* Centers items on mobile */
                flex-wrap: wrap;
                gap: 4px; /* Tight gap for mobile capsules */
                padding: 0 5px;
                max-width: 100%;
            }
            .widget-item {
                flex: 0 0 auto;
                min-width: 112px;
            }
            .main-title { font-size: 1.25rem; text-align: center; }
            .main-desc { font-size: 13px; text-align: center; margin: 0 auto; }
        }

        .bg-card-white { background-color: ${SURFACE_DARK} !important; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .blink-text { animation: blink 2s infinite; }
      `}</style>
    </main>
  );
}
