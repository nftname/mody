'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

interface NGXCapData {
  marketCap: string;
  change24h: number;
  rangeProgress: number; 
}

interface WidgetProps {
  theme?: 'dark' | 'light';
  title?: string;
}

export default function NGXCapWidget({ 
  theme = 'dark', 
  title = 'NGX Cap NFTs'
}: WidgetProps) {
  const [data, setData] = useState<NGXCapData | null>(null);
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

  const mainTextColor = isLight ? '#0A192F' : '#ffffff'; 
  const titleColor = isLight ? '#0A192F' : '#FCD535'; 
  const NEON_GREEN = '#0ecb81';
  const TICKER_RED = '#f6465d';

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const res = await fetch('/api/ngx-cap');
        if (!res.ok) throw new Error('Failed to fetch data');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching NGX Cap data:', error);
        setData({
            marketCap: '$2.54B',
            change24h: 4.88,
            rangeProgress: 75
        });
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

  const changeColor = data.change24h >= 0 ? NEON_GREEN : TICKER_RED;

  return (
    <div className="ngx-widget-container" ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredInfo(null)}>
    <Link href="/ngx" className="text-decoration-none" style={{ cursor: 'pointer', display: 'block' }}>
      
      <div className="glass-container d-flex flex-column justify-content-between rounded-3 position-relative overflow-hidden"
           style={{ ...glassStyle }}>
        
        {/* Header Row */}
        <div className="d-flex align-items-center w-100" style={{ zIndex: 2 }}>
            {/* تعديل 1: تقليل الفجوة من gap-2 إلى gap-1 لتوفير المساحة */}
            <div className="d-flex align-items-center gap-1">
                <span className="fw-bold text-nowrap title-text" style={{ color: titleColor }}>{title}</span>
                
                {/* تعديل 2 و 3: تصغير الخط والتحكم بحجم السهم بدقة */}
                <div className="mobile-percentage fw-bold d-flex align-items-center" 
                     style={{ fontSize: '7px', color: changeColor, display: 'none', lineHeight: '1' }}>
                    <span style={{ fontSize: '6px', marginRight: '1px' }}>{data.change24h >= 0 ? '▲' : '▼'}</span>
                    {Math.abs(data.change24h)}%
                </div>
            </div>
        </div>

        <div style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
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
        <div className="content-col d-flex flex-column justify-content-center w-100" style={{ height: '100%' }}>
            
            {/* Number Row */}
            <div className="d-flex align-items-end gap-2 mb-1 desktop-text-shift mobile-text-lift">
                <div className="fw-bold lh-1 main-score" style={{ color: mainTextColor, letterSpacing: '-0.5px' }}
                     onMouseEnter={() => setHoveredInfo(`Total Market Cap: ${data.marketCap}`)} onMouseLeave={() => setHoveredInfo(null)}>
                    {data.marketCap}
                </div>
                
                <div className="desktop-percentage fw-bold d-flex align-items-center mb-1" style={{ fontSize: '9px', color: changeColor }}
                     onMouseEnter={() => setHoveredInfo(`24h Change: ${data.change24h}%`)} onMouseLeave={() => setHoveredInfo(null)}>
                    {data.change24h >= 0 ? '+' : ''}{data.change24h}% <span style={{ fontSize: '8px', marginLeft: '2px' }}>{data.change24h >= 0 ? '▲' : '▼'}</span>
                </div>
            </div>

            {/* Progress Bar Row */}
            <div className="w-100 d-flex align-items-center progress-container" style={{ zIndex: 1 }}
                 onMouseEnter={() => setHoveredInfo('24H High/Low Range')} onMouseLeave={() => setHoveredInfo(null)}>
                <div className="progress-bar-bg" style={{ 
                    width: '100%', 
                    borderRadius: '10px', 
                    background: 'linear-gradient(90deg, #f6465d 0%, #fdd835 50%, #0ecb81 100%)',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        left: `${data.rangeProgress}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        boxShadow: '0 0 4px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(0,0,0,0.1)'
                    }} />
                </div>
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
        /* --- DESKTOP STYLES --- */
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
            font-size: 9px;
            letter-spacing: 0.5px;
        }

        .main-score {
            font-size: 27px; 
        }

        .desktop-text-shift {
            transform: translateY(-2px); 
        }

        .progress-container {
            height: 12px;
            margin-top: 4px;
        }
        
        .progress-bar-bg {
            height: 6px;
        }

        .desktop-percentage {
            display: flex;
        }
        .mobile-percentage {
            display: none !important;
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

            .main-score {
                font-size: 16px !important; 
            }

            .title-text {
                font-size: 8px !important;
            }

            .mobile-text-lift {
                transform: translateY(-3px) !important;
                margin-bottom: 3px !important;
            }

            .desktop-percentage {
                display: none !important;
            }
            .mobile-percentage {
                display: flex !important;
            }

            .progress-container {
                height: 6px !important;
                margin-top: 0px !important;
            }
            .progress-bar-bg {
                height: 3px !important;
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
