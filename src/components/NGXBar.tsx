'use client';
import { useEffect, useState } from 'react';
import NGXWidget from './NGXWidget'; // Import the mini widget

interface NGXData {
  marketCap: { total: number; change: number };
  volume: { total: number; intensity: number; sectors: number[] };
}

export default function NGXBar({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [data, setData] = useState<NGXData | null>(null);
  const isLight = theme === 'light';

  // Styles
  const bgColor = isLight ? 'linear-gradient(145deg, #F8F9FA, #E9ECEF)' : 'linear-gradient(145deg, #13171c, #0b0e11)';
  const borderColor = isLight ? '#DEE2E6' : '#2b3139';
  const textColor = isLight ? '#0A192F' : '#E6E8EA';
  const subTextColor = isLight ? '#6c757d' : '#848E9C';
  const greenColor = '#0ecb81';
  const redColor = '#f6465d';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/ngx');
        if (res.ok) setData(await res.json());
      } catch (e) { console.error(e); }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toFixed(0)}`;
  };

  // Helper for Market Cap Widget (Middle)
  const MarketCapCard = () => {
    if (!data) return <div className="loading-pulse" />;
    const isPositive = data.marketCap.change >= 0;
    const color = isPositive ? greenColor : redColor;
    
    return (
      <div className="bar-card">
        <div className="d-flex justify-content-between w-100 mb-1">
           <span style={{ fontSize: '10px', color: subTextColor, textTransform: 'uppercase' }}>NFT Market Cap</span>
           <span style={{ fontSize: '10px', color: color, fontWeight: 'bold' }}>
             {isPositive ? '▲' : '▼'} {Math.abs(data.marketCap.change).toFixed(2)}%
           </span>
        </div>
        <div className="fw-bold" style={{ fontSize: '18px', color: textColor }}>
            {formatCurrency(data.marketCap.total)}
        </div>
        {/* Progress Line at bottom like CMC */}
        <div style={{ width: '100%', height: '3px', background: '#2B3139', marginTop: 'auto', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, Math.abs(data.marketCap.change) * 10)}%`, height: '100%', background: color }}></div>
        </div>
      </div>
    );
  };

  // Helper for Buying Pressure Widget (Right)
  const PressureCard = () => {
    if (!data) return <div className="loading-pulse" />;
    // Bars mapping: 0=Identity, 1=Art, 2=Gaming, 3=Total
    const bars = data.volume.sectors || [20, 20, 20, 20]; 
    
    return (
      <div className="bar-card">
         <div className="d-flex justify-content-between w-100 mb-1">
           <span style={{ fontSize: '10px', color: subTextColor, textTransform: 'uppercase' }}>Buying Pressure</span>
           <span className="blink-dot" style={{ fontSize: '10px', color: greenColor }}>● Live</span>
        </div>
        
        <div className="d-flex align-items-end justify-content-between h-100" style={{ paddingBottom: '4px' }}>
            {bars.map((val, i) => (
                <div key={i} style={{
                    width: '18%',
                    height: `${Math.max(15, Math.min(100, val))}%`, // Dynamic height based on real volume
                    backgroundColor: i === 3 ? textColor : (val > 30 ? greenColor : '#495057'), // Last bar is Total
                    borderRadius: '2px',
                    transition: 'height 0.5s ease'
                }}></div>
            ))}
        </div>
        <span style={{ fontSize: '9px', color: subTextColor }}>Vol: {formatCurrency(data.volume.total)}</span>
      </div>
    );
  };

  return (
    <div className="ngx-bar-wrapper">
        <div className="ngx-bar-container">
            {/* 1. Left: The Original Widget (Scaled) */}
            <div className="bar-item">
                <NGXWidget theme={theme} />
            </div>

            {/* 2. Middle: Market Cap (CMC Style) */}
            <div className="bar-item">
                <MarketCapCard />
            </div>

            {/* 3. Right: Buying Pressure (Bars Style) */}
            <div className="bar-item">
                <PressureCard />
            </div>
        </div>

        <style jsx>{`
            .ngx-bar-wrapper {
                width: 100%;
                padding: 10px 0;
                overflow-x: auto; /* Scroll on mobile */
                scrollbar-width: none; /* Hide scrollbar Firefox */
            }
            .ngx-bar-wrapper::-webkit-scrollbar { display: none; } /* Hide scrollbar Chrome */

            .ngx-bar-container {
                display: flex;
                gap: 12px;
                width: 100%;
                max-width: 1200px; /* Limit width on desktop */
                margin: 0 auto;
                padding: 0 15px;
                min-width: 360px; /* Ensure structure on small screens */
            }

            .bar-item {
                flex: 1;
                min-width: 160px; /* Force minimum width for mobile scroll */
                display: flex;
                justify-content: center;
            }

            .bar-card {
                background: ${bgColor};
                border: 1px solid ${borderColor};
                border-radius: 12px;
                padding: 10px 14px;
                width: 100%;
                max-width: 342px; /* Match Widget Width */
                height: 100%;
                min-height: 59px; /* Match Widget Height */
                display: flex;
                flex-direction: column;
                justify-content: center;
                box-shadow: ${isLight ? '0 4px 12px rgba(0,0,0,0.08)' : 'none'};
            }

            .loading-pulse {
                width: 100%;
                height: 100%;
                background: rgba(255,255,255,0.05);
                animation: pulse 1.5s infinite;
            }

            @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
            .blink-dot { animation: blink 2s infinite; }
            @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        `}</style>
    </div>
  );
}
