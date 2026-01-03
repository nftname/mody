'use client';
import { useEffect, useState } from 'react';
import NGXWidget from './NGXWidget';

interface NGXData {
  marketCap: { total: number; change: number };
  volume: { total: number; intensity: number; sectors: number[] };
}

export default function NGXBar({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [data, setData] = useState<NGXData | null>(null);
  
  // Force Dark Mode Colors as requested (Gemini Style)
  const bgColor = '#1E1F20'; 
  const borderColor = '#363c45'; 
  const textColor = '#E6E8EA'; 
  const subTextColor = '#9AA0A6'; 
  const dividerColor = '#363c45';
  const greenColor = '#81c995'; // Softer green for dark mode
  const redColor = '#f28b82';   // Softer red for dark mode

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

  const MarketCapSection = () => {
    if (!data) return <div className="loading-pulse" />;
    const isPos = data.marketCap.change >= 0;
    
    return (
      <div className="data-content">
        <div className="label-text mb-2">NFT MARKET CAP</div>
        <div className="value-row">
            <span className="big-value">{formatCurrency(data.marketCap.total)}</span>
        </div>
        <div className="progress-bar-container">
            <div className="progress-fill" style={{ 
                width: `${Math.min(100, Math.abs(data.marketCap.change) * 20)}%`, 
                backgroundColor: isPos ? greenColor : redColor 
            }}></div>
        </div>
        <span className="small-change" style={{ color: isPos ? greenColor : redColor }}>
             {isPos ? '▲' : '▼'} {Math.abs(data.marketCap.change).toFixed(2)}%
        </span>
      </div>
    );
  };

  const VolumeSection = () => {
    if (!data) return <div className="loading-pulse" />;
    const bars = data.volume.sectors || [20, 20, 20, 20];
    
    return (
      <div className="data-content">
         <div className="label-row mb-2">
             <span className="label-text">BUYING PRESSURE</span>
             <span className="live-dot">●</span>
         </div>
         <div className="chart-row">
            {bars.map((val, i) => (
                <div key={i} className="bar-stick" style={{
                    height: `${Math.max(15, Math.min(100, val))}%`,
                    backgroundColor: i === 3 ? textColor : (val > 40 ? greenColor : '#5f6368')
                }}></div>
            ))}
         </div>
         <div className="value-row mt-2">
            <span className="small-value">{formatCurrency(data.volume.total)} Vol</span>
         </div>
      </div>
    );
  };

  return (
    <div className="ngx-bar-wrapper">
        <div className="ngx-bar-container">
            
            <div className="bar-column widget-column">
                <div className="widget-transform-wrapper">
                    <NGXWidget theme="dark" />
                </div>
            </div>

            <div className="divider"></div>

            <div className="bar-column">
                <MarketCapSection />
            </div>

            <div className="divider"></div>

            <div className="bar-column">
                <VolumeSection />
            </div>

        </div>

        <style jsx>{`
            .ngx-bar-wrapper {
                width: 100%;
                background: ${bgColor}; 
                padding: 0;
                display: flex;
                justify-content: center;
                border-bottom: 1px solid ${borderColor};
            }
            .ngx-bar-container {
                display: flex;
                width: 100%;
                max-width: 1400px;
                height: 90px;
                background: ${bgColor};
                box-sizing: border-box;
                overflow: hidden;
            }
            
            .bar-column {
                flex: 1;
                width: 33.33%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }

            .widget-transform-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                transform-origin: center;
            }

            .divider {
                width: 1px;
                height: 60%;
                margin-top: auto;
                margin-bottom: auto;
                background-color: ${dividerColor};
                flex-shrink: 0;
            }

            .data-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
            }

            .label-text {
                font-size: 11px;
                color: ${subTextColor};
                font-weight: 500;
                letter-spacing: 0.8px;
                text-transform: uppercase;
                white-space: nowrap;
            }
            .label-row {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .live-dot {
                font-size: 8px;
                color: ${greenColor};
                animation: blink 2s infinite;
            }

            .value-row {
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
            }

            .big-value {
                font-size: 22px;
                color: ${textColor};
                font-weight: 600;
                letter-spacing: -0.5px;
            }
            .small-value {
                font-size: 12px;
                color: ${textColor};
                font-weight: 500;
            }

            .progress-bar-container {
                width: 60%;
                height: 4px;
                background: #3c4043;
                border-radius: 2px;
                margin-top: 8px;
                margin-bottom: 4px;
                overflow: hidden;
            }
            .progress-fill { height: 100%; border-radius: 2px; }

            .small-change {
                font-size: 11px;
                font-weight: 600;
            }

            .chart-row {
                display: flex;
                align-items: flex-end;
                gap: 6px;
                height: 28px;
                width: 65%;
                justify-content: center;
                margin-top: 2px;
            }
            .bar-stick { width: 14px; border-radius: 2px; transition: height 0.5s; }

            .loading-pulse {
                width: 100%; height: 100%;
                background: rgba(255,255,255,0.05);
                animation: pulse 1.5s infinite;
            }

            @media (min-width: 769px) {
                .widget-transform-wrapper {
                    transform: scale(1.4);
                }
            }

            @media (max-width: 768px) {
                .ngx-bar-container { height: 75px; }
                
                .widget-transform-wrapper {
                    transform: scale(0.75);
                }
                
                .bar-column { padding: 0 2px; }
                
                .big-value { font-size: 16px; }
                .label-text { font-size: 9px; }
                .small-value { font-size: 10px; }
                .small-change { font-size: 9px; }
                
                .chart-row { width: 85%; height: 22px; gap: 3px; }
                .bar-stick { width: 8px; }
                .progress-bar-container { width: 70%; height: 3px; margin-top: 4px; }
                .divider { height: 40%; }
            }

            @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
            @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        `}</style>
    </div>
  );
}
