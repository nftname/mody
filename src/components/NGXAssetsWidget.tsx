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
      
      <div className="glass-container d-flex justify-content-between rounded-3 position-relative overflow-hidden"
           style={{ ...glassStyle }}>
        
        <div className="text-container d-flex flex-column">
            
            <div className="title-row mb-1">
                <span className="fw-bold text-nowrap title-text" style={{ color: titleColor }}>{title}</span>
            </div>

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

        <div className="bars-container d-flex align-items-end justify-content-between position-relative">
            
            {data.sectors.map((sector, index) => (
                <div key={index} className="d-flex flex-column align-items-center justify-content-end bar-wrapper" 
                     style={{ height: '100%', zIndex: 1 }}
                     onMouseEnter={() => setHoveredInfo(`${sector.label}: ${sector.volume}`)} 
                     onMouseLeave={() => setHoveredInfo(null)}>
                    
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

        .glass-container {
            height: 80px; 
            padding-left: 20px; 
            padding-right: 20px; 
            padding-top: 8px; /* Standard Desktop Padding */
            padding-bottom: 8px;
        }
        
        .text-container {
            width: 55%;
            justify-content: flex-start;
            padding-top: 0;
        }

        .title-row {
            margin-bottom: 4px;
        }

        .stats-container {
            gap: 2px;
        }

        .bars-container {
            width: 40%;
            height: 75%; /* HARD CAP: Bars can never exceed 75% of widget height */
            margin-top: auto; /* Push to bottom */
            padding-bottom: 2px;
        }

        .bar-wrapper {
            width: 12%; 
        }

        .title-text {
            font-size: 10px; 
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

        @media (max-width: 768px) {
            .ngx-widget-container {
                min-width: 112px !important; 
                max-width: 112px !important;
                margin-left: 0 !important; 
                margin-right: auto !important;
            }

            .glass-container {
                padding: 4px 6px !important; /* Matches neighbors */
                height: 63px !important; 
            }

            .title-text {
                font-size: 8px !important; 
            }
            
            .title-row {
                margin-bottom: 2px !important;
            }

            .stats-container {
                gap: 0px !important; 
            }

            .stat-label {
                font-size: 6px !important; 
            }
            
            .stat-val {
                font-size: 6px !important; 
            }
            
            .bar-label {
                font-size: 4px !important; 
            }

            .bars-container {
                width: 45% !important; 
                height: 70% !important; /* Stricter cap on mobile */
                padding-right: 0px !important; 
            }
            
            .bar-wrapper {
                width: 14% !important; 
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
