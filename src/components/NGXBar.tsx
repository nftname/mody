'use client';
import { useEffect, useState } from 'react';
import NGXWidget from './NGXWidget'; // تأكد أن هذا الملف يقبل أن يوضع في حاوية مرنة

interface NGXData {
  marketCap: { total: number; change: number };
  volume: { total: number; intensity: number; sectors: number[] };
}

export default function NGXBar({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [data, setData] = useState<NGXData | null>(null);
  const isLight = theme === 'light';

  // الألوان والتنسيقات
  const bgColor = isLight ? '#F8F9FA' : '#13171c'; // لون سادة أو تدرج خفيف
  const borderColor = isLight ? '#DEE2E6' : '#2b3139';
  const textColor = isLight ? '#0A192F' : '#E6E8EA';
  const subTextColor = isLight ? '#6c757d' : '#848E9C';
  const greenColor = '#0ecb81';
  const redColor = '#f6465d';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/ngx');
        if (res.ok) setData(await res.json());
      } catch (e) { console.error(e); }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val: number) => {
    if (!val) return '$0';
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toFixed(0)}`;
  };

  // --- المكون الأوسط: السيولة وحجم السوق ---
  const MarketCapCard = () => {
    if (!data) return <div className="loading-pulse" />;
    const isPositive = data.marketCap.change >= 0;
    const color = isPositive ? greenColor : redColor;
    
    return (
      <div className="inner-content">
        <div className="label-row">
           <span className="label-text">NFT CAP</span>
           <span style={{ color: color, fontWeight: 'bold' }}>
             {isPositive ? '▲' : '▼'} {Math.abs(data.marketCap.change).toFixed(1)}%
           </span>
        </div>
        <div className="value-text">
            {formatCurrency(data.marketCap.total)}
        </div>
        {/* خط التقدم */}
        <div className="progress-bg">
            <div style={{ width: `${Math.min(100, Math.abs(data.marketCap.change) * 10)}%`, height: '100%', background: color }}></div>
        </div>
      </div>
    );
  };

  // --- المكون الأيمن: مؤشر القطاعات ---
  const PressureCard = () => {
    if (!data) return <div className="loading-pulse" />;
    const bars = data.volume.sectors || [15, 40, 60, 30]; 
    
    return (
      <div className="inner-content">
         <div className="label-row">
           <span className="label-text">SECTORS</span>
           <span className="blink-dot" style={{ color: greenColor }}>●</span>
        </div>
        
        <div className="bars-container">
            {bars.map((val, i) => (
                <div key={i} className="bar-column">
                    <div style={{
                        width: '100%',
                        height: `${Math.max(10, Math.min(100, val))}%`,
                        backgroundColor: val > 50 ? greenColor : (isLight ? '#adb5bd' : '#495057'),
                        borderRadius: '1px',
                        transition: 'height 0.5s ease'
                    }}></div>
                </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="ngx-bar-wrapper">
        <div className="ngx-bar-container">
            {/* 1. Left: NGX Widget (33.3%) */}
            <div className="bar-section left-section">
                {/* تم وضع الودجت داخل حاوية لتملأ المساحة */}
                <div className="widget-fill">
                    <NGXWidget theme={theme} />
                </div>
            </div>

            {/* 2. Middle: Market Cap (33.3%) */}
            <div className="bar-section middle-section">
                <MarketCapCard />
            </div>

            {/* 3. Right: Buying Pressure (33.3%) */}
            <div className="bar-section right-section">
                <PressureCard />
            </div>
        </div>

        <style jsx>{`
            .ngx-bar-wrapper {
                width: 100%;
                background: ${isLight ? '#fff' : '#0b0e11'};
                border-bottom: 1px solid ${borderColor};
                height: 70px; /* ارتفاع ثابت للبار */
                display: flex;
                align-items: center;
                overflow: hidden; /* منع السكرول نهائيا */
            }

            .ngx-bar-container {
                display: flex;
                width: 100%;
                height: 100%;
                justify-content: space-between;
                align-items: stretch;
            }

            .bar-section {
                flex: 1; /* تقسيم متساوي 33% لكل قسم */
                width: 33.33%;
                padding: 4px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-right: 1px solid ${isLight ? '#eee' : '#1e2329'};
                overflow: hidden;
            }
            .bar-section:last-child {
                border-right: none;
            }

            /* Widget Helper */
            .widget-fill {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                /* هنا نفترض أن الـ Widget سيتجاوب مع الحجم */
            }

            /* Inner Content Styling */
            .inner-content {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 2px 4px;
            }

            .label-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 10px;
                font-weight: 600;
            }
            .label-text {
                color: ${subTextColor};
                white-space: nowrap;
            }

            .value-text {
                font-size: 15px;
                font-weight: bold;
                color: ${textColor};
                text-align: center;
                margin: 2px 0;
            }

            /* Progress Line (Middle) */
            .progress-bg {
                width: 100%;
                height: 3px;
                background: ${isLight ? '#e9ecef' : '#2B3139'};
                border-radius: 2px;
                overflow: hidden;
            }

            /* Bars (Right) */
            .bars-container {
                display: flex;
                align-items: flex-end;
                justify-content: space-between;
                height: 25px;
                gap: 2px;
            }
            .bar-column {
                width: 20%;
                height: 100%;
                display: flex;
                align-items: flex-end;
            }

            .loading-pulse {
                width: 100%;
                height: 100%;
                background: rgba(128,128,128,0.1);
                animation: pulse 1.5s infinite;
            }

            .blink-dot { animation: blink 2s infinite; font-size: 8px; }
            @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
            @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }

            /* Mobile Adjustments (لجعل الـ 3 أقسام تظهر بدون سكرول) */
            @media (max-width: 768px) {
                .ngx-bar-wrapper {
                    height: 60px; /* تقليل الارتفاع قليلا للجوال */
                }
                .value-text {
                    font-size: 12px; /* تصغير الخط */
                }
                .label-row {
                    font-size: 8px;
                }
                .bar-section {
                    padding: 2px; /* تقليل الحواف */
                }
            }
        `}</style>
    </div>
  );
}
