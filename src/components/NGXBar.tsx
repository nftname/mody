'use client';
import { useEffect, useState } from 'react';

interface NGXData {
  score: number;
  status: string;
  change24h: number;
  marketCap: { total: number; change: number };
  volume: { total: number; intensity: number; sectors: number[] };
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
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

  const GaugeSection = () => {
    if (!data) return <div className="loading-pulse" />;
    
    const radius = 36; 
    const stroke = 8;
    const needleRotation = ((data.score / 100) * 180) - 90;
    const isPos = data.change24h >= 0;

    return (
        <div className="section-content">
            <div className="text-area">
                <div className="label-row">
                    <span className="label-text">NGX INDEX</span>
                    <span className="live-badge">● Live</span>
                </div>
                <div className="value-row">
                    <span className="big-value">{data.score.toFixed(1)}</span>
                    <span className="small-change" style={{ color: isPos ? greenColor : redColor }}>
                        {isPos ? '▲' : '▼'} {Math.abs(data.change24h)}%
                    </span>
                </div>
            </div>
            
            <div className="gauge-area">
                <svg viewBox="-45 -5 90 50" width="100%" height="100%">
                    <path d={describeArc(0, 36, radius, 0, 36)} fill="none" stroke="#e53935" strokeWidth={stroke} />
                    <path d={describeArc(0, 36, radius, 36, 72)} fill="none" stroke="#fb8c00" strokeWidth={stroke} />
                    <path d={describeArc(0, 36, radius, 72, 108)} fill="none" stroke="#fdd835" strokeWidth={stroke} />
                    <path d={describeArc(0, 36, radius, 108, 144)} fill="none" stroke="#7cb342" strokeWidth={stroke} />
                    <path d={describeArc(0, 36, radius, 144, 180)} fill="none" stroke={greenColor} strokeWidth={stroke} />
                    <line x1="0" y1="36" x2="0" y2="5" stroke={textColor} strokeWidth="3" transform={`rotate(${needleRotation}, 0, 36)`} style={{ transition: 'all 1s' }} />
                    <circle cx="0" cy="36" r="4" fill={textColor} />
                </svg>
            </div>
        </div>
    );
  };

  const MarketCapSection = () => {
    if (!data) return <div className="loading-pulse" />;
    const isPos = data.marketCap.change >= 0;
    
    return (
      <div className="section-content center-aligned">
        <div className="label-text mb-1">NFT MARKET CAP</div>
        <div className="value-row centered">
            <span className="big-value">{formatCurrency(data.marketCap.total)}</span>
        </div>
        <div className="progress-bar-container">
            <div className="progress-fill" style={{ 
                width: `${Math.min(100, Math.abs(data.marketCap.change) * 20)}%`, 
                backgroundColor: isPos ? greenColor : redColor 
            }}></div>
        </div>
        <span className="small-change mt-1" style={{ color: isPos ? greenColor : redColor }}>
             {isPos ? '+' : ''}{data.marketCap.change.toFixed(2)}%
        </span>
      </div>
    );
  };

  const VolumeSection = () => {
    if (!data) return <div className="loading-pulse" />;
    const bars = data.volume.sectors || [20, 20, 20, 20];
    
    return (
      <div className="section-content center-aligned">
         <div className="label-text mb-1">BUYING PRESSURE</div>
         <div className="chart-row">
            {bars.map((val, i) => (
                <div key={i} className="bar-stick" style={{
                    height: `${Math.max(20, Math.min(100, val))}%`,
                    backgroundColor: i === 3 ? textColor : (val > 40 ? greenColor : '#555')
                }}></div>
            ))}
         </div>
         <div className="value-row centered mt-1">
            <span className="small-value">{formatCurrency(data.volume.total)} Vol</span>
         </div>
      </div>
    );
  };

  return (
    <div className="ngx-bar-wrapper">
        <div className="ngx-bar-container">
            <div className="bar-column"><GaugeSection /></div>
            <div className="divider"></div>
            <div className="bar-column"><MarketCapSection /></div>
            <div className="divider"></div>
            <div className="bar-column"><VolumeSection /></div>
        </div>

        <style jsx>{`
            .ngx-bar-wrapper {
                width: 100%;
                background: ${isLight ? '#F8F9FA' : '#000'};
                padding: 0;
            }
            .ngx-bar-container {
                display: flex;
                width: 100%;
                max-width: 1400px;
                height: 85px;
                margin: 0 auto;
                background: ${bgColor};
                border-bottom: 1px solid ${borderColor};
            }
            .bar-column {
                flex: 1;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                padding: 0 10px;
                min-width: 0; 
            }
            .divider {
                width: 1px;
                height: 50%;
                margin-top: auto;
                margin-bottom: auto;
                background-color: ${dividerColor};
            }
            .section-content {
                display: flex;
                width: 100%;
                align-items: center;
                justify-content: space-between;
            }
            .section-content.center-aligned {
                flex-direction: column;
                justify-content: center;
            }
            
            /* Text Styles */
            .label-text {
                font-size: 11px;
                color: ${subTextColor};
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                white-space: nowrap;
            }
            .live-badge {
                font-size: 9px;
                color: ${greenColor};
                margin-left: 6px;
                animation: blink 2s infinite;
            }
            .big-value {
                font-size: 20px;
                color: ${textColor};
                font-weight: 800;
                line-height: 1.1;
            }
            .small-value {
                font-size: 12px;
                color: ${textColor};
                font-weight: 600;
            }
            .small-change {
                font-size: 11px;
                font-weight: 700;
                margin-left: 6px;
            }
            
            /* Layout Helpers */
            .text-area { display: flex; flex-direction: column; justify-content: center; }
            .gauge-area { width: 70px; height: 45px; margin-left: auto; }
            .label-row { display: flex; align-items: center; margin-bottom: 4px; }
            .value-row { display: flex; align-items: baseline; }
            .value-row.centered { justify-content: center; }
            
            /* Visual Elements */
            .progress-bar-container {
                width: 60%;
                height: 4px;
                background: ${isLight ? '#E9ECEF' : '#333'};
                border-radius: 2px;
                margin-top: 4px;
                overflow: hidden;
            }
            .progress-fill { height: 100%; border-radius: 2px; }
            
            .chart-row {
                display: flex;
                align-items: flex-end;
                gap: 4px;
                height: 25px;
                width: 60%;
                justify-content: center;
            }
            .bar-stick { width: 12px; border-radius: 1px; transition: height 0.5s; }

            .loading-pulse {
                width: 60%; height: 20px;
                background: rgba(128,128,128,0.1);
                animation: pulse 1.5s infinite;
                border-radius: 4px;
            }

            /* Mobile Adjustments */
            @media (max-width: 768px) {
                .ngx-bar-container { height: 70px; }
                .gauge-area { width: 50px; height: 35px; }
                .big-value { font-size: 15px; }
                .label-text { font-size: 9px; }
                .small-change { font-size: 9px; margin-left: 2px; }
                .bar-column { padding: 0 4px; }
                .bar-stick { width: 8px; }
            }

            @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
            @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        `}</style>
    </div>
  );
}
