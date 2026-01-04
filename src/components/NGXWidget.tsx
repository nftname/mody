'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

interface NGXData {
  score: number;
  status: string;
  change24h: number;
}

interface WidgetProps {
  type?: 'sentiment' | 'cap' | 'assets';
  title?: string;
  subtitle?: string;
  theme?: 'dark' | 'light';
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

export default function NGXWidget({ 
  title = 'NGX Sentiment', 
  subtitle = 'Market Mood',
  theme 
}: WidgetProps) {
  const [data, setData] = useState<NGXData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const glassStyle = {
    background: 'rgba(11, 14, 17, 0.4)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  };

  const NEON_GREEN = '#0ecb81';

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const res = await fetch('/api/ngx'); 
        if (!res.ok) throw new Error('Fetch failed');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000); 
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }
  };

  if (!mounted || !data) return null; 

  const TICKER_GREEN = '#0ecb81';
  const TICKER_RED = '#f6465d';
  const needleRotation = ((data.score / 100) * 180) - 90;

  const currentStatus = (() => {
      if (data.score < 20) return { color: '#e53935', text: 'S.SELL' };
      if (data.score < 40) return { color: '#fb8c00', text: 'SELL' };        
      if (data.score < 60) return { color: '#fdd835', text: 'NEUT' };     
      if (data.score < 80) return { color: '#7cb342', text: 'BUY' };         
      return { color: TICKER_GREEN, text: 'S.BUY' };                  
  })();

  const changeColor = data.change24h >= 0 ? TICKER_GREEN : TICKER_RED;
  const scoreStr = data.score.toFixed(1);
  const [scoreInt, scoreDec] = scoreStr.split('.');

  const GaugeSVG = () => {
      const radius = 80;
      const stroke = 22;
      
      return (
        <svg viewBox="-90 -20 180 110" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" overflow="visible">
            <path d={describeArc(0, 80, radius, 0, 36)} fill="none" stroke="#e53935" strokeWidth={stroke} opacity="0.9" 
                  onMouseEnter={() => setHoveredInfo('Strong Sell Zone (0-20)')} onMouseLeave={() => setHoveredInfo(null)} style={{cursor: 'help'}} />
            <path d={describeArc(0, 80, radius, 36, 72)} fill="none" stroke="#fb8c00" strokeWidth={stroke} opacity="0.9" 
                  onMouseEnter={() => setHoveredInfo('Sell Zone (20-40)')} onMouseLeave={() => setHoveredInfo(null)} style={{cursor: 'help'}} />
            <path d={describeArc(0, 80, radius, 72, 108)} fill="none" stroke="#fdd835" strokeWidth={stroke} opacity="0.9" 
                  onMouseEnter={() => setHoveredInfo('Neutral Zone (40-60)')} onMouseLeave={() => setHoveredInfo(null)} style={{cursor: 'help'}} />
            <path d={describeArc(0, 80, radius, 108, 144)} fill="none" stroke="#7cb342" strokeWidth={stroke} opacity="0.9" 
                  onMouseEnter={() => setHoveredInfo('Buy Zone (60-80)')} onMouseLeave={() => setHoveredInfo(null)} style={{cursor: 'help'}} />
            <path d={describeArc(0, 80, radius, 144, 180)} fill="none" stroke={TICKER_GREEN} strokeWidth={stroke} opacity="0.9" 
                  onMouseEnter={() => setHoveredInfo('Strong Buy Zone (80-100)')} onMouseLeave={() => setHoveredInfo(null)} style={{cursor: 'help'}} />

            <line x1="0" y1="80" x2="0" y2="10" stroke="#FFFFFF" strokeWidth="5" 
                  transform={`rotate(${needleRotation}, 0, 80)`} 
                  style={{ transition: 'transform 1.5s cubic-bezier(0.23, 1, 0.32, 1)', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }} />
            <circle cx="0" cy="80" r="10" fill="#FFFFFF" />
        </svg>
      );
  };

  return (
    <div style={{ width: '100%', maxWidth: '240px', height: '82px', position: 'relative' }} ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredInfo(null)}>
        <Link href="/ngx" className="text-decoration-none" style={{ cursor: 'pointer', display: 'block', height: '100%' }}>
        
        <div className="widget-glass d-flex align-items-center justify-content-between px-3 py-2 position-relative overflow-hidden"
            style={{
                ...glassStyle,
                height: '100%',
                width: '100%',
                borderRadius: '8px',
            }}>
            
            <div className="d-flex flex-column justify-content-center h-100 flex-shrink-0" style={{ zIndex: 2, maxWidth: '55%' }}>
                <div className="d-flex align-items-center gap-1 mb-0" 
                     onMouseEnter={() => setHoveredInfo('Composite Index Name')} onMouseLeave={() => setHoveredInfo(null)}>
                    <span className="fw-bold text-nowrap widget-title">{title}</span>
                    <span className="pulse-dot"></span>
                </div>
                <div className="widget-subtitle mb-1" 
                     onMouseEnter={() => setHoveredInfo('Indicator Type')} onMouseLeave={() => setHoveredInfo(null)}>
                    {subtitle}
                </div>
                
                <div>
                    <div className="d-flex align-items-baseline gap-1" style={{ lineHeight: '1' }}
                         onMouseEnter={() => setHoveredInfo(`Live Score: ${data.score}`)} onMouseLeave={() => setHoveredInfo(null)}>
                        <div className="fw-bold widget-score">
                            {scoreInt}<span style={{ fontSize: '0.6em', opacity: 0.8 }}>.{scoreDec}</span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-1 mt-1"
                         onMouseEnter={() => setHoveredInfo(`24h Change: ${data.change24h}%`)} onMouseLeave={() => setHoveredInfo(null)}>
                        <span className="fw-bold widget-change" style={{ color: changeColor }}>
                            {data.change24h >= 0 ? '▲' : '▼'}
                        </span>
                        <span className="fw-bold widget-status" style={{ color: currentStatus.color }}>
                            {currentStatus.text}
                        </span>
                    </div>
                </div>
            </div>

            <div className="d-flex align-items-center justify-content-center flex-grow-1" style={{ zIndex: 1, height: '100%', marginLeft: '10px' }}>
                <div style={{ width: '100%', height: '85%', position: 'relative', transform: 'translateY(5px)' }}>
                    <GaugeSVG />
                </div>
            </div>
        </div>
        </Link>

        {hoveredInfo && (
            <div className="ngx-tooltip" style={{ top: mousePos.y + 15, left: mousePos.x + 15 }}>
                {hoveredInfo}
            </div>
        )}

        <style jsx global>{`
            @media (prefers-color-scheme: light) {
                .widget-glass {
                    background: rgba(255, 255, 255, 0.6) !important;
                    border: 1px solid rgba(0, 0, 0, 0.05) !important;
                }
                .widget-title { color: #0A192F !important; }
                .widget-subtitle { color: #555 !important; }
                .widget-score { color: #0A192F !important; }
                .ngx-tooltip {
                    background: rgba(255, 255, 255, 0.95);
                    color: #000;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    border: 1px solid #eee;
                }
            }

            @media (prefers-color-scheme: dark) {
                .widget-glass {
                    background: rgba(11, 14, 17, 0.4) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                }
                .widget-title { color: #FCD535 !important; }
                .widget-subtitle { color: #848E9C !important; }
                .widget-score { color: #FFFFFF !important; }
                .ngx-tooltip {
                    background: rgba(11, 14, 17, 0.95);
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                    border: 1px solid rgba(255,255,255,0.1);
                }
            }

            .widget-title { font-size: 11px; letter-spacing: 0.3px; }
            .widget-subtitle { font-size: 8px; text-transform: uppercase; }
            .widget-score { font-size: 24px; }
            .widget-change { font-size: 9px; }
            .widget-status { font-size: 9px; letter-spacing: 0.3px; text-transform: uppercase; }

            .pulse-dot {
                width: 4px; height: 4px; background-color: #0ecb81; border-radius: 50%;
                box-shadow: 0 0 4px #0ecb81;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; }
            }

            .ngx-tooltip {
                position: absolute;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 500;
                pointer-events: none;
                z-index: 9999;
                white-space: nowrap;
                transform: translateZ(0);
            }
        `}</style>
    </div>
  );
}
