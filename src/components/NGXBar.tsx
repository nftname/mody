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

  // --- Components ---

  const MarketCapSection = () => {
    if (!data) return <div className="loading-txt">Loading...</div>;
    const isPos = data.marketCap.change >= 0;
    const color = isPos ? greenColor : redColor;

    return (
      <div className="flex-col-center">
        <span className="label-text">NFT MARKET CAP</span>
        
        {/* Progress Bar Area */}
        <div className="visual-area">
           <div className="cap-track">
              <div className="cap-fill" style={{ 
                  width: `${Math.min(100, Math.abs(data.marketCap.change) * 10 + 20)}%`, 
                  backgroundColor: color 
              }}></div>
           </div>
        </div>

        {/* Values */}
        <div className="value-area">
           <span className="main-value">{formatCurrency(data.marketCap.total)}</span>
           <span className="sub-value" style={{ color: color }}>
              {isPos ? '▲' : '▼'}{Math.abs(data.marketCap.change).toFixed(2)}%
           </span>
        </div>
      </div>
    );
  };

  const VolumeSection = () => {
    if (!data) return <div className="loading-txt">Loading...</div>;
    const bars = data.volume.sectors?.length === 4 ? data.volume.sectors : [20, 30, 25, 40];
    
    return (
      <div className="flex-col-center">
         <div className="label-row">
            <span className="label-text">BUYING PRESSURE</span>
            <span className="live-dot">●</span>
         </div>

         {/* Chart Area */}
         <div className="visual-area chart-area">
              {bars.map((val, i) => (
                  <div key={i} className="chart-bar" style={{
                      height: `${Math.max(20, Math.min(100, val))}%`,
                      backgroundColor: i === 3 ? textColor : (val > 40 ? greenColor : barBaseColor),
                      opacity: i === 3 ? 1 : 0.7
                  }}></div>
              ))}
         </div>

         {/* Values */}
         <div className="value-area">
            <span className="main-value">{formatCurrency(data.volume.total)}</span>
            <span className="unit-text">Vol</span>
         </div>
      </div>
    );
  };

  return (
    <div className="ngx-bar-wrapper">
        <div className="ngx-bar-container">
            
            {/* Left: Widget */}
            <div className="bar-section widget-section">
                <div className="widget-scaler">
                    <NGXWidget theme="dark" />
                </div>
            </div>

            <div className="divider"></div>

            {/* Middle: Cap */}
            <div className="bar-section">
                <MarketCapSection />
            </div>

            <div className="divider"></div>

            {/* Right: Pressure */}
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
                height: 80px; /* Default height desktop */
                box-sizing: border-box;
                overflow: hidden; /* Crucial */
            }
            
            .bar-section {
                flex: 1;
                width: 33.33%;
                height: 100%;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }

            .divider {
                width: 1px;
                height: 50%;
                margin: auto 0;
                background-color: ${dividerColor};
                flex-shrink: 0;
            }

            /* --- Flex Column Layout for Sections --- */
            .flex-col-center {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
                padding: 0 4px;
                gap: 4px; /* Space between rows */
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
            .label-row { display: flex; align-items: center; gap: 4px; }
            
            .main-value {
                font-size: 15px;
                font-weight: 700;
                color: ${textColor};
                line-height: 1;
                white-space: nowrap;
            }
            .sub-value { font-size: 10px; font-weight: 600; margin-left: 4px; white-space: nowrap; }
            .unit-text { font-size: 10px; color: ${subTextColor}; margin-left: 2px; }
            .value-area { display: flex; align-items: baseline; justify-content: center; }

            /* --- Visual Elements --- */
            .visual-area {
                height: 20px; /* Fixed height for visuals */
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

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
            .chart-area {
                display: flex;
                align-items: flex-end; /* Align bars to bottom */
                gap: 4px;
                width: 70%;
                height: 24px;
            }
            .chart-bar {
                flex: 1;
                border-radius: 2px 2px 0 0;
                transition: height 0.5s ease;
            }

            .live-dot { font-size: 8px; color: ${greenColor}; animation: blink 2s infinite; }
            .loading-txt { font-size: 10px; color: ${subTextColor}; }

            /* --- Widget Scaler --- */
            .widget-scaler {
                transform: scale(0.85);
                transform-origin: center;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            /* --- MOBILE TWEAKS (Crucial for fixing your issue) --- */
            @media (max-width: 768px) {
                .ngx-bar-container { height: 60px; } /* Compact height */
                
                .widget-scaler { transform: scale(0.55); } /* Smaller widget */
                
                .flex-col-center { gap: 2px; } /* Less gap */
                
                /* Smaller Fonts to prevent overlapping */
                .label-text { font-size: 8px; letter-spacing: 0; }
                .main-value { font-size: 11px; }
                .sub-value { font-size: 8px; margin-left: 2px; }
                .unit-text { font-size: 8px; }
                
                /* Visual adjustments */
                .visual-area { height: 14px; }
                .cap-track { width: 80%; height: 3px; }
                .chart-area { width: 85%; height: 18px; gap: 2px; }
                .chart-bar { border-radius: 1px 1px 0 0; }
            }

            @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        `}</style>
    </div>
  );
}
 