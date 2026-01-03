'use client';
import { useEffect, useState } from 'react';
import NGXWidget from './NGXWidget';

interface NGXData {
  marketCap: { total: number; change: number };
  volume: { total: number; intensity: number; sectors: number[] };
}

export default function NGXBar({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [data, setData] = useState<NGXData | null>(null);
  const isLight = theme === 'light';

  const bgColor = isLight ? '#FFFFFF' : '#0b0e11'; // Solid background for the bar
  const borderColor = isLight ? '#DEE2E6' : '#2b3139';
  const textColor = isLight ? '#0A192F' : '#E6E8EA';
  const subTextColor = isLight ? '#6c757d' : '#848E9C';
  const greenColor = '#0ecb81';
  const redColor = '#f6465d';
  const dividerColor = isLight ? '#E9ECEF' : '#2b3139';

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

  const MarketCapCard = () => {
    if (!data) return <div className="loading-pulse" />;
    const isPositive = data.marketCap.change >= 0;
    const color = isPositive ? greenColor : redColor;
    
    return (
      <div className="d-flex flex-column justify-content-center align-items-center h-100 w-100">
        <div className="d-flex align-items-center gap-1 mb-1">
             <span className="label-text">NFT CAP</span>
             <span style={{ fontSize: '10px', color: color, fontWeight: '700' }}>
               {isPositive ? '▲' : '▼'} {Math.abs(data.marketCap.change).toFixed(1)}%
             </span>
        </div>
        <div className="value-text">
            {formatCurrency(data.marketCap.total)}
        </div>
        {/* Simple progress line */}
        <div className="progress-bg mt-1">
            <div style={{ width: `${Math.min(100, Math.abs(data.marketCap.change) * 10)}%`, height: '100%', background: color }}></div>
        </div>
      </div>
    );
  };

  const PressureCard = () => {
    if (!data) return <div className="loading-pulse" />;
    const bars = data.volume.sectors || [20, 20, 20, 20]; 
    
    return (
      <div className="d-flex flex-column justify-content-center align-items-center h-100 w-100">
         <div className="d-flex align-items-center gap-1 mb-1">
           <span className="label-text">VOLUME</span>
           <span className="blink-dot" style={{ fontSize: '8px', color: greenColor }}>●</span>
        </div>
        
        {/* Adjusted Height to match text visual weight */}
        <div className="chart-container">
            {bars.map((val, i) => (
                <div key={i} className="chart-bar" style={{
                    height: `${Math.max(20, Math.min(100, val))}%`, 
                    backgroundColor: i === 3 ? textColor : (val > 30 ? greenColor : '#495057'),
                }}></div>
            ))}
        </div>
        <div className="value-text mt-1" style={{ fontSize: '11px' }}>{formatCurrency(data.volume.total)}</div>
      </div>
    );
  };

  return (
    <div className="ngx-bar-wrapper">
        <div className="ngx-bar-container">
            
            {/* 1. NGX Widget (Left) */}
            <div className="bar-section">
                <div className="widget-scaler">
                    <NGXWidget theme={theme} />
                </div>
            </div>

            {/* Divider */}
            <div className="bar-divider"></div>

            {/* 2. Market Cap (Middle) */}
            <div className="bar-section">
                <MarketCapCard />
            </div>

            {/* Divider */}
            <div className="bar-divider"></div>

            {/* 3. Buying Pressure (Right) */}
            <div className="bar-section">
                <PressureCard />
            </div>

        </div>

        <style jsx>{`
            .ngx-bar-wrapper {
                width: 100%;
                background: ${isLight ? '#F8F9FA' : '#000'};
                padding: 10px 0;
            }

            .ngx-bar-container {
                display: flex;
                align-items: center;
                width: 100%;
                max-width: 1200px;
                height: 70px; /* Unified fixed height */
                margin: 0 auto;
                background: ${bgColor};
                border: 1px solid ${borderColor};
                border-radius: 8px; /* Rounded corners for the whole bar */
                box-shadow: ${isLight ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'};
                overflow: hidden;
            }

            /* Each section takes exactly 1/3 space */
            .bar-section {
                flex: 1;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
                padding: 0 4px;
            }

            .bar-divider {
                width: 1px;
                height: 60%; /* Divider doesn't touch edges */
                background-color: ${dividerColor};
            }

            /* --- Desktop Styles --- */
            .label-text {
                font-size: 10px;
                color: ${subTextColor};
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            .value-text {
                font-size: 15px;
                color: ${textColor};
                font-weight: 700;
                line-height: 1;
            }
            .progress-bg {
                width: 60%;
                height: 3px;
                background: ${isLight ? '#E9ECEF' : '#2B3139'};
                border-radius: 2px;
                overflow: hidden;
            }
            .chart-container {
                display: flex;
                align-items: flex-end;
                justify-content: space-between;
                width: 60%;
                height: 22px; /* Fixed height to match neighbors */
                gap: 2px;
            }
            .chart-bar {
                flex: 1;
                border-radius: 1px;
                transition: height 0.5s ease;
            }
            .widget-scaler {
                transform: scale(0.9); /* Slight scale down for desktop alignment */
                display: flex;
                justify-content: center;
            }

            .loading-pulse {
                width: 50%;
                height: 50%;
                background: rgba(128,128,128,0.1);
                animation: pulse 1.5s infinite;
            }

            /* --- Mobile Styles --- */
            @media (max-width: 768px) {
                .ngx-bar-wrapper {
                    padding: 0; /* Full width on mobile */
                }
                .ngx-bar-container {
                    border-radius: 0; /* Rectangular on mobile */
                    border-left: none;
                    border-right: none;
                    height: 60px; /* Slightly shorter on mobile */
                }
                
                .widget-scaler {
                    transform: scale(0.7); /* Scale widget down to fit 1/3 screen */
                }

                .label-text { font-size: 8px; }
                .value-text { font-size: 12px; }
                
                .chart-container { width: 80%; height: 18px; }
                .progress-bg { width: 80%; }
            }

            @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
            .blink-dot { animation: blink 2s infinite; }
            @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        `}</style>
    </div>
  );
}
