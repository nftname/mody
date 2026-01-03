'use client';
import { useEffect, useState } from 'react';
import NGXWidget from './NGXWidget';

interface NGXData {
  marketCap: { total: number; change: number };
  volume: { total: number; intensity: number; sectors: number[] };
}

export default function NGXBar({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [data, setData] = useState<NGXData | null>(null);

  // Colors
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
    if (!val) return '$0';
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toFixed(0)}`;
  };

  const MarketCapSection = () => {
    if (!data) return <span className="loading-txt">Loading</span>;
    const isPos = data.marketCap.change >= 0;
    const color = isPos ? greenColor : redColor;

    return (
      <div className="section-content">
        <div className="top-label">NFT MARKET CAP</div>
        
        <div className="mid-visual">
           <div className="cap-track">
              <div className="cap-fill" style={{ 
                  width: `${Math.min(100, Math.abs(data.marketCap.change) * 10 + 20)}%`, 
                  backgroundColor: color 
              }}></div>
           </div>
        </div>

        <div className="bot-value">
           <span className="main-num">{formatCurrency(data.marketCap.total)}</span>
           <span className="sub-num" style={{ color: color }}>
              {isPos ? '▲' : '▼'}{Math.abs(data.marketCap.change).toFixed(2)}%
           </span>
        </div>
      </div>
    );
  };

  const VolumeSection = () => {
    if (!data) return <span className="loading-txt">Loading</span>;
    const bars = data.volume.sectors?.length === 4 ? data.volume.sectors : [20, 30, 25, 40];
    
    return (
      <div className="section-content">
         <div className="top-label">
            BUYING PRESSURE <span style={{ color: greenColor }}>●</span>
         </div>

         <div className="mid-visual chart-box">
              {bars.map((val, i) => (
                  <div key={i} className="chart-bar" style={{
                      height: `${Math.max(20, Math.min(100, val))}%`,
                      backgroundColor: i === 3 ? textColor : (val > 40 ? greenColor : barBaseColor),
                      opacity: i === 3 ? 1 : 0.7
                  }}></div>
              ))}
         </div>

         <div className="bot-value">
            <span className="main-num">{formatCurrency(data.volume.total)}</span>
            <span className="unit-txt">Vol</span>
         </div>
      </div>
    );
  };

  return (
    <div className="ngx-bar-wrapper">
        <div className="ngx-bar-container">
            
            {/* LEFT: WIDGET (33%) */}
            <div className="bar-column">
                <div className="widget-wrapper">
                    <NGXWidget theme="dark" />
                </div>
            </div>

            <div className="divider"></div>

            {/* MIDDLE: CAP (33%) */}
            <div className="bar-column">
                <MarketCapSection />
            </div>

            <div className="divider"></div>

            {/* RIGHT: VOLUME (33%) */}
            <div className="bar-column">
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
            }

            .ngx-bar-container {
                display: flex;
                width: 100%;
                max-width: 1400px;
                height: 80px;
                box-sizing: border-box;
            }
            
            .bar-column {
                flex: 1;
                width: 33.33%;
                height: 100%;
                position: relative;
                overflow: hidden;
            }

            .divider {
                width: 1px;
                height: 50%;
                margin: auto 0;
                background-color: ${dividerColor};
            }

            /* --- FLEX LAYOUT SYSTEM --- */
            .section-content {
                display: flex;
                flex-direction: column;
                justify-content: space-evenly; /* Distributes space evenly */
                align-items: center;
                width: 100%;
                height: 100%;
                padding: 5px 2px;
            }

            /* --- TYPOGRAPHY (Desktop Default) --- */
            .top-label {
                font-size: 10px;
                color: ${subTextColor};
                font-weight: 600;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                white-space: nowrap;
            }
            .main-num {
                font-size: 16px;
                font-weight: 700;
                color: ${textColor};
                line-height: 1;
                white-space: nowrap;
            }
            .sub-num { font-size: 10px; font-weight: 600; margin-left: 4px; }
            .unit-txt { font-size: 10px; color: ${subTextColor}; margin-left: 2px; }
            .bot-value { display: flex; align-items: baseline; justify-content: center; }
            .loading-txt { font-size: 10px; color: ${subTextColor}; }

            /* --- VISUALS --- */
            .mid-visual {
                height: 25px;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            /* Market Cap Line */
            .cap-track {
                width: 70%;
                height: 4px;
                background-color: ${barBaseColor};
                border-radius: 2px;
                overflow: hidden;
            }
            .cap-fill { height: 100%; border-radius: 2px; }

            /* Volume Bars */
            .chart-box {
                align-items: flex-end;
                gap: 4px;
                width: 70%;
            }
            .chart-bar {
                flex: 1;
                border-radius: 2px 2px 0 0;
                transition: height 0.5s ease;
            }

            /* --- WIDGET SCALING --- */
            .widget-wrapper {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                transform: scale(0.85); /* Desktop Scale */
            }

            /* =========================================
               MOBILE OPTIMIZATION (CRITICAL FIXES)
               ========================================= */
            @media (max-width: 768px) {
                .ngx-bar-container { height: 60px; }
                
                /* 1. Aggressive Font Downsizing to fit 33% width */
                .top-label { font-size: 7px; letter-spacing: 0; }
                .main-num { font-size: 11px; }
                .sub-num { font-size: 8px; margin-left: 2px; }
                .unit-txt { font-size: 7px; }

                /* 2. Visual Adjustment */
                .mid-visual { height: 16px; }
                .cap-track { width: 85%; height: 3px; }
                .chart-box { width: 90%; gap: 2px; }

                /* 3. Widget Scaling for Mobile */
                /* This forces the large widget to fit into the tiny 33% box */
                .widget-wrapper { transform: scale(0.48); } 
            }
        `}</style>
    </div>
  );
}
