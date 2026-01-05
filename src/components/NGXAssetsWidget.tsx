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
        <div className="text-container d-flex flex-column h-100">
            
            {/* Title Row - Lifted up */}
            <div className="title-row mb-1">
                <span className="fw-bold text-nowrap title-text" style={{ color: titleColor }}>{title}</span>
            </div>

            {/* Stats (Desktop & Mobile Stacked) - Increased spacing */}
            <div className="d-flex flex-column stats-container">
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
                <div style={{ borderBottom: `1px dashed ${isLight ? '#000' : '#fff'}`, height: '20%' }}></div>
                <div style={{ borderBottom: `1px dashed ${isLight ? '#000' : '#fff'}`, height: '20%' }}></div>
                <div style={{ borderBottom: `1px dashed ${isLight ? '#000' : '#fff'}`, height: '20%' }}></div>
                <div style={{ borderBottom: `1px dashed ${isLight ? '#000' : '#fff'}`, height: '20%' }}></div>
            </div>

            {data.sectors.map((sector, index) => (
                <div key={index} className="d-flex flex-column align-items-center justify-content-end bar-wrapper" 
                     style={{ height: '100%', zIndex: 1 }}
                     onMouseEnter={() => setHoveredInfo(`${sector.label}: ${sector.volume}`)} 
                     onMouseLeave={() => setHoveredInfo(null)}>
                    
                    {/* The Bar - Max Height capped at 80% (* 0.75 safe factor) */}
                    <div style={{ 
                        width: '100%', 
                        height: `${Math.max(5, sector.value * 0.75)}%`, 
                        background: 'linear-gradient(180deg, #FCD535 0%, #0ecb81 100%)', 
                        borderRadius: '1px 1px 0 0',
                        opacity: sector.label === 'IMP' ? 1 : 0.85, 
                        transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}></div>
                    
                    {/* Label - Smaller font */}
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
            padding-left: 28px; 
            padding-right: 25px; 
            padding-top: 6px; /* Reduced top padding to lift title */
            padding-bottom: 8px;
        }
        
        .text-container {
            width: 55%;
            justify-content: flex-start !important; /* Align top */
            padding-top: 2px;
        }

        .title-row {
            margin-bottom: 6px !important; /* Increased gap under title */
        }

        .stats-container {
            gap: 4px !important; /* Increased gap between Gainer and Loser */
        }

        .bars-container {
            width: 40%;
            padding-bottom: 4px;
        }

        .bar-wrapper {
            width: 8%; 
        }

        .title-text {
            font-size: 10px; /* Reduced 10% from 11px */
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
                /* Even smaller top padding for mobile lift */
                padding: 3px 4px 2px 6px !important; 
                height: 63px !important; 
            }

            .text-container {
                padding-top: 0px !important;
            }

            .title-text {
                font-size: 8px !important; 
            }
            
            .title-row {
                margin-bottom: 3px !important; /* Smaller gap on mobile */
            }

            .stats-container {
                gap: 2px !important; /* Smaller gap on mobile */
            }

            .stat-label {
                font-size: 6px !important; 
            }
            
            .stat-val {
                font-size: 6px !important; 
            }
            
            .bar-label {
                font-size: 4px !important; /* Reduced 20% from 5px to prevent overlap */
            }

            .bars-container {
                width: 45% !important; 
                padding-right: 2px !important; 
            }
            
            .bar-wrapper {
                width: 10% !important; 
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
