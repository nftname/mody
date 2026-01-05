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

  const gainer = data.marketStats.topGainer;
  const loser = data.marketStats.topLoser;

  return (
    <div className="ngx-widget-container" ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredInfo(null)}>
    <Link href="/ngx" className="text-decoration-none" style={{ cursor: 'pointer', display: 'block' }}>
      
      <div className="glass-container d-flex align-items-center justify-content-between rounded-3 position-relative overflow-hidden"
           style={{ ...glassStyle }}>
        
        {/* LEFT SIDE: Text Info */}
        <div className="text-container d-flex flex-column justify-content-center h-100">
            
            {/* Title Row + LIVE Badge */}
            <div className="d-flex align-items-center gap-2 mb-1 title-row">
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

            {/* Stats (Desktop & Mobile Stacked) */}
            <div className="d-flex flex-column gap-0 stats-container">
                <div className="d-flex align-items-center gap-1 stat-row">
                    <span className="stat-label">{gainer.name}</span>
                    <span style={{ color: NEON_GREEN, fontWeight: 'bold' }} className="stat-val">+{gainer.change}% ▲</span>
                </div>
                <div className="d-flex align-items-center gap-1 stat-row">
                    <span className="stat-label">{loser.name}</span>
                    <span style={{ color: TICKER_RED, fontWeight: 'bold' }} className="stat-val">{loser.change}% ▼</span>
                </div>
            </div>
        </div>

        {/* RIGHT SIDE: Bars */}
        <div className="bars-container d-flex align-items-end justify-content-between h-100 position-relative">
            
            {/* Phantom Grid */}
            <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-between" style={{ zIndex: 0, opacity: 0.1, pointerEvents: 'none' }}>
                <div style={{ borderBottom: `1px dashed ${isLight ? '#000' : '#fff'}`, height: '25%' }}></div>
                <div style={{ borderBottom: `1px dashed ${isLight ? '#000' : '#fff'}`, height: '25%' }}></div>
                <div style={{ borderBottom: `1px dashed ${isLight ? '#000' : '#fff'}`, height: '25%' }}></div>
            </div>

            {data.sectors.map((sector, index) => (
                <div key={index} className="d-flex flex-column align-items-center justify-content-end bar-wrapper" 
                     style={{ height: '100%', zIndex: 1 }}
                     onMouseEnter={() => setHoveredInfo(`${sector.label}: ${sector.volume}`)} 
                     onMouseLeave={() => setHoveredInfo(null)}>
                    
                    {/* The Bar - Reduced Height by 20% (* 0.8) */}
                    <div style={{ 
                        width: '100%', 
                        height: `${Math.max(5, sector.value * 0.8)}%`, 
                        background: 'linear-gradient(180deg, #FCD535 0%, #0ecb81 100%)', 
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

        /* Desktop Layout Adjustments */
        .glass-container {
            height: 80px; 
            padding-left: 28px; /* Increased Left Padding to push Text Right */
            padding-right: 25px; /* Increased Right Padding to push Bars Left */
            padding-top: 8px;
            padding-bottom: 8px;
        }
        
        .text-container {
            width: 55%;
        }

        .bars-container {
            width: 40%;
            padding-bottom: 4px;
        }

        .bar-wrapper {
            width: 8%; /* Reduced bar width for more spacing (was 12%) */
        }

        .title-text {
            font-size: 11px; 
            letter-spacing: 0.5px;
        }

        .stat-label {
            font-size: 9px;
            color: ${SUB_TEXT};
            text-transform: uppercase;
        }
        
        .stat-val {
            font-size: 9px;
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
                /* Reduced Top Padding to 2px to lift title */
                padding: 2px 4px 2px 6px !important; 
                height: 63px !important; 
            }

            .title-text {
                font-size: 8px !important; /* Reduced by 10% */
            }
            
            .title-row {
                margin-bottom: 2px !important;
            }

            .stat-label {
                font-size: 6px !important; /* Reduced size */
            }
            
            .stat-val {
                font-size: 6px !important; /* Reduced size */
            }
            
            /* Tighten gap for stacked names in mobile */
            .stats-container {
                gap: 0px !important; 
            }
            
            .bar-label {
                font-size: 5px !important;
            }

            .bars-container {
                width: 45% !important; /* Give bars a bit more room in compact view */
                padding-right: 2px !important; /* Slight padding from edge */
            }
            
            .bar-wrapper {
                width: 10% !important; /* Slightly wider on mobile than desktop relative to container */
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
