'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NGXData {
  score: number;
  status: string;
  change24h: number;
  marketCap: { total: number; change: number };
  volume: { total: number; intensity: number; sectors: number[] };
}

interface WidgetProps {
  theme?: 'dark' | 'light';
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

export default function NGXWidget({ theme = 'dark' }: WidgetProps) {
  const [data, setData] = useState<NGXData | null>(null);
  const [mounted, setMounted] = useState(false);
  const isLight = theme === 'light';

  const bgColor = isLight ? '#f8f9fa' : '#161b22'; // لون خلفية موحد
  const borderColor = isLight ? '#DEE2E6' : '#30363d';
  const textColor = isLight ? '#0A192F' : '#E6E8EA';
  const subTextColor = isLight ? '#6c757d' : '#8b949e';
  const greenColor = '#238636';
  const redColor = '#da3633';

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

  const formatCurrency = (val: number) => {
    if (!val) return '$0';
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toFixed(0)}`;
  };

  // --- مكون الرسم (Gauge) ---
  const GaugeSection = () => {
      // استخدام بيانات افتراضية للرسم حتى لو لم تأت البيانات بعد لكي لا يظهر فارغاً
      const score = data ? data.score : 50;
      const change = data ? data.change24h : 0;
      
      const needleRotation = ((score / 100) * 180) - 90;
      const currentStatus = (() => {
        if (score < 20) return { color: '#e53935', text: 'SELL' };
        if (score < 40) return { color: '#fb8c00', text: 'SELL' };
        if (score < 60) return { color: '#fdd835', text: 'HOLD' };
        if (score < 80) return { color: '#7cb342', text: 'BUY' };
        return { color: greenColor, text: 'BUY' };
      })();

      return (
        <div className="d-flex align-items-center justify-content-between w-100 h-100 px-1">
           {/* النصوص */}
           <div className="d-flex flex-column justify-content-center" style={{ width: '40%' }}>
              <span style={{ fontSize: '9px', fontWeight: '800', color: subTextColor }}>NGX</span>
              <span style={{ fontSize: '15px', fontWeight: '900', color: textColor, lineHeight: '1.1' }}>{score.toFixed(0)}</span>
              <span style={{ fontSize: '9px', fontWeight: '700', color: currentStatus.color }}>{currentStatus.text}</span>
           </div>

           {/* الرسم SVG */}
           <div style={{ width: '60%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
             <svg viewBox="-90 -15 180 95" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                <path d={describeArc(0, 80, 80, 0, 36)} fill="none" stroke="#e53935" strokeWidth="18" />
                <path d={describeArc(0, 80, 80, 36, 72)} fill="none" stroke="#fb8c00" strokeWidth="18" />
                <path d={describeArc(0, 80, 80, 72, 108)} fill="none" stroke="#fdd835" strokeWidth="18" />
                <path d={describeArc(0, 80, 80, 108, 144)} fill="none" stroke="#7cb342" strokeWidth="18" />
                <path d={describeArc(0, 80, 80, 144, 180)} fill="none" stroke={greenColor} strokeWidth="18" />
                <line x1="0" y1="80" x2="0" y2="10" stroke={isLight ? "#000" : "#FFF"} strokeWidth="4" 
                      transform={`rotate(${needleRotation}, 0, 80)`} style={{ transition: 'transform 1s ease' }} />
                <circle cx="0" cy="80" r="6" fill={isLight ? "#000" : "#fff"} />
             </svg>
           </div>
        </div>
      );
  };

  // --- مكون الماركت كاب ---
  const MarketCapSection = () => {
    if (!data) return <div className="pulse" />;
    const isUp = data.marketCap.change >= 0;
    
    return (
      <div className="d-flex flex-column justify-content-between h-100 w-100">
        <div className="d-flex justify-content-between align-items-center">
           <span style={{ fontSize: '8px', fontWeight: '800', color: subTextColor }}>CAP</span>
           <span style={{ fontSize: '9px', fontWeight: '700', color: isUp ? greenColor : redColor }}>
             {isUp ? '▲' : '▼'}{Math.abs(data.marketCap.change).toFixed(1)}%
           </span>
        </div>
        
        <div style={{ fontSize: '13px', fontWeight: '900', color: textColor, textAlign: 'center' }}>
            {formatCurrency(data.marketCap.total)}
        </div>
        
        <div style={{ width: '100%', height: '3px', background: isLight ? '#e9ecef' : '#21262d', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, Math.abs(data.marketCap.change) * 10)}%`, height: '100%', background: isUp ? greenColor : redColor }} />
        </div>
      </div>
    );
  };

  // --- مكون القطاعات (الأعمدة) ---
  const VolumeSection = () => {
    // إذا لم تكن هناك بيانات، نضع بيانات افتراضية رمادية
    const bars = data?.volume?.sectors ? data.volume.sectors : [20, 20, 20, 20];
    const labels = ['ID', 'ART', 'GM', 'ALL'];
    const hasData = !!data;

    return (
      <div className="d-flex flex-column justify-content-between h-100 w-100">
         <div className="d-flex justify-content-center">
           <span style={{ fontSize: '8px', fontWeight: '800', color: subTextColor }}>VOL FLOW</span>
        </div>
        
        <div className="d-flex justify-content-between align-items-end h-100 gap-1 pb-1">
            {bars.map((val, i) => (
                <div key={i} className="d-flex flex-column align-items-center justify-content-end" style={{ flex: 1, height: '100%' }}>
                    <div style={{
                        width: '4px',
                        height: `${Math.max(15, Math.min(100, val))}%`,
                        backgroundColor: !hasData ? '#333' : (i === 3 ? textColor : (val > 30 ? greenColor : '#555')),
                        borderRadius: '1px',
                        transition: 'height 0.5s ease'
                    }}></div>
                    <span style={{ fontSize: '5px', fontWeight: '700', color: subTextColor, marginTop: '2px' }}>{labels[i]}</span>
                </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-100 py-1" style={{ overflow: 'hidden' }}>
        <div className="d-flex gap-2 w-100 justify-content-between" style={{ height: '58px' }}>
            
            {/* الكبسولة 1: المؤشر */}
            <Link href="/ngx" className="capsule" style={{ textDecoration: 'none' }}>
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
            .capsule {
                flex: 1;
                background: ${bgColor};
                border: 1px solid ${borderColor};
                border-radius: 8px;
                padding: 4px 8px;
                min-width: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                overflow: hidden;
            }
            .pulse {
                width: 100%; height: 100%;
                background: rgba(128,128,128,0.1);
                animation: pulse 1.5s infinite;
            }
            @keyframes pulse { 0% {opacity: 0.6;} 50% {opacity: 1;} 100% {opacity: 0.6;} }
        `}</style>
    </div>
  );
}
