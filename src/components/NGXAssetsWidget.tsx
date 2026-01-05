'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

interface AssetsData {
  sectors: {
    label: string;
    value: number; 
    color: string;
    volume: string;
  }[];
  marketStats: {
    topGainer: { name: string; change: number };
    topLoser: { name: string; change: number };
  };
}

interface WidgetProps {
  theme?: 'dark' | 'light';
  title?: string;
}

export default function NGXAssetsWidget({ 
  theme = 'dark', 
  title = 'NGX Assets'
}: WidgetProps) {
  const [data, setData] = useState<AssetsData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';
  
  const glassStyle = {
    background: isLight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(11, 14, 17, 0.2)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: isLight ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: 'none', 
  };

  const titleColor = isLight ? '#0A192F' : '#FCD535'; 
  const NEON_GREEN = '#0ecb81';
  const TICKER_RED = '#f6465d';
  const SUB_TEXT = '#B0B0B0';

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const res = await fetch('/api/ngx-assets');
        if (!res.ok) throw new Error('Failed to fetch data');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching NGX Assets data:', error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000); 
    
    const tickerInterval = setInterval(() => {
        setTickerIndex((prev) => (prev === 0 ? 1 : 0));
    }, 4000);

    return () => {
        clearInterval(interval);
        clearInterval(tickerInterval);
    };
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

  const gainer = data.marketStats.topGainer;
  const loser = data.marketStats.topLoser;

  return (
    <div className="ngx-widget-container" ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredInfo(null)}>
    <Link href="/ngx" className="text-decoration-none" style={{ cursor: 'pointer', display: 'block' }}>
      
      <div className="glass-container d-flex align-items-center justify-content-between rounded-3 position-relative overflow-hidden"
           style={{ ...glassStyle }}>
        
        {/* LEFT SIDE: Text Info */}
        <div className="d-flex flex-column justify-content-center h-100" style={{ width: '60%', paddingLeft: '2px' }}>
            
            {/* Title Row + LIVE Badge */}
            <div className="d-flex align-items-center gap-2 mb-1">
                <span className="fw-bold text-nowrap title-text" style={{ color: titleColor }}>{title}</span>
                <span className="badge pulse-neon" 
                      style={{ 
                          fontSize:'6px', 
                          padding:'2px 3px', 
                          color: NEON_GREEN, 
                          border: 'none', 
                          backgroundColor: 'rgba(14, 203, 129, 0.1)' 
                      }}>LIVE</span>
            </div>

            {/* Desktop: Stacked Stats */}
            <div className="desktop-stats d-flex flex-column gap-1">
                <div className="d-flex align-items-center gap-1 stat-row">
                    <span className="stat-label">{gainer.name}</span>
                    <span style={{ color: NEON_GREEN, fontSize: '9px', fontWeight: 'bold' }}>+{gainer.change}% ▲</span>
                </div>
                <div className="d-flex align-items-center gap-1 stat-row">
                    <span className="stat-label">{loser.name}</span>
                    <span style={{ color: TICKER_RED, fontSize: '9px', fontWeight: 'bold' }}>{loser.change}% ▼</span>
                </div>
            </div>

            {/* Mobile: Ticker Stats */}
            <div className="mobile-stats">
                <div className={`ticker-item ${tickerIndex === 0 ? 'active' : ''}`}>
                    <span className="stat-label">{gainer.name}</span> <span style={{ color: NEON_GREEN, fontSize: '8px' }}>+{gainer.change}% ▲</span>
                </div>
                <div className={`ticker-item ${tickerIndex === 1 ? 'active' : ''}`}>
                    <span className="stat-label">{loser.name}</span> <span style={{ color: TICKER_RED, fontSize: '8px' }}>{loser.change}% ▼</span>
                </div>
            </div>
        </div>

        {/* RIGHT SIDE: Bars */}
        <div className="d-flex align-items-end justify-content-between h-100 position-relative" style={{ width: '35%', paddingBottom: '4px' }}>
            
            {/* Phantom Grid */}
            <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-between" style={{ zIndex: 0, opacity: 0.1, pointerEvents: 'none' }}>
                <div style={{ borderBottom: `1px dashed ${isLight ? '#000' : '#fff'}`, height: '25%' }}></div>
                <div style={{ borderBottom: `1px dashed ${isLight ? '#000' : '#fff'}`, height: '25%' }}></div>
                <div style={{ borderBottom: `1px dashed ${isLight ? '#000' : '#fff'}`, height: '25%' }}></div>
            </div>

            {data.sectors.map((sector, index) => (
                <div key={index} className="d-flex flex-column align-items-center justify-content-end" 
                     style={{ width: '12%', height: '100%', zIndex: 1 }}
                     onMouseEnter={() => setHoveredInfo(`${sector.label}: ${sector.volume}`)} 
                     onMouseLeave={() => setHoveredInfo(null)}>
                    
                    {/* The Bar */}
                    <div style={{ 
                        width: '100%', 
                        height: `${Math.max(5, sector.value)}%`, 
                        background: 'linear-gradient(180deg, #FCD535 0%, #0ecb81 100%)', // Yellow-Green Gradient
                        borderRadius: '1px 1px 0 0',
                        opacity: sector.label === 'IMP' ? 1 : 0.85, 
                        transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}></div>
                    
                    {/* Label */}
                    <span className="mt-1 fw-bold text-uppercase bar-label" style={{ 
                        color: isLight ? '#0A192F' : '#8899A6',
                        opacity: 0.9,
                    }}>{sector.label}</span>
                </div>
            ))}
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
            max-width: 310px; 
            margin-left: auto;
            margin-right: auto;
        }

        .glass-container {
            height: 80px; 
            padding-left: 20px; 
            padding-right: 15px; 
            padding-top: 8px;
            padding-bottom: 8px;
        }

        .title-text {
            font-size: 11px; /* Increased 10% from 9px */
            letter-spacing: 0.5px;
        }

        .stat-label {
            font-size: 9px; /* Increased 10% from 7px */
            color: ${SUB_TEXT};
            text-transform: uppercase;
        }

        .desktop-stats {
            display: flex;
        }
        .mobile-stats {
            display: none;
        }
        
        .bar-label {
            font-size: 6px;
            letter-spacing: 0.2px;
        }

        /* --- MOBILE STYLES --- */
        @media (max-width: 768px) {
            .ngx-widget-container {
                min-width: 112px !important; 
                max-width: 112px !important;
                margin-left: 0 !important; 
                margin-right: auto !important;
            }

            .glass-container {
                padding: 4px !important; 
                height: 63px !important; 
                padding-right: 4px !important;
            }

            .title-text {
                font-size: 9px !important; /* Increased for mobile too */
            }

            .bar-label {
                font-size: 5px !important;
            }

            .desktop-stats {
                display: none !important;
            }
            .mobile-stats {
                display: block !important;
                position: relative;
                height: 12px;
                width: 100%;
                margin-top: 2px;
            }
        }

        @media (min-width: 992px) {
            .ngx-widget-container {
                margin-left: auto;
                margin-right: 0;
            }
        }

        .ticker-item {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
            white-space: nowrap;
        }
        .ticker-item.active {
            opacity: 1;
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
