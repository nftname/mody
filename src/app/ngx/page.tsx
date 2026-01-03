'use client';
import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import NGXWidget from '@/components/NGXWidget';
import MarketTicker from '@/components/MarketTicker';
import NGXBar from '@/components/NGXBar';
import Link from 'next/link';

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
      <div className="p-2 border border-secondary shadow-sm" style={{ fontSize: '11px', backgroundColor: '#2B3139', color: '#E6E8EA' }}>
        <p className="fw-bold m-0">{label}</p>
        <p className="text-warning fw-bold m-0">NGX: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const SectionHeader = ({ title }: { title: string }) => (
  <div className="d-flex align-items-center mb-3 border-bottom pb-2" style={{ borderColor: '#363c45' }}>
    <div style={{ width: '4px', height: '16px', background: '#FCD535', marginRight: '10px' }}></div>
    <h3 className="fw-bold m-0 text-uppercase" style={{ fontSize: '14px', letterSpacing: '1px', color: '#E6E8EA' }}>{title}</h3>
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
                            <Cell key={`cell-${index}`} fill="#FCD535" fillOpacity={0.8 + (index * 0.05)} />
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

  if (!mounted) return <div className="p-5 text-center text-light">Loading Analytics...</div>;

  return (
    <main style={{ backgroundColor: '#1E1F20', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', color: '#E6E8EA' }}>
      
      <MarketTicker />

      <div className="w-100 border-bottom" style={{ backgroundColor: '#13171c', borderColor: '#2b3139' }}>
        <NGXBar theme="dark" />
      </div>

      <div className="bg-card-dark border-bottom border-dark py-4 px-4 shadow-sm">
        <div className="container-fluid">
            <div className="row align-items-center">
                <div className="col-lg-7 mb-3 mb-lg-0">
                    <h1 className="fw-bold mb-2" style={{ fontSize: '1.65rem', letterSpacing: '-0.5px', color: '#E6E8EA' }}>
                        NGX NFT Index &mdash; The Global Benchmark <span className="text-gold-500">.</span>
                    </h1>
                    <p className="mb-0" style={{ fontSize: '15px', maxWidth: '650px', color: '#B7BDC6' }}>
                        The premier benchmark tracking the global NFT market, aggregating sentiment, liquidity, and rare digital name assets across all platforms.
                    </p>
                </div>
                <div className="col-lg-5 d-flex justify-content-lg-end">
                   <div style={{ width: '100%', maxWidth: '340px' }}>
                        <NGXWidget theme="dark" />
                   </div>
                </div>
            </div>
        </div>
      </div>

      <div className="container-fluid py-4 px-4">
        
        <div className="row g-4">
            
            <div className="col-lg-8">
                
                <div className="bg-card-dark p-4 mb-4 rounded-2 border border-dark shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <SectionHeader title="Market Performance" />
                        <span className="badge bg-dark text-light border border-secondary">2017 - Present</span>
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historicalData}>
                                <defs>
                                    <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FCD535" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#FCD535" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#363c45" />
                                <XAxis dataKey="date" tick={{fontSize: 11, fill: '#848E9C'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 11, fill: '#848E9C'}} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke="#FCD535" strokeWidth={2} fillOpacity={1} fill="url(#colorHist)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-4 mb-4 rounded-2 text-white position-relative overflow-hidden shadow-sm" 
                     style={{ background: 'linear-gradient(135deg, #2B3139 0%, #1A202C 100%)', border: '1px solid #363c45' }}>
                    <div className="position-relative z-1">
                        <h2 className="fw-bold text-gold-500 mb-3 h4">{mainArticle.title}</h2>
                        <p className="lh-lg mb-3" style={{ fontSize: '15px', color: '#B7BDC6', maxWidth: '95%' }}>
                            {mainArticle.content}
                        </p>
                        <div className="d-flex align-items-center gap-3 pt-3 border-top border-secondary">
                             <div className="d-flex align-items-center gap-2">
                                <div className="bg-gold-500 rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                                <span className="small fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px', color: '#848E9C' }}>
                                    Chief Market Analyst &mdash; Market Briefing
                                </span>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card-dark p-4 mb-2 rounded-2 border border-dark shadow-sm" style={{ borderTop: '3px solid #FCD535' }}>
                     <div className="d-flex justify-content-between align-items-center mb-3">
                        <SectionHeader title="Growth Forecast (2025 - 2026)" />
                        <span className="badge bg-dark text-light border border-secondary" style={{ borderColor: '#FCD535' }}>AI Projection</span>
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecastData}>
                                <defs>
                                    <linearGradient id="colorFore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ecb81" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#0ecb81" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#363c45" />
                                <XAxis dataKey="year" tick={{fontSize: 11, fill: '#848E9C'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 11, fill: '#848E9C'}} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke="#0ecb81" strokeWidth={2} fillOpacity={1} fill="url(#colorFore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="fst-italic small mt-2" style={{ color: '#6c757d' }}>
                   * NGX provides information only and does not guarantee financial returns.
                </div>

            </div>

            <div className="col-lg-4">
                
                <div className="bg-card-dark p-4 mb-4 rounded-2 border border-dark shadow-sm">
                    <div className="d-flex justify-content-between align-items-end mb-3">
                        <div>
                            <SectionHeader title="Buying Pressure" />
                            <div className="small" style={{ color: '#848E9C' }}>Buy/Sell Volume Ratio</div>
                        </div>
                        <div className="text-success fw-bold blink-text">● Live</div>
                    </div>
                    <LiveMomentumChart />
                    <div className="mt-3 pt-3 border-top border-secondary small" style={{ color: '#848E9C' }}>
                        Indicates the strength of incoming buy orders vs sell orders.
                    </div>
                </div>

                <div className="bg-card-dark p-4 mb-4 rounded-2 border border-dark shadow-sm">
                    <SectionHeader title="Index Weights" />
                    <p className="mb-3" style={{ fontSize: '15px', lineHeight: '1.5', color: '#B7BDC6' }}>
                        Weighted allocation based on market cap and utility:
                    </p>
                    <ul className="list-unstyled m-0">
                        <li className="d-flex align-items-center justify-content-between py-2 bg-warning bg-opacity-10 px-2 rounded mb-1" style={{ border: '1px solid #FCD53530' }}>
                            <span className="fw-bold" style={{ fontSize: '16px', color: '#FCD535' }}>1. Sovereign Names (ENS/NNM)</span>
                            <span className="badge bg-warning text-dark" style={{ fontSize: '14px' }}>30%</span>
                        </li>
                        <li className="d-flex align-items-center justify-content-between py-2 border-bottom border-secondary">
                            <span className="fw-bold" style={{ fontSize: '16px', color: '#E6E8EA' }}>2. GameFi & Metaverse (IMX)</span>
                            <span className="badge bg-dark text-light border border-secondary" style={{ fontSize: '14px' }}>25%</span>
                        </li>
                        <li className="d-flex align-items-center justify-content-between py-2 border-bottom border-secondary">
                            <span className="fw-bold" style={{ fontSize: '16px', color: '#E6E8EA' }}>3. Digital Art & Culture (APE)</span>
                            <span className="badge bg-dark text-light border border-secondary" style={{ fontSize: '14px' }}>25%</span>
                        </li>
                         <li className="d-flex align-items-center justify-content-between py-2 border-bottom border-secondary">
                            <span className="fw-bold" style={{ fontSize: '16px', color: '#E6E8EA' }}>4. Infrastructure (ETH)</span>
                            <span className="badge bg-dark text-light border border-secondary" style={{ fontSize: '14px' }}>20%</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-card-dark p-4 mb-4 rounded-2 border border-dark shadow-sm">
                    <SectionHeader title="Methodology" />
                    <p className="small mb-0" style={{ lineHeight: '1.6', color: '#B7BDC6' }}>
                        The NGX calculation prioritizes <strong style={{ color: '#FCD535' }}>Sovereign Name Assets (30%)</strong> as the core naming layer of Web3, balancing it with high-liquidity sectors like Gaming and Art.
                    </p>
                </div>

                 <div className="p-4 text-center text-white shadow-sm rounded-2" style={{ background: '#13171c', border: '1px solid #FCD53530' }}>
                    <h6 className="fw-bold text-gold-500 mb-2">Developers & Analysts</h6>
                    <p className="small text-white-50 mb-3" style={{ fontSize: '11px' }}>
                        Integrate the NGX Index into your dashboard.
                    </p>
                    <button className="btn btn-sm btn-outline-light w-100 rounded-0" style={{ fontSize: '11px', borderColor: '#FCD535', color: '#FCD535' }}>
                        GET WIDGET CODE
                    </button>
                </div>

            </div>

        </div> 
        
        <div className="row mt-3 pt-3 border-top border-secondary">
            <div className="col-12 mb-4">
                 <h4 className="fw-bold m-0" style={{ color: '#E6E8EA' }}>Internal Market Intelligence</h4>
                 <p className="small m-0" style={{ color: '#848E9C' }}>Comprehensive insights aggregated from global market activity.</p>
            </div>

            <div className="col-12">
                <div className="d-flex flex-column gap-4">
                    {marketIntelligence.map((report) => (
                        <div key={report.id} className="bg-card-dark p-4 rounded-2 border border-dark shadow-sm">
                            <div className="row">
                                <div className="col-md-3 border-end border-secondary d-none d-md-block">
                                    <span className="fw-bold small text-uppercase d-block mb-1" style={{ color: '#FCD535', fontSize: '11px', letterSpacing: '1px' }}>
                                        {report.category}
                                    </span>
                                    <div className="small" style={{ color: '#848E9C' }}>{report.date}</div>
                                </div>
                                
                                <div className="col-md-9 ps-md-3">
                                    <div className="d-block d-md-none mb-2">
                                        <span className="fw-bold small text-uppercase me-2" style={{ color: '#FCD535', fontSize: '10px' }}>{report.category}</span>
                                        <span className="text-muted small" style={{ fontSize: '10px', color: '#848E9C' }}>{report.date}</span>
                                    </div>

                                    <h5 className="fw-bold mb-3" style={{ fontSize: '20px', color: '#E6E8EA' }}>{report.title}</h5>
                                    <p className="mb-3" style={{ fontSize: '16px', lineHeight: '1.7', textAlign: 'justify', color: '#B7BDC6' }}>
                                        {report.content}
                                    </p>
                                    <div className="small fw-bold fst-italic" style={{ color: '#848E9C' }}>
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
        .bg-card-dark { background-color: #2B3139 !important; }
        .border-dark { border-color: #363c45 !important; }
        .text-gold-500 { color: #FCD535 !important; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .blink-text { animation: blink 2s infinite; }
      `}</style>
    </main>
  );
}
