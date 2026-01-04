'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

interface NGXCapData {
  marketCap: string;
  change24h: number;
  rangeProgress: number; // 0 to 100
}

interface WidgetProps {
  theme?: 'dark' | 'light';
  title?: string;
  subtitle?: string;
}

export default function NGXCapWidget({ 
  theme = 'dark', 
  title = 'NGX Cap NFTs', 
  subtitle = 'Total Valuation' 
}: WidgetProps) {
  const [data, setData] = useState<NGXCapData | null>(null);
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
    boxShadow: 'none', 
  };

  const mainTextColor = isLight ? '#0A192F' : '#ffffff'; 
  const subTextColor = isLight ? '#495057' : '#848E9C';
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
        // Default Fallback
        setData({
            marketCap: '$2.14T',
            change24h: 1.25,
            rangeProgress: 65
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
      
      <div className="d-flex flex-column justify-content-between px-3 py-2 rounded-3 position-relative overflow-hidden"
           style={{
             ...glassStyle,
             height: '82px',
             width: '100%'
           }}>
        
        {/* Header Row */}
        <div className="d-flex align-items-center justify-content-between w-100" style={{ zIndex: 2 }}>
            <div className="d-flex align-items-center gap-2"
                 onMouseEnter={() => setHoveredInfo('Index Name')} onMouseLeave={() => setHoveredInfo(null)}>
                <span className="fw-bold text-nowrap" style={{ color: titleColor, fontSize: '9px', letterSpacing: '0.5px' }}>{title}</span>
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

        {/* Main Value Row */}
        <div className="d-flex align-items-end gap-2 w-100" style={{ zIndex: 2, marginTop: '-2px' }}>
            <div className="fw-bold lh-1" style={{ fontSize: '27px', color: mainTextColor, letterSpacing: '-0.5px' }}
                 onMouseEnter={() => setHoveredInfo(`Total Market Cap: ${data.marketCap}`)} onMouseLeave={() => setHoveredInfo(null)}>
                {data.marketCap}
            </div>
            <div className="fw-bold d-flex align-items-center mb-1" style={{ fontSize: '9px', color: changeColor }}
                 onMouseEnter={() => setHoveredInfo(`24h Change: ${data.change24h}%`)} onMouseLeave={() => setHoveredInfo(null)}>
                {data.change24h >= 0 ? '+' : ''}{data.change24h}% <span style={{ fontSize: '8px', marginLeft: '2px' }}>{data.change24h >= 0 ? '▲' : '▼'}</span>
            </div>
        </div>

        {/* Range Bar Row */}
        <div className="w-100 d-flex align-items-center" style={{ height: '12px', zIndex: 1 }}
             onMouseEnter={() => setHoveredInfo('7-Day High/Low Range')} onMouseLeave={() => setHoveredInfo(null)}>
            <div style={{ 
                width: '100%', 
                height: '6px', 
                borderRadius: '10px', 
                background: 'linear-gradient(to right, #2962FF, #82B1FF, #FFE082, #FF8F00)',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    left: `${data.rangeProgress}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    boxShadow: '0 0 4px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(0,0,0,0.1)'
                }} />
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
