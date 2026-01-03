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

  const bgColor = isLight ? '#FFFFFF' : '#0b0e11';
  const borderColor = isLight ? '#DEE2E6' : '#2b3139';
  const textColor = isLight ? '#0A192F' : '#E6E8EA';
  const subTextColor = isLight ? '#6c757d' : '#848E9C';
  const dividerColor = isLight ? '#E9ECEF' : '#2b3139';
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

  const MarketCapSection = () => {
    if (!data) return <div className="loading-pulse" />;
    const isPos = data.marketCap.change >= 0;
    
    return (
      <div className="data-content">
        <div className="label-text mb-1">NFT MARKET CAP</div>
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
         <div className="label-row mb-1">
             <span className="label-text">BUYING PRESSURE</span>
             <span className="live-dot">●</span>
         </div>
         <div className="chart-row">
            {bars.map((val, i) => (
                <div key={i} className="bar-stick" style={{
                    height: `${Math.max(15, Math.min(100, val))}%`,
                    backgroundColor: i === 3 ? textColor : (val > 40 ? greenColor : '#6c757d')
                }}></div>
            ))}
         </div>
         <div className="value-row mt-1">
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
                    <NGXWidget theme={theme} />
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
                background: ${isLight ? '#F8F9FA' : '#000'};
                padding: 0;
                display: flex;
                justify-content: center;
            }
            .ngx-bar-container {
                display: flex;
                width: 100%;
                max-width: 1400px;
                height: 80px;
                background: ${bgColor};
                border-bottom: 1px solid ${borderColor};
                border-top: 1px solid ${borderColor};
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
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                white-space: nowrap;
            }
            .label-row {
                display: flex;
                align-items: center;
                gap: 4px;
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
                font-size: 18px;
                color: ${textColor};
                font-weight: 800;
            }
            .small-value {
                font-size: 11px;
                color: ${textColor};
                font-weight: 600;
            }

            .progress-bar-container {
                width: 70%;
                height: 4px;
                background: ${isLight ? '#E9ECEF' : '#333'};
                border-radius: 2px;
                margin-top: 5px;
                margin-bottom: 3px;
                overflow: hidden;
            }
            .progress-fill { height: 100%; border-radius: 2px; }

            .small-change {
                font-size: 10px;
                font-weight: 700;
            }

            .chart-row {
                display: flex;
                align-items: flex-end;
                gap: 4px;
                height: 25px;
                width: 70%;
                justify-content: center;
                margin-top: 2px;
            }
            .bar-stick { width: 14px; border-radius: 1px; transition: height 0.5s; }

            .loading-pulse {
                width: 100%; height: 100%;
                background: rgba(128,128,128,0.05);
                animation: pulse 1.5s infinite;
            }

            @media (min-width: 769px) {
                .widget-transform-wrapper {
                    transform: scale(1.35);
                }
            }

            @media (max-width: 768px) {
                .ngx-bar-container { height: 65px; }
                
                .widget-transform-wrapper {
                    transform: scale(0.65);
                }
                
                .bar-column { padding: 0 2px; }
                
                .big-value { font-size: 13px; }
                .label-text { font-size: 8px; }
                .small-value { font-size: 9px; }
                .small-change { font-size: 8px; }
                
                .chart-row { width: 85%; height: 20px; gap: 2px; }
                .bar-stick { width: 8px; }
                .progress-bar-container { width: 80%; height: 3px; margin-top: 3px; }
                .divider { height: 40%; }
            }

            @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
            @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        `}</style>
    </div>
  );
}
