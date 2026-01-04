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
  title = 'NGX NFTs' 
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
    boxShadow: 'none', // لا يوجد شادو نهائياً
  };

  const mainTextColor = isLight ? '#0A192F' : '#ffffff'; 
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
      const stroke = 16; 
      
      return (
        <svg viewBox="-90 -20 180 110" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" overflow="visible">
            <path d={describeArc(0, 80, radius, 0, 36)} fill="none" stroke="#e53935" strokeWidth={stroke} />
            <path d={describeArc(0, 80, radius, 36, 72)} fill="none" stroke="#fb8c00" strokeWidth={stroke} />
            <path d={describeArc(0, 80, radius, 72, 108)} fill="none" stroke="#fdd835" strokeWidth={stroke} />
            <path d={describeArc(0, 80, radius, 108, 144)} fill="none" stroke="#7cb342" strokeWidth={stroke} />
            <path d={describeArc(0, 80, radius, 144, 180)} fill="none" stroke={TICKER_GREEN} strokeWidth={stroke} />

            <g fill={isLight ? "#0A192F" : "rgba(255,255,255,0.8)"} fontSize="10" fontFamily="sans-serif" fontWeight="700">
                <text x="-95" y="85" textAnchor="middle">0</text>
                <text x="-70" y="20" textAnchor="middle">20</text>
                <text x="0" y="-8" textAnchor="middle">50</text>
                <text x="70" y="20" textAnchor="middle">80</text>
                <text x="95" y="85" textAnchor="middle">100</text>
            </g>

            <g fontSize="8" fontFamily="sans-serif" fontWeight="700" opacity="0.9">
                <text x="-55" y="55" fill="#e53935" textAnchor="middle">SELL</text>
                <text x="0" y="30" fill="#fdd835" textAnchor="middle">NEUTRAL</text>
                <text x="55" y="55" fill={TICKER_GREEN} textAnchor="middle">BUY</text>
            </g>

            <line x1="0" y1="80" x2="0" y2="10" stroke={isLight ? "#0A192F" : "#FFFFFF"} strokeWidth="3" 
                  transform={`rotate(${needleRotation}, 0, 80)`} 
                  style={{ transition: 'transform 1.5s cubic-bezier(0.23, 1, 0.32, 1)', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }} />
            
            <circle cx="0" cy="80" r="10" fill={isLight ? "#0A192F" : "#fff"} stroke={isLight ? "#fff" : "#2b3139"} strokeWidth="2" />
        </svg>
      );
  };

  return (
    <div className="ngx-widget-container" ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredInfo(null)}>
    <Link href="/ngx" className="text-decoration-none" style={{ cursor: 'pointer', display: 'block' }}>
      
      <div className="glass-container d-flex flex-column justify-content-between rounded-3 position-relative overflow-hidden"
           style={{ ...glassStyle }}>
        
        {/* Header Row */}
        <div className="d-flex align-items-center justify-content-between w-100" style={{ zIndex: 2 }}>
            <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-nowrap title-text" style={{ color: titleColor }}>{title}</span>
                
                {/* Mobile Only: Percentage moved to header */}
                <div className="mobile-percentage fw-bold d-flex align-items-center" style={{ fontSize: '9px', color: changeColor, display: 'none' }}>
                    {data.change24h >= 0 ? '▲' : '▼'} {Math.abs(data.change24h)}%
                </div>
            </div>
            
            <span className="badge pulse-neon" 
                    style={{ 
                        fontSize:'6px', 
                        padding:'2px 4px', 
                        color: NEON_GREEN, 
                        border: 'none', 
                        backgroundColor: 'rgba(14, 203, 129, 0.1)' 
                    }}>LIVE</span>
        </div>

        {/* Content Row */}
        <div className="content-row d-flex align-items-center w-100" style={{ height: '100%' }}>
            
            {/* Left Side: Number & Info */}
            <div className="text-block d-flex flex-column justify-content-center" style={{ zIndex: 2 }}>
                <div className="d-flex align-items-end gap-2 mb-1 mobile-text-row">
                    <div className="fw-bold lh-1 main-score" style={{ color: mainTextColor, textShadow: isLight ? 'none' : `0 0 20px ${currentStatus.color}30` }}>
                        {scoreInt}<span style={{ fontSize: '0.5em', opacity: 0.8 }}>.{scoreDec}</span>
                    </div>
                    {/* Desktop Only: Percentage stays here */}
                    <div className="desktop-percentage fw-bold d-flex align-items-center mb-1" style={{ fontSize: '9px', color: changeColor }}>
                        {data.change24h >= 0 ? '▲' : '▼'} {Math.abs(data.change24h)}%
                    </div>
                </div>
                <div className="status-text fw-bold text-uppercase" style={{ color: currentStatus.color, letterSpacing: '0.5px' }}>
                    {currentStatus.text}
                </div>
            </div>

            {/* Right Side: Gauge */}
            <div className="gauge-block d-flex align-items-center justify-content-center" style={{ zIndex: 1 }}>
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <GaugeSVG />
                </div>
            </div>

        </div>
      </div>
    </Link>

    <style jsx>{`
        /* --- GENERAL & DESKTOP STYLES (Default) --- */
        .ngx-widget-container {
            position: relative;
            width: 100%;
            max-width: 310px; /* Desktop width */
            margin-left: auto;
            margin-right: auto;
        }
        .glass-container {
            height: 82px;
            /* Desktop Shift: 46px padding-left */
            padding-left: 46px; 
            padding-right: 15px;
            padding-top: 8px;
            padding-bottom: 8px;
        }
        .title-text {
            font-size: 9px;
            letter-spacing: 0.5px;
        }
        .main-score {
            font-size: 24px;
        }
        .status-text {
            font-size: 8px;
            margin-top: 2px;
        }
        .gauge-block {
            width: 55%;
            height: 60px;
        }
        .desktop-percentage {
            display: flex;
        }
        .mobile-percentage {
            display: none !important;
        }

        /* --- MOBILE STYLES (Compact Mode) --- */
        @media (max-width: 768px) {
            .glass-container {
                /* Reset Desktop Padding */
                padding-left: 8px !important;
                padding-right: 8px !important;
                /* Compressed Height */
                height: 70px !important; 
            }
            
            .content-row {
                /* GAP: 1px (Tight packing) */
                gap: 1px !important; 
                justify-content: space-between;
            }

            .main-score {
                font-size: 20px !important; /* Slightly smaller for mobile */
            }

            /* Move Percentage to Header on Mobile */
            .desktop-percentage {
                display: none !important;
            }
            .mobile-percentage {
                display: flex !important;
            }

            /* Adjust Gauge Size for Mobile */
            .gauge-block {
                width: 70px !important; 
                height: 45px !important;
            }
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
    `}</style>
    </div>
  );
}
