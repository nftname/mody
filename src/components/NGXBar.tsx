'use client';
import { useEffect, useState } from 'react';
import NGXWidget from './NGXWidget';

interface NGXData {
  marketCap: { total: number; change: number };
  volume: { total: number; intensity: number; sectors: number[] };
}

export default function NGXBar({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [data, setData] = useState<NGXData | null>(null);

  // Gemini Dark Theme Colors
  const bgColor = '#1E1F20'; 
  const dividerColor = '#363c45'; 
  const textColor = '#E6E8EA'; 
  const subTextColor = '#9AA0A6'; 
  const greenColor = '#81c995'; 
  const redColor = '#f28b82'; 
  const barBaseColor = '#3c4043';

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
    if (!val) return '$0.00';
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toFixed(0)}`;
  };

  // Section 2: Market Cap
  const MarketCapSection = () => {
    if (!data) return <div className="loading-state">Loading...</div>;
    const isPos = data.marketCap.change >= 0;
    const color = isPos ? greenColor : redColor;

    return (
      <div className="section-inner">
        {/* Top: Label */}
        <div className="row-top">
          <span className="label-text">NFT MARKET CAP</span>
        </div>

        {/* Middle: Visual (Progress Line) */}
        <div className="row-middle">
           <div className="cap-track">
              <div className="cap-fill" style={{ 
                  width: `${Math.min(100, Math.abs(data.marketCap.change) * 10 + 20)}%`, 
                  backgroundColor: color 
              }}></div>
           </div>
        </div>

        {/* Bottom: Value & Percent */}
        <div className="row-bottom">
           <span className="main-value">{formatCurrency(data.marketCap.total)}</span>
           <span className="sub-value" style={{ color: color }}>
              {isPos ? '▲' : '▼'}{Math.abs(data.marketCap.change).toFixed(2)}%
           </span>
        </div>
      </div>
    );
  };

  // Section 3: Volume / Buying Pressure
  const VolumeSection = () => {
    if (!data) return <div className="loading-state">Loading...</div>;
    // Ensure we always have 4 bars, fill with roughly 20 if missing
    const bars = data.volume.sectors?.length === 4 ? data.volume.sectors : [20, 30, 25, 40];
    
    return (
      <div className="section-inner">
         {/* Top: Label */}
         <div className="row-top">
            <span className="label-text">BUYING PRESSURE</span>
            <span className="live-dot">●</span>
         </div>

         {/* Middle: Visual (Bar Chart) */}
         <div className="row-middle">
            <div className="chart-container">
              {bars.map((val, i) => (
                  <div key={i} className="chart-bar" style={{
                      height: `${Math.max(15, Math.min(100, val))}%`,
                      backgroundColor: i === 3 ? textColor : (val > 40 ? greenColor : barBaseColor),
                      opacity: i === 3 ? 1 : 0.8
                  }}></div>
              ))}
            </div>
         </div>

         {/* Bottom: Value */}
         <div className="row-bottom">
            <span className="main-value">{formatCurrency(data.volume.total)}</span>
            <span className="unit-text">Vol</span>
         </div>
      </div>
    );
  };

  return (
    <div className="ngx-bar-wrapper">
        <div className="ngx-bar-container">
            
            {/* 1. NGX Widget (Left 33%) */}
            <div className="bar-section widget-section">
                <div className="widget-scaler">
                    <NGXWidget theme="dark" />
                </div>
            </div>

            <div className="divider"></div>

            {/* 2. Market Cap (Middle 33%) */}
            <div className="bar-section">
                <MarketCapSection />
            </div>

            <div className="divider"></div>

            {/* 3. Buying Pressure (Right 33%) */}
            <div className="bar-section">
                <VolumeSection />
            </div>

        </div>

        <style jsx>{`
            .ngx-bar-wrapper {
                width: 100%;
                background: ${bgColor};
                display: flex;
                justify-content: center;
                border-bottom: 1px solid ${dividerColor};
                padding: 0;
            }

            .ngx-bar-container {
                display: flex;
                width: 100%;
                max-width: 1400px;
                height: 80px; /* Fixed height for consistency */
                box-sizing: border-box;
            }
            
            .bar-section {
                flex: 1;
                width: 33.33%;
                height: 100%;
                position: relative;
                overflow: hidden;
            }

            .divider {
                width: 1px;
                height: 50%; /* Divider looks cleaner when not full height */
                background-color: ${dividerColor};
                margin-top: auto;
                margin-bottom: auto;
            }

            /* --- Internal Structure (The Grid) --- */
            .section-inner {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100%;
                width: 100%;
                padding: 0 5px;
            }

            .row-top {
                height: 20%;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .row-middle {
                height: 35%;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .row-bottom {
                height: 25%;
                display: flex;
                align-items: baseline; /* Aligns text properly */
                gap: 4px;
            }

            /* --- Typography --- */
            .label-text {
                font-size: 10px;
                color: ${subTextColor};
                font-weight: 600;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                white-space: nowrap;
            }
            .main-value {
                font-size: 16px;
                font-weight: 700;
                color: ${textColor};
                line-height: 1;
            }
            .sub-value {
                font-size: 10px;
                font-weight: 600;
            }
            .unit-text {
                font-size: 10px;
                color: ${subTextColor};
            }

            /* --- Visuals --- */
            /* Market Cap Bar */
            .cap-track {
                width: 70%;
                height: 4px;
                background-color: ${barBaseColor};
                border-radius: 2px;
                overflow: hidden;
            }
            .cap-fill { height: 100%; border-radius: 2px; }

            /* Volume Chart */
            .chart-container {
                display: flex;
                align-items: flex-end; /* This fixes the floating bars */
                gap: 4px;
                height: 24px;
                width: 70%;
                justify-content: center;
            }
            .chart-bar {
                width: 12px;
                border-radius: 2px 2px 0 0;
                transition: height 0.5s ease;
            }

            .live-dot {
                font-size: 8px;
                color: ${greenColor};
                animation: blink 2s infinite;
            }

            .loading-state {
                font-size: 10px; color: ${subTextColor};
                display: flex; align-items: center; justify-content: center; height: 100%;
            }

            /* --- Widget Scaling (Left Section) --- */
            .widget-section {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .widget-scaler {
                /* Precise scaling to fit the 33% box without overflow */
                transform: scale(0.9);
                transform-origin: center;
                display: flex;
                justify-content: center;
            }

            /* --- Mobile Optimizations --- */
            @media (max-width: 768px) {
                .ngx-bar-container { height: 65px; }

                /* Shrink scale more on mobile */
                .widget-scaler { transform: scale(0.65); }
                
                /* Adjust Grid Heights for Mobile */
                .row-middle { height: 30%; }
                
                /* Fonts */
                .label-text { font-size: 8px; letter-spacing: 0; }
                .main-value { font-size: 12px; }
                .sub-value { font-size: 9px; }
                
                /* Visuals */
                .chart-container { width: 85%; height: 18px; gap: 2px; }
                .chart-bar { width: 6px; }
                .cap-track { width: 80%; height: 3px; }
            }

            @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        `}</style>
    </div>
  );
}
