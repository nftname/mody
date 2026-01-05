'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

interface VolumeData {
  sectors: {
    label: string;
    value: number; 
    color: string;
    volume: string;
  }[];
  marketStats: {
    totalVolChange: number;
    totalVolumeDisplay: string; // Added total volume string (e.g. 2.4M)
    topGainer: { name: string; change: number };
    topLoser: { name: string; change: number };
  };
}

interface WidgetProps {
  theme?: 'dark' | 'light';
  title?: string;
}

export default function NGXVolumeWidget({ 
  theme = 'dark', 
  title = 'NGX Volume'
}: WidgetProps) {
  const [data, setData] = useState<VolumeData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';
  
  // Adjusted padding for tighter fit
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
  const TEXT_WHITE = isLight ? '#000' : '#FFF';
  const SUB_TEXT = '#B0B0B0';

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const res = await fetch('/api/ngx-volume');
        if (!res.ok) throw new Error('Failed to fetch data');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching NGX Volume data:', error);
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

  const volChange = data.marketStats.totalVolChange;
  // Fallback for volume display if API doesn't send it yet
  const totalVolDisplay = data.marketStats.totalVolumeDisplay || "2.4M"; 
  const gainer = data.marketStats.topGainer;
  const loser = data.marketStats.topLoser;
  const volColor = volChange >= 0 ? NEON_GREEN : TICKER_RED;

  return (
    <div className="ngx-widget-container" ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredInfo(null)}>
    <Link href="/ngx" className="text-decoration-none" style={{ cursor: 'pointer', display: 'block' }}>
      
      <div className="glass-container d-flex justify-content-between rounded-3 position-relative overflow-hidden"
           style={{ ...glassStyle }}>
        
        {/* LEFT SIDE: Text Info */}
        <div className="text-container d-flex flex-column h-100">
            
            {/* Title Row - Lifted to Absolute Top */}
            <div className="title-row d-flex align-items-center">
                <span className="fw-bold text-nowrap title-text" style={{ color: titleColor, lineHeight: 1 }}>{title}</span>
                {/* LIVE Badge - Desktop Only - Centered next to title */}
                <span className="badge pulse-neon desktop-only ms-1" 
                      style={{ 
                          fontSize:'6px', 
                          padding:'1px 3px', 
                          color: NEON_GREEN, 
                          border: 'none', 
                          backgroundColor: 'rgba(14, 203, 129, 0.1)',
                          alignSelf: 'center'
                      }}>LIVE</span>
            </div>

            {/* Volume Row: Value + Percentage */}
            <div className="d-flex align-items-center gap-1 vol-row">
                <span className="fw-bold vol-label" style={{ color: TEXT_WHITE }}>VOL</span>
                <span className="fw-bold vol-value" style={{ color: TEXT_WHITE }}>{totalVolDisplay}</span>
                <span className="fw-bold vol-change" style={{ color: volColor }}>
                    {volChange >= 0 ? '+' : ''}{volChange}%
                </span>
            </div>

            {/* Stats Row (Gainer / Loser) */}
            <div className="d-flex flex-column stats-container mt-auto">
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
        <div className="bars-container d-flex align-items-end justify-content-between position-relative">
            
            {data.sectors.map((sector, index) => (
                <div key={index} className="d-flex flex-column align-items-center justify-content-end bar-wrapper" 
                     style={{ height: '100%', zIndex: 1 }}
                     onMouseEnter={() => setHoveredInfo(`${sector.label}: ${sector.volume}`)} 
                     onMouseLeave={() => setHoveredInfo(null)}>
                    
                    {/* The Bar - Max Height hard capped via container, this is relative */}
                    <div style={{ 
                        width: '100%', 
                        height: `${Math.max(10, sector.value)}%`, 
                        background: 'linear-gradient(180deg, #FCD535 0%, #0ecb81 100%)', 
                        borderRadius: '1px 1px 0 0',
                        opacity: sector.label === 'IMP' ? 1 : 0.85, 
                        transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}></div>
                    
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

        /* --- DESKTOP STYLES --- */
        .glass-container {
            height: 80px; 
            padding: 4px 20px 6px 20px; 
        }
        
        .text-container {
            width: 58%; /* Text takes more space */
            justify-content: flex-start;
            padding-top: 2px;
        }

        .title-row {
            margin-bottom: 2px;
            height: 12px; /* Fixed height for title area */
        }

        .vol-row {
            margin-bottom: 4px;
        }
        
        .vol-label { font-size: 10px; }
        .vol-value { font-size: 10px; margin-right: 2px; }
        .vol-change { font-size: 10px; }

        .stats-container {
            gap: 2px;
        }

        .bars-container {
            width: 38%;
            height: 70%; /* HARD CAP: Bars never exceed 70% of widget height */
            margin-top: auto; /* Push to bottom */
            padding-bottom: 2px;
        }

        .bar-wrapper {
            width: 12%; 
        }

        .title-text {
            font-size: 9px; /* Reduced Desktop Title */
            letter-spacing: 0.5px;
        }

        .stat-label {
            font-size: 8px;
            color: ${SUB_TEXT};
            text-transform: uppercase;
        }
        
        .stat-val {
            font-size: 8px;
        }
        
        .bar-label {
            font-size: 6px;
            letter-spacing: 0.2px;
        }

        .desktop-only {
            display: inline-block;
        }

        /* --- MOBILE STYLES (CRITICAL FIXES) --- */
        @media (max-width: 768px) {
            .ngx-widget-container {
                min-width: 112px !important; 
                max-width: 112px !important;
                margin-left: 0 !important; 
                margin-right: auto !important;
            }

            .glass-container {
                /* Extremely tight padding to fit everything */
                padding: 2px 3px 2px 4px !important; 
                height: 63px !important; 
            }

            /* 1. Lift Title Up */
            .text-container {
                width: 62% !important; /* Give text even more room on mobile */
                padding-top: 0px !important;
            }

            .title-row {
                margin-bottom: 1px !important;
                height: 10px !important;
            }

            .title-text {
                font-size: 7px !important; /* Tiny title */
            }
            
            /* 2. Volume Row Sizing */
            .vol-label { font-size: 8px !important; }
            .vol-value { font-size: 8px !important; display: none !important; } /* Hide Absolute Value on Mobile if needed, or keep tiny: display: inline !important */
            .vol-change { font-size: 8px !important; }

            /* 3. Stats Sizing */
            .stats-container {
                gap: 0px !important; 
            }

            .stat-label {
                font-size: 6px !important; 
            }
            
            .stat-val {
                font-size: 6px !important; 
            }
            
            /* 4. Bars Constraints */
            .bars-container {
                width: 35% !important; 
                height: 65% !important; /* Strict 65% height cap on mobile */
                padding-right: 0px !important; 
            }
            
            .bar-label {
                font-size: 4px !important; 
                margin-top: 1px !important;
            }
            
            .bar-wrapper {
                width: 10% !important; /* Thin bars */
            }

            .desktop-only {
                display: none !important;
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
