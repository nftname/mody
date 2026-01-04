'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

interface NGXData {
  score: number;
  status: string;
  change24h: number;
  lastUpdate: string;
}

interface WidgetProps {
  theme?: 'dark' | 'light';
  title?: string;
  subtitle?: string;
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
  theme = 'dark', 
  title = 'NGX NFTs', 
  subtitle = 'Global Index' 
}: WidgetProps) {
  const [data, setData] = useState<NGXData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';
  
  const glassStyle = {
    background: isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(11, 14, 17, 0.4)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: isLight ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: isLight ? '0 4px 6px rgba(0, 0, 0, 0.05)' : '0 4px 6px rgba(0, 0, 0, 0.2)',
  };

  const mainTextColor = isLight ? '#0A192F' : '#ffffff'; 
  const subTextColor = isLight ? '#495057' : '#848E9C';
  const titleColor = isLight ? '#0A192F' : '#FCD535'; 
  const NEON_GREEN = '#0ecb81';

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const res = await fetch('/api/ngx');
        if (!res.ok) throw new Error('Failed to fetch data');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching NGX data:', error);
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
      if (data.score < 20) return { color: '#e53935', text: 'STRONG SELL' }; 
      if (data.score < 40) return { color: '#fb8c00', text: 'SELL' };        
      if (data.score < 60) return { color: '#fdd835', text: 'NEUTRAL' };     
      if (data.score < 80) return { color: '#7cb342', text: 'BUY' };         
      return { color: TICKER_GREEN, text: 'STRONG BUY' };                  
  })();

  const changeColor = data.change24h >= 0 ? TICKER_GREEN : TICKER_RED;
  const scoreStr = data.score.toFixed(1);
  const [scoreInt, scoreDec] = scoreStr.split('.');

  const GaugeSVG = () => {
      const radius = 80;
      const stroke = 20;
      
      return (
        <svg viewBox="-90 -20 180 110" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" overflow="visible">
            <path d={describeArc(0, 80, radius, 0, 36)} fill="none" stroke="#e53935" strokeWidth={stroke} 
                  onMouseEnter={() => setHoveredInfo('Strong Sell Zone (0-20)')} onMouseLeave={() => setHoveredInfo(null)} style={{cursor: 'help'}} />
            <path d={describeArc(0, 80, radius, 36, 72)} fill="none" stroke="#fb8c00" strokeWidth={stroke} 
                  onMouseEnter={() => setHoveredInfo('Sell Zone (20-40)')} onMouseLeave={() => setHoveredInfo(null)} style={{cursor: 'help'}} />
            <path d={describeArc(0, 80, radius, 72, 108)} fill="none" stroke="#fdd835" strokeWidth={stroke} 
                  onMouseEnter={() => setHoveredInfo('Neutral Zone (40-60)')} onMouseLeave={() => setHoveredInfo(null)} style={{cursor: 'help'}} />
            <path d={describeArc(0, 80, radius, 108, 144)} fill="none" stroke="#7cb342" strokeWidth={stroke} 
                  onMouseEnter={() => setHoveredInfo('Buy Zone (60-80)')} onMouseLeave={() => setHoveredInfo(null)} style={{cursor: 'help'}} />
            <path d={describeArc(0, 80, radius, 144, 180)} fill="none" stroke={TICKER_GREEN} strokeWidth={stroke} 
                  onMouseEnter={() => setHoveredInfo('Strong Buy Zone (80-100)')} onMouseLeave={() => setHoveredInfo(null)} style={{cursor: 'help'}} />

            <g fill={isLight ? "#0A192F" : "rgba(255,255,255,0.8)"} fontSize="10" fontFamily="sans-serif" fontWeight="700">
                <text x="-95" y="85" textAnchor="middle">0</text>
                <text x="-70" y="20" textAnchor="middle">20</text>
                <text x="0" y="-8" textAnchor="middle">50</text>
                <text x="70" y="20" textAnchor="middle">80</text>
                <text x="95" y="85" textAnchor="middle">100</text>
            </g>

            <line x1="0" y1="80" x2="0" y2="10" stroke={isLight ? "#0A192F" : "#FFFFFF"} strokeWidth="4" 
                  transform={`rotate(${needleRotation}, 0, 80)`} 
                  style={{ transition: 'transform 1.5s cubic-bezier(0.23, 1, 0.32, 1)', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }} />
            
            <circle cx="0" cy="80" r="12" fill={isLight ? "#0A192F" : "#fff"} stroke={isLight ? "#fff" : "#2b3139"} strokeWidth="2" />
        </svg>
      );
  };

  return (
    <div className="ngx-widget-container" ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredInfo(null)}>
    <Link href="/ngx" className="text-decoration-none" style={{ cursor: 'pointer', display: 'block' }}>
      
      <div className="d-flex align-items-center justify-content-between px-3 py-2 rounded-3 position-relative overflow-hidden"
           style={{
             ...glassStyle,
             height: '82px',
             width: '100%'
           }}>
        
        <div className="d-flex flex-column justify-content-center h-100 flex-shrink-0" style={{ zIndex: 2 }}>
            <div className="mb-1">
                <div className="d-flex align-items-center gap-2"
                     onMouseEnter={() => setHoveredInfo('Index Name')} onMouseLeave={() => setHoveredInfo(null)}>
                    <span className="fw-bold text-nowrap" style={{ color: titleColor, fontSize: '9px', letterSpacing: '0.5px' }}>{title}</span>
                    
                    <span className="badge pulse-neon" 
                          style={{ 
                              fontSize:'6px', 
                              padding:'2px 4px', 
                              color: NEON_GREEN, 
                              border: 'none', 
                              backgroundColor: 'rgba(14, 203, 129, 0.1)' 
                          }}>LIVE</span>
                </div>
                <div style={{ fontSize: '7px', color: subTextColor, textTransform: 'uppercase' }}
                     onMouseEnter={() => setHoveredInfo('Index Type')} onMouseLeave={() => setHoveredInfo(null)}>
                    {subtitle}
                </div>
            </div>
            
            <div>
                <div className="d-flex align-items-end gap-1 mb-1">
                    <div className="fw-bold lh-1" style={{ fontSize: '27px', color: mainTextColor, textShadow: isLight ? 'none' : `0 0 20px ${currentStatus.color}30` }}
                         onMouseEnter={() => setHoveredInfo(`Current Score: ${data.score}`)} onMouseLeave={() => setHoveredInfo(null)}>
                        {scoreInt}<span style={{ fontSize: '0.5em', opacity: 0.8 }}>.{scoreDec}</span>
                    </div>
                    <div className="fw-bold d-flex align-items-center gap-1 mb-2 ms-2" style={{ fontSize: '9px', color: changeColor }}
                         onMouseEnter={() => setHoveredInfo(`24h Change: ${data.change24h}%`)} onMouseLeave={() => setHoveredInfo(null)}>
                        {data.change24h >= 0 ? '▲' : '▼'} {Math.abs(data.change24h)}%
                    </div>
                </div>
                <div className="fw-bold text-uppercase" style={{ color: currentStatus.color, fontSize: '8px', letterSpacing: '0.5px' }}
                     onMouseEnter={() => setHoveredInfo('Market Sentiment')} onMouseLeave={() => setHoveredInfo(null)}>
                    {currentStatus.text}
                </div>
            </div>
        </div>

        <div className="d-flex align-items-center justify-content-center flex-grow-1 ms-2" style={{ zIndex: 1 }}>
            <div style={{ width: '100%', height: '63px', position: 'relative' }}>
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

    <style jsx>{`
        .ngx-widget-container {
            position: relative;
            width: 100%;
            max-width: 240px;
            margin-left: auto;
            margin-right: auto;
        }

        @media (min-width: 992px) {
            .ngx-widget-container {
                margin-left: auto;
                margin-right: 0;
            }
        }

        .pulse-neon {
            animation: pulse-neon-green 2s infinite ease-in-out;
        }
        @keyframes pulse-neon-green {
            0% { text-shadow: 0 0 2px rgba(14, 203, 129, 0.1); opacity: 1; }
            50% { text-shadow: 0 0 8px rgba(14, 203, 129, 0.6); opacity: 0.8; }
            100% { text-shadow: 0 0 2px rgba(14, 203, 129, 0.1); opacity: 1; }
        }

        .ngx-tooltip {
            position: absolute;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
            pointer-events: none;
            z-index: 100;
            white-space: nowrap;
            background: ${isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(11, 14, 17, 0.95)'};
            color: ${isLight ? '#000' : '#fff'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 1px solid ${isLight ? '#eee' : 'rgba(255,255,255,0.1)'};
        }
    `}</style>
    </div>
  );
}
