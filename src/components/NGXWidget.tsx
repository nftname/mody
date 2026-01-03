'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// --- 1. تعريف واجهة البيانات الموحدة (شاملة للمؤشر والبار) ---
interface NGXData {
  // بيانات المؤشر
  score: number;
  status: string;
  change24h: number;
  lastUpdate: string;
  // بيانات البار (الماركت كاب والقطاعات)
  marketCap: { total: number; change: number };
  volume: { total: number; intensity: number; sectors: number[] };
}

interface WidgetProps {
  theme?: 'dark' | 'light';
}

// --- 2. دوال الرسم للمؤشر (Math Helpers) ---
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

// --- 3. المكون الرئيسي ---
export default function NGXWidget({ theme = 'dark' }: WidgetProps) {
  const [data, setData] = useState<NGXData | null>(null);
  const [mounted, setMounted] = useState(false);
  const isLight = theme === 'light';

  // الألوان والتنسيقات المشتركة
  const bgColor = isLight ? 'linear-gradient(145deg, #F8F9FA, #E9ECEF)' : 'linear-gradient(145deg, #13171c, #0b0e11)';
  const borderColor = isLight ? '#DEE2E6' : '#2b3139';
  const textColor = isLight ? '#0A192F' : '#E6E8EA';
  const subTextColor = isLight ? '#6c757d' : '#848E9C';
  const greenColor = '#0ecb81';
  const redColor = '#f6465d';
  const shadow = isLight ? '0 2px 8px rgba(0,0,0,0.05)' : 'none';

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return null;

  // دالة تنسيق العملة
  const formatCurrency = (val: number) => {
    if (!val) return '$0';
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toFixed(0)}`;
  };

  // --------------------------------------------------------
  // الجزء الأول: رسم المؤشر (Gauge Logic)
  // --------------------------------------------------------
  const GaugeSection = () => {
      if (!data) return <div className="pulse-loader" />;
      
      const needleRotation = ((data.score / 100) * 180) - 90;
      const currentStatus = (() => {
        if (data.score < 20) return { color: '#e53935', text: 'S.SELL' }; // اختصار للنصوص للموبايل
        if (data.score < 40) return { color: '#fb8c00', text: 'SELL' };
        if (data.score < 60) return { color: '#fdd835', text: 'NEUTRAL' };
        if (data.score < 80) return { color: '#7cb342', text: 'BUY' };
        return { color: greenColor, text: 'S.BUY' };
      })();

      return (
        <div className="inner-content gauge-layout">
           {/* النصوص (يسار المؤشر) */}
           <div className="gauge-text">
              <div className="label-row">
                 <span className="mini-label">NGX INDEX</span>
                 <span className="live-badge">●</span>
              </div>
              <div className="score-value" style={{ color: isLight ? '#000' : '#fff' }}>
                 {data.score.toFixed(0)}
              </div>
              <div className="status-text" style={{ color: currentStatus.color }}>
                 {currentStatus.text}
              </div>
           </div>

           {/* الرسم (يمين المؤشر) */}
           <div className="gauge-svg-wrapper">
             <svg viewBox="-90 -20 180 110" width="100%" height="100%">
                <path d={describeArc(0, 80, 80, 0, 36)} fill="none" stroke="#e53935" strokeWidth="20" />
                <path d={describeArc(0, 80, 80, 36, 72)} fill="none" stroke="#fb8c00" strokeWidth="20" />
                <path d={describeArc(0, 80, 80, 72, 108)} fill="none" stroke="#fdd835" strokeWidth="20" />
                <path d={describeArc(0, 80, 80, 108, 144)} fill="none" stroke="#7cb342" strokeWidth="20" />
                <path d={describeArc(0, 80, 80, 144, 180)} fill="none" stroke={greenColor} strokeWidth="20" />
                <line x1="0" y1="80" x2="0" y2="10" stroke={isLight ? "#000" : "#FFF"} strokeWidth="4" 
                      transform={`rotate(${needleRotation}, 0, 80)`} style={{ transition: 'transform 1s ease' }} />
                <circle cx="0" cy="80" r="8" fill={isLight ? "#000" : "#fff"} />
             </svg>
           </div>
        </div>
      );
  };

  // --------------------------------------------------------
  // الجزء الثاني: الماركت كاب (Market Cap Logic)
  // --------------------------------------------------------
  const MarketCapSection = () => {
    if (!data) return <div className="pulse-loader" />;
    const isUp = data.marketCap.change >= 0;
    const color = isUp ? greenColor : redColor;

    return (
      <div className="inner-content">
        <div className="label-row">
           <span className="mini-label">NFT CAP</span>
           <span className="change-text" style={{ color }}>
             {isUp ? '▲' : '▼'}{Math.abs(data.marketCap.change).toFixed(1)}%
           </span>
        </div>
        
        <div className="main-number">
            {formatCurrency(data.marketCap.total)}
        </div>
        
        {/* Progress Line */}
        <div className="progress-bg">
            <div style={{ width: `${Math.min(100, Math.abs(data.marketCap.change) * 10)}%`, height: '100%', background: color }} />
        </div>
      </div>
    );
  };

  // --------------------------------------------------------
  // الجزء الثالث: القطاعات (Sectors Logic)
  // --------------------------------------------------------
  const VolumeSection = () => {
    if (!data) return <div className="pulse-loader" />;
    const bars = data.volume.sectors || [0, 0, 0, 0];
    const labels = ['ID', 'ART', 'GM', 'VOL'];

    return (
      <div className="inner-content">
         <div className="label-row centered">
           <span className="mini-label">SECTOR VOL</span>
        </div>
        
        <div className="bars-container">
            {bars.map((val, i) => (
                <div key={i} className="bar-column">
                    <div className="bar-track">
                        <div style={{
                            width: '100%',
                            height: `${Math.max(15, Math.min(100, val))}%`,
                            backgroundColor: i === 3 ? textColor : (val > 30 ? greenColor : '#555'),
                            borderRadius: '1px',
                            transition: 'height 0.5s ease'
                        }}></div>
                    </div>
                    <span className="bar-lbl">{labels[i]}</span>
                </div>
            ))}
        </div>
      </div>
    );
  };

  // --------------------------------------------------------
  // العرض النهائي (Render)
  // --------------------------------------------------------
  return (
    <div className="ngx-combined-widget">
        <div className="capsules-wrapper">
            
            {/* الكبسولة 1: المؤشر */}
            <Link href="/ngx" className="capsule hover-effect">
                <GaugeSection />
            </Link>

            {/* الكبسولة 2: الماركت كاب */}
            <div className="capsule">
                <MarketCapSection />
            </div>

            {/* الكبسولة 3: الفوليوم */}
            <div className="capsule">
                <VolumeSection />
            </div>

        </div>

        <style jsx>{`
            .ngx-combined-widget {
                width: 100%;
                padding: 5px 0;
                overflow: hidden;
            }

            .capsules-wrapper {
                display: flex;
                gap: 6px;
                width: 100%;
                height: 58px; /* ارتفاع ثابت للكبسولات */
                justify-content: space-between;
                align-items: stretch;
            }

            /* تصميم الكبسولة الموحد */
            .capsule {
                flex: 1; /* تقسيم 33% لكل عنصر */
                background: ${bgColor};
                border: 1px solid ${borderColor};
                border-radius: 10px;
                box-shadow: ${shadow};
                padding: 4px 6px;
                min-width: 0; /* يمنع الكسر في الموبايل */
                display: flex;
                justify-content: center;
                align-items: center;
                text-decoration: none;
                position: relative;
                overflow: hidden;
            }

            .hover-effect:hover {
                border-color: ${subTextColor};
            }

            /* المحتوى الداخلي */
            .inner-content {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }

            /* تخطيط خاص للمؤشر */
            .gauge-layout {
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
            }
            .gauge-text {
                display: flex;
                flex-direction: column;
                justify-content: center;
                width: 45%;
            }
            .gauge-svg-wrapper {
                width: 55%;
                height: 100%;
                display: flex;
                align-items: center;
            }

            /* النصوص والأرقام */
            .label-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2px;
            }
            .label-row.centered { justify-content: center; }

            .mini-label {
                font-size: 8px;
                font-weight: 800;
                color: ${subTextColor};
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .live-badge { color: ${greenColor}; font-size: 8px; animation: blink 2s infinite; }
            .change-text { font-size: 8px; font-weight: 700; }
            .status-text { font-size: 8px; font-weight: 800; letter-spacing: 0.5px; }

            .score-value {
                font-size: 16px;
                font-weight: 900;
                line-height: 1.1;
            }
            .main-number {
                font-size: 14px;
                font-weight: 900;
                color: ${textColor};
                text-align: center;
            }

            /* شريط التقدم */
            .progress-bg {
                width: 100%;
                height: 3px;
                background: ${isLight ? '#e9ecef' : '#222'};
                border-radius: 2px;
                overflow: hidden;
                margin-top: auto;
            }

            /* أعمدة الفوليوم */
            .bars-container {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                height: 25px;
                gap: 2px;
            }
            .bar-column {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
                height: 100%;
            }
            .bar-track {
                width: 5px;
                height: 18px;
                display: flex;
                align-items: flex-end;
                justify-content: center;
            }
            .bar-lbl {
                font-size: 5px;
                font-weight: 700;
                color: ${subTextColor};
                margin-top: 2px;
            }

            /* Loader Animation */
            .pulse-loader {
                width: 100%; height: 100%;
                background: rgba(128,128,128,0.1);
                animation: pulse 1.5s infinite;
                border-radius: 6px;
            }

            @keyframes blink { 0% {opacity: 1;} 50% {opacity: 0.3;} 100% {opacity: 1;} }
            @keyframes pulse { 0% {opacity: 0.6;} 50% {opacity: 1;} 100% {opacity: 0.6;} }

            /* تحسينات للجوال */
            @media (max-width: 400px) {
                .main-number { font-size: 12px; }
                .score-value { font-size: 14px; }
                .mini-label { font-size: 7px; }
                .bar-track { width: 3px; }
            }
        `}</style>
    </div>
  );
}
